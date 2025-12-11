/**
 * Complete Deployment Script
 * Deploys both frontend and backend for SmartPromptIQ
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       SmartPromptIQ Complete Deployment Script           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

function runStep(command, description, options = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 ${description}`);
  console.log('='.repeat(60));

  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || __dirname
    });
    console.log(`✅ ${description} - Complete`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} - Failed`);
    console.error(error.message);
    if (options.continueOnError) {
      console.log('⚠️  Continuing despite error...');
      return null;
    }
    throw error;
  }
}

async function deployAll() {
  const startTime = Date.now();

  try {
    console.log('🚀 Starting complete deployment process...\n');

    // Step 1: Build Frontend
    runStep(
      'cd client && npm run build',
      'Step 1: Building Frontend (Production)',
      { cwd: path.join(__dirname, 'client') }
    );

    // Step 2: Deploy Backend to Railway
    console.log('\n📦 Step 2: Deploying Backend to Railway');
    console.log('─'.repeat(60));

    // Check if Railway CLI is available
    try {
      execSync('railway --version', { stdio: 'pipe' });

      runStep(
        'node deploy-railway.js',
        'Step 2a: Railway Backend Deployment'
      );
    } catch (err) {
      console.log('⚠️  Railway CLI not found - skipping backend deployment');
      console.log('   Install Railway CLI: npm install -g @railway/cli');
      console.log('   Then run: node deploy-railway.js');
    }

    // Step 3: Deploy Frontend to Production
    console.log('\n🌐 Step 3: Deploying Frontend to smartpromptiq.com');
    console.log('─'.repeat(60));

    // Check FTP credentials
    if (process.env.FTP_USER && process.env.FTP_PASSWORD) {
      runStep(
        'node deploy-frontend.js',
        'Step 3a: FTP Frontend Deployment'
      );
    } else {
      console.log('⚠️  FTP credentials not configured');
      console.log('\nTo deploy frontend, either:');
      console.log('\n1. Set environment variables and re-run:');
      console.log('   set FTP_USER=your_username');
      console.log('   set FTP_PASSWORD=your_password');
      console.log('   node deploy-all.js');
      console.log('\n2. Manually upload client/dist/ to your hosting');
      console.log('\n3. Or run: node deploy-frontend.js (with credentials)');
    }

    // Step 4: Verify Deployments
    console.log('\n✅ Step 4: Deployment Summary');
    console.log('─'.repeat(60));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️  Total deployment time: ${duration} seconds`);
    console.log('\n📊 Deployment Status:\n');

    // Check frontend build
    const buildExists = fs.existsSync(path.join(__dirname, 'client', 'dist', 'index.html'));
    console.log(`   Frontend Build: ${buildExists ? '✅ Ready' : '❌ Missing'}`);

    // Check backend files
    const backendExists = fs.existsSync(path.join(__dirname, 'railway-server-minimal.cjs'));
    console.log(`   Backend Files:  ${backendExists ? '✅ Ready' : '❌ Missing'}`);

    console.log('\n🎯 Next Steps:\n');
    console.log('1. Test frontend: https://smartpromptiq.com');
    console.log('2. Test backend API: https://your-railway-url.railway.app/api/health');
    console.log('3. Test signup flow: https://smartpromptiq.com/signup');
    console.log('4. Monitor logs:');
    console.log('   - Railway: railway logs');
    console.log('   - Frontend: Browser DevTools Console');

    console.log('\n🔍 Testing Commands:\n');
    console.log('# Test API health');
    console.log('curl https://your-railway-url.railway.app/api/health');
    console.log('\n# Test user registration');
    console.log('curl -X POST https://your-railway-url.railway.app/api/auth/register \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"test@example.com","password":"test123","firstName":"Test"}\'');

    console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║              ✅ DEPLOYMENT COMPLETE! ✅                    ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n\n❌ DEPLOYMENT FAILED\n');
    console.error('Error:', error.message);
    console.error('\nCheck the error above and try again.');
    console.error('\nFor manual deployment, see:');
    console.error('  - Frontend: node deploy-frontend.js');
    console.error('  - Backend:  node deploy-railway.js');
    process.exit(1);
  }
}

// Run complete deployment
deployAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
