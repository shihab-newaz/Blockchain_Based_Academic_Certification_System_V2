import { getSessionToken } from './session';

const NEST_API_URL = process.env.NEST_API_URL ?? 'http://localhost:3001';

// Shared by the app/api/certificate/* route handlers: forwards a mutating
// request to the Nest API with the issuer's JWT attached server-side, so the
// token never reaches client-side JavaScript.
export async function forwardToNest(
  path: string,
  init: { method: string; body?: unknown },
): Promise<Response> {
  const token = await getSessionToken();
  if (!token) {
    return Response.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const nestRes = await fetch(`${NEST_API_URL}${path}`, {
    method: init.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const data = await nestRes.json().catch(() => ({}));
  return Response.json(data, { status: nestRes.status });
}
