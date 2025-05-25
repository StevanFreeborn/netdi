import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json', 'lcov', 'cobertura'],
      include: ['**/src/**/*.ts'],
      exclude: ['**/src/index.ts', '**/src/server.ts'],
    },
  },
  plugins: [swc.vite()],
});
