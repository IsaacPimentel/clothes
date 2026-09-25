import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AvatarCanvas from '../components/3d/AvatarCanvas';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useOutfitStore } from '../stores/outfitStore';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'FittingRoom'
>;

const swatches = ['#E5E7EB', '#F59E0B', '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6'];

export default function FittingRoomScreen({ navigation }: Props) {
  const { top, bottom, shoes, accessory, garmentColor, setGarmentColor } = useOutfitStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Probador virtual</Text>

        <Text style={styles.favorite}>♡</Text>
      </View>

      <View style={styles.avatarArea}>
        <AvatarCanvas />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Tu outfit</Text>

        <View style={styles.outfitRow}>
          <View style={styles.outfitItem}>
            <Text style={styles.outfitEmoji}>👕</Text>
            <Text style={styles.outfitText}>{top}</Text>
          </View>

          <View style={styles.outfitItem}>
            <Text style={styles.outfitEmoji}>👖</Text>
            <Text style={styles.outfitText}>{bottom}</Text>
          </View>

          <View style={styles.outfitItem}>
            <Text style={styles.outfitEmoji}>👟</Text>
            <Text style={styles.outfitText}>{shoes}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Color de prenda</Text>
        <View style={styles.swatchesRow}>
          {swatches.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.swatch,
                { backgroundColor: color },
                garmentColor === color && styles.swatchSelected,
              ]}
              onPress={() => setGarmentColor(color)}
            />
          ))}
        </View>

        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.ghostText}>📷 Studio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Wardrobe')}>
            <Text style={styles.primaryText}>Cambiar prendas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aiPanel}>
          <Text style={styles.aiLabel}>Preparado para render / IA</Text>
          <Text style={styles.aiHint}>Fondo, pose y outfit listos para exportación.</Text>
          <View style={styles.aiBadgesRow}>
            <Text style={styles.aiBadge}>Foto</Text>
            <Text style={styles.aiBadge}>Fondo</Text>
            <Text style={styles.aiBadge}>Prompt IA</Text>
          </View>
        </View>

        <Text style={styles.accessoryText}>Accesorio: {accessory}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    color: '#FFFFFF',
    fontSize: 40,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  favorite: {
    color: '#FFFFFF',
    fontSize: 30,
  },

  avatarArea: {
    flex: 1,
    minHeight: 260,
  },

  panel: {
    backgroundColor: '#17171D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },

  panelTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
  },

  outfitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  outfitItem: {
    width: '31%',
    height: 90,
    borderRadius: 15,
    backgroundColor: '#23232C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  outfitEmoji: {
    fontSize: 35,
  },

  outfitText: {
    color: '#D1D5DB',
    fontSize: 12,
    textTransform: 'capitalize',
    marginTop: 5,
  },

  sectionLabel: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },

  swatchesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#1F2937',
  },

  swatchSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.12 }],
  },

  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  ghostButton: {
    flex: 1,
    backgroundColor: '#1F1F27',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  ghostText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  primaryButton: {
    flex: 2,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  aiPanel: {
    backgroundColor: '#1B1B22',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },

  aiLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  aiHint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },

  aiBadgesRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  aiBadge: {
    backgroundColor: '#2A2A35',
    color: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '700',
  },

  accessoryText: {
    color: '#A78BFA',
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
