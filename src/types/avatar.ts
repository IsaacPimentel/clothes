export type AvatarGender = 'male' | 'female';

export type AvatarMeasurements = {
  height: number;
  bust: number;
  waist: number;
  hips: number;
};

export type AvatarProfile = AvatarMeasurements & {
  skinTone: string;
  gender: AvatarGender;
};

export type MeasurementKey = keyof AvatarMeasurements;

/** Reference measurements (cm) loaded when the user switches gender. */
export const GENDER_PRESETS: Record<AvatarGender, AvatarMeasurements> = {
  female: { height: 170, bust: 92, waist: 68, hips: 96 },
  male: { height: 178, bust: 100, waist: 84, hips: 98 },
};

export const MEASUREMENT_RANGES: Record<MeasurementKey, { min: number; max: number }> = {
  height: { min: 150, max: 200 },
  bust: { min: 70, max: 130 },
  waist: { min: 50, max: 120 },
  hips: { min: 70, max: 135 },
};

export const DEFAULT_AVATAR_PROFILE: AvatarProfile = {
  ...GENDER_PRESETS.female,
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
