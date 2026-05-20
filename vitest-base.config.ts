import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    setupFiles: ['./src/vitest-setup.ts'],
  },
  resolve: {
    alias: {
      'sockjs-client': path.resolve(__dirname, 'src/__mocks__/sockjs-client.ts'),
    },
  },
});
