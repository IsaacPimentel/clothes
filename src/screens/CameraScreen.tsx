import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useOutfitStore } from '../stores/outfitStore';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Camera'
>;

type BackgroundPreset = {
  id: string;
  name: string;
  description: string;
  color: string;
};

const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'studio', name: 'Studio', description: 'Light premium studio', color: '#F5F5F4' },
  { id: 'charcoal', name: 'Charcoal', description: 'Editorial dark studio', color: '#1F2937' },
  { id: 'sunset', name: 'Sunset', description: 'Warm fashion backdrop', color: '#F59E0B' },
  { id: 'ocean', name: 'Ocean', description: 'Fresh minimal backdrop', color: '#0F766E' },
];

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundPreset>(BACKGROUND_PRESETS[0]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { top, bottom, shoes, accessory, garmentColor } = useOutfitStore();

  const promptText = `Modelo ${top} con ${bottom}, ${shoes}, ${accessory !== 'none' ? accessory : 'sin accesorio'}, color ${garmentColor}, fondo ${selectedBackground.description.toLowerCase()}, estilo editorial premium, iluminación suave, detalle textil, alta calidad comercial.`;

  const handleCapture = async () => {
    if (!cameraRef.current) {
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setCapturedPhoto(photo?.uri ?? null);
  };

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Necesitamos acceso a la cámara</Text>
        <Text style={styles.permissionText}>Permite la cámara para capturar el outfit y preparar el export final.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryText}>Permitir cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Final image</Text>

        <Text style={styles.flash}>✦</Text>
      </View>

      <View style={styles.cameraArea}>
        <View style={[styles.frame, { borderColor: selectedBackground.color }]}>
          {capturedPhoto ? (
            <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          ) : (
            <CameraView ref={cameraRef} style={styles.cameraView} facing="front" mirror />
          )}
        </View>
      </View>

      <View style={styles.backgroundSection}>
        <Text style={styles.sectionTitle}>Fondo de estudio</Text>
        <View style={styles.backgroundRow}>
          {BACKGROUND_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              onPress={() => setSelectedBackground(preset)}
              style={[
                styles.backgroundButton,
                { backgroundColor: preset.color },
                preset.id === selectedBackground.id && styles.backgroundButtonSelected,
              ]}
            >
              <Text style={[styles.backgroundButtonText, { color: preset.id === 'charcoal' ? '#F9FAFB' : '#111827' }]}>
                {preset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.promptBox}>
        <Text style={styles.promptLabel}>Prompt de IA</Text>
        <Text style={styles.promptText}>{promptText}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setCapturedPhoto(null)}>
          <Text style={styles.secondaryText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.capture} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ExportPreview', { photoUri: capturedPhoto ?? undefined })}
        >
          <Text style={styles.primaryText}>Exportar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#09090B',
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: '#09090B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },

  permissionText: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
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

  flash: {
    fontSize: 24,
    color: '#F9FAFB',
  },

  cameraArea: {
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 14,
  },

  frame: {
    width: '100%',
    height: 420,
    borderWidth: 2,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },

  cameraView: {
    flex: 1,
    backgroundColor: '#111827',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  backgroundSection: {
    paddingHorizontal: 20,
    marginTop: 6,
  },

  sectionTitle: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },

  backgroundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  backgroundButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  backgroundButtonSelected: {
    borderColor: '#A78BFA',
    transform: [{ scale: 1.04 }],
  },

  backgroundButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },

  promptBox: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
  },

  promptLabel: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  promptText: {
    color: '#E5E7EB',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 22,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 18,
    paddingBottom: 28,
  },

  secondaryButton: {
    width: 82,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1F1F27',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  capture: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A78BFA',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },

  captureInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#111827',
  },

  primaryButton: {
    width: 110,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
