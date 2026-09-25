import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'SavedGallery'
>;

type SavedItem = {
  id: string;
  name: string;
  quality: 'HD' | '4K' | 'Web';
  uri: string;
  accent: string;
};

const MOCK_SAVED_ITEMS: SavedItem[] = [
  {
    id: '1',
    name: 'Luxury Look',
    quality: 'HD',
    uri: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    accent: '#F59E0B',
  },
  {
    id: '2',
    name: 'Minimal Fit',
    quality: '4K',
    uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    accent: '#A78BFA',
  },
  {
    id: '3',
    name: 'Night Style',
    quality: 'Web',
    uri: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    accent: '#60A5FA',
  },
];

export default function SavedGalleryScreen({ navigation }: Props) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(MOCK_SAVED_ITEMS);
  const [name, setName] = useState('Midnight Editorial');
  const [quality, setQuality] = useState<'HD' | '4K' | 'Web'>('HD');
  const [selectedAccent, setSelectedAccent] = useState('#A78BFA');

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    const newItem: SavedItem = {
      id: `${Date.now()}`,
      name: name.trim(),
      quality,
      uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      accent: selectedAccent,
    };

    setSavedItems((current) => [newItem, ...current]);
    setName('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Guardar imagen</Text>

        <Text style={styles.actionTag}>Gallery</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej: City Luxe"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />

        <Text style={styles.label}>Calidad</Text>
        <View style={styles.qualityRow}>
          {(['HD', '4K', 'Web'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.qualityButton,
                quality === option && styles.qualityButtonSelected,
              ]}
              onPress={() => setQuality(option)}
            >
              <Text style={styles.qualityText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Estilo</Text>
        <View style={styles.accentRow}>
          {['#A78BFA', '#F59E0B', '#34D399', '#60A5FA', '#F472B6'].map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedAccent(color)}
              style={[
                styles.accentButton,
                { backgroundColor: color },
                selectedAccent === color && styles.accentButtonSelected,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          disabled={!canSave}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Guardar en galería</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.galleryTitle}>Mi galería</Text>
      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.galleryList}
        columnWrapperStyle={styles.galleryRow}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.uri }} style={styles.cardImage} />
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardMeta}>{item.quality}</Text>
              </View>
              <View style={[styles.cardDot, { backgroundColor: item.accent }]} />
            </View>
          </View>
        )}
      />
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

  formCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
  },

  label: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F9FAFB',
    marginBottom: 16,
  },

  qualityRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },

  qualityButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1F2937',
  },

  qualityButtonSelected: {
    backgroundColor: '#7C3AED',
  },

  qualityText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '700',
  },

  accentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  accentButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  accentButtonSelected: {
    borderColor: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 15,
  },

  saveButtonDisabled: {
    opacity: 0.5,
  },

  saveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  galleryTitle: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },

  galleryList: {
    paddingBottom: 32,
  },

  galleryRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  card: {
    width: '48%',
    backgroundColor: '#131823',
    borderRadius: 18,
    overflow: 'hidden',
  },

  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },

  cardName: {
    color: '#F9FAFB',
    fontWeight: '700',
    fontSize: 13,
  },

  cardMeta: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 2,
  },

  cardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
