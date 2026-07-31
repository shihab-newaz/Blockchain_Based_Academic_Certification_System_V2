'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function UpdateForm({ studentAddress }: { studentAddress: string }) {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [roll, setRoll] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [subject, setSubject] = useState('');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/certificate/update/${encodeURIComponent(studentAddress)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, roll, degreeName, subject, expiry: Number(expiry) }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message ?? 'Failed to update certificate');
      }
      router.push(`/view-certificate/${encodeURIComponent(studentAddress)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update certificate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Certificate'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
}
