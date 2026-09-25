import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
  const percentage = ((safeValue - min) / (max - min)) * 100;

  const changeValue = (delta: number) => {
    const next = Math.min(max, Math.max(min, safeValue + delta));
    onValueChange(next);
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

      <View style={styles.trackWrap}>
        <View style={styles.track} />
        <View style={[styles.fill, { width: `${percentage}%` }]} />
        <View style={[styles.thumb, { left: `${percentage}%` }]} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => changeValue(-step)}>
          <Text style={styles.controlText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => changeValue(step)}>
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  },
  trackWrap: {
    position: 'relative',
    height: 18,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#3F3F46',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#7C3AED',
  },
  thumb: {
    position: 'absolute',
    top: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: -7 }],
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  controlButton: {
    width: 42,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#23232C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
});
