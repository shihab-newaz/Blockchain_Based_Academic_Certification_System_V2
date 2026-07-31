'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StudentAddressForm() {
  const [address, setAddress] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      router.push(`/view-certificate/${encodeURIComponent(address)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter student address"
      />
      <button type="submit">View Certificate</button>
    </form>
  );
}
