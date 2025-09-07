# Proxy Switcher Chrome Extension

A robust Chrome extension for easily switching between direct internet connection and custom proxy configurations, perfect for development and testing with tools like Burp Suite.

## Features

✅ **Manifest V3 Compliant** - Latest Chrome extension standards  
✅ **Multiple Proxy Profiles** - Pre-configured for Burp Suite, Tor, and custom proxies  
✅ **Protocol Support** - HTTP, HTTPS, and SOCKS5 proxies  
✅ **Persistent Settings** - Configurations saved across browser sessions  
✅ **Input Validation** - Real-time validation with error messages  
✅ **Status Indicator** - Clear ON/OFF status with badge  
✅ **Modern UI** - Clean, responsive popup interface  

## Quick Setup

### Pre-configured Profiles:
- **Burp Suite**: 127.0.0.1:8080 (HTTP)
- **Tor Browser**: 127.0.0.1:9050 (SOCKS5)  
- **Custom**: Configure as needed

## Installation

1. **Download** or clone this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

## Usage

### Basic Operation:
1. **Click the extension icon** to open the popup
2. **Select a profile** from the dropdown (Burp Suite, Tor, or Custom)
3. **Configure settings** (host, port, protocol) if needed
4. **Click "Save Profile"** to store your settings
5. **Click "Enable Proxy"** to start using the proxy
6. **Click "Disable Proxy"** to return to direct connection

### Status Indicators:
- **Green dot + "ON"**: Proxy is active
- **Red dot + "OFF"**: Direct connection
- **Badge on icon**: Shows ON/OFF status

## Configuration Examples

### Burp Suite Proxy:
```
Host: 127.0.0.1
Port: 8080
Protocol: HTTP
```

### SOCKS5 Proxy:
```
Host: 127.0.0.1
Port: 1080
Protocol: SOCKS5
```

### Corporate Proxy:
```
Host: proxy.company.com
Port: 8080
Protocol: HTTP
```

## File Structure

```
burp-proxy-switcher/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for proxy management
├── popup.html            # Popup interface HTML
├── popup.js              # Popup interface JavaScript
├── popup.css             # Popup interface styles
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
|   ├── icon64.png
|   ├── icon128.png
└── README.md             # This file
```

## Key Features Explained

### Proxy Profiles
- **Multiple saved configurations** for different use cases
- **Quick switching** between profiles via dropdown
- **Persistent storage** using Chrome's sync storage API

### Input Validation
- **Real-time validation** of host and port fields
- **Error messages** for invalid configurations
- **Port range validation** (1-65535)

### Background Service Worker
- **Automatic proxy application** when toggled
- **Error handling** with fallback to direct connection
- **Status persistence** across browser restarts

### User Interface
- **Modern, responsive design** with clean styling
- **Status indicators** for immediate feedback
- **Keyboard shortcuts** (Enter to toggle)
- **Success/error notifications**

## Development

### Adding New Proxy Profiles:
1. Edit the `DEFAULT_PROFILES` object in `background.js`
2. Add new options to the select element in `popup.html`
3. The extension will automatically handle the new profiles

### Customizing UI:
- Modify `popup.css` for styling changes
- Update `popup.html` for layout changes
- Extend `popup.js` for new functionality

## Troubleshooting

### Common Issues:

**Proxy not working?**
- Check if the proxy server is running
- Verify host and port settings
- Ensure protocol matches proxy server type

**Extension not loading?**
- Check Developer mode is enabled
- Look for errors in Chrome Developer Tools
- Verify all files are in correct locations

**Settings not saving?**
- Check Chrome storage permissions
- Try reloading the extension
- Clear browser data if necessary

### Debug Information:
- Open Chrome DevTools → Extensions → Proxy Switcher
- Check Console for error messages
- Verify proxy settings in Chrome's proxy settings

## Permissions Explained

- **proxy**: Required to modify browser proxy settings
- **storage**: Required to save user configurations
- **activeTab**: Required for extension functionality
- **host_permissions**: Required to apply proxy to all websites

## Browser Compatibility

- **Chrome 88+** (Manifest V3 support)
- **Chromium-based browsers** with Manifest V3 support
- **Not compatible** with Firefox (uses different extension API)

## Security Notes

- Proxy credentials are stored locally in Chrome's sync storage
- No data is transmitted to external servers
- Extension only modifies local proxy settings
- Always verify proxy server security before use

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this extension.

## License

This project is open source and available under the MIT License.
