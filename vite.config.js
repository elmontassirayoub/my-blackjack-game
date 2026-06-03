import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Pure static SPA — no backend, all game logic runs in the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
