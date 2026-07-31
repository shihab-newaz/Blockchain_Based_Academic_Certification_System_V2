import { forwardToNest } from '@/lib/nest-proxy';

export async function DELETE(_request: Request, { params }: { params: Promise<{ studentAddress: string }> }) {
  const { studentAddress } = await params;
  return forwardToNest(`/certificate/revoke/${encodeURIComponent(studentAddress)}`, { method: 'DELETE' });
}
