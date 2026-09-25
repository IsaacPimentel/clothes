import { create } from 'zustand';

import { DEFAULT_OUTFIT, type Outfit } from '../types/outfit';

interface OutfitStore extends Outfit {
  setTop: (top: Outfit['top']) => void;
  setBottom: (bottom: Outfit['bottom']) => void;
  setShoes: (shoes: Outfit['shoes']) => void;
  setAccessory: (accessory: Outfit['accessory']) => void;
  setGarmentColor: (garmentColor: string) => void;
  resetOutfit: () => void;
}

export const useOutfitStore = create<OutfitStore>((set) => ({
  ...DEFAULT_OUTFIT,
  setTop: (top) => set({ top }),
  setBottom: (bottom) => set({ bottom }),
  setShoes: (shoes) => set({ shoes }),
  setAccessory: (accessory) => set({ accessory }),
  setGarmentColor: (garmentColor) => set({ garmentColor }),
  resetOutfit: () => set({ ...DEFAULT_OUTFIT }),
}));
