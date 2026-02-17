"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDiscordWebhook = sendDiscordWebhook;
exports.notifyNewUser = notifyNewUser;
exports.notifyPlanUpgrade = notifyPlanUpgrade;
exports.notifySupportRequest = notifySupportRequest;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Discord Configuration
const DISCORD_CONFIG = {
    WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
    GUILD_ID: process.env.DISCORD_GUILD_ID || '',
    CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
    CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
    REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'https://smartpromptiq.com/api/discord/callback',
    INVITE_URL: process.env.DISCORD_INVITE_URL || 'https://discord.gg/smartpromptiq',
    ROLES: {
        MEMBER: process.env.DISCORD_ROLE_MEMBER || '',
        PRO: process.env.DISCORD_ROLE_PRO || '',
        BUSINESS: process.env.DISCORD_ROLE_BUSINESS || '',
        VERIFIED: process.env.DISCORD_ROLE_VERIFIED || ''
    }
};
async function sendDiscordWebhook(content) {
    if (!DISCORD_CONFIG.WEBHOOK_URL) {
        return false;
    }
    try {
        const embed = {
            title: content.title,
            description: content.description,
            color: content.color || 0x8b5cf6,
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
    }
    catch (error) {
        console.error('Discord webhook error:', error);
        return false;
    }
}
// ============================================
// NOTIFICATION HELPERS (exported for other routes)
// ============================================
async function notifyNewUser(user) {
    await sendDiscordWebhook({
        title: 'New User Joined!',
        description: 'Welcome to the SmartPromptIQ community!',
        color: 0x22c55e,
        fields: [
            { name: 'Username', value: user.username || 'Not set', inline: true },
            { name: 'Email', value: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), inline: true }
        ],
        footer: 'New Registration'
    });
}
async function notifyPlanUpgrade(user, plan) {
    await sendDiscordWebhook({
        title: 'Plan Upgrade!',
        description: 'A user upgraded their subscription!',
        color: 0xf59e0b,
        fields: [
            { name: 'User', value: user.username || user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), inline: true },
            { name: 'New Plan', value: plan.toUpperCase(), inline: true }
        ],
        footer: 'Subscription Upgrade'
    });
}
async function notifySupportRequest(data) {
    await sendDiscordWebhook({
        title: 'New Support Request',
        description: data.subject,
        color: 0x3b82f6,
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
// GET /api/discord/invite - Get Discord invite link
router.get('/invite', (_req, res) => {
    res.json({
        success: true,
        inviteUrl: DISCORD_CONFIG.INVITE_URL
    });
});
// GET /api/discord/status - Connection status and config check
router.get('/status', auth_1.optionalAuth, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    let discordConnected = false;
    let discordUsername = null;
    if (userId) {
        try {
            const user = await database_1.default.user.findUnique({
                where: { id: userId },
                select: { discordId: true, discordUsername: true }
            });
            discordConnected = !!user?.discordId;
            discordUsername = user?.discordUsername || null;
        }
        catch {
            // Ignore - user just not found
        }
    }
    res.json({
        success: true,
        inviteUrl: DISCORD_CONFIG.INVITE_URL,
        configured: !!DISCORD_CONFIG.WEBHOOK_URL,
        oauthConfigured: !!(DISCORD_CONFIG.CLIENT_ID && DISCORD_CONFIG.CLIENT_SECRET),
        connected: discordConnected,
        discordUsername
    });
});
// GET /api/discord/connect - Start OAuth2 flow (requires auth)
router.get('/connect', auth_1.authenticate, (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Please sign in first' });
    }
    if (!DISCORD_CONFIG.CLIENT_ID || !DISCORD_CONFIG.CLIENT_SECRET) {
        // OAuth not configured - redirect to invite link instead
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
// GET /api/discord/callback - OAuth2 callback (saves to database)
router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    if (!code || !state) {
        return res.redirect('/dashboard?discord=error&reason=missing_params');
    }
    try {
        const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());
        if (!userId) {
            return res.redirect('/dashboard?discord=error&reason=invalid_state');
        }
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
            console.error('Discord token exchange failed:', tokens);
            return res.redirect('/dashboard?discord=error&reason=token_failed');
        }
        // Get Discord user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const discordUser = await userResponse.json();
        if (!discordUser.id) {
            console.error('Discord user fetch failed:', discordUser);
            return res.redirect('/dashboard?discord=error&reason=user_fetch_failed');
        }
        // Save Discord connection to database
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                discordId: discordUser.id,
                discordUsername: `${discordUser.username}${discordUser.discriminator && discordUser.discriminator !== '0' ? '#' + discordUser.discriminator : ''}`
            }
        });
        // Try to add user to guild (if bot token and guild ID configured)
        if (DISCORD_CONFIG.BOT_TOKEN && DISCORD_CONFIG.GUILD_ID) {
            try {
                await fetch(`https://discord.com/api/guilds/${DISCORD_CONFIG.GUILD_ID}/members/${discordUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bot ${DISCORD_CONFIG.BOT_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        access_token: tokens.access_token
                    })
                });
            }
            catch (guildError) {
                console.error('Failed to add user to guild:', guildError);
                // Non-fatal - continue even if guild join fails
            }
        }
        // Notify Discord of successful link
        await sendDiscordWebhook({
            title: 'Account Linked!',
            description: 'A SmartPromptIQ user connected their Discord account',
            color: 0x8b5cf6,
            fields: [
                { name: 'Discord', value: discordUser.username, inline: true },
                { name: 'Discord ID', value: discordUser.id, inline: true }
            ]
        });
        res.redirect('/dashboard?discord=connected');
    }
    catch (error) {
        console.error('Discord callback error:', error);
        res.redirect('/dashboard?discord=error&reason=server_error');
    }
});
// GET /api/discord/disconnect - Remove Discord connection (requires auth)
router.post('/disconnect', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    try {
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                discordId: null,
                discordUsername: null
            }
        });
        res.json({ success: true, message: 'Discord account disconnected' });
    }
    catch (error) {
        console.error('Discord disconnect error:', error);
        res.status(500).json({ success: false, error: 'Failed to disconnect Discord' });
    }
});
// POST /api/discord/webhook/test - Test webhook delivery (requires auth)
router.post('/webhook/test', auth_1.authenticate, async (_req, res) => {
    const success = await sendDiscordWebhook({
        title: 'Test Notification',
        description: 'This is a test notification from SmartPromptIQ',
        color: 0x8b5cf6,
        fields: [
            { name: 'Status', value: 'Webhook is working!', inline: true }
        ]
    });
    res.json({ success, message: success ? 'Test notification sent!' : 'Webhook not configured or failed' });
});
exports.default = router;
