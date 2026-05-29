import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

const here = path.dirname(fileURLToPath(import.meta.url));

// El plugin de TanStack Router debe ir antes que el de React para que
// genere `routeTree.gen.ts` a tiempo durante el dev y el build.
export default defineConfig({
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
  },
});
