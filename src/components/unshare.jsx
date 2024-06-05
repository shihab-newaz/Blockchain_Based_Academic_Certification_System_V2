import React, { useState } from 'react';
import '../css/Issue.css';
import { initContract } from './Contract';

function UnShareCertificateComponent() {
  const [receiverAddress, setReceiverAddress] = useState('');
  const[studentAddress, setStudentAddress] = useState(''); 
  const [shareResult, setShareResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const unshareCertificate = async () => {
    setIsLoading(true);
    try {
      const {contract} = initContract();
      const startTime = performance.now(); // Start counting execution time

      const transaction = await contract.unshareCertificate(studentAddress,receiverAddress);
      await transaction.wait();
      const endTime = performance.now(); // Stop counting execution time
      const executionTime = endTime - startTime; // Calculate execution time  
      
      console.log('Execution time for unshareCertificate:', executionTime, 'ms');
      setShareResult('Certificate unshared successfully!');
    } catch (error) {
      console.error('Error unsharing certificate:', error);
      setShareResult('Failed to unshare certificate');
    }
    setIsLoading(false);
  };

  return (
    <div className='share-certificate-container'>
      <h1>Unshare Certificate</h1>
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
      <button onClick={unshareCertificate}>Unshare Certificate</button>
      {isLoading && <p>Unsharing...</p>}
      <p>{shareResult}</p>
    </div>
  );
}

export default UnShareCertificateComponent;