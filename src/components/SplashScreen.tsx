/**
 * Animated Splash Screen Component
 * Handles the custom animation before hiding the native splash screen
 * 
 * @format
 */

import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { metrics } from '../theme/scaling';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

const AnimatedContainer = cssInterop(Animated.View, { className: 'style' });
const AnimatedCircle = cssInterop(Animated.View, { className: 'style' });

function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const circleScaleAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      // Animation sequence:
      // 1. Rotate 220 degrees clockwise (0 -> 220)
      // 2. Small delay at 220 degrees
      // 3. Continue rotating clockwise (220 -> 440) while shrinking (1 -> 0)
      // 4. White circle explodes/grows very fast to fill the screen
      const animation = Animated.sequence([
        // First: Rotate 220 degrees clockwise
        Animated.timing(rotateAnim, {
          toValue: 220,
          duration: 700,
          useNativeDriver: true,
        }),
        // Small delay at 220 degrees
        Animated.delay(200),
        // Second: Continue rotating clockwise (220 -> 440) while shrinking
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 440,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Third: White circle explodes/grows very fast
        Animated.timing(circleScaleAnim, {
          toValue: 1,
          duration: 300, // Very fast explosion
          useNativeDriver: true,
        }),
      ]);

      animation.start(() => {
        setIsVisible(false);
        onAnimationComplete?.();
      });
    }, 100); // Small delay for smooth transition

    return () => clearTimeout(timer);
  }, [rotateAnim, scaleAnim, circleScaleAnim, onAnimationComplete]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 220, 440],
    outputRange: ['0deg', '220deg', '440deg'],
  });

  if (!isVisible) {
    return null;
  }

  // Calculate the diagonal to ensure the circle covers the entire screen
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const diagonal = Math.sqrt(
    Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)
  );
  const circleBaseRadius = metrics.splashCircle.diameter / 2;
  const maxScale = diagonal / circleBaseRadius;

  // Calculate center position for the circle
  const circleCenterX = screenWidth / 2 - circleBaseRadius;
  const circleCenterY = screenHeight / 2 - circleBaseRadius;

  // Calculate center position for the logo container
  const logoCenterX = screenWidth / 2 - metrics.logo.width / 2;
  const logoCenterY = screenHeight / 2 - metrics.logo.height / 2;

  const circleScale = circleScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxScale], // Scale from 0 to cover entire screen
  });

  return (
    <View 
      className="absolute inset-0 overflow-hidden"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#222222',
        zIndex: 9999,
      }}
    >
      <AnimatedContainer
        className="absolute"
        style={{
          top: logoCenterY,
          left: logoCenterX,
          width: metrics.logo.width,
          height: metrics.logo.height,
          transform: [
            { rotate: rotateInterpolate },
            { scale: scaleAnim },
          ],
        }}
      >
        <Image
          source={require('../../assets/bootsplash/logo.png')}
          style={{
            width: metrics.logo.width,
            height: metrics.logo.height,
          }}
          resizeMode="contain"
        />
      </AnimatedContainer>

      {/* White circle that explodes after shrink */}
      <AnimatedCircle
        className="absolute rounded-full bg-white"
        style={{
          width: metrics.splashCircle.diameter,
          height: metrics.splashCircle.diameter,
          borderRadius: circleBaseRadius,
          transform: [{ scale: circleScale }],
          top: circleCenterY,
          left: circleCenterX,
        }}
      />
    </View>
  );
}

export default SplashScreen;
