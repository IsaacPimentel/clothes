import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

const onboardingSteps = [
  { id: 'avatar', emoji: '👤', title: 'Crea tu avatar', hint: 'Ajusta tono y proporciones' },
  { id: 'wardrobe', emoji: '👗', title: 'Elige outfit', hint: 'Tops, pantalones y accesorios' },
  { id: 'studio', emoji: '📸', title: 'Genera imagen', hint: 'Fondo, estilo y export final' },
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>FITTING ROOM</Text>
          <TouchableOpacity style={styles.pill} onPress={() => navigation.navigate('SavedGallery')}>
            <Text style={styles.pillText}>Galería</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.kicker}>Demo premium</Text>
        <Text style={styles.title}>Tu estilo, en 3D, listo para exportar.</Text>
        <Text style={styles.subtitle}>
          Diseña tu avatar, prueba prendas y genera una imagen final con estilo editorial.
        </Text>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroEmoji}>✨</Text>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroLabel}>Flow principal</Text>
            <Text style={styles.heroText}>Avatar + Vestidor + Studio</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3D</Text>
            <Text style={styles.statLabel}>Preview</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12+</Text>
            <Text style={styles.statLabel}>Looks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1 tap</Text>
            <Text style={styles.statLabel}>Export</Text>
          </View>
        </View>

        <View style={styles.stepsRow}>
          {onboardingSteps.map((step) => (
            <View key={step.id} style={styles.stepCard}>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepHint}>{step.hint}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AvatarBuilder')}
        >
          <Text style={styles.primaryText}>Crear mi avatar</Text>
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Wardrobe')}
          >
            <Text style={styles.secondaryText}>Mi vestidor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.secondaryText}>Studio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 28,
    marginBottom: 18,
  },

  logo: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },

  pill: {
    backgroundColor: '#1F1F27',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  kicker: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    marginBottom: 10,
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 24,
  },

  heroCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171D',
    borderWidth: 1,
    borderColor: '#2D1B4F',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  heroGlow: {
    position: 'absolute',
    right: 18,
    top: 12,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7C3AED33',
  },

  heroEmoji: {
    fontSize: 40,
    marginRight: 16,
    zIndex: 1,
  },

  heroTextBlock: {
    flex: 1,
    zIndex: 1,
  },

  heroLabel: {
    color: '#A78BFA',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 6,
  },

  heroText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#14141A',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A32',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  statLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
  },

  stepsRow: {
    marginBottom: 26,
  },

  stepCard: {
    backgroundColor: '#17171D',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#23232C',
  },

  stepEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },

  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  stepHint: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  primaryButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#1F1F27',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
