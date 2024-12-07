import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Try to get the session
    const { data: { session }, error } = await supabase.auth.getSession();

    // If there's an error getting the session, throw it
    if (error) throw error;

    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');
    const isAuthRoute = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register';

    if (isProtectedRoute) {
      if (!session) {
        // Store the attempted URL to redirect back after login
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Refresh the session if it exists
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const redirectUrl = new URL('/login', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error for protected routes, redirect to login
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};