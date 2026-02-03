import { create } from 'zustand';
import type { Discount } from '../types';

interface AppState {
  verificationStatus: 'not-verified' | 'pending' | 'verified';
  discounts: Discount[];
  setVerificationStatus: (status: 'not-verified' | 'pending' | 'verified') => void;
  markDiscountAsUsed: (id: string, code: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  verificationStatus: 'not-verified',
  discounts: [],
  setVerificationStatus: (status) => set({ verificationStatus: status }),
  markDiscountAsUsed: (id, code) =>
    set((state) => ({
      discounts: state.discounts.map((d) =>
        d.id === id ? { ...d, isUsed: true, code } : d
      ),
    })),
}));
