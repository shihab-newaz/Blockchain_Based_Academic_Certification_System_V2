'use client';

import { useState } from 'react';
import { generateStudentAddress } from '@/lib/generateCredentials';

export function IssueForm() {
  const [studentName, setStudentName] = useState('');
  const [roll, setRoll] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [subject, setSubject] = useState('');
  const [expiry, setExpiry] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAddress = () => {
    const address = generateStudentAddress(generatedAddresses);
    setStudentAddress(address);
    setGeneratedAddresses([...generatedAddresses, address]);
  };

  const handleIssue = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/certificate/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          roll,
          degreeName,
          subject,
          expiry: Number(expiry),
          studentAddress,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message ?? 'Failed to issue certificate');
      }
      setResult(`Certificate issued successfully. IPFS CID: ${body.cid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue certificate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
      <input type="text" placeholder="Roll Number" value={roll} onChange={(e) => setRoll(e.target.value)} />
      <input type="text" placeholder="Degree Name" value={degreeName} onChange={(e) => setDegreeName(e.target.value)} />
      <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <input
        type="number"
        placeholder="Expiration (unix timestamp)"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
      />

      <button type="button" onClick={handleGenerateAddress}>
        Generate Student Credentials
      </button>
      {studentAddress !== '' && <p>Student Address: {studentAddress}</p>}

      <button type="button" onClick={handleIssue} disabled={isLoading || studentAddress === ''}>
        {isLoading ? 'Issuing...' : 'Issue Certificate'}
      </button>
      {isLoading && <div className="spinner" />}
      {result && <p className="success-message">{result}</p>}
      {error && <p className="error-message">{error}</p>}
    </>
  );
}
