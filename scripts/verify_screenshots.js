const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define expected screenshot criteria for Apple App Store Connect
const DEVICE_SPECS = {
  'iphone_pro_max': {
    name: 'iPhone Pro Max (6.7")',
    width: 1290,
    height: 2796,
    altWidth: 2796,
    altHeight: 1290,
    required: true
  },
  'iphone_plus': {
    name: 'iPhone Plus (5.5")',
    width: 1242,
    height: 2208,
    altWidth: 2208,
    altHeight: 1242,
    required: false
  },
  'ipad_pro': {
    name: 'iPad Pro (12.9")',
    width: 2048,
    height: 2732,
    altWidth: 2732,
    altHeight: 2048,
    required: false
  }
};

const SCREENSHOT_SCENES = ['home', 'explore', 'cards', 'flowers'];

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return null;
  }
}

function getImageInfo(filePath) {
  // Use sips (native macOS) to get image details
  const widthStr = runCommand(`sips -g pixelWidth "${filePath}" | awk '/pixelWidth/ {print $2}'`);
  const heightStr = runCommand(`sips -g pixelHeight "${filePath}" | awk '/pixelHeight/ {print $2}'`);
  const hasAlphaStr = runCommand(`sips -g hasAlpha "${filePath}" | awk '/hasAlpha/ {print $2}'`);
  const formatStr = runCommand(`sips -g format "${filePath}" | awk '/format/ {print $2}'`);

  return {
    width: widthStr ? parseInt(widthStr, 10) : null,
    height: heightStr ? parseInt(heightStr, 10) : null,
    hasAlpha: hasAlphaStr === 'yes',
    format: formatStr ? formatStr.toLowerCase() : null,
    sizeBytes: fs.statSync(filePath).size
  };
}

function performOCR(filePath) {
  // Use tesseract if available
  const hasTesseract = runCommand('which tesseract');
  if (!hasTesseract) {
    return { available: false, text: '' };
  }
  
  const text = runCommand(`tesseract "${filePath}" stdout --psm 3 2>/dev/null`);
  return {
    available: true,
    text: text || ''
  };
}

function scanScreenshotsDir(baseDir) {
  const filesList = [];
  
  function recurse(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        recurse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
          filesList.push(fullPath);
        }
      }
    }
  }

  recurse(baseDir);
  return filesList;
}

function analyzeScreenshot(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  const pathParts = relativePath.split(path.sep);
  
  // Try to determine the device type and theme from path
  // Expected: screenshots/[device_type]/[theme]/[scene]/filename.ext
  const deviceType = pathParts[0];
  const theme = pathParts[1] || 'unknown';
  const scene = pathParts[2] || 'unknown';
  
  const fileInfo = getImageInfo(filePath);
  const ocr = performOCR(filePath);
  
  const issues = [];
  const warnings = [];
  const passes = [];
  
  // 1. Format check: Apple requires PNG
  if (fileInfo.format !== 'png') {
    issues.push(`Incorrect format: file is **${fileInfo.format ? fileInfo.format.toUpperCase() : 'unknown'}**, but App Store screenshots **MUST** be PNG.`);
  } else {
    passes.push('Format is PNG');
  }
  
  // 2. Alpha Channel Check
  if (fileInfo.hasAlpha) {
    issues.push('Contains an **alpha channel (transparency)**. App Store Connect will reject this screenshot.');
  } else {
    passes.push('No alpha channel');
  }

  // 3. Location Check
  if (pathParts.length < 4 && relativePath !== 'mcp_screenshot_post_tap.jpg') {
    warnings.push(`File is not in the standard nested structure: \`screenshots/[device]/[theme]/[category]/[filename]\``);
  }

  // 4. Dimension Checks
  const spec = DEVICE_SPECS[deviceType];
  if (spec) {
    const isPortrait = fileInfo.width === spec.width && fileInfo.height === spec.height;
    const isLandscape = fileInfo.width === spec.altWidth && fileInfo.height === spec.altHeight;
    
    if (!isPortrait && !isLandscape) {
      issues.push(`Invalid dimensions for **${spec.name}**: Got \`${fileInfo.width}x${fileInfo.height}\`. Expected \`${spec.width}x${spec.height}\` (Portrait) or \`${spec.altWidth}x${spec.altHeight}\` (Landscape).`);
    } else {
      passes.push(`Dimensions match ${spec.name} (\`${fileInfo.width}x${fileInfo.height}\`)`);
    }
  } else {
    // Screenshot at root or in unknown device folder
    if (relativePath === 'mcp_screenshot_post_tap.jpg') {
      warnings.push(`Misplaced screenshot found in root \`screenshots/\` directory.`);
    } else {
      warnings.push(`Unknown device category folder \`${deviceType}\`. Expected one of: ${Object.keys(DEVICE_SPECS).join(', ')}.`);
    }
  }

  // 5. OCR Content Scan (SpringBoard, Expo Launcher, Debug Ribbon, Status Bar)
  if (ocr.available && ocr.text) {
    const textLower = ocr.text.toLowerCase();
    
    // Check for iOS Springboard (Simulator Home screen)
    if (textLower.includes('calendar') && textLower.includes('photos') && textLower.includes('settings') && textLower.includes('wallet')) {
      issues.push('Looks like a screenshot of the **iOS Simulator Home Screen (Springboard)**, not the app.');
    }
    
    // Check for Expo Go / Dev Launcher
    if (textLower.includes('development build') || textLower.includes('metro') || textLower.includes('enter url manually') || textLower.includes('development servers')) {
      issues.push('Looks like a screenshot of the **Expo Development Launcher / Expo Go** screen instead of the application.');
    }
    
    // Check for React Native DEBUG banner
    if (textLower.includes('debug') && (textLower.includes('fps') || textLower.includes('metro') || relativePath.includes('debug'))) {
      warnings.push('Contains potential debug overlay or "DEBUG" indicator.');
    }
    
    // Check for time stamp (status bar)
    // Find timestamps like "5:19", "10:30"
    const timeMatch = ocr.text.match(/\b\d{1,2}:\d{2}\b/);
    if (timeMatch) {
      const time = timeMatch[0];
      if (time !== '9:41') {
        warnings.push(`Status bar time is \`${time}\`. Apple's design guidelines recommend standardizing simulator time to \`9:41\`.`);
      } else {
        passes.push('Status bar shows 9:41');
      }
    }
  } else if (!ocr.available) {
    warnings.push('OCR analysis skipped (tesseract not found in PATH).');
  }

  // 6. File size check (warning if > 2MB)
  const sizeMB = (fileInfo.sizeBytes / (1024 * 1024)).toFixed(2);
  if (fileInfo.sizeBytes > 2 * 1024 * 1024) {
    warnings.push(`Large file size: **${sizeMB} MB**. We recommend compressing screenshots to speed up downloads and uploads.`);
  } else {
    passes.push(`File size is optimized (${sizeMB} MB)`);
  }

  return {
    relativePath,
    filePath,
    deviceType,
    theme,
    scene,
    fileInfo,
    issues,
    warnings,
    passes,
    ocrText: ocr.text
  };
}

function fixScreenshot(analysis) {
  const { filePath, fileInfo, relativePath } = analysis;
  let fixed = false;
  const actionsTaken = [];

  // Action 1: Strip Alpha / Convert to PNG if it's JPG in device folder
  const fileExt = path.extname(filePath).toLowerCase();
  const dirName = path.dirname(filePath);
  const baseName = path.basename(filePath, fileExt);
  
  let targetPath = filePath;

  // If file is JPG and belongs to device structure, let's convert to PNG
  if (fileInfo.format !== 'png' && relativePath !== 'mcp_screenshot_post_tap.jpg') {
    const pngPath = path.join(dirName, `${baseName}.png`);
    console.log(`Converting ${relativePath} to PNG...`);
    const convertCmd = runCommand(`which convert`);
    if (convertCmd) {
      runCommand(`convert "${filePath}" -alpha off "${pngPath}"`);
    } else {
      runCommand(`sips -s format png "${filePath}" --out "${pngPath}"`);
    }
    // Delete old file
    fs.unlinkSync(filePath);
    targetPath = pngPath;
    actionsTaken.push(`Converted format to PNG: \`${path.basename(pngPath)}\``);
    fixed = true;
    
    // Update fileInfo for subsequent checks
    analysis.filePath = pngPath;
    analysis.relativePath = path.relative(path.join(process.cwd(), 'screenshots'), pngPath);
    analysis.fileInfo = getImageInfo(pngPath);
  }

  // Action 2: Strip Alpha channel if present
  if (analysis.fileInfo.hasAlpha) {
    console.log(`Stripping alpha channel from ${analysis.relativePath}...`);
    const convertCmd = runCommand(`which convert`);
    if (convertCmd) {
      // ImageMagick can strip alpha reliably
      runCommand(`convert "${targetPath}" -background white -alpha remove -alpha off "${targetPath}"`);
      actionsTaken.push('Removed alpha channel using ImageMagick');
      fixed = true;
    } else {
      // Fallback to sips
      runCommand(`sips -s format png "${targetPath}" --setProperty formatOptions default --out "${targetPath}"`);
      actionsTaken.push('Removed alpha channel using sips');
      fixed = true;
    }
    
    // Refresh info
    analysis.fileInfo = getImageInfo(targetPath);
  }

  return { fixed, actionsTaken };
}

function generateMarkdownReport(results, baseDir) {
  let md = `# App Store Screenshot Quality Control Report\n\n`;
  md += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  
  const totalFiles = results.length;
  const totalIssues = results.reduce((acc, r) => acc + r.issues.length, 0);
  const totalWarnings = results.reduce((acc, r) => acc + r.warnings.length, 0);
  
  md += `## Summary\n\n`;
  md += `- **Total screenshots found**: ${totalFiles}\n`;
  md += `- **Critical Issues (App Store Rejections)**: <span style="color:red">**${totalIssues}**</span>\n`;
  md += `- **Warnings / Design Recommendations**: <span style="color:orange">**${totalWarnings}**</span>\n\n`;

  if (totalIssues > 0) {
    md += `> [!CAUTION]\n`;
    md += `> **${totalIssues} critical issues detected!** Screenshots containing alpha channels, incorrect dimensions, or showing developer menu screens will be rejected by Apple App Store Connect. Use the \`npm run qc-screenshots -- --fix\` command to resolve alpha channels and formats automatically.\n\n`;
  } else {
    md += `> [!TIP]\n`;
    md += `> No critical technical blocking issues found. Make sure the screenshot content matches your latest design expectations.\n\n`;
  }

  md += `## Detailed Results\n\n`;

  for (const res of results) {
    md += `### \`${res.relativePath}\`\n\n`;
    md += `- **Path**: [${path.basename(res.filePath)}](file://${res.filePath})\n`;
    md += `- **Format**: ${res.fileInfo.format ? res.fileInfo.format.toUpperCase() : 'Unknown'}\n`;
    md += `- **Dimensions**: \`${res.fileInfo.width} x ${res.fileInfo.height} px\`\n`;
    md += `- **Alpha Channel**: ${res.fileInfo.hasAlpha ? '🔴 Yes (Rejected by Apple)' : '🟢 No'}\n`;
    md += `- **File Size**: \`${(res.fileInfo.sizeBytes / (1024 * 1024)).toFixed(2)} MB\`\n\n`;

    if (res.issues.length > 0) {
      md += `#### 🔴 Critical Issues:\n`;
      res.issues.forEach(iss => {
        md += `- ${iss}\n`;
      });
      md += `\n`;
    }

    if (res.warnings.length > 0) {
      md += `#### ⚠️ Warnings:\n`;
      res.warnings.forEach(warn => {
        md += `- ${warn}\n`;
      });
      md += `\n`;
    }

    if (res.passes.length > 0) {
      md += `#### 🟢 Passed Checks:\n`;
      res.passes.forEach(pass => {
        md += `- ${pass}\n`;
      });
      md += `\n`;
    }

    if (res.ocrText) {
      md += `<details>\n<summary>Extracted Text (OCR)</summary>\n\n\`\`\`text\n${res.ocrText.trim()}\n\`\`\`\n\n</details>\n\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

function main() {
  const baseDir = path.join(process.cwd(), 'screenshots');
  const fixArg = process.argv.includes('--fix');
  
  console.log(`Starting Screenshot QC Scanner in: ${baseDir}`);
  console.log(`Fix option: ${fixArg ? 'ENABLED' : 'DISABLED'}\n`);
  
  if (!fs.existsSync(baseDir)) {
    console.error(`Error: Screenshots directory not found at ${baseDir}`);
    process.exit(1);
  }

  const files = scanScreenshotsDir(baseDir);
  if (files.length === 0) {
    console.log('No screenshots found in screenshots/ directory.');
    process.exit(0);
  }

  const results = [];
  
  for (const file of files) {
    console.log(`Scanning: ${path.relative(baseDir, file)}...`);
    const analysis = analyzeScreenshot(file, baseDir);
    
    if (fixArg) {
      const fixResult = fixScreenshot(analysis);
      if (fixResult.fixed) {
        console.log(`Fixed issues: ${fixResult.actionsTaken.join(', ')}`);
        // Re-analyze after fix
        const reanalysis = analyzeScreenshot(analysis.filePath, baseDir);
        reanalysis.fixedActions = fixResult.actionsTaken;
        results.push(reanalysis);
        continue;
      }
    }
    
    results.push(analysis);
  }

  // Print console report
  console.log('\n======================================');
  console.log('         SCREENSHOT QC REPORT         ');
  console.log('======================================');
  
  let totalIssues = 0;
  let totalWarnings = 0;

  results.forEach(res => {
    totalIssues += res.issues.length;
    totalWarnings += res.warnings.length;

    console.log(`\nFile: ${res.relativePath}`);
    console.log(`  Dimensions: ${res.fileInfo.width}x${res.fileInfo.height}`);
    console.log(`  Format: ${res.fileInfo.format.toUpperCase()} | Alpha Channel: ${res.fileInfo.hasAlpha ? 'YES (🔴 CRITICAL)' : 'NO'}`);
    
    if (res.issues.length > 0) {
      console.log('  🔴 Issues:');
      res.issues.forEach(iss => console.log(`     - ${iss.replace(/\*\*/g, '')}`));
    }
    if (res.warnings.length > 0) {
      console.log('  ⚠️ Warnings:');
      res.warnings.forEach(warn => console.log(`     - ${warn.replace(/\*\*/g, '')}`));
    }
    if (res.issues.length === 0 && res.warnings.length === 0) {
      console.log('  🟢 All checks passed.');
    }
    if (res.fixedActions) {
      console.log(`  🛠️ Fixed Actions: ${res.fixedActions.join(', ')}`);
    }
  });

  console.log('\n======================================');
  console.log(`Scan Summary:`);
  console.log(`Total Files Checked: ${results.length}`);
  console.log(`Critical Issues: ${totalIssues}`);
  console.log(`Warnings/Suggestions: ${totalWarnings}`);
  console.log('======================================\n');

  // Write markdown report
  const reportPath = path.join(baseDir, 'qc_report.md');
  const markdownReport = generateMarkdownReport(results, baseDir);
  fs.writeFileSync(reportPath, markdownReport, 'utf-8');
  console.log(`Saved detailed QC report to: ${reportPath}`);

  if (totalIssues > 0 && !fixArg) {
    console.log('Tip: Run this script with the --fix argument to automatically resolve alpha channels and format mismatches:');
    console.log('     node scripts/verify_screenshots.js --fix\n');
  }
}

main();
