import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  // resolve: {
  //   alias: {
  //     'argon2-browser': path.resolve(
  //       'path/to/root',
  //       'node_modules/argon2-browser/dist/argon2-bundled.min.js',
  //     ),
  //   },
  // },
});
