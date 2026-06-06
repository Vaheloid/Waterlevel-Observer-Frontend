import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import path, { resolve } from 'path'
import config from './public/config.json'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        login: resolve(__dirname, 'login.html'),      
        mainpage: resolve(__dirname, 'mainpage.html'), 
      },
      output: {
        // Настройка JS
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'login' 
            ? 'login/login.[hash].js' 
            : 'mainpage/mainpage.[hash].js';
        },
        chunkFileNames: 'shared/[name].[hash].js',
        
        // Настройка CSS и других ассетов
        assetFileNames: (assetInfo) => {
          const isCSS = assetInfo.name?.endsWith('.css');
          
          if (isCSS) {
            // Если CSS импортирован в login.html (проверка на 'login' остается актуальной)
            if (assetInfo.name?.includes('index') || assetInfo.name?.includes('login')) {
              return 'login/login.[hash][extname]';
            }
            // Если CSS импортирован в mainpage.html
            if (assetInfo.name?.includes('mainpage') || assetInfo.name?.includes('App')) {
              return 'mainpage/css/mainpage.[hash][extname]';
            }
            // Все остальное
            return 'shared/css/[name].[hash][extname]';
          }
          
          return 'shared/[name].[hash][extname]';
        },
      },
    },
  },
  server: {
    open: '/login.html', 
    proxy: {
      '/api': {
        target: config.API_HOST + ":" + config.API_PORT,
        changeOrigin: true,
        secure: false,
      }
    },
  },
})