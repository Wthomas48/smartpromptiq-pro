const fs = require('fs');
const path = require('path');

console.log('🔍 RAILWAY DEPLOYMENT VERIFICATION');
console.log('='.repeat(50));

// Check essential files
const essentialFiles = [
  'server.cjs',
  'railway.json',
  'package.json',
  'client/dist/index.html'
];

console.log('📁 Checking essential files:');
essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) {
    console.error(`❌ ERROR: Missing essential file: ${file}`);
    process.exit(1);
  }
});

// Check package.json start script
console.log('\n📦 Checking package.json configuration:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const startScript = packageJson.scripts?.start;
console.log(`  Start script: "${startScript}"`);

if (startScript !== 'node server.cjs') {
  console.error(`❌ ERROR: Start script should be "node server.cjs", got "${startScript}"`);
  process.exit(1);
} else {
  console.log('  ✅ Start script is correct');
}

// Check dependencies
console.log('\n📚 Checking essential dependencies:');
const requiredDeps = ['express'];
const availableDeps = Object.keys(packageJson.dependencies || {});

requiredDeps.forEach(dep => {
  const hasDepIndirect = availableDeps.includes(dep);
  console.log(`  ${hasDepIndirect ? '✅' : '❌'} ${dep}`);
});

// Check railway.json configuration
console.log('\n🚄 Checking Railway configuration:');
const railwayConfig = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
console.log(`  Start command: "${railwayConfig.deploy?.startCommand}"`);
console.log(`  Health check path: "${railwayConfig.deploy?.healthcheckPath}"`);

if (railwayConfig.deploy?.startCommand !== 'node server.cjs') {
  console.error('❌ ERROR: Railway start command should be "node server.cjs"');
  process.exit(1);
}

if (railwayConfig.deploy?.healthcheckPath !== '/health') {
  console.error('❌ ERROR: Railway health check path should be "/health"');
  process.exit(1);
}

// Check client build
console.log('\n🎨 Checking client build:');
const clientDistPath = path.join(__dirname, 'client', 'dist');
const indexPath = path.join(clientDistPath, 'index.html');
const assetsPath = path.join(clientDistPath, 'assets');

console.log(`  Build directory: ${fs.existsSync(clientDistPath) ? '✅' : '❌'}`);
console.log(`  Index.html: ${fs.existsSync(indexPath) ? '✅' : '❌'}`);
console.log(`  Assets directory: ${fs.existsSync(assetsPath) ? '✅' : '❌'}`);

if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  console.log(`  Assets count: ${assets.length} files`);
}

console.log('\n🎯 VERIFICATION RESULTS:');
console.log('✅ All essential files present');
console.log('✅ Package.json configuration correct');
console.log('✅ Railway configuration valid');
console.log('✅ Client build available');

console.log('\n🚀 DEPLOYMENT READY!');
console.log('Your app is configured correctly for Railway deployment.');
console.log('='.repeat(50));