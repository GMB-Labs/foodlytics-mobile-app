// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  // allow our custom text component `AppText` to contain raw text (no-raw-text rule)
  {
    rules: {
      'react-native/no-raw-text': ['error', { skip: ['AppText'] }],
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
