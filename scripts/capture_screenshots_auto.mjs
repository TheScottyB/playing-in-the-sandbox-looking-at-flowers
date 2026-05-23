import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const DEVICE_TYPES = {
  'iphone_pro_max': {
    name: 'iPhone Pro Max (6.7")',
    simulator: 'iPhone 16 Pro Max',
    filePrefix: 'iphone67',
    scales: [
      { prefix: 'iphone65', w: 1242, h: 2688 },
      { prefix: 'iphone61', w: 1179, h: 2556 }
    ]
  },
  'iphone_plus': {
    name: 'iPhone Plus (5.5")',
    simulator: 'iPhone SE (3rd generation)',
    filePrefix: 'iphone55',
    scales: []
  },
  'ipad_pro': {
    name: 'iPad Pro (12.9")',
    simulator: 'iPad Pro 13-inch (M4)',
    filePrefix: 'ipad129',
    scales: [
      { prefix: 'ipad11', w: 1668, h: 2388 },
      { prefix: 'ipad105', w: 1668, h: 2224 },
      { prefix: 'ipad97', w: 1536, h: 2048 }
    ]
  }
};

const SCREENSHOT_SCENES = ['', '_back', '_yesterday', '_search'];

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return null;
  }
}

function createDirectoryStructure() {
  const baseDir = path.join(process.cwd(), 'app_store_assets/screenshots');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
}

function startSimulatorAndConfigure(deviceInfo) {
  const name = deviceInfo.simulator;
  try {
    console.log(`\nBooting simulator: "${name}"...`);
    execSync(`xcrun simctl boot "${name}" || true`, { stdio: 'ignore' });
    execSync(`open -a Simulator`, { stdio: 'ignore' });
    execSync('sleep 5');

    console.log(`Standardizing simulator status bar to 9:41 AM...`);
    execSync(
      `xcrun simctl status_bar booted override ` +
      `--time "9:41" ` +
      `--batteryState "charged" ` +
      `--batteryLevel "100" ` +
      `--cellularMode "active" ` +
      `--cellularBars "4" ` +
      `--wifiMode "searching" ` +
      `--wifiBars "3" || true`,
      { stdio: 'ignore' }
    );
    
    console.log(`Installing Expo Go (host.exp.Exponent) on booted simulator...`);
    execSync(
      `xcrun simctl install booted ~/.expo/ios-simulator-app-cache/Expo-Go-56.0.2.tar.app || true`,
      { stdio: 'ignore' }
    );

    console.log(`Setting simulator location to Cupertino, CA...`);
    execSync(
      `xcrun simctl location booted set 37.33182 -122.03118 || true`,
      { stdio: 'ignore' }
    );
    
    return true;
  } catch (error) {
    console.error(`Error starting simulator for ${name}: ${error.message}`);
    return false;
  }
}

function resizeImage(sourcePath, destPath, targetW, targetH) {
  const wStr = runCommand(`sips -g pixelWidth "${sourcePath}" | awk '/pixelWidth/ {print $2}'`);
  const hStr = runCommand(`sips -g pixelHeight "${sourcePath}" | awk '/pixelHeight/ {print $2}'`);
  const isLandscape = wStr && hStr && parseInt(wStr, 10) > parseInt(hStr, 10);
  
  const w = isLandscape ? targetH : targetW;
  const h = isLandscape ? targetW : targetH;
  
  execSync(`sips -z ${h} ${w} "${sourcePath}" --out "${destPath}"`, { stdio: 'ignore' });
}

function postProcessScreenshot(filePath) {
  if (!fs.existsSync(filePath)) return;

  // 1. Remove alpha channel
  const hasAlpha = runCommand(`sips -g hasAlpha "${filePath}" | awk '/hasAlpha/ {print $2}'`) === 'yes';
  if (hasAlpha) {
    console.log(`     Removing alpha channel from ${path.basename(filePath)}...`);
    execSync(`sips -s format png "${filePath}" --setProperty formatOptions default --out "${filePath}"`, { stdio: 'ignore' });
  }
}

async function main() {
  console.log('=== Starting Automated Screen Capture & Scaler ===');
  
  const baseDir = createDirectoryStructure();
  const devices = Object.keys(DEVICE_TYPES);
  
  for (const deviceKey of devices) {
    const deviceInfo = DEVICE_TYPES[deviceKey];
    console.log(`\n==================================================`);
    console.log(`RUNNING DEVICE: ${deviceInfo.name}`);
    console.log(`==================================================`);
    
    const booted = startSimulatorAndConfigure(deviceInfo);
    if (!booted) {
      console.log(`Skipping device ${deviceInfo.name} due to boot error.`);
      continue;
    }
    
    console.log(`Running Maestro capture flow...`);
    try {
      execSync(`maestro test -e PREFIX=${deviceInfo.filePrefix} .maestro/capture_flow.yml`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Maestro run failed for ${deviceInfo.name}: ${e.message}`);
      // Continue anyway, try to process what we captured
    }
    
    console.log(`Post-processing screenshots for ${deviceInfo.name}...`);
    for (const suffix of SCREENSHOT_SCENES) {
      const sourcePath = path.join(baseDir, `${deviceInfo.filePrefix}${suffix}.png`);
      if (!fs.existsSync(sourcePath)) {
        console.warn(`  ⚠️ Missing screenshot: ${path.basename(sourcePath)}`);
        continue;
      }
      
      // Clean up base image
      postProcessScreenshot(sourcePath);
      
      // Generate and clean up scaled copies
      for (const scale of deviceInfo.scales) {
        const destPath = path.join(baseDir, `${scale.prefix}${suffix}.png`);
        console.log(`  Scaling copy to ${scale.prefix}${suffix}.png (${scale.w}x${scale.h})...`);
        resizeImage(sourcePath, destPath, scale.w, scale.h);
        postProcessScreenshot(destPath);
      }
    }
    
    // Shutdown the simulator to keep system resources clean
    console.log(`Shutting down simulator for ${deviceInfo.name}...`);
    runCommand(`xcrun simctl shutdown booted`);
  }
  
  console.log('\n==================================================');
  console.log('🎉 Automated capture, scaling, and formatting complete!');
  console.log(`Saved under: ${baseDir}`);
  console.log('You can now run quality control verification:');
  console.log('  pnpm run qc-screenshots');
  console.log('==================================================\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
