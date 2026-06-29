import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'

const looseAssets = ['app.js', 'styles.css']

export default defineConfig({
  root: '.',
  publicDir: false,
  server: {
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  plugins: [
    {
      name: 'copy-loose-assets',
      closeBundle() {
        if (!existsSync('dist')) mkdirSync('dist', { recursive: true })
        for (const file of looseAssets) {
          if (existsSync(file)) copyFileSync(file, `dist/${file}`)
        }
      },
    },
  ],
})
