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
