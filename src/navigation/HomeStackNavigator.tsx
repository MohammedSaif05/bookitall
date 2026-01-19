import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import CategoryListingScreen from '../screens/main/CategoryListingScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  CategoryListing: {
    categorySlug: string;
    categoryName: string;
  };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CategoryListing" component={CategoryListingScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;


