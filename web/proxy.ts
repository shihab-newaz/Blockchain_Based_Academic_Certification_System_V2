import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16 renamed middleware.ts -> proxy.ts (same API). Gates the issuer
// pages client-side; the actual authorization boundary is the JWT check in
// api/src/auth/jwt-auth.guard.ts on every protected API call.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has('session');
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/certificates/:path*'],
};
