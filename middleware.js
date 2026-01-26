// middleware.js (檔名一定要是這個)
import { NextResponse } from 'next/server';

export function middleware(request) { // 這裡建議改用具名導出 middleware
  const role = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const permissions = {
    '/analyze': ['admin'],
    '/demos': ['admin', 'editor'],
    '/tools': ['admin', 'editor', 'user'],
  };

  const pathKey = Object.keys(permissions).find(path => pathname.startsWith(path));

  if (pathKey) {
    const allowedRoles = permissions[pathKey];

    // 如果沒登入
    if (!role) {
      return NextResponse.redirect(new URL('/?auth_error=not_logged_in', request.url));
    }

    // 如果權限不足
    if (!allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/?auth_error=no_permission', request.url));
    }
  }

  return NextResponse.next();
}

// 這裡定義哪些路徑要被這個 Middleware 攔截
export const config = {
  matcher: [
    '/demos/:path*', 
    '/tools/:path*', 
    '/analyze/:path*'
  ],
};