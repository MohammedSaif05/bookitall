import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import GettingStarted from '../screens/GettingStarted';
import OTPScreen from '../screens/OTPScreen';
import SuccessScreen from '../screens/SuccessScreen';
import NameScreen from '../screens/NameScreen';
import type { RootStackParamList } from './types';
import { forwardRef } from 'react';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  initialAuthRoute: keyof RootStackParamList;
  onReady?: () => void;
};

export const RootNavigator = forwardRef<any, Props>(
  ({ initialAuthRoute, onReady }, ref) => (
    <NavigationContainer ref={ref} onReady={onReady}>
      <Stack.Navigator initialRouteName={initialAuthRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GettingStarted" component={GettingStarted} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} />
        <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  ),
);

RootNavigator.displayName = 'RootNavigator';

