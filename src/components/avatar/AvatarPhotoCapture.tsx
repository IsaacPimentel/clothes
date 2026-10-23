import React, { useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type AvatarPhotoCaptureProps = {
  onPhotoConfirmed: (uri: string, heightCm: number) => void;
  onCancel: () => void;
};

export default function AvatarPhotoCapture({ onPhotoConfirmed, onCancel }: AvatarPhotoCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heightInput, setHeightInput] = useState('');

  const heightCm = Number(heightInput);
  const validHeight = /^\d{3}$/.test(heightInput) && heightCm >= 120 && heightCm <= 220;
  const canCaptureHere = Platform.OS !== 'web' || window.isSecureContext;

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady || isCapturing) return;

    setIsCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) throw new Error('No se pudo obtener la imagen.');
      setCapturedPhoto(photo.uri);
    } catch {
      setError('No se pudo tomar la foto. Comprueba la cámara e inténtalo de nuevo.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helper}>Comprobando permiso de cámara…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Primero, una foto de referencia</Text>
        <Text style={styles.helper}>Necesitamos permiso para tomar una foto antes de mostrar tu avatar.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Permitir cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textButton} onPress={onCancel} accessibilityRole="button">
          <Text style={styles.textButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} accessibilityRole="button" accessibilityLabel="Volver">
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Foto de referencia</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.helper}>
        Toma una foto de cuerpo entero, de pie y de frente, con fondo liso y buena iluminación.
      </Text>

      <Text style={styles.heightLabel}>Estatura (cm)</Text>
      <TextInput
        value={heightInput}
        onChangeText={(value) => setHeightInput(value.replace(/\D/g, '').slice(0, 3))}
        placeholder="Ej. 170"
        placeholderTextColor="#71717A"
        keyboardType="number-pad"
        maxLength={3}
        style={styles.heightInput}
        accessibilityLabel="Estatura en centímetros"
      />
      {heightInput.length > 0 && !validHeight ? (
        <Text style={styles.validation}>Introduce una estatura entre 120 y 220 cm.</Text>
      ) : null}
      <Text style={styles.warning}>
        La estimación corporal es aproximada y no reemplaza una medición real.
      </Text>
      {!canCaptureHere ? (
        <Text style={styles.validation}>
          Para usar la cámara web, abre la aplicación en localhost o mediante HTTPS.
        </Text>
      ) : null}

      <View style={styles.cameraFrame}>
        {capturedPhoto ? (
          <Image source={{ uri: capturedPhoto }} style={styles.camera} resizeMode="cover" />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            mirror
            onCameraReady={() => setCameraReady(true)}
            onMountError={() => setError('No se pudo iniciar la cámara en este dispositivo.')}
          />
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {capturedPhoto ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setCapturedPhoto(null);
              setCameraReady(false);
              setError(null);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Tomar otra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => validHeight && onPhotoConfirmed(capturedPhoto, heightCm)}
            disabled={!validHeight}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Usar foto y crear avatar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.primaryButton, styles.captureButton, (!cameraReady || isCapturing) && styles.disabledButton]}
          onPress={handleCapture}
          disabled={!cameraReady || isCapturing}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{isCapturing ? 'Tomando foto…' : 'Tomar foto'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerSpacer: { width: 36 },
  back: { color: '#FFFFFF', fontSize: 40, lineHeight: 44 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  helper: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  heightLabel: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  heightInput: {
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  validation: { color: '#FCA5A5', fontSize: 12, marginBottom: 6 },
  warning: {
    color: '#FDE68A',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 12,
  },
  cameraFrame: {
    flex: 1,
    minHeight: 220,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#3F3F46',
    backgroundColor: '#18181B',
  },
  camera: { width: '100%', height: '100%' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: '#7C3AED',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: '#27272A',
  },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  captureButton: { flex: 0, marginTop: 20 },
  disabledButton: { opacity: 0.5 },
  textButton: { padding: 16, marginTop: 8 },
  textButtonText: { color: '#C4B5FD', fontSize: 15, fontWeight: '700' },
  error: { color: '#FCA5A5', textAlign: 'center', marginTop: 12 },
});
