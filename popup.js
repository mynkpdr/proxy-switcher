/**
 * Popup JavaScript for Proxy Switcher Extension
 * Handles UI interactions and communicates with background service worker
 */

// DOM Elements
const profileSelect = document.getElementById('profileSelect');
const proxyHost = document.getElementById('proxyHost');
const proxyPort = document.getElementById('proxyPort');
const proxyProtocol = document.getElementById('proxyProtocol');
const saveButton = document.getElementById('saveButton');
const toggleButton = document.getElementById('toggleButton');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// State variables
let currentProfiles = {};
let isProxyEnabled = false;
let activeProfile = 'burp';

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  await loadSettings();
  setupEventListeners();
});

/**
 * Load settings from Chrome storage and update UI
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['profiles', 'proxyEnabled', 'activeProfile']);
    
    // Load profiles
    currentProfiles = result.profiles || getDefaultProfiles();
    
    // Load proxy state
    isProxyEnabled = result.proxyEnabled || false;
    activeProfile = result.activeProfile || 'burp';
    
    // Update UI
    updateProfileSelect();
    loadActiveProfile();
    updateStatus(isProxyEnabled);
    
    console.log('Settings loaded:', { currentProfiles, isProxyEnabled, activeProfile });
    
  } catch (error) {
    console.error('Failed to load settings:', error);
    showError('Failed to load extension settings');
  }
}

/**
 * Get default proxy profiles
 */
function getDefaultProfiles() {
  return {
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
}

/**
 * Update profile selector dropdown
 */
function updateProfileSelect() {
  profileSelect.innerHTML = '';
  
  Object.keys(currentProfiles).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = currentProfiles[key].name;
    profileSelect.appendChild(option);
  });
  
  profileSelect.value = activeProfile;
}

/**
 * Load active profile data into form fields
 */
function loadActiveProfile() {
  const profile = currentProfiles[activeProfile];
  if (profile) {
    proxyHost.value = profile.host || '';
    proxyPort.value = profile.port || '';
    proxyProtocol.value = profile.protocol || 'http';
  }
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
  // Profile selection change
  profileSelect.addEventListener('change', (e) => {
    activeProfile = e.target.value;
    loadActiveProfile();
    saveActiveProfile();
  });
  
  // Input field changes for real-time validation
  proxyHost.addEventListener('input', validateInputs);
  proxyPort.addEventListener('input', validateInputs);
  proxyProtocol.addEventListener('change', validateInputs);
  
  // Save button click
  saveButton.addEventListener('click', saveProfile);
  
  // Toggle button click
  toggleButton.addEventListener('click', toggleProxy);
  
  // Enter key in input fields
  [proxyHost, proxyPort].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (validateCurrentProfile()) {
          toggleProxy();
        }
      }
    });
  });
}

/**
 * Validate input fields
 */
function validateInputs() {
  const host = proxyHost.value.trim();
  const port = proxyPort.value.trim();
  
  // Clear previous validation styles
  proxyHost.classList.remove('invalid');
  proxyPort.classList.remove('invalid');
  
  let isValid = true;
  
  // Validate host
  if (!host) {
    proxyHost.classList.add('invalid');
    isValid = false;
  }
  
  // Validate port
  const portNum = parseInt(port);
  if (!port || isNaN(portNum) || portNum < 1 || portNum > 65535) {
    proxyPort.classList.add('invalid');
    isValid = false;
  }
  
  // Update button states
  saveButton.disabled = !isValid;
  
  return isValid;
}

/**
 * Validate current profile configuration
 */
function validateCurrentProfile() {
  const host = proxyHost.value.trim();
  const port = proxyPort.value.trim();
  
  if (!host) {
    showError('Host is required');
    return false;
  }
  
  const portNum = parseInt(port);
  if (!port || isNaN(portNum) || portNum < 1 || portNum > 65535) {
    showError('Port must be a number between 1 and 65535');
    return false;
  }
  
  return true;
}

/**
 * Save current profile
 */
async function saveProfile() {
  if (!validateCurrentProfile()) {
    return;
  }
  
  try {
    // Update current profile
    currentProfiles[activeProfile] = {
      ...currentProfiles[activeProfile],
      host: proxyHost.value.trim(),
      port: proxyPort.value.trim(),
      protocol: proxyProtocol.value
    };
    
    // Save to storage
    await chrome.storage.sync.set({ profiles: currentProfiles });
    
    showSuccess('Profile saved successfully');
    console.log('Profile saved:', currentProfiles[activeProfile]);
    
  } catch (error) {
    console.error('Failed to save profile:', error);
    showError('Failed to save profile');
  }
}

/**
 * Save active profile selection
 */
async function saveActiveProfile() {
  try {
    await chrome.storage.sync.set({ activeProfile: activeProfile });
    console.log('Active profile saved:', activeProfile);
  } catch (error) {
    console.error('Failed to save active profile:', error);
  }
}

/**
 * Toggle proxy on/off
 */
async function toggleProxy() {
  if (!isProxyEnabled && !validateCurrentProfile()) {
    return;
  }
  
  try {
    // Show loading state
    toggleButton.disabled = true;
    toggleButton.textContent = isProxyEnabled ? 'Disabling...' : 'Enabling...';
    
    // Save current profile before enabling
    if (!isProxyEnabled) {
      await saveProfile();
    }
    
    // Toggle proxy state
    const newState = !isProxyEnabled;
    await chrome.storage.sync.set({ proxyEnabled: newState });
    
    // Update local state
    isProxyEnabled = newState;
    updateStatus(newState);
    
    const message = newState ? 'Proxy enabled successfully' : 'Proxy disabled successfully';
    showSuccess(message);
    
    console.log('Proxy toggled:', newState);
    
  } catch (error) {
    console.error('Failed to toggle proxy:', error);
    showError('Failed to toggle proxy: ' + error.message);
  } finally {
    // Reset button state
    toggleButton.disabled = false;
    updateToggleButton();
  }
}

/**
 * Update status indicator and toggle button
 */
function updateStatus(enabled) {
  isProxyEnabled = enabled;
  
  // Update status indicator
  if (enabled) {
    statusDot.classList.add('active');
    statusText.textContent = 'ON';
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = 'OFF';
  }
  
  updateToggleButton();
}

/**
 * Update toggle button text and style
 */
function updateToggleButton() {
  if (isProxyEnabled) {
    toggleButton.textContent = 'Disable Proxy';
    toggleButton.classList.add('enabled');
  } else {
    toggleButton.textContent = 'Enable Proxy';
    toggleButton.classList.remove('enabled');
  }
}

/**
 * Show error message
 */
function showError(message) {
  hideMessages();
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
  hideMessages();
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
}

/**
 * Hide all messages
 */
function hideMessages() {
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
}

// Listen for storage changes (in case background script updates state)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.proxyEnabled) {
      updateStatus(changes.proxyEnabled.newValue);
    }
    
    if (changes.profiles) {
      currentProfiles = changes.profiles.newValue;
      updateProfileSelect();
      loadActiveProfile();
    }
    
    if (changes.activeProfile) {
      activeProfile = changes.activeProfile.newValue;
      profileSelect.value = activeProfile;
      loadActiveProfile();
    }
  }
});

console.log('Popup script loaded');
