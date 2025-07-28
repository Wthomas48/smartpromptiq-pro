import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'localdev123',
  database: 'smartpromptiq',
});

export const db = drizzle(pool, { schema });

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'SmartPromptIQ API', version: '1.0.0' });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (error) {
    res.json({ status: 'error', timestamp: new Date().toISOString(), database: 'disconnected' });
  }
});

// API Routes
app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompt_templates ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.get('/api/prompts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

app.post('/api/prompts', async (req, res) => {
  const { title, content, category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO prompts (title, content, category, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, category, 1]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Start server
async function startServer() {
  console.log('🚀 Starting SmartPromptIQ Backend...');
  
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', result.rows[0].current_time);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/templates`);
    console.log(`   GET  http://localhost:${PORT}/api/prompts`);
    console.log(`   POST http://localhost:${PORT}/api/prompts`);
  });
}

startServer();
