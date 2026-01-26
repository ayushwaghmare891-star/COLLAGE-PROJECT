import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedItem {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: string;
  expiryDays: number;
  brand: string;
  savedAt: string;
}

interface SavedState {
  savedItems: SavedItem[];
  addSavedItem: (item: SavedItem) => void;
  removeSavedItem: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAllSaved: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedItems: [],

      addSavedItem: (item: SavedItem) => {
        set((state) => {
          // Check if item already exists
          if (state.savedItems.some((saved) => saved.id === item.id)) {
            return state;
          }
          return {
            savedItems: [
              ...state.savedItems,
              { ...item, savedAt: new Date().toISOString() },
            ],
          };
        });
      },

      removeSavedItem: (id: string) => {
        set((state) => ({
          savedItems: state.savedItems.filter((item) => item.id !== id),
        }));
      },

      isSaved: (id: string) => {
        return get().savedItems.some((item) => item.id === id);
      },

      clearAllSaved: () => {
        set({ savedItems: [] });
      },
    }),
    {
      name: 'saved-items-storage',
    }
  )
);
