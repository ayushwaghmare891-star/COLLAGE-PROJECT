import { create } from 'zustand';
import { Discount, VendorDiscount } from '../types';

interface AppState {
  verificationStatus: 'not-verified' | 'pending' | 'verified';
  discounts: Discount[];
  vendorDiscounts: VendorDiscount[];
  allOffers: VendorDiscount[]; // All vendor offers (for students/admins)
  setVerificationStatus: (status: 'not-verified' | 'pending' | 'verified') => void;
  markDiscountAsUsed: (id: string, code: string) => void;
  addVendorDiscount: (discount: Omit<VendorDiscount, 'id' | 'createdAt' | 'usageCount' | 'totalViews'>) => void;
  updateVendorDiscount: (id: string, updates: Partial<VendorDiscount>) => void;
  deleteVendorDiscount: (id: string) => void;
  setVendorDiscounts: (discounts: VendorDiscount[]) => void;
  setAllOffers: (offers: VendorDiscount[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  verificationStatus: 'not-verified',
  vendorDiscounts: [],
  allOffers: [],
  discounts: [],
  setVerificationStatus: (status) => set({ verificationStatus: status }),
  markDiscountAsUsed: (id, code) =>
    set((state) => ({
      discounts: state.discounts.map((d) =>
        d.id === id ? { ...d, isUsed: true, code } : d
      ),
    })),
  
  addVendorDiscount: (discount) =>
    set((state) => ({
      vendorDiscounts: [
        ...state.vendorDiscounts,
        {
          ...discount,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          usageCount: 0,
          totalViews: 0,
        },
      ],
    })),

  updateVendorDiscount: (id, updates) =>
    set((state) => ({
      vendorDiscounts: state.vendorDiscounts.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  deleteVendorDiscount: (id) =>
    set((state) => ({
      vendorDiscounts: state.vendorDiscounts.filter((d) => d.id !== id),
    })),

  setVendorDiscounts: (discounts) => set({ vendorDiscounts: discounts }),
  
  setAllOffers: (offers) => set({ allOffers: offers }),
}));
