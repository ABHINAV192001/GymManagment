
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/api/auth';

/**
 * AuthGuard Component
 * 
 * 1. Checks authentication on mount.
 * 2. Listens for 'pageshow' event to handle BFcache (Back/Forward Cache).
 *    If the page is served from cache but the user is logged out, it forces a reload/redirect.
 */
export default function AuthGuard({ children }) {
    const router = useRouter();

    useEffect(() => {
        // 1. Standard check on mount
        const checkAuth = () => {
            // Primarily trust the cookie via isAuthenticated()
            const authenticated = isAuthenticated();

            // sessionStorage check is only as a secondary hint for tab-tracking
            const isSessionActive = typeof window !== 'undefined' && sessionStorage.getItem('received_session');

            if (!authenticated) {
                // If not authenticated via cookie, clear any lingering session state and redirect
                sessionStorage.removeItem('received_session');
                window.location.href = '/auth/login';
            } else if (!isSessionActive) {
                // If authenticated via cookie but no tab-session, sync it
                sessionStorage.setItem('received_session', 'true');
            }
        };

        checkAuth();

        // 2. Handle BFcache restoration
        const handlePageShow = (event) => {
            // event.persisted is true if the page was restored from bfcache
            if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                checkAuth();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [router]);

    return <>{children}</>;
}
