'use client';

import { useState } from 'react';
import { verifyCertificate } from '@/lib/api';

export function VerifyButton({ studentAddress }: { studentAddress: string }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    setResult(null);
    try {
      setResult(await verifyCertificate(studentAddress));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="verification-section">
      <button type="button" onClick={handleVerify} disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Verify Certificate'}
      </button>
      {result !== null && (
        <p className={result ? 'success-message' : 'error-message'}>
          {result ? 'Certificate is valid and not revoked.' : 'Certificate is not valid or has been revoked.'}
        </p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
