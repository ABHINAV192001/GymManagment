
import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;

    // Handle case-sensitivity for Explore route
    if (pathname === '/user/Explore') {
        return NextResponse.rewrite(new URL('/user/explore', request.url));
    }

    // Define paths
    // Routes that logged-in users shouldn't visit (redirect to dashboard)
    const authRoutes = ['/auth/login', '/auth/register', '/auth/signup'];
    // Routes that require authentication
    const protectedRoutes = ['/branch', '/admin', '/user'];

    // Exception: verify-otp might be needed even if token exists (depending on flow)
    // For now, let's assuming if they have a token they might still need to verify. 
    // But usually verify is part of auth. If they are FULLY logged in they shouldn't be here.
    // Let's stick to Login and Register for auto-redirects to be safe.

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // 1. Protect Private Routes: Redirect to Login if no token
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 2. Redirect from Auth Routes if Logged In
    if (isAuthRoute && token) {
        // Determine dashboard based on role
        const role = request.cookies.get('userRole')?.value;
        let targetDashboard = '/branch/dashboard'; // Default for Branch Admin/Staff

        if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ORG_ADMIN') {
            targetDashboard = '/admin/dashboard';
        } else if (role === 'TRAINER') {
            targetDashboard = '/branch/trainer-dashboard';
        } else if (role === 'USER' || role === 'PREMIUM_USER') {
            targetDashboard = '/user';
        }

        return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 3. Cache Control (Fix "Back" button issue)
    // Prevent the browser from caching protected pages so back button triggers a reload (and thus middleware check)
    const response = NextResponse.next();

    // specific cache control for protected routes logic
    if (isProtectedRoute || isAuthRoute) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public images extensions
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)'],
};
