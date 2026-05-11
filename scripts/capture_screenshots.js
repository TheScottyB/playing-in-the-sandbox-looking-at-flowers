const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to automate the screenshot capture process for Sandbox Staring at Flowers
 * 
 * This script will:
 * 1. Create necessary directory structure if it doesn't exist
 * 2. Start the appropriate simulator for each device type
 * 3. Provide instructions for capturing required screenshots
 */

const DEVICE_TYPES = {
  'iphone_pro_max': {
    name: 'iPhone Pro Max',
    simulator: 'iPhone 14 Pro Max',
    resolution: '1284 x 2778 px',
  },
  'iphone_plus': {
    name: 'iPhone Plus',
    simulator: 'iPhone 8 Plus',
    resolution: '1242 x 2208 px',
  },
  'ipad_pro': {
    name: 'iPad Pro',
    simulator: 'iPad Pro (12.9-inch) (6th generation)',
    resolution: '2048 x 2732 px',
  }
};

const SCREENSHOT_SCENES = [
  'home_screen', 
  'interactive_feature', 
  'cards_collapsed', 
  'cards_expanded', 
  'theme_adaptation'
];

const THEMES = ['light', 'dark'];

// Create directory structure if it doesn't exist
function createDirectoryStructure() {
  console.log('Setting up directory structure for screenshots...');

  const baseDir = path.join(process.cwd(), 'screenshots');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  // Create device directories
  Object.keys(DEVICE_TYPES).forEach(deviceType => {
    const deviceDir = path.join(baseDir, deviceType);
    if (!fs.existsSync(deviceDir)) {
      fs.mkdirSync(deviceDir);
    }

    // Create theme directories
    THEMES.forEach(theme => {
      const themeDir = path.join(deviceDir, theme);
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir);
      }

      // Create scene directories for organization
      ['home', 'explore', 'cards', 'flowers'].forEach(sceneCat => {
        const sceneDir = path.join(themeDir, sceneCat);
        if (!fs.existsSync(sceneDir)) {
          fs.mkdirSync(sceneDir);
        }
      });
    });
  });

  console.log('Directory structure created successfully!');
}

// List available simulators
function listAvailableSimulators() {
  try {
    const output = execSync('xcrun simctl list devices available', { encoding: 'utf-8' });
    console.log('\nAvailable Simulators:');
    console.log(output);
  } catch (error) {
    console.error('Error listing simulators:', error.message);
  }
}

// Start simulator for a specific device
function startSimulator(deviceType) {
  const simulatorName = DEVICE_TYPES[deviceType].simulator;
  
  try {
    console.log(`Starting simulator for ${simulatorName}...`);
    execSync(`xcrun simctl boot "${simulatorName}" || true`, { stdio: 'inherit' });
    execSync(`open -a Simulator`, { stdio: 'inherit' });
    
    console.log(`\nSimulator started for ${simulatorName}`);
    return true;
  } catch (error) {
    console.error(`Error starting simulator for ${simulatorName}:`, error.message);
    console.log('\nAvailable simulators:');
    listAvailableSimulators();
    return false;
  }
}

// Guide user through screenshot capture process
function guideCaptureProcess(deviceType) {
  const deviceInfo = DEVICE_TYPES[deviceType];
  
  console.log('\n--------------------------------------------------');
  console.log(`SCREENSHOT CAPTURE GUIDE FOR ${deviceInfo.name.toUpperCase()}`);
  console.log('--------------------------------------------------');
  console.log(`Resolution: ${deviceInfo.resolution}`);
  console.log('\nRequired screenshots:');
  
  SCREENSHOT_SCENES.forEach((scene, index) => {
    console.log(`\n${index + 1}. ${scene.replace(/_/g, ' ').toUpperCase()}`);
    switch(scene) {
      case 'home_screen':
        console.log('   - Navigate to the Home tab');
        console.log('   - Ensure all three tabs are visible');
        console.log('   - Show the parallax scrolling effect');
        break;
      case 'interactive_feature':
        console.log('   - Navigate to the Explore tab');
        console.log('   - Show user interaction with features');
        break;
      case 'cards_collapsed':
        console.log('   - Navigate to the Cards tab');
        console.log('   - Show multiple cards in collapsed state');
        break;
      case 'cards_expanded':
        console.log('   - In the Cards tab, tap a card to expand it');
        console.log('   - Capture the card in expanded state');
        break;
      case 'theme_adaptation':
        console.log('   - Show the app with theme adaptation');
        console.log('   - Showcase native iOS styling elements');
        break;
    }
    console.log(`   - To capture: Press Cmd + S in Simulator`);
    console.log(`   - Save to: screenshots/${deviceType}/{theme}/{appropriate-folder}/`);
  });
  
  console.log('\n--------------------------------------------------');
  console.log('After capturing all screenshots:');
  console.log('1. Ensure they are properly named and organized');
  console.log('2. Edit as needed to highlight animations/interactions');
  console.log('3. Prepare them for App Store submission');
  console.log('--------------------------------------------------\n');
}

// Main function
function main() {
  console.log('Welcome to the Sandbox Staring at Flowers Screenshot Capture Tool!\n');
  
  // Create directory structure
  createDirectoryStructure();
  
  // Process each device type
  Object.keys(DEVICE_TYPES).forEach(deviceType => {
    console.log(`\n=== Processing ${DEVICE_TYPES[deviceType].name} ===`);
    
    // Start simulator
    const simulatorStarted = startSimulator(deviceType);
    
    if (simulatorStarted) {
      // Guide user through capture process
      guideCaptureProcess(deviceType);
      
      console.log(`\nComplete the screenshot capture for ${DEVICE_TYPES[deviceType].name} before continuing to the next device.`);
      console.log('Press Ctrl+C to exit this script when you are done with all devices.\n');
    }
  });
}

// Run the script
main(); 