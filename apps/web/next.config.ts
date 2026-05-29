import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ['@alice/shared'],
  // En Windows OpenNext no puede crear symlinks sin Developer Mode. Con
  // `output: 'standalone'` Next.js empaqueta el server con sus deps resueltas
  // y OpenNext lo usa directo, evitando los symlinks.
  output: 'standalone',
  // Como vivimos en un monorepo pnpm, el "tracing root" tiene que apuntar a
  // la raiz para que Next vea node_modules hoisted y los workspaces.
  outputFileTracingRoot: path.join(here, '..', '..'),
};

export default nextConfig;
