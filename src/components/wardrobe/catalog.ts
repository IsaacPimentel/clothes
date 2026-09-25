import type { Outfit } from '../../types/outfit';

export type GarmentCategory = 'top' | 'bottom' | 'shoes' | 'accessory';

type OptionOf<C extends GarmentCategory> = {
  category: C;
  value: Outfit[C];
  label: string;
  detail: string;
};

export type GarmentOption =
  | OptionOf<'top'>
  | OptionOf<'bottom'>
  | OptionOf<'shoes'>
  | OptionOf<'accessory'>;

export type CategoryFilter = GarmentCategory | 'all';

export const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Pantalones' },
  { key: 'shoes', label: 'Zapatos' },
  { key: 'accessory', label: 'Accesorios' },
];

export const CATEGORY_TITLES: Record<GarmentCategory, string> = {
  top: 'Tops',
  bottom: 'Pantalones',
  shoes: 'Zapatos',
  accessory: 'Accesorios',
};

export const GARMENT_OPTIONS: GarmentOption[] = [
  { category: 'top', value: 'classic', label: 'Camiseta', detail: 'Algodón' },
  { category: 'top', value: 'hoodie', label: 'Hoodie', detail: 'Felpa' },
  { category: 'top', value: 'overshirt', label: 'Sobrecamisa', detail: 'Sarga' },
  { category: 'top', value: 'tank', label: 'Tank top', detail: 'Rib' },
  { category: 'bottom', value: 'jeans', label: 'Jeans', detail: 'Denim' },
  { category: 'bottom', value: 'trousers', label: 'Pantalón', detail: 'Recto' },
  { category: 'bottom', value: 'shorts', label: 'Shorts', detail: 'Chino' },
  { category: 'shoes', value: 'sneakers', label: 'Zapatillas', detail: 'Urbanas' },
  { category: 'shoes', value: 'boots', label: 'Botas', detail: 'Cuero' },
  { category: 'shoes', value: 'loafers', label: 'Mocasines', detail: 'Cuero' },
  { category: 'accessory', value: 'none', label: 'Ninguno', detail: 'Sin accesorio' },
  { category: 'accessory', value: 'glasses', label: 'Gafas', detail: 'Metal' },
  { category: 'accessory', value: 'cap', label: 'Gorra', detail: 'Visera' },
];

export const labelFor = (category: GarmentCategory, value: string) =>
  GARMENT_OPTIONS.find((option) => option.category === category && option.value === value)?.label ?? value;

/** "Camiseta · Jeans · Zapatillas", plus the accessory when there is one. */
export const outfitSummary = (outfit: Outfit) =>
  [
    labelFor('top', outfit.top),
    labelFor('bottom', outfit.bottom),
    labelFor('shoes', outfit.shoes),
    outfit.accessory === 'none' ? null : labelFor('accessory', outfit.accessory),
  ]
    .filter(Boolean)
    .join(' · ');
