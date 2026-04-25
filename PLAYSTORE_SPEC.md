# Play Store Release Spec: Sandbox Playing Flowers

> **Status:** Draft — Review & Approve before implementation
> **Date:** 2026-02-19
> **Target:** Google Play Store (Android)

---

## 1. Current State Assessment

### What the App Is

A React Native / Expo SDK 52 app with 4 tabs:

| Tab | Current State | Play Store Ready? |
|-----|---------------|-------------------|
| **Home** | Default Expo template — "Hello World!!", React logo, developer instructions ("Edit index.tsx", "npm run reset-project") | NO — developer scaffold, not user content |
| **Explore** | Default Expo template — developer docs about file-based routing, custom fonts, image handling | NO — developer scaffold, not user content |
| **Cards** | 3 generic animated cards ("First Card", "Second Card", "Third Card") with expand/collapse | NO — placeholder content |
| **Flowers** | Seasonal flower gallery with 3D flip cards, season filters, haptics | PARTIALLY — best screen, but has bugs |

### Critical Bugs Found

1. **`FlowerGalleryCard.tsx` is corrupted** — The file contains two concatenated versions of the same component. The first version is truncated mid-line (`fontWeight: 'bol`) at ~line 412, then a second complete version starts. This will cause a build failure or unpredictable behavior.

2. **Web-only API on native** — The second copy of `FlowerGalleryCard` uses `new Image()` (a browser API) for preloading on all platforms without a platform check. The first copy correctly uses `Platform.OS === 'web'` branching and `Image.prefetch` for native. Only the first version's approach is correct.

3. **Missing `useCacheAssets` in second copy** — The first (truncated) version imports and uses `useCacheAssets` hook; the second version does not, leading to no image caching on native.

4. **Card footer inconsistency** — First version uses `paddingHorizontal: 15, paddingVertical: 10`; second uses `padding: 15`. Minor but indicates the file needs to be unified.

5. **No SafeAreaView** on the Flowers or Cards screens — content can render behind Android status bars and navigation bars.

---

## 2. What Needs to Change (Ordered by Priority)

### P0 — Blockers (App won't pass review or will crash)

#### 2.1 Fix `FlowerGalleryCard.tsx` corruption
- Remove the second duplicated component
- Keep the first version (which has `useCacheAssets`, proper platform checks, the full 12-flower FLOWER_IMAGES dataset organized by season)
- Fix the truncated `fontWeight: 'bol` → `fontWeight: 'bold'`
- Restore missing styles from the truncation (`loadingContainer`, `loadingText`, `infoContainer`, `description`)

#### 2.2 Replace template screens with real content

**Home screen** — Replace the Expo default with an app-appropriate welcome:
- App title/branding with a flower-themed header image (not the React logo)
- Brief welcome text ("Explore beautiful flowers across all four seasons")
- Quick-start cards linking to the Flowers and Cards tabs
- Seasonal highlight or "flower of the day" section

**Explore screen** — Replace developer docs with actual content:
- "About the App" section
- Seasonal flower guide (what blooms when)
- Flower care tips or fun facts
- Credits/attribution for Unsplash photographers

**Cards screen** — Replace placeholder cards with meaningful content:
- Seasonal flower fact cards with actual descriptions
- OR flower identification cards
- OR a garden journal / favorites feature

#### 2.3 Add Google Play submit configuration to `eas.json`
Currently only iOS submission is configured. Add:
```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "internal"
    }
  }
}
```

#### 2.4 Set Android `targetSdkVersion`
Google Play requires `targetSdkVersion` 34 or higher (as of August 2024). Add to `app.json`:
```json
"android": {
  ...
  "compileSdkVersion": 35,
  "targetSdkVersion": 35
}
```

#### 2.5 Add `INTERNET` permission explicitly
The app fetches images from Unsplash over the network. While React Native adds this implicitly, being explicit is better practice:
```json
"android": {
  "permissions": ["android.permission.INTERNET"]
}
```

### P1 — Required for Play Store Listing

#### 2.6 Play Store listing metadata
Create or update store listing assets:
- **App name:** "Sandbox Flowers" (max 30 chars) ✓ already fits
- **Short description:** (max 80 chars) — needs to be written
- **Full description:** (max 4000 chars) — needs to be written
- **Feature graphic:** 1024×500 PNG (does not exist)
- **Screenshots:** Minimum 2, recommended 8, for phone (16:9 or 9:16). Current screenshots are iOS-focused — need Android device frames
- **App icon:** 512×512 PNG (current `icon.png` is only 22KB — may need higher resolution)
- **Content rating:** Must complete IARC questionnaire (app is clearly "Everyone")
- **Data safety form:** Must declare what data the app collects/shares

#### 2.7 Update privacy policy for accuracy
Current policy states:
- "does not integrate with or utilize any third-party services" — **FALSE**, the app fetches images from `images.unsplash.com`
- `expo-insights` is installed as a dependency — this is Expo's analytics module

**Fix:** Either:
- Remove `expo-insights` and bundle flower images locally (strongest privacy position), OR
- Update privacy policy to disclose network image fetching and Expo telemetry

#### 2.8 Unsplash compliance
The app loads images directly from Unsplash URLs without:
- Proper API parameters (sizing: `?w=400&q=80`)
- Attribution (Unsplash license requires photographer credit)
- API key (hotlinking raw URLs may get rate-limited or blocked)

**Options:**
1. **Bundle images locally** (recommended) — Download the 12 flower images, include them in `assets/images/flowers/`, remove network dependency entirely. Eliminates privacy concern, Unsplash compliance issue, and offline failure mode in one move.
2. Use the Unsplash API properly with an API key and attribution.

### P2 — Quality & Polish

#### 2.9 Android-specific UI fixes
- Add `SafeAreaView` or use `expo-status-bar` padding on Flowers and Cards screens
- Test and fix the tab bar — iOS uses blur transparency (`position: 'absolute'`), Android gets `default: {}` which may look different/broken
- The `IconSymbol` component uses SF Symbols (`house.fill`, `paperplane.fill`, etc.) — these are iOS-only. On Android, need Material Icons fallback. Check if `IconSymbol.tsx` handles this (it does for iOS via `IconSymbol.ios.tsx`, but the base `IconSymbol.tsx` needs to map to MaterialIcons properly).
- `expo-blur` tab background only works on iOS — Android needs a solid/semi-transparent fallback
- Test dark mode on Android — card backs use hardcoded `backgroundColor: '#f8f8f8'` which won't look right in dark mode

#### 2.10 Offline handling
- The app has zero offline handling — if the network is down, flower images fail silently
- Add an error state / retry UI for failed image loads
- If images are bundled locally (recommended per 2.8), this becomes a non-issue

#### 2.11 Accessibility
- No `accessibilityLabel` props on interactive elements
- Flower images have no alt text
- Season filter buttons have no accessibility hints
- Flip button state isn't announced to screen readers
- Test with TalkBack (Android screen reader)

#### 2.12 Performance
- The `FlowerGalleryCard` component creates new `Animated.Value` refs on every render path — animation values should be stable
- `Dimensions.get('window')` is called at module scope — won't respond to screen rotation or split-screen on Android
- Consider using `useWindowDimensions()` hook instead

#### 2.13 App signing
- Set up Google Play App Signing (recommended: let Google manage the signing key)
- Configure upload key for EAS Build
- Add keystore configuration

### P3 — Nice to Have (Post-Launch)

#### 2.14 Feature enhancements
- Swipe gestures to navigate between flowers (instead of tap-only)
- Favorites / bookmark system
- Search functionality
- More flower data (botanical names, growing zones, care tips)
- Seasonal notifications
- Share a flower image

#### 2.15 Testing
- Only 1 test exists (`ThemedText-test.tsx`) — add tests for:
  - `FlowerGalleryCard` rendering and flip logic
  - Season filter functionality
  - `AnimatedCard` expand/collapse
  - Navigation between tabs
- Set up Android-specific CI in GitHub Actions (currently only `ios-hardware.yml`)

#### 2.16 Analytics & crash reporting
- If you want usage data, add a proper analytics solution and update the privacy policy
- Consider Sentry or Bugsnag for crash reporting on production builds

---

## 3. Recommended Implementation Order

### Phase 1: Fix What's Broken
1. Fix `FlowerGalleryCard.tsx` corruption (deduplicate, restore truncated styles)
2. Add SafeAreaView to all screens
3. Bundle flower images locally (removes Unsplash dependency, privacy issue, and offline issue simultaneously)
4. Remove `expo-insights` or update privacy policy

### Phase 2: Replace Template Content
5. Redesign Home screen with flower-themed welcome
6. Redesign Explore screen with actual flower/app content
7. Redesign Cards screen with meaningful flower cards
8. Update app branding (replace React logo in header with flower imagery)

### Phase 3: Android & Play Store Config
9. Add Android targetSdkVersion and permissions to `app.json`
10. Add Google Play submit config to `eas.json`
11. Test on Android emulator and fix platform-specific issues
12. Verify icon rendering on Android (adaptive icon)
13. Set up app signing

### Phase 4: Store Listing
14. Write short and full descriptions
15. Create feature graphic (1024×500)
16. Capture Android screenshots
17. Complete IARC content rating
18. Complete data safety form
19. Update privacy policy

### Phase 5: Polish & Submit
20. Add accessibility labels
21. Fix dark mode on all screens
22. Add error/loading states
23. Run `eas build --platform android --profile production`
24. Internal testing via Play Console
25. Submit for review

---

## 4. Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unsplash image hotlinking breaks | App shows blank cards | Bundle images locally |
| Play Store rejects for "minimum functionality" | Rejection | Replace 2 template screens with real content |
| `expo-insights` flagged in data safety review | Rejection or required disclosure | Remove dependency or disclose in data safety form |
| Corrupted FlowerGalleryCard causes crash | Crash on launch | Fix file immediately — P0 |
| SF Symbols icons missing on Android | Broken tab bar | Verify IconSymbol.tsx Android fallback |

---

## 5. Files That Need Changes

| File | Change Type | Priority |
|------|-------------|----------|
| `components/FlowerGalleryCard.tsx` | Fix corruption, deduplicate | P0 |
| `app/(tabs)/index.tsx` | Full rewrite — replace template | P0 |
| `app/(tabs)/explore.tsx` | Full rewrite — replace template | P0 |
| `app/(tabs)/cards.tsx` | Rewrite with real content | P0 |
| `app.json` | Add Android SDK versions, permissions | P0 |
| `eas.json` | Add Android submit config | P0 |
| `package.json` | Remove `expo-insights` (if decided) | P1 |
| `docs/privacy.html` | Update for accuracy | P1 |
| `app/(tabs)/_layout.tsx` | Verify Android icon fallback | P2 |
| `app/(tabs)/flowers.tsx` | Add SafeAreaView | P2 |
| `components/AnimatedCard.tsx` | Dark mode fix, accessibility | P2 |
| `components/ui/TabBarBackground.tsx` | Verify Android rendering | P2 |
| `components/ui/IconSymbol.tsx` | Verify Android Material Icons | P2 |

---

## 6. Play Store Checklist (Summary)

- [ ] App does not crash on launch
- [ ] No placeholder/template developer content
- [ ] Android `targetSdkVersion` >= 34
- [ ] App icon: 512×512 PNG
- [ ] Feature graphic: 1024×500 PNG
- [ ] At least 2 screenshots (phone)
- [ ] Short description (≤ 80 chars)
- [ ] Full description (≤ 4000 chars)
- [ ] Privacy policy URL (hosted and accurate)
- [ ] IARC content rating completed
- [ ] Data safety form completed
- [ ] App signing configured
- [ ] Google Play Developer account active ($25 one-time fee)
- [ ] Tested on Android 12, 13, 14 (minimum)
- [ ] AAB (Android App Bundle) format for upload
- [ ] Internal testing track before production
