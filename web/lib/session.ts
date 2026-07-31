import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'session';

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSessionToken()) !== undefined;
}
