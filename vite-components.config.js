import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

const library = process.env.LIBRARY || 'DSFRChart';

/** @type {import('vite').UserConfig} */
export default {
  define: {
    'process.env': {},
  },
  appType: 'custom',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: '',
  build: {
    minify: true,
    outDir: path.resolve('dist/' + library),
    emptyOutDir: true,
    lib: {
      entry: library === 'DSFRChart' ? 'src/charts/main.js' : `src/charts/${library}.js`,
      name: library,
      fileName: library,
    },
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
};
