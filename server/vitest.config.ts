import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    root: './src',
    fileParallelism: false,
    testTimeout: 15000,
  },
});
