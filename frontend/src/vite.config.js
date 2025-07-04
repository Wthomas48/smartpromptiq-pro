import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './frontend', // 👈 tells Vite where your index.html lives
  plugins: [react()],
  build: {
    outDir: '../dist', // 👈 output goes to root-level dist/
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
    allowedHosts: 'all'
  }
})
