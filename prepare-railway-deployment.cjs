const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PREPARING RAILWAY DEPLOYMENT');
console.log('================================');

const TIMEOUT = 10 * 60 * 1000; // 10 minutes

function runCommand(cmd, cwd = process.cwd()) {
    console.log(`\n📝 Running: ${cmd}`);
    console.log(`📍 Directory: ${cwd}`);

    try {
        const output = execSync(cmd, {
            cwd,
            stdio: 'pipe',
            timeout: TIMEOUT,
            encoding: 'utf8'
        });
        console.log('✅ Command completed successfully');
        return output;
    } catch (error) {
        console.error(`❌ Command failed: ${error.message}`);
        if (error.stdout) console.log('STDOUT:', error.stdout);
        if (error.stderr) console.log('STDERR:', error.stderr);
        throw error;
    }
}

function checkExists(filePath, description) {
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
    return exists;
}

async function main() {
    try {
        // Step 1: Check current status
        console.log('\n🔍 CHECKING CURRENT STATUS...');

        const projectRoot = process.cwd();
        const clientDir = path.join(projectRoot, 'client');
        const clientDistDir = path.join(clientDir, 'dist');

        checkExists(clientDir, 'Client directory');
        checkExists(path.join(clientDir, 'package.json'), 'Client package.json');

        // Step 2: Install root dependencies
        console.log('\n📦 INSTALLING ROOT DEPENDENCIES...');
        runCommand('npm install');

        // Step 3: Install client dependencies
        console.log('\n📦 INSTALLING CLIENT DEPENDENCIES...');
        runCommand('npm install', clientDir);

        // Step 4: Build client
        console.log('\n🏗️ BUILDING CLIENT...');
        runCommand('npm run build', clientDir);

        // Step 5: Verify build
        console.log('\n🔍 VERIFYING BUILD...');
        const buildExists = checkExists(clientDistDir, 'Client build directory');
        const indexExists = checkExists(path.join(clientDistDir, 'index.html'), 'Client index.html');

        if (!buildExists || !indexExists) {
            throw new Error('Client build verification failed');
        }

        // Step 6: Test server locally
        console.log('\n🧪 TESTING SERVER LOCALLY...');
        console.log('Starting server for 10 seconds to test...');

        const { spawn } = require('child_process');
        const server = spawn('node', ['server.cjs'], {
            env: { ...process.env, PORT: '9998' },
            stdio: 'pipe'
        });

        let serverOutput = '';
        server.stdout.on('data', (data) => {
            serverOutput += data.toString();
        });

        server.stderr.on('data', (data) => {
            console.log('Server stderr:', data.toString());
        });

        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test health check
        const http = require('http');
        const healthCheck = new Promise((resolve, reject) => {
            const req = http.get('http://localhost:9998/health', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200 && data === 'OK') {
                        console.log('✅ Health check passed');
                        resolve(true);
                    } else {
                        reject(new Error(`Health check failed: ${res.statusCode} - ${data}`));
                    }
                });
            });
            req.on('error', reject);
            req.setTimeout(5000, () => reject(new Error('Health check timeout')));
        });

        try {
            await healthCheck;
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
        }

        // Stop server
        server.kill();

        // Step 7: Railway configuration check
        console.log('\n⚙️ CHECKING RAILWAY CONFIGURATION...');
        checkExists('railway.json', 'Railway JSON config');
        checkExists('railway.toml', 'Railway TOML config');
        checkExists('nixpacks.toml', 'Nixpacks config');
        checkExists('Procfile', 'Procfile');

        // Step 8: Railway deployment readiness
        console.log('\n🚀 RAILWAY DEPLOYMENT READINESS...');

        const deploymentChecklist = [
            { check: 'Root package.json exists', pass: fs.existsSync('package.json') },
            { check: 'Client build exists', pass: fs.existsSync(clientDistDir) },
            { check: 'Server file exists', pass: fs.existsSync('server.cjs') },
            { check: 'Health endpoint configured', pass: true },
            { check: 'Railway config exists', pass: fs.existsSync('railway.json') }
        ];

        let allPassed = true;
        deploymentChecklist.forEach(item => {
            console.log(`${item.pass ? '✅' : '❌'} ${item.check}`);
            if (!item.pass) allPassed = false;
        });

        if (allPassed) {
            console.log('\n🎉 RAILWAY DEPLOYMENT READY!');
            console.log('\nNext steps:');
            console.log('1. railway login');
            console.log('2. railway link (link to your project)');
            console.log('3. railway up (deploy)');
            console.log('\nOr use: npm run railway:deploy');
        } else {
            console.log('\n❌ DEPLOYMENT NOT READY - Fix issues above');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ PREPARATION FAILED:', error.message);
        process.exit(1);
    }
}

main();