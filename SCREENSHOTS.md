# Screenshot Capture Guide

This document provides detailed guidelines for capturing, organizing, and preparing screenshots for App Store submission. Per Apple's guidelines, only the first 3 screenshots will be used on app installation sheets, and screenshots will be used across all device sizes, so quality and accuracy are critical.

## Directory Structure

All screenshots are organized in the `/screenshots` directory with the following structure:

```
screenshots/
├── iphone_pro_max/         # iPhone 15 Pro Max (1290 × 2796) - HIGHEST PRIORITY
│   ├── light/              # Light mode screenshots
│   │   ├── flowers/        # Flower gallery screenshots (PRIMARY)
│   │   ├── cards/          # Interactive cards screenshots (SECONDARY)
│   │   └── explore/        # Explore interface screenshots (TERTIARY)
│   └── dark/               # Dark mode screenshots
│       ├── flowers/
│       ├── cards/
│       └── explore/
├── iphone/                 # iPhone standard sizes
│   ├── light/
│   │   ├── flowers/
│   │   ├── cards/
│   │   ├── explore/
│   │   └── home/
│   └── dark/
│       ├── flowers/
│       ├── cards/
│       ├── explore/
│       └── home/
└── ipad/                   # iPad Pro 12.9"
    ├── light/
    │   ├── flowers/
    │   ├── cards/
    │   ├── explore/
    │   └── home/
    └── dark/
        ├── flowers/
        ├── cards/
        ├── explore/
        └── home/
```

## Critical Screenshots (First 3)

These are the most important screenshots that will appear on the App Store installation sheet and should be captured first.

### 1. Flower Gallery (PRIMARY)

- **Device**: iPhone 15 Pro Max
- **Mode**: Light mode
- **Directory**: `screenshots/iphone_pro_max/light/flowers/`
- **Content Requirements**:
  - Show the flower gallery with flip card animations in action
  - Capture mid-animation if possible to show dynamic elements
  - Ensure flowers are clearly visible and appealing
  - Include UI elements that highlight interactivity
  - Clean status bar with carrier text removed

### 2. Interactive Cards (SECONDARY)

- **Device**: iPhone 15 Pro Max
- **Mode**: Light mode
- **Directory**: `screenshots/iphone_pro_max/light/cards/`
- **Content Requirements**:
  - Display cards in various states (collapsed/expanded)
  - Capture expansion animation if possible
  - Show multiple cards for context
  - Include visual indicator of haptic feedback if possible
  - Clean status bar with carrier text removed

### 3. Explore Interface (TERTIARY)

- **Device**: iPhone 15 Pro Max
- **Mode**: Light mode
- **Directory**: `screenshots/iphone_pro_max/light/explore/`
- **Content Requirements**:
  - Show the main discovery/explore interface
  - Display navigation elements clearly
  - Highlight discovery features
  - Show content relevant to user journey
  - Clean status bar with carrier text removed

## Screenshot Capture Process

### Preparation

1. Install and set up the app on the target device (iPhone 15 Pro Max).
2. Ensure the device is in Light Mode for initial screenshots.
3. Set device time to 9:41 AM (Apple's preferred time).
4. Clear all notifications and ensure a full battery icon.
5. Connect to WiFi but remove carrier name if possible.

### Capturing

Using Simulator or Physical Device:

1. **Using Xcode Simulator**:
   ```bash
   # Start a specific simulator
   xcrun simctl boot "iPhone 15 Pro Max"
   
   # Set simulator appearance to light mode
   xcrun simctl ui booted appearance light
   
   # Take a screenshot
   xcrun simctl io booted screenshot screenshots/iphone_pro_max/light/flowers/flower_gallery_main.png
   ```

2. **Using Physical Device**:
   - Navigate to the screen you want to capture
   - Press the Side button + Volume up button simultaneously
   - Transfer the screenshot to your computer via AirDrop or cable
   - Rename according to naming conventions below

3. **Using QuickTime Player**:
   - Connect your device to your Mac
   - Open QuickTime Player
   - Select File > New Movie Recording
   - Click the dropdown next to the record button and select your iOS device
   - Take screenshots using Screenshot app on Mac (Shift+Command+5)

### Post-Processing

1. Crop screenshots if needed to remove any unwanted elements
2. Verify proper dimensions match the target device
3. Ensure PNG format and proper color space (RGB)
4. Optimize file size using ImageOptim without quality loss
5. Verify no status bar artifacts or unwanted elements

## File Naming Conventions

Follow this naming pattern for consistency:

```
[section]_[feature]_[state]_[count].png
```

Examples:
- `flowers_gallery_main_01.png`
- `flowers_flip_animation_02.png`
- `cards_expanded_view_01.png`
- `cards_spring_animation_02.png`
- `explore_categories_main_01.png`
- `explore_seasonal_featured_02.png`

## Quality Checklist

Before submitting screenshots, verify each image against this checklist:

- [ ] Correct dimensions for target device (iPhone 15 Pro Max: 1290 × 2796)
- [ ] PNG format with RGB color space
- [ ] No alpha channel or transparency
- [ ] File size optimized but without visible compression artifacts
- [ ] No carrier text, notifications, or time (except 9:41 AM)
- [ ] Battery shown as full
- [ ] WiFi icon present, no cellular signal indicators if possible
- [ ] Content accurately represents actual app functionality
- [ ] Text is legible and not cut off
- [ ] UI elements are clearly visible and not obscured
- [ ] No developer debugging information visible
- [ ] Consistent light/dark theme usage within each category
- [ ] No cut-off content or UI elements

## Automated Processing

After capturing initial screenshots, you can use ImageMagick for batch processing:

```bash
# Resize all screenshots to match required dimensions
magick mogrify -resize 1290x2796! screenshots/iphone_pro_max/light/flowers/*.png

# Optimize PNG files
find screenshots -name "*.png" -exec magick convert {} -strip -quality 95 {} \;
```

## Useful Resources

- [Apple's App Store Screenshot Specifications](https://developer.apple.com/app-store/product-page/)
- [iOS Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/overview/themes/)
- [Screenshot Templates](https://developer.apple.com/app-store/marketing/guidelines/#section-products)

---

**Last Updated**: April 11, 2025  
**Responsible Team Member**: Scott Beilfuss (scottybe@tbdstud.io)

# App Store Screenshot Requirements for Sandbox Flowers

This document outlines the required screenshots for App Store submission, including specifications for different device sizes, orientations, and content recommendations.

## Device Requirements

Apple requires screenshots for all device types your app supports. For Sandbox Flowers, we need to provide:

### Required Screenshots

| Device Type | Screen Size | Resolution | Min. Required | Orientation |
|-------------|------------|------------|--------------|-------------|
| iPhone Pro Max | 6.5" | 1284 x 2778 px | 5 screenshots | Portrait |
| iPhone Plus | 5.5" | 1242 x 2208 px | 5 screenshots | Portrait |
| iPad Pro | 12.9" | 2048 x 2732 px | 5 screenshots | Portrait |

## Screenshot Scenes

For each device type, capture the following scenes:

### Scene 1: Welcome/Home Screen with Tab Navigation
- **Content**: Main home interface showing the parallax scrolling effect with visible tab navigation
- **Tips**: 
  - Ensure all three tabs (Home, Explore, Cards) are visible at the bottom
  - Show the app name at the top
  - Capture with a clean, uncluttered view
  - Highlight the active tab with its selected state

### Scene 2: Interactive Feature
- **Content**: Show user interaction with flowers/plants
- **Tips**:
  - Capture mid-interaction to demonstrate the app's functionality
  - Use bright, colorful flowers to make the screenshot appealing
  - Include visible UI controls if applicable

### Scene 3: Animated Cards (Collapsed State)
- **Content**: Show the new Cards tab with multiple cards in collapsed state
- **Tips**:
  - Ensure multiple card options are visible
  - Capture with clean typography and vibrant colors
  - Show a finger or touch indicator suggesting tap interaction
  - Include a visual hint that cards are interactive

### Scene 4: Animated Cards (Expanded State)
- **Content**: Show at least one card in its fully expanded state
- **Tips**:
  - Capture the card mid-animation if possible to show movement
  - Display the expanded content clearly
  - Consider using motion blur effects to convey animation
  - Use a small touch indicator to show where the user interacted

### Scene 5: Creative/Garden View with Theme Adaptation
- **Content**: Showcase a completed garden or creative space with theme adaptation
- **Tips**:
  - Display the app in both light and dark mode if possible
  - Ensure the scene looks polished and complete
  - Highlight native iOS styling elements (blur effects, translucency)
  - Show adaptive color schemes that respond to system settings
## Technical Guidelines

1. **No Device Frames**: Submit screenshots without device frames or status bars
2. **No People**: Avoid showing people/faces in screenshots unless necessary
3. **High Quality**: Ensure images are sharp and clear
4. **Accurate Representation**: Screenshots must accurately represent the app
5. **No URLs/Pricing**: Don't include URLs, pricing or promotional text
6. **No App Store Badges**: Don't include App Store badge or Apple product images
7. **Capturing Animations**: For animated elements, use techniques like:
   - Motion blur to suggest movement
   - Before/after pairs to show transitions
   - Mid-animation frames to convey dynamism
8. **Haptic Feedback Visualization**: Use visual cues like ripple effects or subtle highlights to suggest haptic feedback in static images

## File Specifications

- Format: PNG or JPEG
- Color Space: RGB (not CMYK)
- Resolution: Save at actual pixel dimensions (no scaling)
- Compression: Minimal compression to maintain quality
- Filename Convention: `[device]_[scene_number].png` (e.g., `iphone_pro_max_1.png`)

## Optional Enhancements

Consider these enhancements for more appealing screenshots:

1. **Localized Text**: If supporting multiple languages, provide localized screenshots
2. **Overlay Text**: Consider adding short descriptive text overlays to highlight features like "Fluid Animations" or "Haptic Feedback"
3. **Consistent Design**: Maintain consistent design elements across all screenshots
4. **Interaction Indicators**: Use subtle touch indicators (like fingerprint or glow effects) to show where interactions occur
5. **Animation Sequences**: For App Preview videos, showcase the spring animations and card transitions
6. **Visual Feedback Cues**: Include visual elements that suggest the haptic feedback (like ripple effects)
7. **Seasonal Elements**: If applicable, consider seasonal themes for visual appeal
## Screenshot Creation Workflow

1. Launch the app in the iOS Simulator for each required device (physical device preferred for animation fidelity)
2. Navigate to each scene
3. For animation captures:
   - Use screen recording to capture the full animation
   - Extract key frames that best represent the motion
   - Consider using long-exposure techniques for motion blur
4. For haptic feedback scenes:
   - Add visual indicators where haptic feedback occurs
   - Use subtle highlight effects to suggest the feedback
5. Capture screenshot (`Cmd + S` in Simulator, or use screen recording on physical device)
6. Organize screenshots using the filename convention
7. Enhance screenshots with editing tools to emphasize animations and interactions

## Animation Capture Tips

1. **Card Expansion**: Capture multiple frames during the animation to show the spring effect
2. **Tab Transitions**: Use a slight motion blur to indicate the transition between tabs
3. **Haptic Feedback**: Add ripple or pulse effects at touch points to visualize feedback
4. **Light/Dark Transitions**: Show split-screen views to demonstrate theme adaptivity

## App Store Upload Process

1. Log in to App Store Connect
2. Navigate to the app's page
3. Select "Prepare for Submission"
4. Upload screenshots for each device type
5. Add localized screenshots if supporting multiple languages
6. Consider adding App Preview videos to showcase animations
7. Preview all screenshots before final submission

Remember: High-quality, appealing screenshots significantly impact download conversion rates. Invest time in creating screenshots that effectively showcase your app's features and value, especially the new animated cards and haptic feedback features that distinguish your app.
