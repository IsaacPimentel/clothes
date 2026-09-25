import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
};

export default function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onValueChange,
}: SliderFieldProps) {
  const safeValue = Math.min(max, Math.max(min, value));

  const setValue = (next: number) => {
    const rounded = Math.round(next / step) * step;
    const clamped = Math.min(max, Math.max(min, rounded));
    if (clamped !== safeValue) {
      onValueChange(clamped);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(safeValue)}
          {unit}
        </Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setValue(safeValue - step)}
          disabled={safeValue <= min}
          accessibilityRole="button"
          accessibilityLabel={`Reducir ${label.toLowerCase()}`}
          hitSlop={8}
        >
          <Text style={[styles.controlText, safeValue <= min && styles.controlTextDisabled]}>−</Text>
        </TouchableOpacity>

        <Slider
          style={styles.slider}
          value={safeValue}
          minimumValue={min}
          maximumValue={max}
          step={step}
          onValueChange={setValue}
          minimumTrackTintColor="#7C3AED"
          maximumTrackTintColor="#3F3F46"
          thumbTintColor="#FFFFFF"
          tapToSeek
          accessibilityLabel={label}
          accessibilityUnits={unit.trim()}
        />

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setValue(safeValue + step)}
          disabled={safeValue >= max}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${label.toLowerCase()}`}
          hitSlop={8}
        >
          <Text style={[styles.controlText, safeValue >= max && styles.controlTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>
          {min}
          {unit}
        </Text>
        <Text style={styles.rangeText}>
          {max}
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  controlButton: {
    width: 36,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#23232C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  controlTextDisabled: {
    color: '#4B5563',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 44,
    marginTop: -4,
  },
  rangeText: {
    color: '#6B7280',
    fontSize: 11,
  },
});
