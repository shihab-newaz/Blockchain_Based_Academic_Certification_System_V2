// Public, read-only certificate lookups (view/verify) call the Nest API
// directly from the browser — no secret is involved, so NEXT_PUBLIC_API_URL
// is safe to expose. Mutating operations (issue/update/revoke) instead go
// through this app's own /api/certificate/* route handlers, which attach
// the issuer's JWT server-side from the httpOnly session cookie.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface CertificateDetails {
  studentName: string;
  roll: string;
  degreeName: string;
  subject: string;
  studentAddress: string;
  issueTimestamp: number;
  expiration: number;
}

export async function fetchCertificate(studentAddress: string): Promise<CertificateDetails> {
  const res = await fetch(`${API_URL}/certificate/view/${encodeURIComponent(studentAddress)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Failed to load certificate (${res.status})`);
  }
  return res.json();
}

export async function verifyCertificate(studentAddress: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/certificate/verify/${encodeURIComponent(studentAddress)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Verification failed (${res.status})`);
  }
  const data = await res.json();
  return data.isValid;
}
