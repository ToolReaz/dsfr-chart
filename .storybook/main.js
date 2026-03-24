/** @type { import('@storybook/svelte-vite').StorybookConfig } */
export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/svelte-vite',
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
};
