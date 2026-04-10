import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const isWeb = process.env.VERCEL || process.env.BUILD_WEB === 'true';

const plugins = [react()];

// Only include electron plugin for desktop builds
if (!isWeb) {
  const electron = (await import('vite-plugin-electron')).default;
  plugins.push(
    electron([
      { entry: 'electron/main.cjs' },
      {
        entry: 'electron/preload.cjs',
        onstart(options) { options.reload(); },
      },
    ])
  );
}

export default defineConfig({
  plugins,
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
});
