import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AvatarCanvas from '../components/3d/AvatarCanvas';
import DraggableSheet from '../components/ui/DraggableSheet';
import OverlayHeader from '../components/ui/OverlayHeader';
import GarmentCard from '../components/wardrobe/GarmentCard';
import {
  CATEGORY_FILTERS,
  CATEGORY_TITLES,
  GARMENT_OPTIONS,
  outfitSummary,
  type CategoryFilter,
  type GarmentCategory,
  type GarmentOption,
} from '../components/wardrobe/catalog';
import { useAvatarSheetLayout } from '../hooks/useAvatarSheetLayout';
import { useOutfitStore } from '../stores/outfitStore';
import { GARMENT_COLORS } from '../types/outfit';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Wardrobe'
>;

// Handle + title + outfit summary: what stays visible when the sheet is collapsed.
const SHEET_PEEK = 86;
const GRID_COLUMNS = 3;
const GRID_GAP = 10;

const SECTION_ORDER: GarmentCategory[] = ['top', 'bottom', 'shoes', 'accessory'];

function CameraIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M4 8 H7.5 L9 5.5 H15 L16.5 8 H20 V19 H4 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={13.2} r={3.4} fill="none" stroke="#FFFFFF" strokeWidth={1.8} />
    </Svg>
  );
}

export default function WardrobeScreen({ navigation }: Props) {
  const { insets, snapPoints, viewport, handleSheetHeight } = useAvatarSheetLayout(SHEET_PEEK);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [gridWidth, setGridWidth] = useState(0);
  const cardWidth = gridWidth > 0 ? (gridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS : 0;
  const outfit = useOutfitStore();
  const { setTop, setBottom, setShoes, setAccessory, setGarmentColor } = outfit;

  const handleSelect = (option: GarmentOption) => {
    switch (option.category) {
      case 'top':
        setTop(option.value);
        break;
      case 'bottom':
        setBottom(option.value);
        break;
      case 'shoes':
        setShoes(option.value);
        break;
      case 'accessory':
        setAccessory(option.value);
        break;
    }
  };

  const sections = SECTION_ORDER.filter((category) => filter === 'all' || filter === category);

  return (
    <View style={styles.container}>
      <AvatarCanvas outfitMode="outfit" viewport={viewport} />

      <OverlayHeader
        title="Mi vestidor"
        topInset={insets.top}
        onBack={() => navigation.goBack()}
        hint="↔ Arrastra el avatar para girarlo"
        right={
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Camera')}
            accessibilityRole="button"
            accessibilityLabel="Escanear prenda con la cámara"
            hitSlop={8}
          >
            <CameraIcon />
          </TouchableOpacity>
        }
      />

      <DraggableSheet
        snapPoints={snapPoints}
        initialSnap={1}
        bottomInset={insets.bottom}
        stickyHeaderIndices={[0]}
        accessibilityLabel="Catálogo de prendas"
        onVisibleHeightChange={handleSheetHeight}
        header={
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={styles.title} selectable={false}>
                Tu look
              </Text>
              <Text style={styles.summary} numberOfLines={1} selectable={false}>
                {outfitSummary(outfit)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.fittingButton}
              onPress={() => navigation.navigate('FittingRoom')}
              accessibilityRole="button"
              accessibilityLabel="Ver en el probador"
            >
              <Text style={styles.fittingButtonText}>Probador ›</Text>
            </TouchableOpacity>
          </View>
        }
      >
        {/* Sticky filters (index 0 of the scroll content). */}
        <View style={styles.filtersBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {CATEGORY_FILTERS.map(({ key, label }) => {
              const active = filter === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setFilter(key)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {sections.map((category) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{CATEGORY_TITLES[category]}</Text>

            <View style={styles.grid} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
              {cardWidth > 0 &&
                GARMENT_OPTIONS.filter((option) => option.category === category).map((option) => (
                  <GarmentCard
                    key={`${option.category}-${option.value}`}
                    option={option}
                    width={cardWidth}
                    topColor={outfit.garmentColor}
                    selected={outfit[option.category] === option.value}
                    onPress={() => handleSelect(option)}
                  />
                ))}
            </View>

            {category === 'top' && (
              <View style={styles.colorRow}>
                <Text style={styles.colorLabel}>Color</Text>
                <View style={styles.swatches}>
                  {GARMENT_COLORS.map((color) => {
                    const selected = outfit.garmentColor === color;
                    return (
                      <Pressable
                        key={color}
                        onPress={() => setGarmentColor(color)}
                        style={[styles.swatch, { backgroundColor: color }, selected && styles.swatchSelected]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`Color ${color}`}
                        hitSlop={4}
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('FittingRoom')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Ver en el probador</Text>
        </TouchableOpacity>
      </DraggableSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#17171DCC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  sheetHeaderText: {
    flex: 1,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  summary: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  fittingButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  fittingButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  filtersBar: {
    backgroundColor: '#17171D',
    paddingBottom: 12,
  },

  filters: {
    gap: 8,
  },

  chip: {
    backgroundColor: '#23232C',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  chipActive: {
    backgroundColor: '#7C3AED',
  },

  chipText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },

  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },

  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 14,
  },

  colorLabel: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },

  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2D2D38',
  },

  swatchSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.12 }],
  },

  primaryButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
