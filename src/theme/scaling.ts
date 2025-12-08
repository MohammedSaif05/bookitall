import {
  moderateScale,
  scale as horizontalScale,
  verticalScale,
} from 'react-native-size-matters';

/**
 * Responsive scaling helpers
 * Use these helpers to ensure consistent sizing across different screen sizes.
 */

export const ms = (size: number, factor = 0.5) => moderateScale(size, factor);
export const hs = (size: number) => horizontalScale(size);
export const vs = (size: number) => verticalScale(size);

export const metrics = {
  logo: {
    width: ms(150, 0.4),
    height: ms(171, 0.4),
  },
  splashCircle: {
    diameter: ms(100, 0.5),
  },
};

