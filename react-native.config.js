/**
 * React Native Configuration
 * For New Architecture, let autolinking handle dependencies automatically
 */
module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
    },
    ios: {},
  },
  assets: ['./assets/fonts/'],
};

