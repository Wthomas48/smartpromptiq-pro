import { Express } from 'express';
import { Server } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await import('vite');
  const viteServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(__dirname, '../client'),
  });
  
  app.use(viteServer.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, '../client/dist');
  const express = require('express');
  
  app.use(express.static(distPath));
  
  // Serve index.html for all non-API routes (SPA)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}
