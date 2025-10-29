import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;

  // Actions
  login: (email: string, role: Role) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Mock authentication for development
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,

      login: (email: string, role: Role) => {
        const mockUser: User = {
          id: Math.random().toString(36).substring(2),
          email,
          name: email.split('@')[0],
          role,
          companyId: role === 'hr' ? 'company_123' : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockToken = `mock_token_${Date.now()}`;

        set({
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
          role,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
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
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);