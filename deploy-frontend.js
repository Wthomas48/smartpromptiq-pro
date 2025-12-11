/**
 * Frontend Deployment Script for SmartPromptIQ
 * Deploys client/dist to smartpromptiq.com via FTP
 */

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Load FTP credentials from environment or config
const FTP_CONFIG = {
  host: process.env.FTP_HOST || 'smartpromptiq.com',
  user: process.env.FTP_USER || '',
  password: process.env.FTP_PASSWORD || '',
  secure: true, // Use FTPS
  port: parseInt(process.env.FTP_PORT || '21'),
  remotePath: process.env.FTP_REMOTE_PATH || '/public_html'
};

async function deployToProduction() {
  console.log('🚀 Starting Frontend Deployment to smartpromptiq.com...\n');

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    // Check if build exists
    const buildPath = path.join(__dirname, 'client', 'dist');
    if (!fs.existsSync(buildPath)) {
      throw new Error('Build not found! Run "npm run build" first.');
    }

    console.log('📁 Build directory:', buildPath);
    console.log('🌐 Target server:', FTP_CONFIG.host);
    console.log('📂 Remote path:', FTP_CONFIG.remotePath);
    console.log('');

    // Validate credentials
    if (!FTP_CONFIG.user || !FTP_CONFIG.password) {
      console.log('⚠️  FTP credentials not configured.');
      console.log('Please set environment variables:');
      console.log('  - FTP_USER=your_ftp_username');
      console.log('  - FTP_PASSWORD=your_ftp_password');
      console.log('  - FTP_HOST=smartpromptiq.com (default)');
      console.log('  - FTP_REMOTE_PATH=/public_html (default)');
      console.log('');
      console.log('Example:');
      console.log('  set FTP_USER=myuser && set FTP_PASSWORD=mypass && node deploy-frontend.js');
      process.exit(1);
    }

    // Connect to FTP server
    console.log('🔌 Connecting to FTP server...');
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      secure: FTP_CONFIG.secure,
      port: FTP_CONFIG.port
    });
    console.log('✅ Connected successfully!\n');

    // Navigate to remote directory
    console.log(`📂 Navigating to ${FTP_CONFIG.remotePath}...`);
    await client.ensureDir(FTP_CONFIG.remotePath);
    console.log('✅ Directory ready!\n');

    // Create backup of current deployment (optional)
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupDir = `${FTP_CONFIG.remotePath}_backup_${timestamp}`;
      console.log(`💾 Creating backup at ${backupDir}...`);
      // Note: This requires server-side move/copy support
      console.log('⚠️  Backup skipped (manual backup recommended)\n');
    } catch (err) {
      console.log('⚠️  Backup failed (continuing anyway):', err.message, '\n');
    }

    // Upload files
    console.log('📤 Uploading files...');
    await client.uploadFromDir(buildPath, FTP_CONFIG.remotePath);
    console.log('✅ Upload complete!\n');

    // Verify upload
    console.log('🔍 Verifying deployment...');
    const files = await client.list(FTP_CONFIG.remotePath);
    const indexExists = files.some(f => f.name === 'index.html');
    const assetsExists = files.some(f => f.name === 'assets');

    if (indexExists && assetsExists) {
      console.log('✅ Verification passed!');
      console.log('   - index.html: Found');
      console.log('   - assets/: Found');
    } else {
      console.log('⚠️  Verification incomplete:');
      console.log('   - index.html:', indexExists ? 'Found' : 'MISSING');
      console.log('   - assets/:', assetsExists ? 'Found' : 'MISSING');
    }

    console.log('\n🎉 Deployment successful!');
    console.log(`🌐 Visit: https://${FTP_CONFIG.host}`);

  } catch (err) {
    console.error('\n❌ Deployment failed:', err.message);
    console.error('\nFull error:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Check if basic-ftp is installed
try {
  require.resolve('basic-ftp');
} catch (e) {
  console.log('📦 Installing required package: basic-ftp...\n');
  const { execSync } = require('child_process');
  execSync('npm install basic-ftp --save-dev', { stdio: 'inherit' });
  console.log('✅ Package installed!\n');
}

// Run deployment
deployToProduction().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
