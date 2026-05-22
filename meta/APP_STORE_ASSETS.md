# App Store Submission Assets

This document outlines required assets, metadata, and specifications for submitting "Specimen Sandbox" to the Apple App Store. The app is a daily ritual: each morning it shows a fresh AI-generated picture of a flower native to the user's US state.

## Screenshot Specifications

> **IMPORTANT**: Per Apple's guidelines, only the first 3 screenshots will be used on the app installation sheets. These are reused across display sizes and localizations. The screenshots in `screenshots/` were captured against the previous tab-gallery UI and **need to be recaptured** against the new daily-flower screen before submission.

All screenshots must be:
- PNG or JPEG
- RGB color space (not CMYK)
- No alpha channel
- High-quality, no compression artifacts

### Required Device Screenshots

| Device | Size (pixels) | Orientation | Quantity | Priority | Status |
|--------|---------------|-------------|----------|----------|--------|
| iPhone 15 Pro Max | 1290 × 2796 | Portrait | 3 | High (Installation Sheet) | ❌ Recapture |
| iPhone 15 Pro Max | 1290 × 2796 | Portrait | 2-7 | Medium (App Store) | ❌ Recapture |
| iPad Pro (12.9", 6th gen) | 2048 × 2732 | Portrait | 3 | Medium | ❌ Recapture |
| iPad Pro (12.9", 6th gen) | 2732 × 2048 | Landscape | 3 | Medium | ❌ Recapture |

### Screenshot Priority and Content

#### Critical (First 3 Screenshots)
These appear on installation sheets and must show the core experience:

1. **Today's Flower (Primary)** — full-bleed flower image with common name, latin name, blurb, region label, and date overlay. Use a visually striking species (e.g. California Poppy or Texas Bluebonnet).
2. **Yesterday's Flower** — same layout, demonstrating the ±6-day back-navigation. Communicates "fresh every day" without text.
3. **Different Region** — same layout with a different state's flower (e.g. Hawaiian Hibiscus, Saguaro Blossom). Communicates "matched to where you are."

#### Supporting Screenshots (4-10)

4. **First-launch state** — showing the location prompt or the loading indicator. Communicates the one-prompt UX.
5. **Dark mode** — same flower card in dark theme.
6. **Different season** — show a winter-blooming species (Camellia, Yellow Jessamine) to communicate seasonality.
7. **Tablet (iPad)** — same single-screen layout adapting to a larger canvas.

### Screenshot Tips

- Hide status-bar time, carrier, notifications
- Use iOS 17+ style
- Pick high-contrast species in the first 3 to maximize App Store thumbnail impact
- Consistent styling across all shots
- See [Apple's App Preview guidelines](https://developer.apple.com/app-store/app-previews/)

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

Icons live in `app_store_assets/icons/` with iPhone and iPad sub-folders. See `app_store_assets/icons/MANIFEST.md`.

### Icon Design Guidelines

- Simple, recognizable design that works at small sizes
- No transparency
- No App Store logos / "Download on the App Store" badge
- No screenshots in the icon
- Brand green (#4CAF50)
- Flower motif

### Icon Generation

Generated via ImageMagick from `assets/images/icon.png` (1024×1024, 8-bit sRGB, no alpha).

## App Store Metadata

### Basic Information

| Metadata | Value | Status |
|----------|-------|--------|
| App Name | "Specimen Sandbox" (max 30 char) | ✅ Complete |
| Subtitle | "A flower a day, native to you" (max 30 char) | ❌ Pending |
| Category | Primary: Entertainment<br>Secondary: Lifestyle | ❌ Update from Education |
| Price | Free | ✅ Complete |
| Availability | US only (v1 — content is US-state-native species) | ❌ Pending |

### Descriptions

| Item | Value | Status |
|------|-------|--------|
| Description (max 4000 char) | "Wake up to a fresh AI-generated picture of a flower blooming near you today. Specimen Sandbox selects a native species for your US state and the current month, then delivers a new image every morning. One tap to see yesterday's. No accounts, no ads, no tracking — your region is resolved once on first launch and stored only on your device." | ❌ Pending |
| Promotional Text (max 170 char) | "A new native flower, every morning. Picked for your state and the season." | ❌ Pending |
| Keywords (max 100 char) | "flowers,native,daily,wildflowers,bloom,nature,seasons,states,gallery,morning" | ❌ Pending |

### App Review Information

| Item | Status |
|------|--------|
| Contact Info | ❌ Pending |
| Demo Account | N/A — no login |
| Reviewer Notes | ❌ Pending — flag location is one-prompt + cached, no tracking |

## Localization Requirements

### Current Localization

| Language | Status |
|----------|--------|
| English (US) | ✅ Complete |

v1 ships English-only. Species data and blurbs are in English; image generation is language-agnostic. Localization deferred until non-US regions are supported.

## App Preview Videos (Optional)

| Device | Resolution | Orientation | Length | Format | Status |
|--------|------------|-------------|--------|--------|--------|
| iPhone 15 Pro Max | 1290 × 2796 | Portrait | 15-30 sec | H.264 | ❌ Optional |
| iPad Pro (12.9") | 2048 × 2732 | Portrait | 15-30 sec | H.264 | ❌ Optional |

Suggested video flow: launch → location prompt → today's flower fades in → swipe to yesterday → end card with app icon.

## App Store Submission Checklist

### Legal Requirements

- [x] Privacy Policy URL available (now includes location-data disclosure)
- [x] App complies with GDPR requirements
- [x] App complies with CCPA requirements
- [x] Digital Services Act (DSA) compliance documentation
- [x] Encryption declaration completed

### Technical Requirements

- [ ] First-launch location prompt fires correctly on hardware
- [ ] Resolved state cached and reused on subsequent launches
- [ ] Today's flower fetches and renders within 2s on cellular
- [ ] Graceful fallback when permission denied → `default` bucket
- [ ] Graceful fallback when no flower published yet (HTTP 404)
- [ ] No crashes/freezes during normal operation
- [ ] No placeholder content or debug logs
- [ ] App icon displayed correctly on all devices
- [ ] Background/foreground transitions clean

### Content Requirements

- [ ] All screenshots recaptured against the new daily-flower UI
- [x] App Store icon (1024×1024) uploaded
- [ ] App description finalized
- [ ] Keywords optimized
- [ ] Support URL valid
- [ ] Copyright current

### App-Specific Requirements

- [ ] First 7 days of flowers pre-generated (avoid 404 on launch day)
- [ ] `data/species.json` reviewed by a botanist (or at least double-checked for state-flower accuracy)
- [ ] Generated images sampled across 5+ states for botanical plausibility
- [ ] Cron has run at least 3 times successfully before submission

## Asset Creation Tools

- **Screenshots**: QuickTime Player screen recording or Xcode's screenshot feature
- **App Icon**: [App Icon Generator](https://appicon.co/) for size generation
- **Video Preview**: iMovie / Final Cut Pro
- **Image Optimization**: [ImageOptim](https://imageoptim.com/mac)

---

**Responsible**: Scott Beilfuss (scottybe@tbdstud.io)
