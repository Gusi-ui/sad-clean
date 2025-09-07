import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si hay parámetros de recuperación en la URL
  const searchParams = request.nextUrl.searchParams;
  const hash = request.nextUrl.hash;

  // Buscar tokens en parámetros de búsqueda
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  // Buscar tokens en hash (para enlaces de Supabase)
  let hashAccessToken = null;
  let hashRefreshToken = null;
  let hashType = null;

  if (hash && hash.startsWith('#')) {
    const hashParams = new URLSearchParams(hash.substring(1));
    hashAccessToken = hashParams.get('access_token');
    hashRefreshToken = hashParams.get('refresh_token');
    hashType = hashParams.get('type');
  }

  // Usar tokens de hash si existen, sino usar los de search params
  const finalAccessToken = hashAccessToken || accessToken;
  const finalRefreshToken = hashRefreshToken || refreshToken;
  const finalType = hashType || type;

  // Si hay tokens de recuperación y no estamos ya en la página de reset
  if (finalAccessToken && finalRefreshToken && finalType === 'recovery' && pathname !== '/auth/reset-password') {
    console.log('Middleware: Token de recuperación detectado, redirigiendo...');

    // Redirigir a la página de reset con los parámetros
    const resetUrl = new URL('/auth/reset-password', request.url);
    resetUrl.searchParams.set('access_token', finalAccessToken);
    resetUrl.searchParams.set('refresh_token', finalRefreshToken);
    resetUrl.searchParams.set('type', finalType);

    return NextResponse.redirect(resetUrl);
  }

  return NextResponse.next();
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
