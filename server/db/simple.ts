// Simplified schema for SQLite development
export const users = {
  id: 'TEXT PRIMARY KEY',
  email: 'TEXT UNIQUE NOT NULL',
  name: 'TEXT NOT NULL', 
  passwordHash: 'TEXT NOT NULL',
  role: 'TEXT DEFAULT \"user\"',
  isEmailVerified: 'INTEGER DEFAULT 0',
  createdAt: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};

// For now, let's create a simple mock database
export const db = {
  users: new Map(),
  prompts: new Map(),
  subscriptions: new Map()
};

export function checkDatabaseConnection() {
  console.log('✅ Mock database ready');
  return true;
}

export function ensureDatabaseSetup() {
  checkDatabaseConnection();
}
