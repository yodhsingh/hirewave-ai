'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { backendClient } from '@/lib/api/backend-client';

/**
 * AuthGuard component that validates auth tokens on app initialization
 * and clears stale tokens if they're invalid
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    // Only run validation if user is authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    // Validate the current auth token
    const validateToken = async () => {
      try {
        // Try to fetch user's jobs (or any authenticated endpoint)
        const response = await backendClient.getJobs();

        // If we get an error, the token is likely stale
        if (!response.success) {
          console.warn('Auth token validation failed, clearing stale session');
          logout();
        }
      } catch (error) {
        // On error, clear the stale session
        console.warn('Auth token validation error, clearing stale session:', error);
        logout();
      }
    };

    validateToken();
  }, []); // Only run once on mount

  return <>{children}</>;
}
