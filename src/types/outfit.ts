export type TopType = 'classic' | 'hoodie' | 'overshirt' | 'tank';
export type BottomType = 'jeans' | 'trousers' | 'shorts';
export type ShoeType = 'sneakers' | 'boots' | 'loafers';
export type AccessoryType = 'none' | 'glasses' | 'cap';

export type Outfit = {
  top: TopType;
  bottom: BottomType;
  shoes: ShoeType;
  accessory: AccessoryType;
  garmentColor: string;
};

export const DEFAULT_OUTFIT: Outfit = {
  top: 'classic',
  bottom: 'jeans',
  shoes: 'sneakers',
  accessory: 'none',
  garmentColor: '#E5E7EB',
};

/** Colors available for the top garment. */
export const GARMENT_COLORS = ['#E5E7EB', '#F59E0B', '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6'] as const;

// Fixed fabric colors, shared by the 3D renderer and the wardrobe icons.
export const BOTTOM_COLORS: Record<BottomType, string> = {
  jeans: '#2F4A73',
  trousers: '#3A3F4B',
  shorts: '#B59B6A',
};

export const SHOE_COLORS: Record<ShoeType, string> = {
  sneakers: '#1F2937',
  boots: '#6B3A1E',
  loafers: '#3B2416',
};

export const SOLE_COLORS: Record<ShoeType, string> = {
  sneakers: '#F5F5F4',
  boots: '#1C1917',
  loafers: '#1A120D',
};
