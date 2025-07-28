import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

const app = express();
const PORT = 3001;

// Hardcoded local database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'localdev123',
  database: 'smartpromptiq',
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SmartPromptIQ API', version: '1.0.0' });
});

app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Start server
async function startServer() {
  console.log('🚀 Starting SmartPromptIQ Backend...');
  
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️  Starting server without database connection');
  }
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   - http://localhost:${PORT}/`);
    console.log(`   - http://localhost:${PORT}/health`);
    console.log(`   - http://localhost:${PORT}/api/test`);
  });
}

startServer();
