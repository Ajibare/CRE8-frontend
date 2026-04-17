import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { Profile } from '../services/profileService';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  creativeId?: string;
  category?: string;
  bio?: string;
  country?: string;
  state?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    portfolio?: string;
  };
  portfolio?: string;
  role: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | Profile) => void;
  getProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  completeRegistration: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          const { token, user } = response;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          await authService.register(data);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | Profile) => {
        const mappedUser: User = {
          ...user,
          id: (user as any)._id || (user as any).id,
        };
        set({ user: mappedUser });
      },

      getProfile: async () => {
        try {
          const response = await authService.getProfile();
          set({ user: response.user });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      },

      updateProfile: async (data: any) => {
        try {
          const response = await authService.updateProfile(data);
          set({ user: response.user });
        } catch (error) {
          console.error('Failed to update profile:', error);
          throw error;
        }
      },

      completeRegistration: async () => {
        try {
          await authService.completeRegistration();
          await get().getProfile();
        } catch (error) {
          console.error('Failed to complete registration:', error);
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          await authService.forgotPassword(email);
        } catch (error) {
          console.error('Failed to send password reset:', error);
          throw error;
        }
      },

      resetPassword: async (token: string, email: string, newPassword: string) => {
        try {
          await authService.resetPassword(token, email, newPassword);
        } catch (error) {
          console.error('Failed to reset password:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.user) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
