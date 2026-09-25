import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AvatarCanvas from '../components/3d/AvatarCanvas';
import DraggableSheet from '../components/ui/DraggableSheet';
import OverlayHeader from '../components/ui/OverlayHeader';
import SliderField from '../components/ui/SliderField';
import { useAvatarSheetLayout } from '../hooks/useAvatarSheetLayout';
import { useAvatarStore } from '../stores/avatarStore';
import { MEASUREMENT_RANGES, SKIN_TONES, type AvatarGender } from '../types/avatar';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AvatarBuilder'
>;

// Handle + title + summary: what stays visible when the sheet is collapsed.
const SHEET_PEEK = 86;

const GENDER_OPTIONS: { value: AvatarGender; label: string }[] = [
  { value: 'female', label: 'Mujer' },
  { value: 'male', label: 'Hombre' },
];

export default function AvatarBuilderScreen({ navigation }: Props) {
  const { insets, snapPoints, viewport, handleSheetHeight } = useAvatarSheetLayout(SHEET_PEEK);
  const {
    height,
    bust,
    waist,
    hips,
    skinTone,
    gender,
    updateAvatar,
    setGender,
    resetMeasurements,
  } = useAvatarStore();

  const genderLabel = gender === 'male' ? 'Hombre' : 'Mujer';
  const bustLabel = gender === 'male' ? 'Pecho' : 'Busto';

  return (
    <View style={styles.container}>
      <AvatarCanvas outfitMode="base" viewport={viewport} />

      <OverlayHeader
        title="Crear avatar"
        topInset={insets.top}
        onBack={() => navigation.goBack()}
        hint="↔ Arrastra el avatar para girarlo"
      />

      <DraggableSheet
        snapPoints={snapPoints}
        initialSnap={1}
        bottomInset={insets.bottom}
        accessibilityLabel="Panel de personalización"
        onVisibleHeightChange={handleSheetHeight}
        header={
          <View>
            <Text style={styles.title} selectable={false}>
              Personaliza tu cuerpo
            </Text>
            <Text style={styles.summary} selectable={false}>
              {genderLabel} · {height} cm · {bust}/{waist}/{hips} cm
            </Text>
          </View>
        }
      >
        <Text style={styles.sectionLabel}>Género</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((option) => {
            const selected = gender === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setGender(option.value)}
                style={[styles.genderButton, selected && styles.genderButtonSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={styles.genderText}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.helper}>
          Al cambiar de género se cargan medidas de referencia. Ajústalas a tu cuerpo.
        </Text>

        <Text style={styles.sectionLabel}>Medidas</Text>
        <SliderField
          label="Estatura"
          value={height}
          min={MEASUREMENT_RANGES.height.min}
          max={MEASUREMENT_RANGES.height.max}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ height: value })}
        />
        <SliderField
          label={bustLabel}
          value={bust}
          min={MEASUREMENT_RANGES.bust.min}
          max={MEASUREMENT_RANGES.bust.max}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ bust: value })}
        />
        <SliderField
          label="Cintura"
          value={waist}
          min={MEASUREMENT_RANGES.waist.min}
          max={MEASUREMENT_RANGES.waist.max}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ waist: value })}
        />
        <SliderField
          label="Cadera"
          value={hips}
          min={MEASUREMENT_RANGES.hips.min}
          max={MEASUREMENT_RANGES.hips.max}
          unit=" cm"
          onValueChange={(value) => updateAvatar({ hips: value })}
        />

        <Text style={styles.sectionLabel}>Tono de piel</Text>
        <View style={styles.swatchesRow}>
          {SKIN_TONES.map((tone) => {
            const selected = skinTone === tone;
            return (
              <TouchableOpacity
                key={tone}
                onPress={() => updateAvatar({ skinTone: tone })}
                style={[styles.swatch, { backgroundColor: tone }, selected && styles.swatchSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Tono de piel ${tone}`}
              />
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetMeasurements}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Restablecer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('FittingRoom')}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Ir al probador</Text>
          </TouchableOpacity>
        </View>
      </DraggableSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
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

  sectionLabel: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },

  genderRow: {
    flexDirection: 'row',
    gap: 10,
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

  helper: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 10,
  },

  swatchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  swatchSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#23232C',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  button: {
    flex: 2,
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
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
