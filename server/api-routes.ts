import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'localdev123',
  database: 'smartpromptiq',
});

// Get all templates
router.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompt_templates ORDER BY category, name');
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get all prompts
router.get('/api/prompts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompts ORDER BY created_at DESC');
    res.json({ prompts: result.rows });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Create a new prompt
router.post('/api/prompts', async (req, res) => {
  const { title, content, category, tags } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO prompts (title, content, category, tags, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, category, tags || [], 1] // Using user_id 1 for now
    );
    res.json({ prompt: result.rows[0] });
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Get single prompt
router.get('/api/prompts/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json({ prompt: result.rows[0] });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Update prompt
router.put('/api/prompts/:id', async (req, res) => {
  const { title, content, category, tags } = req.body;
  try {
    const result = await pool.query(
      'UPDATE prompts SET title = $1, content = $2, category = $3, tags = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, content, category, tags || [], req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json({ prompt: result.rows[0] });
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// Delete prompt
router.delete('/api/prompts/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM prompts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

export default router;
