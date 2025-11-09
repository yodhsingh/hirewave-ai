import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: Role | null;


  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,

      login: (user: User, accessToken: string, refreshToken: string) => {
        console.log('[AuthStore.login] Called with user:', user.email, 'role:', user.role);
        console.log('[AuthStore.login] Access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NONE');
        console.log('[AuthStore.login] Refresh token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NONE');

        // Also store tokens in standalone localStorage keys for immediate access
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          console.log('[AuthStore.login] Tokens stored in localStorage');
        }

        set({
          user,
          token: accessToken,
          refreshToken,
          isAuthenticated: true,
          role: user.role,
        });

        console.log('[AuthStore.login] State updated');
      },

      logout: () => {
        // Clear all auth-related data from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage'); // Clear Zustand persisted state

          // Clear any other potential auth keys
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auth') || key.includes('token'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          role: null,
        });
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);