'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RevokeButton({ studentAddress }: { studentAddress: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRevoke = async () => {
    if (!confirm(`Revoke the certificate for ${studentAddress}? This cannot be undone.`)) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/certificate/revoke/${encodeURIComponent(studentAddress)}`, {
        method: 'DELETE',
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message ?? 'Failed to revoke certificate');
      }
      router.push(`/view-certificate/${encodeURIComponent(studentAddress)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke certificate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" className="danger" onClick={handleRevoke} disabled={isLoading}>
        {isLoading ? 'Revoking...' : 'Revoke Certificate'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </>
  );
}
