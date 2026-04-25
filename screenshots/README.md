# Screenshot Capture for Sandbox Flowers

This directory contains organized screenshots for App Store submission.

## Directory Structure

```
screenshots/
├── iphone_pro_max/     # iPhone Pro Max (6.5") screenshots
│   ├── light/          # Light mode screenshots
│   │   ├── home/       # Home tab screenshots
│   │   ├── explore/    # Explore tab screenshots
│   │   ├── cards/      # Cards tab screenshots
│   │   └── flowers/    # Flower interaction screenshots
│   └── dark/           # Dark mode screenshots
│       ├── home/
│       ├── explore/
│       ├── cards/
│       └── flowers/
├── iphone_plus/        # iPhone Plus (5.5") screenshots
│   ├── light/
│   └── dark/
└── ipad_pro/           # iPad Pro (12.9") screenshots
    ├── light/
    └── dark/
```

## Automated Capture Process

We've created a tool to help streamline the screenshot capture process:

```bash
npm run capture-screenshots
```

This script will:
1. Create the necessary directory structure if it doesn't exist
2. Start the appropriate simulator for each device type
3. Guide you through the required screenshots for each device

## Required Screenshots

For each device type (iPhone Pro Max, iPhone Plus, iPad Pro), you need to capture:

1. **Home Screen** - Main interface with parallax scrolling
2. **Interactive Feature** - User interaction in Explore tab
3. **Cards (Collapsed)** - Multiple cards in collapsed state
4. **Cards (Expanded)** - At least one card in expanded state
5. **Theme Adaptation** - App showcasing theme/style adaptation

## Manual Capture

If you prefer to capture screenshots manually:

1. Run the app in the iOS Simulator (or on device) for the required device type
2. Navigate to each scene described in the [SCREENSHOTS.md](../SCREENSHOTS.md) file
3. Capture screenshot (Cmd + S in Simulator)
4. Save the screenshot to the appropriate folder in this directory structure
5. Repeat for all required device types and scenes

## Post-Processing

After capturing raw screenshots:

1. Edit as needed to highlight animations and interactions
2. Add visual indicators for haptic feedback if necessary
3. Ensure all screenshots meet Apple's requirements
4. Prepare final images for App Store submission

## Reference

For detailed requirements and specifications, refer to [SCREENSHOTS.md](../SCREENSHOTS.md) in the project root. 