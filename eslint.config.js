// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // React Three Fiber uses three.js props (args, position, castShadow...) as JSX attributes
    files: ["src/components/3d/**/*.tsx"],
    rules: {
      "react/no-unknown-property": "off",
    },
  },
]);
