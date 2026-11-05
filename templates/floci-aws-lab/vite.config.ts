/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { flociProxy } from './vite/floci-proxy';

const server = {
  host: true,
  port: 5173,
  strictPort: true,
  // Codespaces serves forwarded ports from <codespace>-5173.app.github.dev.
  allowedHosts: ['.app.github.dev'],
};

export default defineConfig({
  plugins: [
    react(),
    flociProxy({
      target: process.env.FLOCI_ENDPOINT ?? 'http://localhost:4566',
    }),
  ],
  server: {
    ...server,
    // The forwarded URL is https on 443, not the dev server's own port, so the
    // HMR websocket has to be told where to connect back to.
    hmr: process.env.CODESPACES ? { clientPort: 443 } : undefined,
  },
  preview: server,
  test: {
    environment: 'node',
  },
});
