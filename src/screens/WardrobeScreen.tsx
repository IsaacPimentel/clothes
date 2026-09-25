import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useOutfitStore } from '../stores/outfitStore';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Wardrobe'
>;

const categories = ['Todos', 'Tops', 'Pantalones', 'Zapatos', 'Accesorios'];

const garments = [
  { id: '1', name: 'Camiseta', emoji: '👕', top: 'classic' as const },
  { id: '2', name: 'Hoodie', emoji: '🧥', top: 'hoodie' as const },
  { id: '3', name: 'Overshirt', emoji: '🧥', top: 'overshirt' as const },
  { id: '4', name: 'Tank', emoji: '🏃', top: 'tank' as const },
  { id: '5', name: 'Jeans', emoji: '👖', bottom: 'jeans' as const },
  { id: '6', name: 'Pantalón', emoji: '🩳', bottom: 'trousers' as const },
  { id: '7', name: 'Shorts', emoji: '🩱', bottom: 'shorts' as const },
  { id: '8', name: 'Sneakers', emoji: '👟', shoes: 'sneakers' as const },
  { id: '9', name: 'Botas', emoji: '🥾', shoes: 'boots' as const },
  { id: '10', name: 'Loafers', emoji: '🥿', shoes: 'loafers' as const },
  { id: '11', name: 'Gafas', emoji: '🕶️', accessory: 'glasses' as const },
  { id: '12', name: 'Gorra', emoji: '🧢', accessory: 'cap' as const },
];

export default function WardrobeScreen({ navigation }: Props) {
  const { setTop, setBottom, setShoes, setAccessory } = useOutfitStore();

  const handleSelectGarment = (item: (typeof garments)[number]) => {
    if ('top' in item && item.top) {
      setTop(item.top);
    }

    if ('bottom' in item && item.bottom) {
      setBottom(item.bottom);
    }

    if ('shoes' in item && item.shoes) {
      setShoes(item.shoes);
    }

    if ('accessory' in item && item.accessory) {
      setAccessory(item.accessory);
    }

    navigation.navigate('FittingRoom');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Mi vestidor</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.add}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item, index }) => (
          <View
            style={[styles.category, index === 0 && styles.categoryActive]}
          >
            <Text
              style={[
                styles.categoryText,
                index === 0 && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </View>
        )}
      />

      <FlatList
        data={garments}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectGarment(item)}
          >
            <Text style={styles.garment}>{item.emoji}</Text>
            <Text style={styles.garmentName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
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
    paddingBottom: 15,
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
    fontSize: 22,
    fontWeight: '800',
  },

  add: {
    color: '#A78BFA',
    fontSize: 30,
  },

  categories: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 20,
  },

  category: {
    backgroundColor: '#18181F',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  categoryActive: {
    backgroundColor: '#7C3AED',
  },

  categoryText: {
    color: '#9CA3AF',
  },

  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  grid: {
    paddingHorizontal: 15,
  },

  card: {
    flex: 1,
    margin: 7,
    height: 190,
    borderRadius: 20,
    backgroundColor: '#17171D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  garment: {
    fontSize: 70,
  },

  garmentName: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 15,
  },
});
