/** @type { import('@storybook/web-components-vite').StorybookConfig } */
export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/web-components-vite',
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
};
