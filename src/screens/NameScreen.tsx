import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, ScrollView, StatusBar, TextInput, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { typography, fonts } from '../theme/fonts';
import { colors } from '../theme/colors';
import { Button } from '../components/auth';

const HeaderLogo = require('../assets/webp/header_logo.webp');

type Props = NativeStackScreenProps<RootStackParamList, 'NameScreen'>;

const NameScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideListener = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const isNameValid = name.trim().length > 0;

  const handleNext = () => {
    if (!isNameValid) {
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('SuccessScreen');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background.primary}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Logo */}
          <View style={styles.header}>
            <Image 
              source={HeaderLogo} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>
              What's your{'\n'}name?
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              We'll use your name to personalize your experience{'\n'}and make things feel more familiar.
            </Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>

            {/* Inline Button (shown when keyboard is open) */}
            {isKeyboardVisible && (
              <View style={[styles.buttonContainer, styles.buttonContainerInline]}>
                <Button
                  title="Next"
                  onPress={handleNext}
                  loading={isLoading}
                  disabled={!isNameValid}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Button (hidden when keyboard is open) */}
        {!isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <Button
              title="Next"
              onPress={handleNext}
              loading={isLoading}
              disabled={!isNameValid}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  logo: {
    width: 120,
    height: 32,
  },
  content: {
    flex: 1,
    marginTop: 32,
  },
  title: {
    ...typography.h1,
    color: colors.text.black,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: fonts.manrope.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.black,
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    ...typography.body,
    color: colors.text.black,
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  buttonContainerInline: {
    paddingHorizontal: 0, // avoid double padding (scroll already has 24px)
    paddingBottom: 0,
    marginTop: 24,
    width: '100%', // match bottom full-width sizing
  },
});

export default NameScreen;

