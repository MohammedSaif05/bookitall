/**
 * Font Configuration
 * Centralized font family configuration for the app
 */

export const fonts = {
  // Manrope font family - primary font
  manrope: {
    extraLight: 'Manrope-ExtraLight',
    light: 'Manrope-Light',
    regular: 'Manrope-Regular',
    medium: 'Manrope-Medium',
    semiBold: 'Manrope-SemiBold',
    bold: 'Manrope-Bold',
    extraBold: 'Manrope-ExtraBold',
  },
  // Default font family
  default: 'Manrope-Regular',
} as const;

// Font weight mapping for React Native
export const fontWeights = {
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

/**
 * Get font family with weight
 * @param weight - Font weight (extraLight, light, regular, medium, semiBold, bold, extraBold)
 * @returns Font family name for React Native
 */
export const getFontFamily = (
  weight: keyof typeof fonts.manrope = 'regular'
): string => {
  return fonts.manrope[weight];
};

/**
 * Typography presets for common text styles
 */
export const typography = {
  display: {
    fontFamily: fonts.manrope.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.96,
  },
  h1: {
    fontFamily: fonts.manrope.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fonts.manrope.semiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: fonts.manrope.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fonts.manrope.medium,
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.manrope.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: fonts.manrope.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.manrope.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    fontFamily: fonts.manrope.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: fonts.manrope.medium,
    fontSize: 14,
    lineHeight: 20,
  },
} as const;

