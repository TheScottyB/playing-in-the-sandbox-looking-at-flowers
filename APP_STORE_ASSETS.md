# App Store Submission Assets

This document outlines all required assets, metadata, and specifications needed for submitting "Sandbox Flowers" to the Apple App Store.

## Screenshot Specifications

> **IMPORTANT**: According to Apple's guidelines, only the first 3 screenshots will be used on the app installation sheets. These screenshots will be used for all display sizes and localizations. Focus on representing the app's core user experience accurately on the newest devices.

All screenshots must be:
- In PNG or JPEG format
- RGB color space (not CMYK)
- No alpha channel
- High-quality without compression artifacts

### Required Device Screenshots

| Device | Size (pixels) | Orientation | Quantity | Priority | Status |
|--------|---------------|-------------|----------|----------|--------|
| iPhone 15 Pro Max | 1290 × 2796 | Portrait | 3 | High (Installation Sheet) | ❌ Pending |
| iPhone 15 Pro Max | 1290 × 2796 | Portrait | 2-7 | Medium (App Store) | ❌ Pending |
| iPad Pro (12.9", 6th gen) | 2048 × 2732 | Portrait | 3 | Medium | ❌ Pending |
| iPad Pro (12.9", 6th gen) | 2732 × 2048 | Landscape | 3 | Medium | ❌ Pending |

### Screenshot Priority and Content

#### Critical (First 3 Screenshots)
These will appear on installation sheets and should represent core functionality:

1. **Flower Gallery (Primary)** - Feature the flower gallery with flip animations, clearly showcasing the app's main purpose
2. **Interactive Cards** - Showcase the animated cards with expansion animation, highlighting interactive elements
3. **Explore Interface** - Display the discovery features with visual appeal and core navigation

#### Supporting Screenshots (4-10)
These provide additional context in the App Store listing:

4. **Home Screen** - Show the welcome screen with parallax effect
5. **Dark Mode Experience** - Showcase the app's appearance in dark mode
6. **Haptic Feedback Visual** - Illustrate the haptic feedback interactions
7. **Seasonal Collections** - Highlight different flower collections if applicable
8. **Tablet Experience** - Show how the app takes advantage of larger screens (iPad)

### Screenshot Tips

- Avoid showing time, carrier text, or notifications in the status bar
- Use iOS 17+ style (current iOS version)
- Include clear visual elements that highlight key features
- Prioritize visual appeal in the first 3 screenshots - these are critical for conversions
- Use consistent styling across all screenshots
- Consider using [Apple's App Preview guidelines](https://developer.apple.com/app-store/app-previews/) for framing

## App Icon Requirements

### App Icon Sizes

| Usage | Size (pixels) | Format | Status |
|-------|---------------|--------|--------|
| App Store | 1024 × 1024 | PNG | ✅ Complete |
| iPhone Notifications | 20 × 20 @2x, @3x | PNG | ✅ Complete |
| iPhone Settings | 29 × 29 @2x, @3x | PNG | ✅ Complete |
| iPhone Spotlight | 40 × 40 @2x, @3x | PNG | ✅ Complete |
| iPhone App | 60 × 60 @2x, @3x | PNG | ✅ Complete |
| iPad Notifications | 20 × 20 @1x, @2x | PNG | ✅ Complete |
| iPad Settings | 29 × 29 @1x, @2x | PNG | ✅ Complete |
| iPad Spotlight | 40 × 40 @1x, @2x | PNG | ✅ Complete |
| iPad App | 76 × 76 @1x, @2x | PNG | ✅ Complete |
| iPad Pro App | 83.5 × 83.5 @2x | PNG | ✅ Complete |

All icon sizes have been generated and are located in the `app_store_assets/icons/` directory with the following structure:
- `AppStore-1024x1024.png` - Main App Store icon
- `iphone/` - All iPhone-specific icons with appropriate naming
- `ipad/` - All iPad-specific icons with appropriate naming

### Icon Design Guidelines

- Simple, recognizable design that works at small sizes
- Avoid transparency (not supported)
- Don't include the App Store logo or "Download on the App Store" badge
- Avoid screenshots in your app icon
- Primary color scheme should incorporate our brand green (#4CAF50)
- Include the flower motif to reflect app content

### Icon Generation Process

The app icons were generated using ImageMagick from our custom base 1024x1024 source icon:
1. Source: `assets/images/icon.png` (1024x1024, 8-bit sRGB)
2. Verified icon properties meet App Store requirements (no alpha channel, proper color space)
3. Generated all required sizes for both iPhone and iPad
4. Created a verification MANIFEST.md file in the icons directory

#### Custom Icon Specifications

We selected the custom `icon.png` from the project's `assets/images/` directory as our source for all App Store icons based on the following specifications:

- **Dimensions**: Perfect 1024×1024 pixels (Apple's required size for App Store)
- **Color Space**: sRGB (required by App Store guidelines)
- **Bit Depth**: 8-bit (optimal for iOS display)
- **File Size**: 22KB (optimized for quality/size balance)
- **Alpha Channel**: None (as required by Apple)

This icon was chosen over other alternatives (like adaptive-icon.png and splash-icon.png) because it features our distinctive flower motif that best represents the app's purpose and aesthetic. The icon's unique visual design maintains recognizability even at small sizes while incorporating our brand green (#4CAF50) color scheme.

See `app_store_assets/icons/MANIFEST.md` for detailed verification information of all generated icons.

## App Store Metadata

### Basic Information

| Metadata | Requirements | Status |
|----------|--------------|--------|
| App Name | "Sandbox Flowers" (max 30 characters) | ✅ Complete |
| Subtitle | "Interactive Flower Gallery" (max 30 characters) | ❌ Pending |
| Category | Primary: Entertainment<br>Secondary: Education | ✅ Complete |
| Price | Free | ✅ Complete |
| Availability | All territories | ❌ Pending |

### Descriptions

| Item | Requirements | Status |
|------|--------------|--------|
| Description | Full app description (max 4000 characters)<br>Current: "An interactive flower gallery with beautiful animations and seasonal collections. Flip through various flower types with immersive haptic feedback." | ✅ Complete |
| Promotional Text | Changeable marketing text (max 170 characters) | ❌ Pending |
| Keywords | Comma-separated list (max 100 characters)<br>Suggested: "flowers,gallery,animation,interactive,nature,haptic,flip,cards" | ❌ Pending |

### App Review Information

| Item | Requirements | Status |
|------|--------------|--------|
| Contact Info | Name, email, and phone number for Apple to contact | ❌ Pending |
| Demo Account | If app requires login, provide test credentials | N/A |
| Notes | Special instructions for reviewers | ❌ Pending |

## Localization Requirements

### Current Localization

| Language | Localized Elements | Status |
|----------|-------------------|--------|
| English (US) | Full localization | ✅ Complete |

### Recommended Additional Languages

| Language | Market Importance | Status |
|----------|-------------------|--------|
| Spanish | High | ❌ Pending |
| Japanese | High | ❌ Pending |
| French | Medium | ❌ Pending |
| German | Medium | ❌ Pending |
| Chinese (Simplified) | High | ❌ Pending |

For each language, the following must be localized:
- App name
- Description
- Keywords
- Screenshots (text overlays)
- In-app content

## App Preview Videos (Optional)

### Video Specifications

| Device | Resolution | Orientation | Length | Format | Status |
|--------|------------|-------------|--------|--------|--------|
| iPhone 13 Pro Max | 1284 × 2778 | Portrait | 15-30 sec | H.264 | ❌ Optional |
| iPad Pro (12.9") | 2048 × 2732 | Portrait | 15-30 sec | H.264 | ❌ Optional |

### Content Requirements

- [ ] All screenshots completed and uploaded
- [x] App Store icon (1024×1024) uploaded
- [ ] App description finalized
4. Highlight the haptic feedback integration
5. Show light/dark mode transition
6. End with a call to action

## App Store Submission Checklist

### Legal Requirements

- [x] Privacy Policy URL available
- [x] App complies with GDPR requirements
- [x] App complies with CCPA requirements
- [x] Digital Services Act (DSA) compliance documentation
- [x] Encryption declaration completed

### Technical Requirements

- [ ] App successfully runs on all declared devices
- [ ] No crashes or freezes during normal operation
- [ ] All user interfaces are complete and functional
- [ ] No placeholder content or debug information
- [ ] App icon is properly displayed on all devices
- [ ] App correctly handles background/foreground transitions
- [ ] Haptic feedback functions as intended on supported devices

### Content Requirements

- [ ] All screenshots completed and uploaded
- [ ] App Store icon (1024×1024) uploaded
- [ ] App description finalized
- [ ] Keywords optimized and finalized
- [ ] Support URL is valid and accessible
- [ ] Marketing URL is valid and accessible
- [ ] Copyright information is current and accurate

### App-Specific Requirements

- [ ] All flower gallery images are properly credited
- [ ] Animation performance verified on older devices
- [ ] Seasonal collections are properly labeled
- [ ] Haptic feedback patterns tested on multiple devices
- [ ] Dark mode theme properly implemented for all screens

## Asset Creation Tools

- **Screenshots**: Use QuickTime Player screen recording or Xcode's built-in screenshot feature
- **App Icon**: [App Icon Generator](https://appicon.co/) can generate all required sizes
- **Video Preview**: iMovie or Final Cut Pro for editing screen recordings
- **Image Optimization**: [ImageOptim](https://imageoptim.com/mac) for lossless compression

## Submission Timeline

1. Prepare all screenshots and app icon assets (Deadline: April 18, 2025)
   - ✅ App icons completed on April 11, 2025
   - ❌ Screenshots pending
2. Finalize app metadata and descriptions (Deadline: April 20, 2025)
3. Complete app preview video (if applicable) (Deadline: April 22, 2025)
4. Submit for App Review (Target Date: April 25, 2025)
5. Expected review time: 1-3 business days
6. Target public release: May 1, 2025

---

**Last Updated**: April 11, 2025 (Updated with icon generation completion)

**Responsible Team Member**: Scott Beilfuss (scottybe@tbdstud.io)

