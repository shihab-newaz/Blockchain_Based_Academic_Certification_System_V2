import React, { useState } from 'react';
import { generateStudentCredentials } from '../utils/GenerateCredentials';
import axios from 'axios';
import '../css/Issue.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_LARAVEL_URL || 'http://localhost:8000',
});

function IssueCertificateComponent() {
  const [studentName, setStudentName] = useState('');
  const [roll, setRoll] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [subject, setSubject] = useState('');
  const [expiry, setExpiry] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [issueResult, setIssueResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedAddresses, setGeneratedAddresses] = useState([]);

  const issueCertificate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/api/issue-certificate`, {
        studentName,
        roll,
        degreeName,
        subject,
        expiry,
        studentAddress
      });

      if (response.data.success) {
        setIssueResult(`Certificate issued successfully! Transaction Hash: ${response.data.data.transactionHash}`);
      } else {
        throw new Error(response.data.message || 'Failed to issue certificate');
      }
    } catch (error) {
      console.error('Error issuing certificate:', error);
      setError(error.response?.data?.error || error.message || 'Failed to issue certificate');
    }
    setIsLoading(false);
  };

  return (
    <div className='issue-certificate-container'>
      <h1>Issue Certificate</h1>
      <input id='issue' type="text" placeholder="Student Name" onChange={(e) => setStudentName(e.target.value)} />
      <input id='issue' type="text" placeholder="Roll Number" onChange={(e) => setRoll(e.target.value)} />
      <input id='issue' type="text" placeholder="Degree Name" onChange={(e) => setDegreeName(e.target.value)} />
      <input id='issue' type="text" placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />
      <input id='issue' type="text" placeholder="Expiration (in days)" onChange={(e) => setExpiry(e.target.value)} />

      <button id='btn' onClick={() => generateStudentCredentials(generatedAddresses, setStudentAddress, setGeneratedAddresses)}>
        Generate Student Credentials
      </button>
      {studentAddress !== '' && <div> Student Address: {studentAddress}</div>}

      <button id='btn' onClick={issueCertificate}>Issue Certificate</button> <br />
      {isLoading && (
        <>
          <div className="spinner"></div>
          <p>Issuing certificate...</p>
        </>
      )}
      {issueResult && <p className="success-message">{issueResult}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default IssueCertificateComponent;