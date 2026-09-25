export type AvatarGender = 'male' | 'female';

export type AvatarProfile = {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  skinTone: string;
  gender: AvatarGender;
};

export const DEFAULT_AVATAR_PROFILE: AvatarProfile = {
  height: 170,
  bust: 92,
  waist: 68,
  hips: 96,
  skinTone: '#F1C7A3',
  gender: 'female',
};

export const SKIN_TONES = [
  '#F1C7A3',
  '#E4B08A',
  '#C98E5D',
  '#8D5B3C',
  '#E7C29C',
  '#A86F4F',
  '#6F4224',
] as const;
