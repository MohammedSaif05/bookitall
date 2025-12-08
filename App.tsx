import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import RNBootSplash from 'react-native-bootsplash';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import { RootNavigator } from './src/navigation';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [shouldNavigateToSuccess] = useState(false);

  useLayoutEffect(() => {
    // Hide native splash screen immediately so custom splash can take over
    // The custom splash screen will handle the animation
    const hide = () => RNBootSplash.hide({ fade: false }).catch(() => {});
    hide(); // Hide immediately to show custom splash
  }, []);

  useEffect(() => {
    // Placeholder for future async initialization logic
    // const checkOnboardingStatus = async () => {
    //   const userId = await userStorage.getUserId();
    //   const isOnBoardCompleted = await userStorage.getIsOnBoardCompleted();
    //   if (userId && isOnBoardCompleted) setShouldNavigateToSuccess(true);
    // };
    // checkOnboardingStatus();
  }, []);

  return (
    <ErrorBoundary onError={(error, info) => console.error('App Error:', error, info)}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {isSplashVisible && (
          <SplashScreen onAnimationComplete={() => setIsSplashVisible(false)} />
        )}
        {!isSplashVisible && (
          <AppContent shouldNavigateToSuccess={shouldNavigateToSuccess} />
        )}
        <FlashMessage position="bottom" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function AppContent({ shouldNavigateToSuccess }: { shouldNavigateToSuccess: boolean }) {
  const navigationRef = useRef(null);
  return (
    <RootNavigator
      ref={navigationRef}
      onReady={() => {
        console.log('Navigation ready');
      }}
      initialAuthRoute={shouldNavigateToSuccess ? 'SuccessScreen' : 'GettingStarted'}
    />
  );
}

export default App;
