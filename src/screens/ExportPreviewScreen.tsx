import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ExportPreview'
>;

type EditorialPreset = {
  id: string;
  name: string;
  description: string;
  accent: string;
  background: string;
};

const EDITORIAL_PRESETS: EditorialPreset[] = [
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Luz cálida y estilo premium',
    accent: '#F59E0B',
    background: '#1F2937',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Blanco y líneas limpias',
    accent: '#A78BFA',
    background: '#F5F5F4',
  },
  {
    id: 'night',
    name: 'Night',
    description: 'Elegancia oscura editorial',
    accent: '#60A5FA',
    background: '#111827',
  },
];

export default function ExportPreviewScreen({ navigation, route }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<EditorialPreset>(EDITORIAL_PRESETS[0]);
  const photoUri = route.params?.photoUri;

  const finalPrompt = useMemo(
    () =>
      `Outfit editorial premium, fondo ${selectedPreset.description.toLowerCase()}, luz sofisticada, detalle textil, composición elegante, enfoque comercial, resolución alta, natural pose.`,
    [selectedPreset],
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mi preview final: ${finalPrompt}`,
      });
    } catch (error) {
      console.warn('Share failed', error);
    }
  };

  const handleDownload = () => {
    if (photoUri) {
      console.log('Descarga preparada para:', photoUri);
      return;
    }

    console.log('No hay imagen capturada para descargar');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Preview final</Text>

        <Text style={styles.actionTag}>Export</Text>
      </View>

      <View
        style={[
          styles.previewFrame,
          { borderColor: selectedPreset.accent, backgroundColor: selectedPreset.background },
        ]}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>✨</Text>
            <Text style={styles.placeholderText}>Sin captura aún</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Preset editorial</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
        {EDITORIAL_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetCard,
              { backgroundColor: preset.background },
              selectedPreset.id === preset.id && styles.presetCardSelected,
            ]}
            onPress={() => setSelectedPreset(preset)}
          >
            <Text style={[styles.presetName, { color: preset.id === 'night' ? '#F9FAFB' : '#111827' }]}>
              {preset.name}
            </Text>
            <Text style={[styles.presetDescription, { color: preset.id === 'night' ? '#E5E7EB' : '#374151' }]}>
              {preset.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Prompt final</Text>
        <Text style={styles.metaText}>{finalPrompt}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
          <Text style={styles.secondaryText}>Compartir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleDownload}>
          <Text style={styles.primaryText}>Descargar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.galleryButton} onPress={() => navigation.navigate('SavedGallery')}>
        <Text style={styles.galleryText}>Ver galería guardada</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    marginBottom: 18,
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

  actionTag: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  previewFrame: {
    height: 430,
    borderRadius: 28,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  placeholder: {
    alignItems: 'center',
  },

  placeholderEmoji: {
    fontSize: 62,
    marginBottom: 8,
  },

  placeholderText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 18,
  },

  sectionTitle: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },

  presetRow: {
    paddingBottom: 8,
    gap: 10,
  },

  presetCard: {
    width: 150,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  presetCardSelected: {
    borderColor: '#A78BFA',
  },

  presetName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  presetDescription: {
    fontSize: 11,
    lineHeight: 16,
  },

  metaCard: {
    marginTop: 18,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
  },

  metaLabel: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  metaText: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 8,
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#1F1F27',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  galleryButton: {
    backgroundColor: '#1F1F27',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 28,
  },

  galleryText: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '700',
  },
});
