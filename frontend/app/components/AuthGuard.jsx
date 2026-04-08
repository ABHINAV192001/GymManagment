
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api/auth';

/**
 * AuthGuard Component
 * 
 * 1. Synchronizes local tab-session state with cookies.
 * 2. Provides diagnostic visibility into the authentication state.
 */
export default function AuthGuard({ children }) {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async (retryCount = 0) => {
            const authenticated = isAuthenticated();
            
            if (authenticated) {
                if (typeof window !== 'undefined' && !sessionStorage.getItem('received_session')) {
                    sessionStorage.setItem('received_session', 'true');
                }
                return;
            }

            // Sync/Race Condition Diagnostic Logic
            if (retryCount === 0) {
                console.log(`DEBUG: [AuthGuard] Potential race detected. Waiting 500ms...`);
                setTimeout(() => checkAuth(1), 500);
                return;
            }

            console.warn(`DEBUG: [AuthGuard] Still unauthenticated after wait. Session storage hint missing.`);
            sessionStorage.removeItem('received_session');
            
            // NOTE: Redirection is primarily handled by server-side Middleware.
            // If the user reached this component, Middleware has already approved.
            // We maintain a "soft" check here but don't force a redirect to avoid loop conflicts.
        };

        checkAuth();

        // BFcache restoration support
        const handlePageShow = (event) => {
            if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                checkAuth();
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    return <>{children}</>;
}
