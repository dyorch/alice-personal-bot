import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

const here = path.dirname(fileURLToPath(import.meta.url));

// El plugin de TanStack Router debe ir antes que el de React para que
// genere `routeTree.gen.ts` a tiempo durante el dev y el build.
export default defineConfig(({ mode }) => {
  // Vars con prefix DEV_ (sin VITE_): solo accesibles aquí, NUNCA llegan
  // al bundle del browser. Se usan para inyectar el Bearer en el proxy de dev.
  const env = loadEnv(mode, here, '');
  const botBase = env.DEV_BOT_API_BASE || 'http://localhost:8787';
  const botToken = env.DEV_API_SHARED_TOKEN || '';

  return {
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(here, 'src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        // En dev, `/api/*` se reenvía al worker del bot añadiendo el Bearer.
        // El bundle del browser solo conoce URLs relativas — el token vive
        // solo en `.env.local` y se inyecta aquí, server-side.
        '/api': {
          target: botBase,
          changeOrigin: true,
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (botToken) {
                proxyReq.setHeader('Authorization', `Bearer ${botToken}`);
              }
            });
          },
        },
      },
    },
  };
});
