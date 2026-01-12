import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import RNBootSplash from 'react-native-bootsplash';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import { RootNavigator } from './src/navigation';
import { useUserStore } from './src/store/userStore';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Dashboard' | 'GettingStarted'>('GettingStarted');
  const initialize = useUserStore((state) => state.initialize);

  useLayoutEffect(() => {
    // Hide native splash screen immediately so custom splash can take over
    // The custom splash screen will handle the animation
    const hide = () => RNBootSplash.hide({ fade: false }).catch(() => {});
    hide(); // Hide immediately to show custom splash
  }, []);

  useEffect(() => {
    // Initialize store and check userId
    const checkAuthStatus = async () => {
      await initialize();
      // Check if userId exists after initialization
      const currentUserId = useUserStore.getState().userId;
      if (currentUserId) {
        setInitialRoute('Dashboard');
      } else {
        setInitialRoute('GettingStarted');
      }
    };
    checkAuthStatus();
  }, [initialize]);

  return (
    <ErrorBoundary onError={(error, info) => console.error('App Error:', error, info)}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {isSplashVisible && (
          <SplashScreen onAnimationComplete={() => setIsSplashVisible(false)} />
        )}
        {!isSplashVisible && (
          <AppContent initialRoute={initialRoute} />
        )}
        <FlashMessage 
          position="bottom" 
          floating={true}
          style={{
            borderRadius: 12,
          }}
        />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function AppContent({ initialRoute }: { initialRoute: 'Dashboard' | 'GettingStarted' }) {
  const navigationRef = useRef(null);
  return (
    <RootNavigator
      ref={navigationRef}
      onReady={() => {
        console.log('Navigation ready');
      }}
      initialAuthRoute={initialRoute}
    />
  );
}

export default App;
