/**
 * Background Service Worker for Proxy Switcher Extension
 * Handles proxy configuration changes and maintains proxy state
 */

// Default proxy profiles
const DEFAULT_PROFILES = {
  'burp': {
    name: 'Burp Suite',
    host: '127.0.0.1',
    port: '8080',
    protocol: 'http'
  },
  'tor': {
    name: 'Tor Browser',
    host: '127.0.0.1',
    port: '9050',
    protocol: 'socks5'
  },
  'custom': {
    name: 'Custom Proxy',
    host: '',
    port: '',
    protocol: 'http'
  }
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Proxy Switcher Extension installed');
  
  // Set default values if not already set
  const result = await chrome.storage.sync.get(['proxyEnabled', 'profiles', 'activeProfile']);
  
  if (!result.profiles) {
    await chrome.storage.sync.set({ profiles: DEFAULT_PROFILES });
  }
  
  if (!result.activeProfile) {
    await chrome.storage.sync.set({ activeProfile: 'burp' });
  }
  
  if (result.proxyEnabled === undefined) {
    await chrome.storage.sync.set({ proxyEnabled: false });
  }
  
  // Update badge to show current status
  updateBadge(result.proxyEnabled || false);
});

// Listen for storage changes (when popup updates settings)
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync') {
    console.log('Storage changed:', changes);
    
    // If proxy enabled state changed, apply/remove proxy
    if (changes.proxyEnabled) {
      const enabled = changes.proxyEnabled.newValue;
      if (enabled) {
        await applyProxySettings();
      } else {
        await clearProxySettings();
      }
      updateBadge(enabled);
    }
    
    // If active profile or profile settings changed while proxy is enabled
    if ((changes.activeProfile || changes.profiles) && await isProxyEnabled()) {
      await applyProxySettings();
    }
  }
});

/**
 * Apply proxy settings based on current active profile
 */
async function applyProxySettings() {
  try {
    const result = await chrome.storage.sync.get(['profiles', 'activeProfile']);
    const profiles = result.profiles || DEFAULT_PROFILES;
    const activeProfileKey = result.activeProfile || 'burp';
    const activeProfile = profiles[activeProfileKey];
    
    if (!activeProfile || !activeProfile.host || !activeProfile.port) {
      console.error('Invalid proxy configuration');
      throw new Error('Invalid proxy configuration. Please check host and port settings.');
    }
    
    // Validate port number
    const port = parseInt(activeProfile.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('Port must be a number between 1 and 65535');
    }
    
    // Configure proxy based on protocol
    let proxyConfig;
    
    if (activeProfile.protocol === 'socks5') {
      proxyConfig = {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: 'socks5',
            host: activeProfile.host,
            port: port
          }
        }
      };
    } else {
      // HTTP/HTTPS proxy
      proxyConfig = {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: 'http',
            host: activeProfile.host,
            port: port
          }
        }
      };
    }
    
    // Apply proxy configuration
    await chrome.proxy.settings.set({
      value: proxyConfig,
      scope: 'regular'
    });
    
    console.log('Proxy applied:', activeProfile);
    
    // Show notification
    await showNotification('Proxy Enabled', `Connected to ${activeProfile.name} (${activeProfile.host}:${activeProfile.port})`);
    
  } catch (error) {
    console.error('Failed to apply proxy settings:', error);
    
    // Disable proxy on error
    await chrome.storage.sync.set({ proxyEnabled: false });
    await clearProxySettings();
    
    // Show error notification
    await showNotification('Proxy Error', error.message || 'Failed to apply proxy settings');
  }
}

/**
 * Clear proxy settings (direct connection)
 */
async function clearProxySettings() {
  try {
    await chrome.proxy.settings.set({
      value: { mode: 'direct' },
      scope: 'regular'
    });
    
    console.log('Proxy cleared - using direct connection');
    await showNotification('Proxy Disabled', 'Using direct internet connection');
    
  } catch (error) {
    console.error('Failed to clear proxy settings:', error);
  }
}

/**
 * Update extension badge to show proxy status
 */
function updateBadge(enabled) {
  const badgeText = enabled ? 'ON' : 'OFF';
  const badgeColor = enabled ? '#4CAF50' : '#F44336';
  
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

/**
 * Check if proxy is currently enabled
 */
async function isProxyEnabled() {
  const result = await chrome.storage.sync.get(['proxyEnabled']);
  return result.proxyEnabled || false;
}

/**
 * Show notification to user
 */
async function showNotification(title, message) {
  try {
    // For Manifest V3, we'll use the action badge instead of notifications
    // since notifications require additional permissions
    console.log(`${title}: ${message}`);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

/**
 * Handle extension icon click (fallback)
 */
chrome.action.onClicked.addListener(() => {
  // This will be handled by the popup, but adding as fallback
  console.log('Extension icon clicked');
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension started');
  const enabled = await isProxyEnabled();
  
  if (enabled) {
    await applyProxySettings();
  }
  
  updateBadge(enabled);
});

console.log('Background service worker loaded');
