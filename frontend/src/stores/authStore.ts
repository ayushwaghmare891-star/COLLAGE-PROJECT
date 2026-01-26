import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole, additionalInfo?: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (email: string, password: string, role: UserRole) => {
        try {
          // Route to different endpoints based on user role
          // Note: Both students and admins use the student endpoint (Option B)
          let endpoint = `${API_BASE_URL}/auth/student/login`;
          if (role === 'vendor') {
            endpoint = `${API_BASE_URL}/auth/vendor/login`;
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            console.error('Login failed:', response.statusText);
            return false;
          }

          const data = await response.json();
          
          if (data.token && data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.username,
              role,
              university: role === 'student' ? 'State University' : undefined,
              companyName: role === 'vendor' ? 'Tech Company' : undefined,
              isVerified: data.user.isEmailVerified || false,
              createdAt: new Date().toISOString(),
            };

            set({
              user,
              isAuthenticated: true,
              token: data.token,
            });

            // Store token in localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Store verification status if available
            if (data.user.verificationStatus) {
              localStorage.setItem('verification_status', data.user.verificationStatus);
            }

            return true;
          }

          return false;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      signup: async (email: string, password: string, name: string, role: UserRole, additionalInfo?: any) => {
        try {
          // Route to different endpoints based on user role
          let endpoint = `${API_BASE_URL}/auth/register`;
          let body: any = {
            email,
            password,
          };

          if (role === 'student') {
            endpoint = `${API_BASE_URL}/auth/student/register`;
            body = {
              email,
              password,
              username: name,
              firstName: additionalInfo?.firstName || name.split(' ')[0],
              lastName: additionalInfo?.lastName || name.split(' ')[1] || '',
            };
          } else if (role === 'vendor') {
            endpoint = `${API_BASE_URL}/auth/vendor/register`;
            body = {
              email,
              password,
              businessName: additionalInfo?.companyName || additionalInfo?.businessName || '',
              ownerFirstName: name.split(' ')[0] || '',
              ownerLastName: name.split(' ')[1] || '',
            };
          } else {
            // Admin
            body = {
              email,
              password,
              username: name,
              firstName: additionalInfo?.firstName || name.split(' ')[0],
              lastName: additionalInfo?.lastName || name.split(' ')[1] || '',
            };
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            const errorMessage = errorData.error || errorData.message || 'Signup failed';
            console.error('Signup failed:', response.status, errorMessage);
            throw new Error(errorMessage);
          }

          const data = await response.json();

          if (data.token && data.user) {
            // Handle different user types with their specific fields
            let userName = data.user.username || `${data.user.ownerFirstName || ''} ${data.user.ownerLastName || ''}`.trim();
            
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: userName,
              role,
              university: role === 'student' ? additionalInfo?.university : undefined,
              companyName: role === 'vendor' ? data.user.businessName || additionalInfo?.companyName : undefined,
              isVerified: data.user.isEmailVerified || false,
              createdAt: new Date().toISOString(),
            };

            set({
              user,
              isAuthenticated: true,
              token: data.token,
            });

            // Store token in localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Store verification status if available (especially for students)
            if (data.verificationStatus) {
              localStorage.setItem('verification_status', data.verificationStatus);
            } else if (role === 'student') {
              // Students are auto-approved
              localStorage.setItem('verification_status', 'verified');
            }

            return true;
          }

          console.error('Signup response missing token or user:', data);
          throw new Error('Invalid response from server');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Signup failed';
          console.error('Signup failed:', message);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
        });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({
            user: updatedUser,
          });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
