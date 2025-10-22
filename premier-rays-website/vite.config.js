import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  server: {
    proxy: {
      // Proxy /api to your local express server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sports: resolve(__dirname, 'sports.html'),
        travels: resolve(__dirname, 'travels.html'),
        tourism: resolve(__dirname, 'tourism.html'),
        innova: resolve(__dirname, 'innova.html'),
        urbania: resolve(__dirname, 'urbania.html'),
        vin: resolve(__dirname, 'vin-academy.html'),
        accessories: resolve(__dirname, 'accessories.html'),
        ecostay: resolve(__dirname, 'ecostay.html'),
        coffeevilla: resolve(__dirname, 'coffeevilla.html'),
        treks: resolve(__dirname, 'treks.html'),
        gallery: resolve(__dirname, 'gallery.html'),
      }
    }
  }
})
