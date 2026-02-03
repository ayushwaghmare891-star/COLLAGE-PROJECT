// User and Authentication Types
export type UserRole = 'student' | 'admin' | 'vendor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  university?: string;
  isVerified: boolean;
  createdAt: string;
  // Admin specific fields
  phoneNumber?: string;
  bio?: string;
  profilePicture?: string;
  permissions?: string[];
  isActive?: boolean;
  isSuspended?: boolean;
  // Vendor specific fields
  businessName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Discount Types
export interface Discount {
  id: string;
  brand: string;
  discount: string;
  description: string;
  category: string;
  expiryDays: number;
  isExpired: boolean;
  isUsed: boolean;
  code?: string;
  termsAndConditions: string;
  createdAt: string;
}
