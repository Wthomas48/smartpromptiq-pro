// Simple test script for the queue implementation
const { generateDemoLogic } = require('./backend/src/services/queueService');

async function testQueueLogic() {
  console.log('🧪 Testing Demo Generation Logic...');

  try {
    // Test startup-pitch template
    const testData = {
      templateType: 'startup-pitch',
      userResponses: {
        businessName: 'TestApp',
        industry: 'Technology',
        problem: 'Users struggle with complex interfaces',
        solution: 'Simple, intuitive design platform',
        targetMarket: 'Small businesses',
        revenueModel: 'SaaS Subscription'
      },
      generateRealPrompt: false
    };

    console.log('📝 Test data:', JSON.stringify(testData, null, 2));

    const result = await generateDemoLogic(testData);

    console.log('✅ Demo generation successful!');
    console.log('📋 Result keys:', Object.keys(result));
    console.log('📝 Title:', result.title);
    console.log('📖 Content length:', result.content.length, 'characters');
    console.log('⏰ Generated at:', result.generatedAt);

    // Test another template
    console.log('\n🧪 Testing Social Campaign Template...');

    const socialTest = {
      templateType: 'social-campaign',
      userResponses: {
        productService: 'Mobile App',
        targetAudience: 'Young professionals',
        campaignGoal: 'App Downloads',
        budget: '$2,000',
        duration: '4 weeks',
        platforms: 'Instagram, TikTok'
      },
      generateRealPrompt: false
    };

    const socialResult = await generateDemoLogic(socialTest);
    console.log('✅ Social campaign generation successful!');
    console.log('📝 Title:', socialResult.title);
    console.log('📖 Content preview:', socialResult.content.substring(0, 200) + '...');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testQueueLogic().then(() => {
  console.log('\n🎉 All tests completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});