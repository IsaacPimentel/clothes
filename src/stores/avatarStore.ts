import { create } from 'zustand';

import { DEFAULT_AVATAR_PROFILE, type AvatarProfile } from '../types/avatar';

interface AvatarStore extends AvatarProfile {
  updateAvatar: (updates: Partial<AvatarProfile>) => void;
  resetAvatar: () => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  ...DEFAULT_AVATAR_PROFILE,
  updateAvatar: (updates) =>
    set((state) => ({
      ...state,
      ...updates,
    })),
  resetAvatar: () => set({ ...DEFAULT_AVATAR_PROFILE }),
}));
