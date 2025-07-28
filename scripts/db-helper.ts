// scripts/db-helper.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';

const execAsync = promisify(exec);

// Load environment based on NODE_ENV or command line argument
const env = process.argv[2] || 'local';
dotenv.config({ path: path.resolve(`.env.${env}`) });

async function runCommand(command: string, description: string) {
  console.log(`\n🔄 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    throw error;
  }
}

async function main() {
  const command = process.argv[3];
  
  switch (command) {
    case 'migrate':
      await runCommand(
        'npx drizzle-kit generate:pg && npx drizzle-kit push:pg',
        'Running database migrations'
      );
      break;
    
    case 'seed':
      console.log('🌱 Seeding database...');
      // Add seed logic here
      break;
    
    case 'reset':
      if (env === 'local') {
        await runCommand('npm run db:reset', 'Resetting local database');
      } else {
        console.error('❌ Reset only allowed for local environment');
      }
      break;
    
    default:
      console.log(`
Database Helper Commands:
  npm run db:helper local migrate  - Run migrations on local DB
  npm run db:helper staging migrate - Run migrations on staging DB
  npm run db:helper local reset     - Reset local database
  npm run db:helper local seed      - Seed local database
      `);
  }
}

main().catch(console.error);
