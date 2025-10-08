import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',            
  base: '/website/',       
  build: {
    outDir: 'dist',         
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'sports.html'),
        contact: resolve(__dirname, 'tours.html'),
        contact: resolve(__dirname, 'travels.html'),
      }
    }
  }
})
