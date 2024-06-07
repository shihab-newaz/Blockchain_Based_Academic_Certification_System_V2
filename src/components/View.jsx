import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/View.css';
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import { initContract } from './Contract';
import { verifyCertificate } from './Verify';
import { createIPFSclient } from './IPFS';

//0x5A7E0D6823D42110A1D361F7E115Aa300Cf8F0c7
//0x70997970C51812dc3A010C7d01b50e0d17dc79C8

function ViewCertificateComponent() {
  const location = useLocation();
  const [viewMessage, setViewMessage] = useState({});
  const [fileUrl, setFileUrl] = useState(null);
  const [certificateDetails, setCertificateDetails] = useState(null);
  const [viewIPFSimage, setViewIPFSimage] = useState(false);
  const [inputSecretKey, setInputSecretKey] = useState('');
  const [isCorrectKey, setIsCorrectKey] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [signatureValidation, setSignatureValidation] = useState('');
  const client = createIPFSclient();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const studentAddress = searchParams.get('studentAddress');
    const employerAddress = searchParams.get('employerAddress');

    if (studentAddress && employerAddress) {
      viewCertificate(studentAddress, employerAddress);
    }
  }, [location.search]);

  async function fetchFromIPFS(CID) {
    try {
      const stream = client.cat(CID);
      let data = [];
      for await (const chunk of stream) {
        data.push(chunk);
      }
      const blob = new Blob(data, { type: 'application/json' });
      const text = await blob.text();
      const parsedData = JSON.parse(text);
      setCertificateDetails(parsedData.certificateData);

      // Convert the fileData back to Uint8Array
      const uint8ArrayData = new Uint8Array(Object.values(parsedData.fileData));

      // Create a Blob from the Uint8Array
      const fileBlob = new Blob([uint8ArrayData], { type: 'image/jpeg' });
      const url = URL.createObjectURL(fileBlob);
      setFileUrl(url);
      setViewIPFSimage(true);

    } catch (error) {
      console.error('Error fetching file from IPFS:', error);
      setViewMessage({ error: error.message });
    }
  }

  const checkSecretKey = () => {
    if (inputSecretKey === process.env.REACT_APP_AES_SECRET_KEY) {
      setIsCorrectKey(true);
    } else {
      alert('The input secret key is incorrect.');
    }
  };

  const viewCertificate = async (studentAddress, employerAddress) => {
    try {
      const { contract } = await initContract();
      const permission = await contract.isCertificateSharedWith(studentAddress, employerAddress);
      if (!permission) {
        setViewMessage({ error: 'This viewer does not have permission for this certificate' });
        return;
      }

      const certificate = await contract.viewCertificate(studentAddress);

      if (certificate.error) {
        setViewMessage({ error: certificate.error });
        return;
      }
      const decryptedBytes = AES.decrypt(certificate.encryptedData, process.env.REACT_APP_AES_SECRET_KEY);
      const certificateCID = decryptedBytes.toString(CryptoJS.enc.Utf8);

      fetchFromIPFS(certificateCID);

    } catch (error) {
      console.error('Failed to view certificate:', error);
      setViewMessage({ error: 'Failed to view certificate: ' + error.message });
    }
  };

  const handleVerifyCertificate = async () => {
    const searchParams = new URLSearchParams(location.search);
    const studentAddress = searchParams.get('studentAddress');
    const employerAddress = searchParams.get('employerAddress');

    const result = await verifyCertificate(studentAddress, employerAddress);
    if (result.error) {
      setVerificationMessage(result.error);
    } else if (result.success) {
      setSignatureValidation(result.success);
    }
  };

  return (
    <div className="view-container">
      {!isCorrectKey && (
        <div>
          <input
            style={{ marginBottom: '10px' }}
            type="password"
            placeholder="Enter Secret Key"
            onChange={(e) => setInputSecretKey(e.target.value)}
          />
          <button
            onClick={checkSecretKey}
            style={{
              backgroundColor: '#4caf50', color: 'white', padding: '10px 15px',
              border: 'none', borderRadius: '5px', marginBottom: '10px', cursor: 'pointer',
            }}
          >
            Enter Secret Key
          </button>
        </div>
      )}

      {isCorrectKey && certificateDetails && (
        <div className="details-container">
          <div className="certificate-details">
            <h4>Certificate Details</h4>
            <p>----------------------------</p>
            <p>Name: {certificateDetails.studentName}</p>
            <p>Roll Number: {certificateDetails.roll}</p>
            <p>Degree Name: {certificateDetails.degreeName}</p>
            <p>Subject: {certificateDetails.subject}</p>
            <p>Issue Timestamp: {new Date(certificateDetails.issueTimestamp * 1000).toLocaleString()}</p>
            <p>Expiry: {certificateDetails.expiration} days</p>
          </div>
          {viewIPFSimage && fileUrl && (
            <div>
              {fileUrl && (
                <img id="image" alt="From IPFS" src={fileUrl} height={480} width={360} />
              )}
              {!fileUrl && <p>No image found</p>}
            </div>
          )}
        </div>
      )}
      {viewMessage.error && <p>{viewMessage.error}</p>}

      {isCorrectKey && (
        <div className="verify">
          <button
            onClick={handleVerifyCertificate}
            style={{
              backgroundColor: '#4caf50', color: 'white', padding: '10px 15px', border: 'none',
              borderRadius: '5px', marginBottom: '10px', cursor: 'pointer'
            }}>
            Verify Certificate
          </button>
        </div>
      )}

      {verificationMessage && <p>{verificationMessage}</p>}
      {signatureValidation && <p>{signatureValidation}</p>}
    </div>
  );
}

export default ViewCertificateComponent;
