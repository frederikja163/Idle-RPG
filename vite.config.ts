import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, 'src/front-end'), '');

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: 'assets',
            dest: '',
          },
        ],
      }),
    ],
    root: 'src/front-end',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/'),
      },
    },
    server: {
      port: Number(env.VITE_FRONTEND_PORT ?? 3000),
    },
    build: {
      outDir: '../../dist',
      emptyOutDir: true,
    },
    base: `${env.VITE_BASE_URL ?? ''}/`, // May be needed when deployed to GitHub pages
  };
});
