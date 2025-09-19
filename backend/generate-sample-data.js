const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function generateSampleData() {
  console.log('🚀 Generating sample data for admin dashboard...');

  try {
    // Create sample users with different tiers
    const users = [
      {
        email: 'user1@test.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free',
        role: 'USER'
      },
      {
        email: 'user2@test.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Jane',
        lastName: 'Smith',
        subscriptionTier: 'starter',
        role: 'USER'
      },
      {
        email: 'user3@test.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Mike',
        lastName: 'Johnson',
        subscriptionTier: 'pro',
        role: 'USER'
      },
      {
        email: 'user4@test.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Sarah',
        lastName: 'Wilson',
        subscriptionTier: 'business',
        role: 'USER'
      }
    ];

    console.log('Creating sample users...');
    const createdUsers = [];
    for (const userData of users) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.email}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
          });
          createdUsers.push(existingUser);
        } else {
          throw error;
        }
      }
    }

    // Create sample prompts
    console.log('Creating sample prompts...');
    const promptCategories = ['marketing', 'product-development', 'education', 'personal-development'];

    for (let i = 0; i < 20; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomCategory = promptCategories[Math.floor(Math.random() * promptCategories.length)];

      try {
        await prisma.prompt.create({
          data: {
            title: `Sample Prompt ${i + 1}`,
            content: `This is a sample prompt for ${randomCategory} category. It demonstrates the kind of AI-generated content users create.`,
            category: randomCategory,
            questionnaire: JSON.stringify({
              target: 'General audience',
              tone: 'Professional',
              length: 'Medium'
            }),
            customization: JSON.stringify({
              style: 'Informative',
              format: 'Paragraph'
            }),
            userId: randomUser.id,
            isFavorite: Math.random() > 0.7
          }
        });
      } catch (error) {
        console.log(`⚠️  Could not create prompt ${i + 1}: ${error.message}`);
      }
    }

    // Create sample usage logs
    console.log('Creating sample usage logs...');
    for (let i = 0; i < 50; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const tokensUsed = Math.floor(Math.random() * 2000) + 100; // 100-2100 tokens
      const costInCents = Math.floor(tokensUsed * 0.002 * 100); // Roughly $0.002 per token in cents

      try {
        await prisma.usageLog.create({
          data: {
            userId: randomUser.id,
            endpoint: '/api/generate-prompt',
            feature: 'prompt-generation',
            tokensConsumed: tokensUsed,
            costInCents: costInCents,
            provider: Math.random() > 0.5 ? 'openai' : 'anthropic',
            responseTime: Math.floor(Math.random() * 3000) + 500, // 500-3500ms
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
          }
        });
      } catch (error) {
        console.log(`⚠️  Could not create usage log ${i + 1}: ${error.message}`);
      }
    }

    // Create sample subscriptions
    console.log('Creating sample subscriptions...');
    const subscriptionPlans = [
      { tier: 'starter', priceInCents: 999 },
      { tier: 'pro', priceInCents: 1999 },
      { tier: 'business', priceInCents: 4999 }
    ];

    for (const user of createdUsers) {
      if (user.subscriptionTier !== 'free') {
        const plan = subscriptionPlans.find(p => p.tier === user.subscriptionTier);
        if (plan) {
          try {
            await prisma.subscription.create({
              data: {
                userId: user.id,
                stripeSubscriptionId: `sub_test_${Math.random().toString(36).substr(2, 9)}`,
                status: 'active',
                tier: user.subscriptionTier,
                priceInCents: plan.priceInCents,
                createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random time in last 90 days
              }
            });
          } catch (error) {
            console.log(`⚠️  Could not create subscription for ${user.email}: ${error.message}`);
          }
        }
      }
    }

    // Update user statistics
    console.log('Updating user statistics...');
    for (const user of createdUsers) {
      const generationsCount = await prisma.prompt.count({
        where: { userId: user.id }
      });

      const tokensUsed = await prisma.usageLog.aggregate({
        where: { userId: user.id },
        _sum: { tokensConsumed: true }
      });

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            generationsUsed: generationsCount,
            tokensUsed: tokensUsed._sum.tokensConsumed || 0,
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
          }
        });
      } catch (error) {
        console.log(`⚠️  Could not update user ${user.email}: ${error.message}`);
      }
    }

    console.log('✅ Sample data generation completed!');
    console.log(`📊 Created ${createdUsers.length} users, ~20 prompts, ~50 usage logs, and subscriptions`);
    console.log('🔗 Admin Dashboard: http://localhost:5174/admin');
    console.log('🔑 Admin Login: admin@admin.com / Admin123!');

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateSampleData();