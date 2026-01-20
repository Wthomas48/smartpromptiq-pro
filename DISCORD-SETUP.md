# SmartPromptIQ Discord Server Setup Guide

## Quick Links
- **Invite URL**: https://discord.com/invite/smartpromptiq
- **Server Name**: SmartPromptIQ Community

---

## Step 1: Create Discord Application (for Bot)

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it: `SmartPromptIQ Bot`
4. Go to **Bot** tab → Click **"Add Bot"**
5. Copy the **Bot Token** (save this for .env)
6. Enable these Privileged Intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### Get OAuth2 Credentials
1. Go to **OAuth2** → **General**
2. Copy **Client ID** and **Client Secret**
3. Add Redirect URL: `https://smartpromptiq.com/api/discord/callback`

---

## Step 2: Create Your Server

1. Open Discord → Click **"+"** → **"Create My Own"**
2. Select **"For a club or community"**
3. Name: **SmartPromptIQ Community**
4. Upload logo as server icon

---

## Step 3: Create Custom Invite Link

1. Server Settings → **Invites**
2. Create Invite → Set to **Never Expire**
3. Click **"Edit invite link"** → type `smartpromptiq`
4. Result: `discord.gg/smartpromptiq`

---

## Step 4: Create Channels

### Copy this structure:

```
📢 ANNOUNCEMENTS
├── #📢-announcements (read-only)
├── #📝-updates-changelog
└── #🔴-status

👋 START HERE
├── #👋-welcome
├── #📜-rules
├── #🎭-introductions
└── #🏷️-get-roles

💬 COMMUNITY
├── #💬-general-chat
├── #🧠-prompt-sharing
├── #🎨-showcase
├── #💡-tips-tricks
└── #🔥-off-topic

❓ SUPPORT
├── #❓-help-questions
├── #🐛-bug-reports
└── #💡-feature-requests

📚 RESOURCES
├── #📚-tutorials
├── #📖-documentation
└── #❓-faq

🎓 ACADEMY
├── #📚-course-discussions
├── #📝-homework-help
└── #🏆-certifications

💎 PREMIUM (Locked to roles)
├── #💜-pro-lounge
├── #👑-business-lounge
└── #🎁-exclusive-content
```

---

## Step 5: Create Roles

Go to **Server Settings** → **Roles** → Create:

| Role | Color | Permissions |
|------|-------|-------------|
| 🔴 Admin | Red (#FF0000) | Administrator |
| 🟠 Moderator | Orange (#FF6B00) | Manage Messages, Kick/Ban |
| 👑 Business Member | Gold (#FFD700) | Access Premium channels |
| 💜 Pro Member | Purple (#8B5CF6) | Access Pro channels |
| ✅ Verified | Green (#22C55E) | Linked SmartPromptIQ account |
| 👤 Member | Gray (#6B7280) | Basic access |

### Role IDs (for .env)
After creating roles, right-click each → **Copy ID** (Developer Mode must be ON)

---

## Step 6: Setup Webhook (for Notifications)

1. Go to `#📢-announcements` channel
2. Click ⚙️ **Edit Channel**
3. Go to **Integrations** → **Webhooks**
4. Create Webhook → Name: `SmartPromptIQ Bot`
5. Copy Webhook URL (save for .env)

---

## Step 7: Add Bot to Server

1. Go to Discord Developer Portal → Your App → **OAuth2** → **URL Generator**
2. Select Scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select Bot Permissions:
   - ✅ Manage Roles
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Add Reactions
   - ✅ Use Slash Commands
4. Copy the generated URL and open it
5. Select your server → Authorize

---

## Step 8: Environment Variables

Add to your `.env` file:

```env
# Discord Integration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_REDIRECT_URI=https://smartpromptiq.com/api/discord/callback

# Role IDs (get from Discord after creating roles)
DISCORD_ROLE_MEMBER=role_id_here
DISCORD_ROLE_PRO=role_id_here
DISCORD_ROLE_BUSINESS=role_id_here
DISCORD_ROLE_VERIFIED=role_id_here
```

---

## Welcome Message Template

Copy this for the `#👋-welcome` channel:

```
═══════════════════════════════════════════
🧠 WELCOME TO SMARTPROMPTIQ COMMUNITY! 🧠
═══════════════════════════════════════════

👋 **Welcome, prompt engineer!**

You've joined the official community for **SmartPromptIQ** — the AI-powered prompt engineering and app creation platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 **QUICK START**

1️⃣ Read the #📜-rules
2️⃣ Introduce yourself in #🎭-introductions
3️⃣ Get your roles in #🏷️-get-roles
4️⃣ Start chatting in #💬-general-chat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 **IMPORTANT LINKS**

🌐 Website: https://smartpromptiq.com
📚 Documentation: https://smartpromptiq.com/documentation
🎓 Academy: https://smartpromptiq.com/academy
💰 Pricing: https://smartpromptiq.com/pricing
📞 Support: https://smartpromptiq.com/support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 **MEMBER BENEFITS**

✨ Share and discover amazing prompts
💬 Get help from the community
🚀 Early access to new features
🎓 Academy course discussions
🏆 Showcase your AI creations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 **PREMIUM PERKS**

Pro and Business members get access to:
• 💜 Exclusive Pro Lounge
• 👑 Business Member channels
• 🎁 Exclusive content and resources
• ⚡ Priority support

Upgrade at: https://smartpromptiq.com/pricing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 **CONNECT YOUR ACCOUNT**

Link your SmartPromptIQ account to get:
• ✅ Verified badge
• 🎭 Role based on your subscription
• 🔓 Access to premium channels

Visit: https://smartpromptiq.com/dashboard → Discord

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We're excited to have you here! 🎉
Let's build amazing things together! 🚀

═══════════════════════════════════════════
```

---

## Rules Template

Copy this for the `#📜-rules` channel:

```
═══════════════════════════════════════════
📜 COMMUNITY RULES
═══════════════════════════════════════════

Please follow these rules to keep our community friendly and productive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**1️⃣ BE RESPECTFUL**
Treat everyone with respect. No harassment, hate speech, or discrimination of any kind.

**2️⃣ NO SPAM**
Don't spam messages, links, or self-promotion. Share relevant content only.

**3️⃣ STAY ON TOPIC**
Use the appropriate channels for discussions. Off-topic chat goes in #🔥-off-topic.

**4️⃣ NO NSFW CONTENT**
Keep all content safe for work. No explicit, violent, or inappropriate material.

**5️⃣ RESPECT PRIVACY**
Don't share personal information about yourself or others. Protect your API keys!

**6️⃣ NO PIRACY**
Don't share or request pirated content, leaked API keys, or copyrighted material.

**7️⃣ HELP EACH OTHER**
We're all learning together. Be patient and helpful with questions.

**8️⃣ USE ENGLISH**
Please use English in public channels so everyone can participate.

**9️⃣ FOLLOW DISCORD TOS**
All Discord Terms of Service and Community Guidelines apply.

**🔟 HAVE FUN!**
This is a community. Enjoy yourself, make friends, and build cool stuff!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **VIOLATIONS**
Breaking rules may result in:
• Warning
• Mute
• Kick
• Ban

Moderators have final say on all decisions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Ask in #❓-help-questions or DM a moderator.

═══════════════════════════════════════════
```

---

## API Endpoints Available

Once configured, these endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /api/discord/invite` | Get Discord invite URL |
| `GET /api/discord/connect` | Start OAuth2 flow (requires auth) |
| `GET /api/discord/callback` | OAuth2 callback handler |
| `GET /api/discord/status` | Check Discord configuration status |
| `POST /api/discord/webhook/test` | Test webhook notification |

---

## Testing

1. Set up all environment variables
2. Restart your server
3. Test webhook: `POST /api/discord/webhook/test`
4. Check if message appears in your Discord channel

---

## Need Help?

- Discord Developer Docs: https://discord.com/developers/docs
- SmartPromptIQ Support: support@smartpromptiq.com
- Phone: 727-304-5812
