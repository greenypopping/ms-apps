import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: false,
  server: {
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
