import { create } from 'zustand';

import {
  DEFAULT_AVATAR_PROFILE,
  GENDER_PRESETS,
  type AvatarGender,
  type AvatarProfile,
} from '../types/avatar';

interface AvatarStore extends AvatarProfile {
  updateAvatar: (updates: Partial<AvatarProfile>) => void;
  /** Switches gender and loads its reference measurements. */
  setGender: (gender: AvatarGender) => void;
  /** Restores the reference measurements of the current gender. */
  resetMeasurements: () => void;
  resetAvatar: () => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  ...DEFAULT_AVATAR_PROFILE,
  updateAvatar: (updates) =>
    set((state) => ({
      ...state,
      ...updates,
    })),
  setGender: (gender) =>
    set((state) => (state.gender === gender ? state : { gender, ...GENDER_PRESETS[gender] })),
  resetMeasurements: () => set((state) => ({ ...GENDER_PRESETS[state.gender] })),
  resetAvatar: () => set({ ...DEFAULT_AVATAR_PROFILE }),
}));
