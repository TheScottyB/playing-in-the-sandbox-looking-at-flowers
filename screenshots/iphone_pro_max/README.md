# iPhone 15 Pro Max Screenshots

This directory contains screenshots for the iPhone 15 Pro Max device, which are **critically important** as they appear on the App Store installation sheet and are used across all device sizes.

## Device Specifications

- **Device**: iPhone 15 Pro Max
- **Screen Size**: 6.7 inches
- **Resolution**: 1290 × 2796 pixels
- **Color Profile**: P3 display (wide color)
- **Aspect Ratio**: 19.5:9

## Three Critical Screenshots

According to Apple's guidelines, the **first 3 screenshots** will appear on the app installation sheet and should be carefully designed and captured. These are the most impactful images potential users will see.

### 1. Flower Gallery (PRIMARY)

**Directory**: `light/flowers/`

**Requirements**:
- Show the flower gallery with visible flip animations
- Focus on vibrant, colorful flowers that showcase the app's visual appeal
- Capture mid-animation to demonstrate interactive elements
- Clean status bar (time 9:41, full WiFi, full battery)
- Position should show the complete UI with tab bar visible
- No overlapping elements or cut-off content

**Capture Process**:
1. Navigate to the Flowers tab
2. Start a card flip animation 
3. Capture screenshot mid-animation
4. Use simulator command: `xcrun simctl io booted screenshot light/flowers/flowers_gallery_main_01.png`

### 2. Interactive Cards (SECONDARY)

**Directory**: `light/cards/`

**Requirements**:
- Display expanded card with rich content
- Show animation spring effect if possible
- Include multiple cards in the background to indicate browsing
- Focus on a particularly visually appealing card design
- Highlight interactive elements like buttons or swipe areas
- Clean status bar (time 9:41, full WiFi, full battery)

**Capture Process**:
1. Navigate to the Cards tab
2. Expand one of the cards fully
3. Arrange view to show multiple cards
4. Initiate animation and capture mid-expansion
5. Use simulator command: `xcrun simctl io booted screenshot light/cards/cards_expanded_view_01.png`

### 3. Explore Interface (TERTIARY)

**Directory**: `light/explore/`

**Requirements**:
- Show the discovery/explore interface with categories
- Include visible navigation elements and search functionality
- Highlight seasonal or featured content
- Ensure content appears rich and engaging
- Clean status bar (time 9:41, full WiFi, full battery)
- Show the interface at rest (not during an animation)

**Capture Process**:
1. Navigate to the Explore tab
2. Scroll to reveal the best content arrangement
3. Make sure all UI elements are fully loaded
4. Capture screenshot with the view in an optimal position
5. Use simulator command: `xcrun simctl io booted screenshot light/explore/explore_main_view_01.png`

## Device-Specific Quality Checklist

For iPhone 15 Pro Max screenshots, verify the following:

- [ ] Exact dimensions: 1290 × 2796 pixels
- [ ] Dynamic Island appears natural and unobtrusive
- [ ] No notch cutout interfering with content
- [ ] Status bar shows 9:41 time
- [ ] Status bar shows full WiFi signal
- [ ] Status bar shows 100% battery
- [ ] No carrier name visible
- [ ] No unnecessary status icons (Bluetooth, location, etc.)
- [ ] Content fills the entire screen edge-to-edge
- [ ] No content cut off by the rounded corners
- [ ] Text is clear and readable at this resolution
- [ ] UI elements are properly sized for this large screen
- [ ] Haptic feedback indicators visible where applicable
- [ ] Shadow and depth effects render properly
- [ ] Animations appear smooth (not blurry unless intentional)
- [ ] Colors appear vibrant on the P3 display

## File Naming Convention

Use this format for all iPhone 15 Pro Max screenshots:

```
[section]_[feature]_[state]_[number].png
```

**Examples**:
- `flowers_gallery_main_01.png`
- `flowers_flip_animation_02.png`
- `cards_expanded_view_01.png`
- `cards_spring_animation_02.png`
- `explore_categories_view_01.png`
- `explore_seasonal_content_02.png`

## Simulator Commands

### Setup Commands

```bash
# Boot the simulator
xcrun simctl boot "iPhone 15 Pro Max"

# Set status bar (Apple's preferred 9:41 time)
xcrun simctl status_bar "iPhone 15 Pro Max" override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100

# Set light appearance
xcrun simctl ui booted appearance light
```

### Screenshot Commands

```bash
# Capture primary flower gallery screenshot
xcrun simctl io booted screenshot light/flowers/flowers_gallery_main_01.png

# Capture cards view screenshot
xcrun simctl io booted screenshot light/cards/cards_expanded_view_01.png

# Capture explore interface screenshot
xcrun simctl io booted screenshot light/explore/explore_main_view_01.png
```

## Post-Processing

After capturing raw screenshots:

1. Verify dimensions match exactly 1290 × 2796
2. Remove any unwanted status bar elements
3. Optimize file size using ImageOptim
4. Verify the screenshots display properly on App Store Preview

---

**Reference**: See the main [SCREENSHOTS.md](../../SCREENSHOTS.md) for additional guidance.

