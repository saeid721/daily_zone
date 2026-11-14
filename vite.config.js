import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
          additionalData: `$env-google-fonts-noto: "${env.VITE_GOOGLE_FONTS_NOTO_URL || ''}";\n`,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@features': path.resolve(__dirname, './src/features'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@app': path.resolve(__dirname, './src/app'),
      },
    },
    server: { port: 3000, open: true },
    build: {
      outDir: 'dist',
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rolldownOptions: {
        checks: { pluginTimings: false },
        output: {
          codeSplitting: {
            groups: [
              { name: 'vendor-react', test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\// },
              { name: 'bootstrap', test: /node_modules\/(bootstrap|react-bootstrap)\// },
              { name: 'swiper', test: /node_modules\/swiper\// },
              { name: 'zustand', test: /node_modules\/zustand\// },
              { name: 'axios', test: /node_modules\/axios\// },
              { name: 'helmet', test: /node_modules\/(react-helmet-async|react-helmet)\// },
              { name: 'framer-motion', test: /node_modules\/framer-motion\// },
              { name: 'vendor', test: /node_modules/ },
            ],
          },
        },
      },
      modulePreload: {
        resolveDependencies: (filename, deps) =>
          deps.filter(dep => !dep.includes('html2pdf')),
      },
    },
  };
});