/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // supabase/functions/** are Deno modules with URL imports ESLint cannot resolve.
    ignores: ['dist/*', 'supabase/functions/**', 'supabase/.temp/**'],
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
