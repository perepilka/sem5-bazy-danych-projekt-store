import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../api/types';

interface User {
  username: string;
  userType: 'CUSTOMER' | 'EMPLOYEE';
  role?: 'KIEROWNIK' | 'SPRZEDAWCA' | 'MAGAZYNIER';
  storeId?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (authData: AuthResponse) => void;
  logout: () => void;
  
  // Helper methods
  isCustomer: () => boolean;
  isEmployee: () => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (authData: AuthResponse) => {
        const user: User = {
          username: authData.username,
          userType: authData.userType,
          role: authData.role,
          storeId: authData.storeId,
        };
        
        // Store token in localStorage
        localStorage.setItem('authToken', authData.token);
        
        set({
          token: authData.token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      isCustomer: () => {
        const { user } = get();
        return user?.userType === 'CUSTOMER';
      },

      isEmployee: () => {
        const { user } = get();
        return user?.userType === 'EMPLOYEE';
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
