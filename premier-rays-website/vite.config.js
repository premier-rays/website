import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',            
  base: '/',       
  build: {
    outDir: 'dist',         
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sports: resolve(__dirname, 'sports.html'),
        travels: resolve(__dirname, 'travels.html'),
        tourism: resolve(__dirname, 'tourism.html'),
      }
    }
  }
})
