/**
 * SearchBar Component
 * Reusable search bar with icon and placeholder
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Keyboard, Animated, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import SearchIcon from '../../assets/icons/svg/search.svg';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
}

const SERVICE_TYPES = [
  'saloon',
  'spa',
  'turf',
  'swimming pool',
  'beauty parlour',
];

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder: customPlaceholder,
  value,
  onChangeText,
  onPress,
  editable = true,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Use custom placeholder if provided, otherwise use animated placeholder
  const useAnimatedPlaceholder = !customPlaceholder && !value;

  useEffect(() => {
    if (!useAnimatedPlaceholder) {
      // Reset animations when not using animated placeholder
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }

    // Start animation immediately
    const animate = () => {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change text
        setCurrentIndex((prev) => (prev + 1) % SERVICE_TYPES.length);
        // Reset animations
        slideAnim.setValue(10);
        // Fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    // Start first animation after initial delay
    const timeout = setTimeout(animate, 2500);
    
    // Then continue with interval
    const interval = setInterval(animate, 2500);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useAnimatedPlaceholder]);

  const handleContainerPress = () => {
    if (onPress) {
      onPress();
    } else if (editable) {
      // Focus the input when clicking on the search bar container
      inputRef.current?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handleContainerPress}
        activeOpacity={1}
      >
        {useAnimatedPlaceholder && (
          <Animated.View
            style={[
              styles.animatedPlaceholderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.animatedPlaceholder}>
              Search for {SERVICE_TYPES[currentIndex]}
            </Text>
          </Animated.View>
        )}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={useAnimatedPlaceholder ? '' : customPlaceholder || 'Search for services'}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={() => {
            // Dismiss keyboard when focus is lost
            Keyboard.dismiss();
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handleContainerPress}
        activeOpacity={0.7}
      >
        <SearchIcon width={ms(20)} height={ms(20)} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.primary,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  animatedPlaceholderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 0,
  },
  animatedPlaceholder: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.tertiary,
  },
  iconContainer: {
    marginLeft: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;

