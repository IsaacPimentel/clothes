import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import AvatarBuilderScreen from '../screens/AvatarBuilderScreen';
import WardrobeScreen from '../screens/WardrobeScreen';
import CameraScreen from '../screens/CameraScreen';
import FittingRoomScreen from '../screens/FittingRoomScreen';
import ExportPreviewScreen from '../screens/ExportPreviewScreen';
import SavedGalleryScreen from '../screens/SavedGalleryScreen';

export type RootStackParamList = {
  Home: undefined;
  AvatarBuilder: undefined;
  Wardrobe: undefined;
  Camera: undefined;
  FittingRoom: undefined;
  ExportPreview: { photoUri?: string } | undefined;
  SavedGallery: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      <Stack.Screen
        name="AvatarBuilder"
        component={AvatarBuilderScreen}
      />

      <Stack.Screen
        name="Wardrobe"
        component={WardrobeScreen}
      />

      <Stack.Screen
        name="Camera"
        component={CameraScreen}
      />

      <Stack.Screen
        name="FittingRoom"
        component={FittingRoomScreen}
      />

      <Stack.Screen
        name="ExportPreview"
        component={ExportPreviewScreen}
      />

      <Stack.Screen
        name="SavedGallery"
        component={SavedGalleryScreen}
      />
    </Stack.Navigator>
  );
}