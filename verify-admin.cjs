const db = require('better-sqlite3')('backend/prisma/dev.db');

const admin = db.prepare('SELECT id, email, role, firstName, lastName, plan, tokenBalance, generationsLimit FROM users WHERE email = ?').get('admin@admin.com');

console.log('✅ Admin user in database:');
console.log(JSON.stringify(admin, null, 2));

db.close();
