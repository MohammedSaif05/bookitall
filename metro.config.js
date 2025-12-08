const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    // Ensure .js files are resolved properly
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'mjs', 'cjs', 'svg'],
    // Remove js and svg from asset extensions to allow them as source
    assetExts: (defaultConfig.resolver?.assetExts || []).filter((ext) => ext !== 'js' && ext !== 'svg'),
  },
};

module.exports = withNativeWind(mergeConfig(defaultConfig, config), {
  input: './global.css',
});

