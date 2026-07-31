import { forwardToNest } from '@/lib/nest-proxy';

export async function PATCH(request: Request, { params }: { params: Promise<{ studentAddress: string }> }) {
  const { studentAddress } = await params;
  const body = await request.json();
  return forwardToNest(`/certificate/update/${encodeURIComponent(studentAddress)}`, { method: 'PATCH', body });
}
