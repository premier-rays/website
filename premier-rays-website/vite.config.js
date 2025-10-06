import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',            
  base: '/website/',       
  build: {
    outDir: 'dist',         
    emptyOutDir: true
  }
})
