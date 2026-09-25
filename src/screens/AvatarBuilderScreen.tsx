import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AvatarCanvas from '../components/3d/AvatarCanvas';
import SliderField from '../components/ui/SliderField';
import { useAvatarStore } from '../stores/avatarStore';
import { SKIN_TONES, type AvatarGender } from '../types/avatar';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AvatarBuilder'
>;

export default function AvatarBuilderScreen({ navigation }: Props) {
  const { height, bust, waist, hips, skinTone, gender, updateAvatar } = useAvatarStore();
  const genderOptions: AvatarGender[] = ['female', 'male'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Crear avatar</Text>

        <View style={{ width: 30 }} />
      </View>

      <View style={styles.avatarArea}>
        <View style={styles.previewCard}>
          <View style={styles.previewGlow} />
          <AvatarCanvas />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>Personaliza tu cuerpo</Text>

        <View style={styles.genderSection}>
          <Text style={styles.sectionLabel}>Género</Text>
          <View style={styles.genderRow}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => updateAvatar({ gender: option })}
                style={[
                  styles.genderButton,
                  gender === option && styles.genderButtonSelected,
                ]}
              >
                <Text style={styles.genderText}>{option === 'male' ? 'Hombre' : 'Mujer'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SliderField
          label="Estatura"
          value={height}
          min={150}
          max={200}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ height: value })}
        />

        <SliderField
          label="Busto"
          value={bust}
          min={70}
          max={120}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ bust: value })}
        />

        <SliderField
          label="Cintura"
          value={waist}
          min={50}
          max={110}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ waist: value })}
        />

        <SliderField
          label="Cadera"
          value={hips}
          min={70}
          max={130}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ hips: value })}
        />

        <View style={styles.swatchesSection}>
          <Text style={styles.swatchesTitle}>Tono de piel</Text>

          <View style={styles.swatchesRow}>
            {SKIN_TONES.map((tone) => (
              <TouchableOpacity
                key={tone}
                onPress={() => updateAvatar({ skinTone: tone })}
                style={[
                  styles.swatch,
                  { backgroundColor: tone },
                  skinTone === tone && styles.swatchSelected,
                ]}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('FittingRoom')}
        >
          <Text style={styles.buttonText}>Ir al probador</Text>
        </TouchableOpacity>
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
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    color: '#FFFFFF',
    fontSize: 40,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  avatarArea: {
    flex: 1,
    minHeight: 260,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },

  previewCard: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0B0B0F',
    borderWidth: 1,
    borderColor: '#2D1B4F',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },

  previewGlow: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C3AED33',
    zIndex: 1,
  },

  panel: {
    backgroundColor: '#17171D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
    marginTop: 4,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
  },

  genderSection: {
    marginBottom: 16,
  },

  sectionLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 2,
  },

  genderButton: {
    flex: 1,
    backgroundColor: '#23232C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  genderButtonSelected: {
    backgroundColor: '#7C3AED',
  },

  genderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  swatchesSection: {
    marginBottom: 18,
    marginTop: 6,
  },

  swatchesTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  swatchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  swatchSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },

  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
