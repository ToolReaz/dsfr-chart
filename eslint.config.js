import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginStorybook from 'eslint-plugin-storybook';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,svelte}'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...pluginStorybook.configs['flat/recommended'],
  {
    rules: {},
  },
  {
    ignores: ['!.storybook'],
  },
];
