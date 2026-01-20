const express = require('express');
const router = express.Router();

// Discord Configuration
const DISCORD_CONFIG = {
  WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
  GUILD_ID: process.env.DISCORD_GUILD_ID || '',
  CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
  REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'https://smartpromptiq.com/api/discord/callback',
  INVITE_URL: 'https://discord.com/invite/smartpromptiq',
  // Role IDs (set these after creating roles in Discord)
  ROLES: {
    MEMBER: process.env.DISCORD_ROLE_MEMBER || '',
    PRO: process.env.DISCORD_ROLE_PRO || '',
    BUSINESS: process.env.DISCORD_ROLE_BUSINESS || '',
    VERIFIED: process.env.DISCORD_ROLE_VERIFIED || ''
  }
};

// ============================================
// DISCORD WEBHOOK NOTIFICATIONS
// ============================================

/**
 * Send notification to Discord webhook
 */
async function sendDiscordWebhook(content) {
  if (!DISCORD_CONFIG.WEBHOOK_URL) {
    console.log('Discord webhook URL not configured');
    return false;
  }

  try {
    const embed = {
      title: content.title,
      description: content.description,
      color: content.color || 0x8b5cf6, // Purple default
      fields: content.fields || [],
      footer: content.footer ? { text: content.footer } : { text: 'SmartPromptIQ' },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(DISCORD_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });

    return response.ok;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

// ============================================
// NOTIFICATION EVENTS (Export for use in other routes)
// ============================================

/**
 * Notify Discord when a new user signs up
 */
async function notifyNewUser(user) {
  await sendDiscordWebhook({
    title: '🎉 New User Joined!',
    description: `Welcome to the SmartPromptIQ community!`,
    color: 0x22c55e, // Green
    fields: [
      { name: 'Username', value: user.username || 'Not set', inline: true },
      { name: 'Email', value: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), inline: true }
    ],
    footer: 'New Registration'
  });
}

/**
 * Notify Discord when a user upgrades their plan
 */
async function notifyPlanUpgrade(user, plan) {
  await sendDiscordWebhook({
    title: '⬆️ Plan Upgrade!',
    description: `A user upgraded their subscription!`,
    color: 0xf59e0b, // Amber
    fields: [
      { name: 'User', value: user.username || user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), inline: true },
      { name: 'New Plan', value: plan.toUpperCase(), inline: true }
    ],
    footer: 'Subscription Upgrade'
  });
}

/**
 * Notify Discord of support requests
 */
async function notifySupportRequest(data) {
  await sendDiscordWebhook({
    title: '🎫 New Support Request',
    description: data.subject,
    color: 0x3b82f6, // Blue
    fields: [
      { name: 'From', value: data.name, inline: true },
      { name: 'Category', value: data.category, inline: true },
      { name: 'Email', value: data.email.replace(/(.{2}).*(@.*)/, '$1***$2'), inline: true }
    ],
    footer: 'Support Ticket'
  });
}

// ============================================
// API ROUTES
// ============================================

/**
 * Get Discord invite link
 */
router.get('/invite', (req, res) => {
  res.json({
    success: true,
    inviteUrl: DISCORD_CONFIG.INVITE_URL
  });
});

/**
 * Discord OAuth2 - Start verification flow
 */
router.get('/connect', (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Please sign in first' });
  }

  if (!DISCORD_CONFIG.CLIENT_ID) {
    return res.redirect(DISCORD_CONFIG.INVITE_URL);
  }

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.CLIENT_ID,
    redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds.join',
    state
  });

  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

/**
 * Discord OAuth2 callback
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.redirect('/dashboard?discord=error');
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CONFIG.CLIENT_ID,
        client_secret: DISCORD_CONFIG.CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_CONFIG.REDIRECT_URI
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error('Failed to get Discord access token');
    }

    // Get Discord user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const discordUser = await userResponse.json();

    // Notify Discord of successful link
    await sendDiscordWebhook({
      title: '✅ Account Linked!',
      description: `A SmartPromptIQ user connected their Discord account`,
      color: 0x8b5cf6,
      fields: [
        { name: 'Discord', value: discordUser.username, inline: true }
      ]
    });

    res.redirect('/dashboard?discord=connected');
  } catch (error) {
    console.error('Discord callback error:', error);
    res.redirect('/dashboard?discord=error');
  }
});

/**
 * Get Discord connection status
 */
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    inviteUrl: DISCORD_CONFIG.INVITE_URL,
    configured: !!DISCORD_CONFIG.WEBHOOK_URL
  });
});

/**
 * Manual webhook test (for testing)
 */
router.post('/webhook/test', async (req, res) => {
  const success = await sendDiscordWebhook({
    title: '🧪 Test Notification',
    description: 'This is a test notification from SmartPromptIQ',
    color: 0x8b5cf6,
    fields: [
      { name: 'Status', value: 'Webhook is working!', inline: true }
    ]
  });

  res.json({ success, message: success ? 'Test notification sent!' : 'Webhook not configured or failed' });
});

module.exports = router;
module.exports.sendDiscordWebhook = sendDiscordWebhook;
module.exports.notifyNewUser = notifyNewUser;
module.exports.notifyPlanUpgrade = notifyPlanUpgrade;
module.exports.notifySupportRequest = notifySupportRequest;
