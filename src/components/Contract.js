import { ethers } from 'ethers';

export function initContract() {
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;

  // Use Infura's Sepolia endpoint
  const PROVIDER = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.REACT_APP_API_KEY}`);
  const signer = new ethers.Wallet(PRIVATE_KEY, PROVIDER);
  const CONTRACT_ABI = require('../abis/CertificateContract.json');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { contract, signer };
}
