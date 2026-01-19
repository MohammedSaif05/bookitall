import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import CategoryListingScreen from '../screens/main/CategoryListingScreen';
import BusinessDetailsScreen from '../screens/main/BusinessDetailsScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  CategoryListing: {
    categorySlug: string;
    categoryName: string;
  };
  BusinessDetails: {
    businessId: string;
  };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CategoryListing" component={CategoryListingScreen} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;


