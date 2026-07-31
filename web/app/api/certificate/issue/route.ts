import { forwardToNest } from '@/lib/nest-proxy';

export async function POST(request: Request) {
  const body = await request.json();
  return forwardToNest('/certificate/issue', { method: 'POST', body });
}
