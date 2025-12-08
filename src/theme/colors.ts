/**
 * Color Configuration
 * Centralized color palette for the app
 */

export const colors = {
  // Background colors
  background: {
    primary: '#EBEBEB',
    white: '#FFFFFF',
    black: '#000000',
  },

  // Text colors
  text: {
    primary: '#050505',
    secondary: '#666666',
    tertiary: '#999999',
    white: '#FFFFFF',
    black: '#000000',
  },

  // Button colors
  button: {
    primary: '#050505',
    primaryDisabled: '#000000', // 60% opacity applied in component
    secondary: '#666666',
    disabled: '#000000',
  },

  // Status colors
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // Border colors
  border: {
    light: '#E5E5E5',
    medium: '#CCCCCC',
    dark: '#999999',
  },
} as const;

/**
 * Get color with opacity
 * @param color - Hex color string
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

