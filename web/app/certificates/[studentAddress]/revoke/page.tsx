import { RevokeButton } from '@/components/RevokeButton';

export default async function RevokeCertificatePage({
  params,
}: {
  params: Promise<{ studentAddress: string }>;
}) {
  const { studentAddress } = await params;
  return (
    <div className="card-form">
      <h1>Revoke Certificate</h1>
      <p>Student Address: {studentAddress}</p>
      <p>This action is irreversible.</p>
      <RevokeButton studentAddress={studentAddress} />
    </div>
  );
}
