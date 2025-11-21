// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactNative = require('eslint-plugin-react-native');

module.exports = defineConfig([
  expoConfig,
  // allow our custom text component `AppText` to contain raw text (no-raw-text rule)
  {
    plugins: {
      'react-native': reactNative,
    },
    rules: {
      'react-native/no-raw-text': ['error', { skip: ['AppText', 'RNText'] }],
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
