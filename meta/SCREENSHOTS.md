# Screenshot Capture Guide

Detailed guidelines for capturing, organizing, and preparing screenshots for App Store and Play Store submission. Per Apple's guidelines, only the first 3 screenshots will be used on installation sheets and reused across display sizes — quality and accuracy are critical.

> **Status:** All previous screenshots in `screenshots/` were captured against the deprecated tab UI and **must be recaptured** against the new daily-flower screen (`app/index.tsx`) before submission.

## Directory Structure

```
screenshots/
├── iphone_pro_max/         # iPhone 15 Pro Max (1290 × 2796) — HIGHEST PRIORITY
│   ├── light/
│   │   ├── today/          # Primary: full-bleed today's flower
│   │   ├── yesterday/      # Secondary: ±6-day back-nav
│   │   ├── region/         # Tertiary: different state's flower
│   │   ├── season/         # Different month / season
│   │   └── first-launch/   # Location prompt or initial loading
│   └── dark/               # Same subfolders, dark mode
├── iphone/                 # Smaller iPhones for App Store fallback
│   └── (same structure)
├── ipad/                   # iPad Pro 12.9"
│   ├── light/
│   └── dark/
└── android/                # Play Store
    ├── phone/
    ├── tablet_7/
    └── tablet_10/
```

## Critical Screenshots (First 3)

These appear on the App Store installation sheet — capture first and prioritize visual impact.

### 1. Today's Flower (PRIMARY)

- **Device**: iPhone 15 Pro Max
- **Mode**: Light
- **Directory**: `screenshots/iphone_pro_max/light/today/`
- **Content**:
  - Full-bleed flower image filling the upper 60% of the screen
  - Common name + latin name + 1-2 line blurb visible
  - Region label and date visible at the bottom
  - Pick a high-contrast, instantly-recognizable species (California Poppy, Texas Bluebonnet, Hawaiian Hibiscus)
  - Status bar clean: 9:41 AM, full battery, no carrier

### 2. Yesterday's Flower (SECONDARY)

- **Device**: iPhone 15 Pro Max
- **Mode**: Light
- **Directory**: `screenshots/iphone_pro_max/light/yesterday/`
- **Content**:
  - Same layout, different flower
  - Optionally include the "← Yesterday" / "Today →" controls visible to communicate the back-nav
  - Date in metadata reads as the day before today's screenshot

### 3. Different Region (TERTIARY)

- **Device**: iPhone 15 Pro Max
- **Mode**: Light
- **Directory**: `screenshots/iphone_pro_max/light/region/`
- **Content**:
  - A flower from a contrasting state (e.g. Saguaro Blossom for AZ if the primary was a poppy)
  - Region label clearly visible in the metadata footer
  - Communicates "matched to your area"

## Supporting Screenshots (4-8)

| # | Topic | Notes |
|---|-------|-------|
| 4 | First-launch | Location permission prompt, or the loading spinner just before the first flower resolves |
| 5 | Dark mode | Same flower, dark theme |
| 6 | Different season | Winter-blooming species (Camellia, Yellow Jessamine) to communicate seasonality |
| 7 | iPad layout | Same single-screen card on a tablet |
| 8 | Error state (optional) | Friendly fallback when no flower is published — only if the error UI is polished |

## Capture Process

### Preparation

1. Install a development build on the target device.
2. Reset region cache: `await resetRegion()` from `lib/region.ts`, or wipe app data.
3. Pre-fetch a known-good flower for "today" by ensuring `docs/daily/{state}/{today}.{webp,json}` is published on GH Pages.
4. Set device to Light Mode for primary captures, Dark Mode for the dark-mode shot.
5. Set device time to 9:41 AM (Apple's preferred time).
6. Full battery, no notifications, no carrier text.

### iOS — Xcode Simulator

```bash
# List available simulators
xcrun simctl list devices

# Boot the iPhone 15 Pro Max simulator
xcrun simctl boot "iPhone 15 Pro Max"

# Take a screenshot
xcrun simctl io "iPhone 15 Pro Max" screenshot screenshots/iphone_pro_max/light/today/01.png
```

### iOS — Physical Device

1. Connect device to Mac
2. Settings → set Status Bar override (via 3rd-party tool or pre-recorded mock) for 9:41 AM
3. Volume-Up + Side button to capture
4. AirDrop or USB-transfer to Mac

### Android — Play Store

```bash
adb shell screencap -p /sdcard/today.png
adb pull /sdcard/today.png screenshots/android/phone/today.png
```

## Image Requirements

| Store | Format | Size |
|-------|--------|------|
| App Store | PNG or JPEG, RGB, no alpha | iPhone 15 Pro Max: 1290 × 2796; iPad Pro 12.9": 2048 × 2732 |
| Play Store | PNG or JPEG | 16:9 or 9:16, between 320 px and 3840 px on the long edge |

## Helper Script

`scripts/capture_screenshots.js` automates simulator-based capture. Invoke after the app is running on the simulator:

```bash
node scripts/capture_screenshots.js
```

Outputs land in `screenshots/iphone_pro_max/light/`. Re-run with mode=dark for dark-theme captures.

## Submission Checklist

- [ ] All 3 critical screenshots captured (today, yesterday, region) on iPhone 15 Pro Max in Light mode
- [ ] Same 3 captured in Dark mode
- [ ] Supporting shots 4-8 captured
- [ ] iPad equivalents captured
- [ ] Android phone + tablet captures
- [ ] All images verified: no carrier text, status bar clean, no debug overlays
- [ ] Filename convention consistent within each subfolder
- [ ] Originals archived; submission copies optimized via ImageOptim
