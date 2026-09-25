import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import GarmentIcon from './GarmentIcon';
import type { GarmentOption } from './catalog';

type GarmentCardProps = {
  option: GarmentOption;
  width: number;
  topColor: string;
  selected: boolean;
  onPress: () => void;
};

export default function GarmentCard({ option, width, topColor, selected, onPress }: GarmentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width }, selected && styles.cardSelected, pressed && styles.cardPressed]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${option.label}, ${option.detail}`}
    >
      <View style={[styles.iconTile, selected && styles.iconTileSelected]}>
        <GarmentIcon option={option} topColor={topColor} size={46} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {option.label}
      </Text>
      <Text style={styles.detail} numberOfLines={1}>
        {option.detail}
      </Text>

      {selected && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: '#1D1D25',
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#211A33',
  },
  cardPressed: {
    opacity: 0.75,
  },
  iconTile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#26262F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconTileSelected: {
    backgroundColor: '#2E2446',
  },
  label: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '700',
  },
  detail: {
    color: '#8B8B98',
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
