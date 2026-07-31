import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/session';

const NEST_API_URL = process.env.NEST_API_URL ?? 'http://localhost:3001';

export async function POST(request: Request) {
  const body = await request.json();

  const nestRes = await fetch(`${NEST_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!nestRes.ok) {
    const error = await nestRes.json().catch(() => ({ message: 'Login failed' }));
    return Response.json({ message: error.message ?? 'Login failed' }, { status: nestRes.status });
  }

  const { accessToken } = await nestRes.json();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 2,
  });

  return Response.json({ success: true });
}
