import { fetchCertificate } from '@/lib/api';
import { VerifyButton } from '@/components/VerifyButton';

export default async function ViewCertificatePage({
  params,
}: {
  params: Promise<{ studentAddress: string }>;
}) {
  const { studentAddress } = await params;

  let certificate;
  let loadError: string | null = null;
  try {
    certificate = await fetchCertificate(studentAddress);
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load certificate';
  }

  if (loadError) {
    return <div className="error-message">Error: {loadError}</div>;
  }

  return (
    <div className="card-form certificate-details">
      <h2>Certificate Details</h2>
      <p>
        <strong>Student Name:</strong> {certificate!.studentName}
      </p>
      <p>
        <strong>Roll Number:</strong> {certificate!.roll}
      </p>
      <p>
        <strong>Degree Name:</strong> {certificate!.degreeName}
      </p>
      <p>
        <strong>Subject:</strong> {certificate!.subject}
      </p>
      <p>
        <strong>Issue Date:</strong> {new Date(certificate!.issueTimestamp * 1000).toLocaleString()}
      </p>
      <p>
        <strong>Expiration:</strong> {new Date(certificate!.expiration * 1000).toLocaleString()}
      </p>

      <VerifyButton studentAddress={studentAddress} />

      <p>
        <a href={`/certificates/${encodeURIComponent(studentAddress)}/update`}>Update this certificate</a>
        {' · '}
        <a href={`/certificates/${encodeURIComponent(studentAddress)}/revoke`}>Revoke this certificate</a>
      </p>
    </div>
  );
}
