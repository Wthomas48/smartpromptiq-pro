const sqlite3 = require('better-sqlite3');
const db = sqlite3('backend/prisma/dev.db');

console.log('📊 Tables in database:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

// Check if database has been initialized
if (tables.length === 0) {
  console.log('\n⚠️  Database is empty! Run: cd backend && npx prisma db push');
} else {
  // Try to list some users
  try {
    const users = db.prepare('SELECT id, email, role, firstName FROM User LIMIT 5').all();
    console.log('\n👥 Users in database:');
    console.log(users);
  } catch (err) {
    console.log('\n❌ Could not query User table:', err.message);
  }
}

db.close();
