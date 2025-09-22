const { execSync } = require('child_process');

console.log('🔍 Debug Information:');
console.log('Node version:', process.version);
console.log('NPM version:', execSync('npm --version').toString().trim());
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

try {
  console.log('\n📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  console.log('\n🏗️  Running build...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n✅ Build successful!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}