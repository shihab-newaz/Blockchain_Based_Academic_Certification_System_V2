import { UpdateForm } from '@/components/UpdateForm';

export default async function UpdateCertificatePage({
  params,
}: {
  params: Promise<{ studentAddress: string }>;
}) {
  const { studentAddress } = await params;
  return (
    <div className="card-form">
      <h1>Update Certificate</h1>
      <p>Student Address: {studentAddress}</p>
      <UpdateForm studentAddress={studentAddress} />
    </div>
  );
}
