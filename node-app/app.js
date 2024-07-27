import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import CryptoJS from 'crypto-js';
import { create } from 'ipfs-http-client';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';
import { readFile } from 'fs/promises';

dotenv.config();

const app = express();
const port = process.env.PORT || 3999;

app.use(cors());
app.use(express.json());

// Initialize contract and provider
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_URL = process.env.PROVIDER_RPC_URL;

const provider = new ethers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import contract ABI
const contractJsonPath = resolve(__dirname, './artifacts/contracts/CertificateContract.sol/CertificateContract.json');
const contractJsonUrl = pathToFileURL(contractJsonPath);
const contractJson = JSON.parse(await readFile(contractJsonUrl));
const CONTRACT_ABI = contractJson.abi;

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Initialize Helia
let helia;
let fs;

async function initializeHelia() {
  if (!helia) {
    console.log('Initializing Helia with IPFS Desktop daemon...');
    try {
      const ipfs = create({ url: process.env.IPFS_URL });
      helia = await createHelia({ ipfs });
      fs = unixfs(helia);
    } catch (error) {
      console.error('Failed to initialize Helia:', error);
      throw error;
    }
  }
}

async function uploadToIPFS(data) {
  await initializeHelia();
  const buffer = Buffer.from(JSON.stringify(data));
  const result = await fs.addBytes(buffer);
  return result.toString();
}

async function fetchFromIPFS(cid) {
  await initializeHelia();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('IPFS fetch operation timed out'));
    }, 10000);

    (async () => {
      try {
        console.log(`Fetching CID: ${cid} from IPFS...`);
        let data = new Uint8Array();

        for await (const chunk of fs.cat(cid)) {
          const newData = new Uint8Array(data.length + chunk.length);
          newData.set(data);
          newData.set(chunk, data.length);
          data = newData;
        }

        clearTimeout(timeout);
        console.log(`Successfully fetched CID: ${cid} from IPFS`);
        resolve(JSON.parse(Buffer.from(data).toString()));
      } catch (error) {
        clearTimeout(timeout);
        console.error(`Error fetching from IPFS: ${error}`);
        reject(error);
      }
    })();
  });
}

app.post('/issue-certificate', async (req, res) => {
  console.log('Received request to issue certificate');
  try {
    const { studentName, roll, degreeName, subject, expiry, studentAddress } = req.body;

    const certificateData = {
      studentName,
      roll,
      degreeName,
      subject,
      studentAddress,
      issueTimestamp: Math.floor(Date.now() / 1000),
      expiration: Number(expiry)
    };

    const cid = await uploadToIPFS(certificateData);
    console.log(`Certificate data uploaded to IPFS with CID: ${cid}`);

    const encryptedData = CryptoJS.AES.encrypt(cid, process.env.AES_SECRET_KEY).toString();
    const dataHash = ethers.hashMessage(encryptedData);  
    const signature = await signer.signMessage(dataHash);

    const currentSignerAddress = await signer.getAddress();
    console.log('Current signer address:', currentSignerAddress);

    console.log('Issuing certificate on the blockchain...');
    const tx = await contract.issueCertificate(
      studentAddress,
      encryptedData,
      dataHash,
      signature
    );

    console.log('Transaction sent. Transaction hash:', tx.hash);
    console.log('Waiting for transaction to be mined...');
    
    const receipt = await tx.wait();
    console.log('Transaction mined. Block number:', receipt.blockNumber);
    console.log('Transaction hash:', receipt.hash);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    if (receipt.status === 1) {
      console.log(`Certificate issued successfully. Transaction hash: ${receipt.hash}`);
      res.json({
        success: true,
        message: 'Certificate issued successfully',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        cid,
        signerAddress: currentSignerAddress
      });
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue certificate',
      error: error.message
    });
  }
});

app.get('/view-certificate/:studentAddress', async (req, res) => {
  console.log(`Received request to view certificate for address: ${req.params.studentAddress}`);
  try {
    const { studentAddress } = req.params;
    const certificateData = await contract.viewCertificate(studentAddress);
    const decryptedBytes = CryptoJS.AES.decrypt(certificateData.encryptedData, process.env.AES_SECRET_KEY);
    const cid = decryptedBytes.toString(CryptoJS.enc.Utf8);

    console.log('Fetching certificate data from IPFS...');
    const fetchedData = await fetchFromIPFS(cid);
    console.log('Certificate data fetched from IPFS');

    res.json({
      success: true,
      certificateDetails: fetchedData,
    });
  } catch (error) {
    console.error('Error viewing certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view certificate',
      error: error.message
    });
  }
});

app.get('/verify-certificate/:studentAddress', async (req, res) => {
  console.log(`Received request to verify certificate for address: ${req.params.studentAddress}`);
  try {
    const { studentAddress } = req.params;
    console.log('Verifying certificate on the blockchain...');
    const isIssued = await contract.verifyCertificate(studentAddress);

    if (!isIssued) {
      console.log('Certificate not issued or revoked');
      return res.json({ success: false, message: 'Certificate either not issued or already revoked' });
    }

    console.log('Fetching certificate details for signature verification...');
    const certificateDetails = await contract.viewCertificate(studentAddress);
    console.log('Certificate details:', certificateDetails);
    
    const messageHash = ethers.hashMessage(certificateDetails.dataHash);
    console.log('Message hash:', messageHash);
    
    const signerAddress = ethers.recoverAddress(messageHash, certificateDetails.signature);
    const expectedSignerAddress = process.env.SIGNER_ADDRESS;
    const currentSignerAddress = await signer.getAddress();
    
    console.log("Recovered signer address:", signerAddress);
    console.log("Expected signer address:", expectedSignerAddress);
    console.log("Current signer address:", currentSignerAddress);

    if (signerAddress === expectedSignerAddress || signerAddress === currentSignerAddress) {
      console.log('Certificate verification successful');
      res.json({ success: true, message: 'Certificate verification successful' });
    } else {
      console.log('Signature verification unsuccessful');
      res.json({ 
        success: false, 
        message: 'Signature verification unsuccessful',
        recoveredSigner: signerAddress,
        expectedSigner: expectedSignerAddress,
        currentSigner: currentSignerAddress,
        messageHash: messageHash,
        dataHash: certificateDetails.dataHash,
        signature: certificateDetails.signature
      });
    }
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during verification',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});