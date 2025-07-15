import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
      // Disable strict mode to prevent @fs errors
      strict: false
    }
  },
  // Add this to help with module resolution
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  },
  build: {
    // Ensure proper chunking
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})