import { NextResponse } from 'next/server';

export default function proxy(request) {
  const role = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const permissions = {
    '/koo-phio': ['admin'],
    '/demos/slider': ['admin', 'editor'],
    '/tools/Rotate': ['admin', 'editor', 'user'],
  };

  const pathKey = Object.keys(permissions).find(path => pathname.startsWith(path));

  if (pathKey) {
    const allowedRoles = permissions[pathKey];

    if (!role) {
      return NextResponse.redirect(new URL('/?auth_error=not_logged_in', request.url));
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/?auth_error=no_permission', request.url));
    }
  }

  return NextResponse.next();
}

// 這個部分保持不變
export const config = {
  matcher: [
    '/demos/:path*', 
    '/tools/:path*', 
    '/koo-phio/:path*'
  ],
};