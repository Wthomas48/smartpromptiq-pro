// Test the demo API endpoint
const axios = require('axios');

async function testDemoAPI() {
  console.log('🧪 Testing Demo API Endpoint...');

  try {
    // Test data for the demo generation
    const testPayload = {
      templateType: 'startup-pitch',
      userResponses: {
        businessName: 'EcoTrack Pro',
        industry: 'Environmental Technology',
        problem: 'Small businesses struggle to track their carbon footprint',
        solution: 'AI-powered carbon tracking and reduction platform',
        targetMarket: 'Small to medium businesses',
        revenueModel: 'SaaS Subscription'
      },
      generateRealPrompt: false
    };

    console.log('📤 Sending request to demo API...');
    console.log('🔗 URL: http://localhost:5001/api/demo/generate');
    console.log('📋 Payload:', JSON.stringify(testPayload, null, 2));

    const response = await axios.post('http://localhost:5001/api/demo/generate', testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ API request successful!');
    console.log('📊 Status:', response.status);
    console.log('📋 Response keys:', Object.keys(response.data));

    if (response.data.success) {
      console.log('🎉 Demo generation successful!');
      console.log('📝 Title:', response.data.data.title);
      console.log('📖 Content length:', response.data.data.content?.length || 0, 'characters');
      console.log('🔧 Job ID:', response.data.meta?.jobId);
      console.log('📊 Queue stats:', response.data.meta?.queueStats);
    } else {
      console.log('❌ Demo generation failed:', response.data.error);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Server not running. Please start the test server first.');
      console.log('💡 Run this command to start the server:');
      console.log('   cd backend && node -e "const express = require(\'express\'); const app = express(); app.use(express.json()); const { addDemoToQueue, getQueueStatus } = require(\'./src/services/queueService\'); app.post(\'/api/demo/generate\', addDemoToQueue); app.get(\'/api/demo/queue/status\', getQueueStatus); app.listen(5001, () => console.log(\'Test server ready on port 5001\'));"');
    } else {
      console.error('❌ API test failed:', error.message);
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📋 Response:', error.response.data);
      }
    }
  }
}

// Run the test
testDemoAPI().then(() => {
  console.log('\n🏁 API test completed!');
}).catch(error => {
  console.error('💥 API test suite failed:', error);
});