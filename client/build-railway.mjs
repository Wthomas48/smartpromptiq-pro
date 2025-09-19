#!/usr/bin/env node

/**
 * Railway Build Script for SmartPromptIQ Pro Client
 * ESM compatible build script for Vite v5.4.19+
 */

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏗️  Building SmartPromptIQ Pro for Railway...');

try {
  await build({
    // Vite build configuration for Railway
    root: __dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false, // Disable sourcemaps for production
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['wouter'],
            ui: ['@radix-ui/react-tabs', '@radix-ui/react-dialog'],
          },
        },
      },
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  console.log('✅ Railway build completed successfully!');
} catch (error) {
  console.error('❌ Railway build failed:', error);
  process.exit(1);
}