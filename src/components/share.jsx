import React, { useState } from 'react';
import '../css/Issue.css';
import { initContract } from './Contract';

function ShareCertificateComponent() {
  const [receiverAddress, setReceiverAddress] = useState('');
  const[studentAddress, setStudentAddress] = useState(''); 
  const [shareResult, setShareResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const shareCertificate = async () => {
    setIsLoading(true);
    try {

      const {contract} = initContract();
      const startTime = performance.now(); // Start counting execution time
      const transaction = await contract.shareCertificate(studentAddress,receiverAddress);
      await transaction.wait();
      const endTime = performance.now(); // Stop counting execution time
      const executionTime = endTime - startTime; // Calculate execution time  
      
      console.log('Execution time for shareCertificate:', executionTime, 'ms');
      setShareResult('Certificate shared successfully!');
    } catch (error) {
      console.error('Error sharing certificate:', error);
      setShareResult('Failed to share certificate');
    }
    setIsLoading(false);
  };

  return (
    <div className='share-certificate-container'>
      <h1>Share Certificate</h1>
      <input
        type="text"
        placeholder="University/Employer Address"
        onChange={(e) => setReceiverAddress(e.target.value)}
      />
        <input
        type="text"
        placeholder="Student Address"
        onChange={(e) => setStudentAddress(e.target.value)}
      />
      <button onClick={shareCertificate}>Share Certificate</button>
      {isLoading && <p>Sharing...</p>}
      <p>{shareResult}</p>
    </div>
  );
}

export default ShareCertificateComponent;