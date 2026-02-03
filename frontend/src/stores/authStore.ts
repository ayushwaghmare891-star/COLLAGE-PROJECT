import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole, additionalInfo?: any) => Promise<boolean>;
  logout: () => Promise<void>;
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
          // Use unified login endpoint for all roles
          const endpoint = `${API_BASE_URL}/auth/login`;

          console.log(`Attempting unified login for role: ${role}`);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role }),
          }).catch(networkError => {
            console.error('Network error during login:', networkError);
            throw new Error(`Network error: ${networkError.message}. Is the backend running?`);
          });

          if (!response.ok) {
            // For 401/403 auth errors, return false instead of throwing to allow auto-detection to continue
            if (response.status === 401 || response.status === 403) {
              try {
                const errorData = await response.json();
                console.log(`${role} login attempt failed:`, errorData.message);
                
                // If this is a WRONG_ROLE error, throw it so it can be handled by the UI
                if (errorData.code === 'WRONG_ROLE') {
                  const error = new Error(errorData.message);
                  (error as any).code = 'WRONG_ROLE';
                  (error as any).correctRole = errorData.correctRole;
                  throw error;
                }
              } catch (e) {
                console.log(`${role} login attempt failed: ${response.status}`);
                // Re-throw WRONG_ROLE errors
                if ((e as any).code === 'WRONG_ROLE') {
                  throw e;
                }
              }
              return false;
            }
            
            // For other errors, throw
            let errorMessage = `HTTP ${response.status}: `;
            try {
              const errorData = await response.json();
              errorMessage += errorData.message || 'Login failed';
              console.error('Login error response:', errorData);
            } catch (parseError) {
              errorMessage += await response.text();
              console.error('Could not parse error response');
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log('Login response:', { success: data.success, user: data.user?.email, role: data.user?.role });
          
          if (data.success && data.token && data.user) {
            // Determine actual role from server response
            const actualRole = data.user.role || role;
            
            // For admin users, fetch complete profile information
            let adminProfile = null;
            if (actualRole === 'admin') {
              try {
                const profileResponse = await fetch(`${API_BASE_URL}/admin/profile`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json',
                  },
                });
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  adminProfile = profileData.data || profileData.user;
                }
              } catch (error) {
                console.log('Note: Could not fetch full admin profile');
              }
            }

            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: actualRole as UserRole,
              university: actualRole === 'student' ? 'University' : undefined,
              isVerified: data.user.isVerified || false,
              createdAt: new Date().toISOString(),
              // Admin fields
              ...(actualRole === 'admin' && {
                phoneNumber: adminProfile?.phoneNumber || data.user.phoneNumber,
                bio: adminProfile?.bio || data.user.bio,
                profilePicture: adminProfile?.profilePicture || data.user.profilePicture,
                permissions: adminProfile?.permissions || data.user.permissions || [],
                isActive: adminProfile?.isActive !== undefined ? adminProfile.isActive : true,
                isSuspended: adminProfile?.isSuspended !== undefined ? adminProfile.isSuspended : false,
              }),
            };

            set({
              user,
              isAuthenticated: true,
              token: data.token,
            });

            // Store token in localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(user));

            return true;
          }

          return false;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          console.error('Login error:', message);
          // Don't throw authentication errors, let them be handled as false returns
          // Only throw network/server errors and WRONG_ROLE errors
          if (message.includes('Network error') || message.includes('HTTP 5') || (error as any).code === 'WRONG_ROLE') {
            throw error;
          }
          return false;
        }
      },

      signup: async (email: string, password: string, name: string, role: UserRole, additionalInfo?: any) => {
        try {
          const endpoint = `${API_BASE_URL}/auth/register`;
          
          console.log('🔐 SIGNUP DEBUG - Starting signup...');
          console.log('  Endpoint:', endpoint);
          console.log('  Name:', name);
          console.log('  Email:', email);
          console.log('  Role:', role);
          
          const body: any = {
            name,
            email,
            password,
            role,
            ...(role === 'student' && {
              collegeName: additionalInfo?.collegeName,
              courseName: additionalInfo?.courseName,
              yearOfStudy: additionalInfo?.yearOfStudy,
              enrollmentNumber: additionalInfo?.enrollmentNumber,
              studentId: additionalInfo?.studentId,
              collegeEmailId: additionalInfo?.collegeEmailId,
              university: additionalInfo?.university,
              mobileNumber: additionalInfo?.mobileNumber,
              city: additionalInfo?.city,
              state: additionalInfo?.state,
            }),
            ...(role === 'vendor' && {
              businessName: additionalInfo?.businessName,
              businessCategory: additionalInfo?.businessType,
              businessRegistration: additionalInfo?.businessRegistration,
              gstNumber: additionalInfo?.gstNumber,
              businessEmail: additionalInfo?.businessEmail,
              businessAddress: additionalInfo?.businessAddress,
              mobileNumber: additionalInfo?.mobileNumber,
              city: additionalInfo?.city,
              state: additionalInfo?.state,
            }),
          };

          console.log('📤 Sending request...');
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          console.log('📥 Response received:', {
            status: response.status,
            statusText: response.statusText,
          });

          if (!response.ok) {
            console.error('❌ Response not OK:', response.status);
            const errorData = await response.json().catch(() => ({ message: 'Signup failed' }));
            console.error('Error data:', errorData);
            throw new Error(errorData.message || 'Signup failed');
          }

          const data = await response.json();
          console.log('✅ Response data:', {
            success: data.success,
            hasToken: !!data.token,
            hasUser: !!data.user,
            userId: data.user?.id,
          });

          if (data.success && data.token && data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role,
              university: role === 'student' ? 'University' : undefined,
              isVerified: data.user.isVerified || false,
              createdAt: new Date().toISOString(),
              ...(role === 'vendor' && {
                businessName: data.user.businessName,
              }),
            };

            set({
              user,
              isAuthenticated: true,
              token: data.token,
            });

            // Store token in localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(user));

            console.log('✅ SIGNUP SUCCESS - User stored in state and localStorage');
            return true;
          }

          console.warn('⚠️ Signup response missing required fields');
          return false;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Signup failed';
          console.error('❌ SIGNUP ERROR:', message);
          console.error('Full error:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          
          // Call backend logout endpoint to record logout session
          if (token) {
            try {
              await fetch(`${API_BASE_URL}/login/logout`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ token }),
              });
            } catch (error) {
              console.error('Error recording logout:', error);
              // Continue with logout even if API call fails
            }
          }

          // Clear localStorage first
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('verification_status');
          
          // Then clear Zustand state
          set({
            user: null,
            isAuthenticated: false,
            token: null,
          });
          
          console.log('Logout successful');
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear local state even if there's an error
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('verification_status');
          set({
            user: null,
            isAuthenticated: false,
            token: null,
          });
          throw error;
        }
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
