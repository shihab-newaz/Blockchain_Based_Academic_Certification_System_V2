import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import '../css/Issue.css'
import { initContract } from './Contract';
import { createIPFSclient } from './IPFS'
import AES from 'crypto-js/aes';

function UpdateCertificateComponent() {
  const [studentName, setStudentName] = useState('');
  const [roll, setRoll] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [subject, setSubject] = useState('');
  const [expiry, setExpiry] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [issueResult, setIssueResult] = useState('');
  const [CID, setCID] = useState(null);
  const fileInput = useRef(null);
  const [isLoading, setIsLoading] = useState(false);


  async function handleUploadToIPFS() {
    const file = fileInput.current.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
  
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileData = reader.result;
        const issueTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp
        const expiration = Number(expiry);
  
        const certificateData = { studentName, roll, degreeName, subject, studentAddress, issueTimestamp, expiration };
        const dataToUpload = JSON.stringify({ certificateData, fileData: new Uint8Array(fileData) });
        const client= createIPFSclient();
        const { cid } = await client.add(dataToUpload);
        console.log(cid.toString());
        setCID(cid.toString());
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  

  const updateCertificate = async () => {
    //const startTime = performance.now(); // Start counting execution time
    setIsLoading(true);
    try {

      const { contract, signer } = initContract();

      await handleUploadToIPFS();
     
      // Convert the certificate data to a string
      //console.log(certificateDataString);

      // Encrypt the certificate data 
      const certificateDataString = JSON.stringify(CID);
      const encryptedData = AES.encrypt(certificateDataString, process.env.REACT_APP_AES_SECRET_KEY).toString();

      const hash = ethers.utils.hashMessage(encryptedData);
      const signature = await signer.signMessage(hash);
      //console.log(encryptedData);
      //console.log(hash);

      const transaction = await contract.issueCertificate(
        studentAddress,
        encryptedData,
        hash,
        signature
      );
      await transaction.wait();
      setIssueResult('Certificate issued successfully!');
    }
    catch (error) {
      console.error('Error issuing certificate:', error);
      setIssueResult('Failed to issue certificate');
    }
    setIsLoading(false);
  };

  return (
    <div className='issue-certificate-container'>
      <h1>Update Certificate</h1>
      <input
        type="text"
        placeholder="Student Name"
        onChange={(e) => setStudentName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Roll Number"
        onChange={(e) => setRoll(e.target.value)}
      />
      <input
        type="text"
        placeholder="Degree Name"
        onChange={(e) => setDegreeName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        type="text"
        placeholder="Expiration"
        onChange={(e) => setExpiry(e.target.value)}
      />
      <input
        type="text"
        placeholder="Student Address"
        onChange={(e) => setStudentAddress(e.target.value)}
      />

      <input type="file" ref={fileInput} />
      {/* <button onClick={handleUploadToIPFS} style={{ marginBottom: 10, }}>Upload to IPFS</button> <br /> */}

      <button onClick={updateCertificate}>Update Certificate</button> <br />
      {isLoading && <>
        <div className="spinner"></div>
        <p>Uploading to the chain</p></>}

      <p>{issueResult}</p><br />

    </div>


  );

}

export default UpdateCertificateComponent;

