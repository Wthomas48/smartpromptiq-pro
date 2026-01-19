# SmartPromptIQ Chrome Extension

Generate powerful AI prompts anywhere you work. Access your prompt library, templates, and AI-powered generation directly in your browser.

## Features

### Core Features
- **Prompt Generation**: Generate context-aware AI prompts based on category and input
- **Quick Actions**: Pre-built actions for common tasks (Improve, Explain, Summarize, Code Help)
- **Multi-Platform Support**: Works on ChatGPT, Claude, Gemini, Copilot, Poe, Perplexity, and more
- **Context Capture**: Automatically capture page context or selected text
- **One-Click Insert**: Insert generated prompts directly into AI chat inputs

### Authentication & Sync
- **Seamless Auth**: Automatically syncs authentication from the SmartPromptIQ website
- **Token Management**: Tracks your token balance and usage
- **Prompt Library Sync**: Access your saved prompts from anywhere

### User Interface
- **Popup Interface**: Quick access to prompt generation from the toolbar
- **Floating Button**: Persistent access button on supported AI platforms
- **Quick Panel**: In-page panel for rapid prompt creation
- **Settings Page**: Comprehensive options for customization
- **Dark Mode**: Beautiful dark theme throughout

### Advanced Features
- **Offline Mode**: Demo prompts available when offline
- **Recent Prompts**: Quick access to recently generated prompts
- **Keyboard Shortcuts**: Ctrl+Shift+P (popup), Ctrl+Shift+G (quick generate)
- **Context Menu**: Right-click integration for selected text
- **Badge Notifications**: Token count displayed on the extension icon

## Installation

### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Development)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. The extension icon should appear in your toolbar

## Usage

### Getting Started
1. Click the SmartPromptIQ icon in your Chrome toolbar
2. Sign in to your SmartPromptIQ account (or create one at smartpromptiq.com)
3. Select a category and describe what you need
4. Click "Generate AI Prompt"
5. Copy, insert, or save your generated prompt

### Quick Actions (On AI Chat Pages)
1. Navigate to a supported AI chat (ChatGPT, Claude, etc.)
2. Click the floating 🧠 button or press Ctrl+Shift+G
3. Select a quick action or enter a custom prompt
4. The prompt will be automatically inserted into the chat

### Context Menu
1. Select text on any webpage
2. Right-click and choose from SmartPromptIQ options:
   - Generate Prompt
   - Improve Selected Text
   - Explain Selected Text
   - Summarize Selected Text

### Keyboard Shortcuts
- `Ctrl+Shift+P` / `Cmd+Shift+P`: Open popup
- `Ctrl+Shift+G` / `Cmd+Shift+G`: Quick generate panel
- `Escape`: Close quick panel

## Supported Platforms

The extension works on these AI chat platforms:
- ChatGPT (chat.openai.com, chatgpt.com)
- Claude AI (claude.ai)
- Google Gemini (gemini.google.com)
- Microsoft Copilot (copilot.microsoft.com, bing.com/chat)
- Poe (poe.com)
- Perplexity AI (perplexity.ai)
- You.com

## Settings

Access settings via:
- Popup → Settings icon (⚙️)
- Right-click extension icon → Options
- Chrome → Extensions → SmartPromptIQ → Options

### Available Settings
- **Dark Mode**: Toggle dark theme
- **Show Notifications**: Enable/disable toast notifications
- **Default Category**: Set your preferred prompt category
- **Show Floating Button**: Toggle the floating button on AI pages
- **Auto-Insert Prompts**: Automatically insert generated prompts
- **Keyboard Shortcuts**: Enable/disable keyboard shortcuts

### Developer Options
- **Environment**: Switch between production and development APIs
- **Debug Mode**: Enable verbose logging

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── background/
│   └── background.js      # Service worker (API, auth, context menus)
├── popup/
│   ├── popup.html         # Popup interface
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── content/
│   ├── content.js         # AI platform integration
│   ├── content.css        # Content styles
│   └── auth-listener.js   # Auth sync from website
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings logic
├── utils/
│   ├── config.js          # Configuration constants
│   ├── api.js             # API service layer
│   └── storage.js         # Storage utilities
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Permissions

The extension requires these permissions:
- **storage**: Store settings, tokens, and cached data
- **activeTab**: Access the current tab for context capture
- **tabs**: Manage browser tabs
- **contextMenus**: Add right-click menu options
- **clipboardWrite**: Copy prompts to clipboard
- **alarms**: Schedule background tasks
- **notifications**: Show desktop notifications
- **scripting**: Inject content scripts

## Privacy

- Authentication tokens are stored securely in Chrome's local storage
- No data is shared with third parties
- All API communication is encrypted (HTTPS)
- See our full privacy policy at smartpromptiq.com/privacy

## Troubleshooting

### Extension not working on AI chat pages
1. Refresh the page
2. Check if the extension is enabled
3. Verify you're on a supported platform
4. Try reloading the extension

### Can't sign in
1. Visit smartpromptiq.com and sign in there
2. The extension will automatically sync your session
3. Check your internet connection

### Prompts not inserting
1. Make sure the chat input is visible
2. Try clicking on the input field first
3. Use the "Copy" button and paste manually

### Badge not updating
1. Sign out and sign back in
2. Reload the extension
3. Check your token balance on the dashboard

## Development

### Building the Extension
```bash
# No build step required - pure JavaScript
# Just load the chrome-extension folder as unpacked extension
```

### Testing
1. Load as unpacked extension in Developer mode
2. Make changes to files
3. Click the refresh icon on the extensions page
4. Test your changes

### API Configuration
Edit `utils/config.js` or use the Developer Options in settings to switch between:
- **Production**: smartpromptiq.com
- **Development**: localhost:5001

## Support

- **Website**: https://smartpromptiq.com
- **Email**: support@smartpromptiq.com
- **Issues**: Report bugs on our GitHub repository

## License

MIT License - see LICENSE file for details

---

**SmartPromptIQ** - Generate powerful AI prompts anywhere you work.
