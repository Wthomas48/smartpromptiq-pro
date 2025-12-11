/**
 * Railway Backend Deployment Script
 * Deploys backend to Railway with full configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚂 Railway Backend Deployment Script\n');
console.log('=' .repeat(60));

// Configuration
const BACKEND_SERVER = 'railway-server-minimal.cjs';
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'FRONTEND_URL'
];

function runCommand(cmd, description) {
  console.log(`\n📌 ${description}...`);
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}

async function deployBackend() {
  try {
    console.log('\n🔍 Step 1: Pre-deployment Checks\n');

    // Check if Railway CLI is installed
    try {
      runCommand('railway --version', 'Checking Railway CLI');
    } catch (err) {
      console.log('\n❌ Railway CLI not installed!');
      console.log('\n📥 Install with:');
      console.log('   npm install -g @railway/cli');
      console.log('\nOr use the installer:');
      console.log('   https://docs.railway.app/develop/cli');
      process.exit(1);
    }

    // Check if backend server exists
    if (!fs.existsSync(path.join(__dirname, BACKEND_SERVER))) {
      throw new Error(`Backend server not found: ${BACKEND_SERVER}`);
    }
    console.log(`✅ Backend server found: ${BACKEND_SERVER}`);

    // Check environment file
    const envPath = path.join(__dirname, 'backend', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  backend/.env not found');
    } else {
      console.log('✅ Environment file found');

      // Read and validate env vars
      const envContent = fs.readFileSync(envPath, 'utf8');
      const missingVars = REQUIRED_ENV_VARS.filter(varName => {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        return !regex.test(envContent);
      });

      if (missingVars.length > 0) {
        console.log('\n⚠️  Missing required environment variables:');
        missingVars.forEach(v => console.log(`   - ${v}`));
      } else {
        console.log('✅ All required environment variables present');
      }
    }

    console.log('\n🔍 Step 2: Check Railway Connection\n');

    // Check if linked to Railway project
    try {
      const status = runCommand('railway status', 'Checking Railway project status');
      console.log('✅ Railway project linked');
    } catch (err) {
      console.log('\n⚠️  Not linked to Railway project');
      console.log('\n🔗 Linking to Railway...');

      try {
        runCommand('railway link', 'Linking to Railway project');
        console.log('✅ Project linked successfully');
      } catch (linkErr) {
        console.log('\n❌ Failed to link project');
        console.log('\nPlease run manually:');
        console.log('   railway login');
        console.log('   railway link');
        process.exit(1);
      }
    }

    console.log('\n🔍 Step 3: Sync Environment Variables\n');

    // Push environment variables to Railway
    if (fs.existsSync(envPath)) {
      console.log('📤 Uploading environment variables to Railway...');

      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n').filter(line => {
        return line.trim() && !line.startsWith('#') && line.includes('=');
      });

      console.log(`Found ${envLines.length} environment variables`);

      // Set each variable
      for (const line of envLines) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');

        if (key && value) {
          try {
            execSync(`railway variables set ${key}="${value}"`, {
              encoding: 'utf8',
              stdio: 'pipe'
            });
            console.log(`✅ Set ${key}`);
          } catch (err) {
            console.log(`⚠️  Failed to set ${key}: ${err.message}`);
          }
        }
      }

      console.log('\n✅ Environment variables synced');
    }

    console.log('\n🔍 Step 4: Deploy to Railway\n');

    // Deploy using Railway CLI
    console.log('🚀 Starting deployment...');
    runCommand('railway up', 'Deploying to Railway');

    console.log('\n✅ Deployment initiated!');

    console.log('\n🔍 Step 5: Get Deployment Info\n');

    // Get deployment URL
    try {
      const domains = runCommand('railway domain', 'Getting deployment URL');
      console.log('\n📍 Your backend is deployed at:');
      console.log(domains);
    } catch (err) {
      console.log('⚠️  Could not retrieve domain automatically');
      console.log('Check Railway dashboard: https://railway.app/dashboard');
    }

    console.log('\n🎉 Backend Deployment Complete!\n');
    console.log('=' .repeat(60));
    console.log('\n📋 Next Steps:\n');
    console.log('1. Check deployment status:');
    console.log('   railway logs\n');
    console.log('2. View in dashboard:');
    console.log('   railway open\n');
    console.log('3. Test API endpoint:');
    console.log('   curl https://your-app.railway.app/api/health\n');

  } catch (err) {
    console.error('\n❌ Deployment failed:', err.message);
    process.exit(1);
  }
}

// Run deployment
deployBackend();
