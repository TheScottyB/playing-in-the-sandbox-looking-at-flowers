import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Script to automate the screenshot capture process for Specimen Sandbox
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
  'home_card_front', 
  'home_card_back', 
  'search_modal', 
  'detail_view'
];

const THEMES = ['light', 'dark'];

// Create directory structure if it doesn't exist
function createDirectoryStructure() {
  console.log('Setting up directory structure for screenshots...');

  const baseDir = path.join(process.cwd(), 'app_store_assets/screenshots');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

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
      case 'home_card_front':
        console.log('   - Navigate to the Home Screen');
        console.log('   - Capture the daily flower card (front view showing image, title, and region)');
        break;
      case 'home_card_back':
        console.log('   - On the Home Screen, tap the card to flip it');
        console.log('   - Capture the daily flower card back view (showing description, stats, and bloom months)');
        break;
      case 'search_modal':
        console.log('   - Tap the Search button in the home navbar');
        console.log('   - Type a query (e.g. "yellow desert bloom")');
        console.log('   - Capture the search input and listed results list with similarity match percentages');
        break;
      case 'detail_view':
        console.log('   - Tap the expand button on the home flower card or select a search result');
        console.log('   - Capture the full-screen detail view containing the close button');
        break;
    }
    console.log(`   - To capture: Press Cmd + S in Simulator`);
    console.log(`   - Save to: app_store_assets/screenshots/ with correct prefix (e.g. ${deviceType === 'iphone_pro_max' ? 'iphone67.png' : 'device_prefix.png'})`);
  });
  
  console.log('\n--------------------------------------------------');
  console.log('After capturing all screenshots:');
  console.log('1. Ensure they are properly named and organized');
  console.log('2. Run verification tool: pnpm run qc-screenshots');
  console.log('--------------------------------------------------\n');
}

// Main function
function main() {
  console.log('Welcome to the Specimen Sandbox Screenshot Capture Tool!\n');
  
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
