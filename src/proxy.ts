import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, encrypt } from './lib/auth';

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const sessionCookie = request.cookies.get('session')?.value;

  let session = null;
  if (sessionCookie) {
    try {
      session = await decrypt(sessionCookie);
    } catch {
      session = null;
    }
  }

  // Not logged in and not on login page -> redirect to login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in and on login page -> redirect to home
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Refresh the session cookie if it exists
  if (session) {
    try {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      session.expires = expires;
      const res = NextResponse.next();
      res.cookies.set({
        name: 'session',
        value: await encrypt(session),
        httpOnly: true,
        expires,
      });
      return res;
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
