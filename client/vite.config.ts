import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    // Explicitly define Supabase environment variables for production
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://ycpvdoktcoejmywqfwwy.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcHZkb2t0Y29lam15d3Fmd3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxMjkzNTEsImV4cCI6MjA0MjcwNTM1MX0.VQNqWP5PjNpYJVBHH2g0HTpKAhW1dE1Kg-T_lI-7huw')
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Allow external connections
    hmr: {
      // Configure HMR to be more resilient
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      timeout: 5000,
      overlay: false, // Don't show error overlay for HMR issues
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: 'hidden', // Generate sourcemaps but don't expose to users - upload to error tracking
    minify: true,
    target: 'es2019', // ES2019 for broader compatibility (supports optional chaining)
    rollupOptions: {
      output: {
        // Force new file hashes to bust cache
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          auth: ['@supabase/supabase-js'],
          routing: ['wouter', 'react-router-dom']
        }
      },
      maxParallelFileOps: 2
    },
    chunkSizeWarningLimit: 1500
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      'class-variance-authority'
    ],
    force: false
  },
  esbuild: {
    target: 'es2019', // Match build target for consistency
    minify: true
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})