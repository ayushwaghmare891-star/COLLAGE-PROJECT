export type UserRole = 'student' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  university?: string;
  companyName?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface Discount {
  id: string;
  vendorId: string;
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

export interface VendorDiscount extends Discount {
  usageCount: number;
  totalViews: number;
  isActive: boolean;
}
