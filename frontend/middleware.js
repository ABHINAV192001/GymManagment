
import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;
    const role = request.cookies.get('userRole')?.value;

    // Handle case-sensitivity for Explore route
    if (pathname === '/user/Explore') {
        return NextResponse.rewrite(new URL('/user/explore', request.url));
    }

    // Define paths
    const authRoutes = ['/auth/login', '/auth/register', '/auth/signup'];
    const protectedRoutes = ['/branch', '/admin', '/user'];

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Debug logging (Full-Debug Mode)
    if (isProtectedRoute || isAuthRoute) {
        console.log(`DEBUG: [Middleware] Path: ${pathname}, TokenFound: ${!!token}, Role: ${role || 'None'}`);
    }

    // 1. Protect Private Routes: Redirect to Login if no token
    if (isProtectedRoute && !token) {
        console.warn(`DEBUG: [Middleware] Redirecting to login! Missing token for path: ${pathname}`);
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 2. Redirect from Auth Routes if Logged In
    if (isAuthRoute && token) {
<<<<<<< Updated upstream
        let targetDashboard = '/branch/dashboard'; 
        const upperRole = role?.toUpperCase() || '';

        if (['ADMIN', 'SUPER_ADMIN', 'OWNER', 'ORG_ADMIN'].includes(upperRole)) {
=======
        // Determine dashboard based on role (Normalize to uppercase and handle ROLE_ prefix)
        const rawRole = request.cookies.get('userRole')?.value || '';
        const role = rawRole.toUpperCase().replace('ROLE_', '');
        
        console.log(`DEBUG: [Middleware] Decoded Role: ${role} from Raw: ${rawRole}`);

        let targetDashboard = '/branch/dashboard'; // Default for Branch Admin/Staff

        if (['ADMIN', 'SUPER_ADMIN', 'OWNER', 'ORG_ADMIN'].includes(role)) {
>>>>>>> Stashed changes
            targetDashboard = '/admin/dashboard';
        } else if (upperRole === 'TRAINER') {
            targetDashboard = '/branch/trainer-dashboard';
<<<<<<< Updated upstream
        } else if (upperRole === 'USER' || upperRole === 'PREMIUM_USER') {
=======
        } else if (['USER', 'PREMIUM_USER'].includes(role)) {
>>>>>>> Stashed changes
            targetDashboard = '/user';
        }

        // Avoid infinite loop if already on the target dashboard
        if (pathname === targetDashboard) {
            return NextResponse.next();
        }

        console.log(`DEBUG: [Middleware] Logged-in user at auth route. Redirecting to: ${targetDashboard}`);
        return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 3. Proactive Guard for Specialized Dashboards (Strict Enclosure for Trainers)
    const trainerAllowedPrefixes = ['/branch/trainer-dashboard', '/branch/users', '/branch/profile', '/branch/inventory', '/branch/sessions'];
    const isTrainerAllowed = trainerAllowedPrefixes.some(prefix => pathname.startsWith(prefix));

    if (pathname.startsWith('/branch/') && !isTrainerAllowed && role?.toUpperCase() === 'TRAINER') {
        console.log(`DEBUG: [Middleware] Trainer attempting access to unauthorized branch path: ${pathname}. Redirecting to Trainer Terminal.`);
        return NextResponse.redirect(new URL('/branch/trainer-dashboard', request.url));
    }

    // 4. Cache Control
    const response = NextResponse.next();
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
