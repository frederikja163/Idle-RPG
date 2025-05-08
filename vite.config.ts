import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    root:
      'src/front-end',
    resolve: {
      alias: {
        '@':
          path.resolve(__dirname, 'src/'),
      },
    },
    server: {
      port: Number(env.VITE_FRONTEND_PORT ?? 3000),
    },
    build: {
      outDir: '../../dist',
      emptyOutDir:
        true,
    },
    base: "/Idle-RPG/"
  }
});
