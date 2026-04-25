## [1.1.0] - 2026-04-25

### Changed (BREAKING — product pivot)
- Replaced the boilerplate tab gallery with a single-screen daily flower experience
- App now resolves the user's US state via a one-shot `expo-location` prompt and shows a fresh AI-generated flower image native to that state, matched to the current month
- `app/index.tsx` is the only screen; the `(tabs)` group has been removed entirely

### Added
- `lib/region.ts` — one-prompt location → US state code, cached forever in AsyncStorage; falls back to `default` bucket if denied or non-US
- `lib/dailyFlower.ts` — provider interface for the daily flower (v1 resolves to GH Pages CDN; v2-ready for a Cloudflare Worker swap-in)
- `data/species.json` — 3 curated native species per state (51 buckets + `default`), each tagged with bloom months
- `scripts/generate-daily.mjs` — Node 20 generator that picks an in-season species via deterministic `hash(state+date)`, calls Gemini 2.5 Flash Image via REST, and writes `.webp` + sidecar JSON to `docs/daily/{state}/{date}.{webp,json}`
- `.github/workflows/generate-daily.yml` — daily cron at 04:00 PT plus `workflow_dispatch` with optional `date` and `states` inputs for backfills
- `NSLocationWhenInUseUsageDescription` and `expo-location` plugin in `app.json`
- `expo-location` and `@react-native-async-storage/async-storage` dependencies
- Location-data disclosure in `meta/PRIVACY.md` and `docs/privacy.html`

### Removed
- `app/(tabs)/` — Home, Explore, Cards, Flowers screens
- `components/` — `AnimatedCard`, `Collapsible`, `ExternalLink`, `FlowerGalleryCard`, `HapticTab`, `HelloWave`, `ParallaxScrollView`, `IconSymbol`, `TabBarBackground`
- `hooks/useCacheAssets.ts`
- `assets/images/partial-react-logo.png`, `react-logo*.png`

### Infrastructure
- Upgraded Expo SDK 52 → 55 (52.0.43 → 55.0.17)
- Upgraded React Native 0.76.9 → 0.83.6 and React 18.3.1 → 19.2.0
- Upgraded react-native-reanimated 3.16 → 4.2, expo-router 4 → 55, and aligned dev deps
- Added `react-native-worklets` as required peer dep of Reanimated 4
- Migrated `useCacheAssets` to `expo-file-system/legacy` to preserve existing caching API
- Narrowed `useColorScheme` wrapper to return `'light' | 'dark' | null` (RN now surfaces `'unspecified'`)
- Tightened `IconSymbol` MAPPING typing with `as const satisfies` and added missing
  `rectangle.stack.fill` and `leaf.fill` fallbacks for Android/web

### Fixed
- Deduplicated corrupted `FlowerGalleryCard.tsx` (two concatenated copies, broken string
  literal, invalid apostrophe escape — would have blocked any typecheck/bundle)
- Added missing `expo-file-system` and `expo-crypto` dependencies used by `useCacheAssets`

## [1.0.0] - 2025-04-11

### Features
- Added Flowers tab to main navigation with leaf icon
- Enhanced app navigation structure for better user experience
- Added flower gallery with flip card animations
- Added image caching system for improved performance
- Added animated cards feature with spring animations

### Documentation
- Added comprehensive GitHub setup documentation (GITHUB_SETUP.md)
- Added Digital Services Act (DSA) compliance documentation (DSA_COMPLIANCE.md)
- Added encryption usage declaration for App Store submission (ENCRYPTION_NOTICE.md)
- Updated README with project structure and GitHub Pages information
- Added comprehensive iOS Developer Mode guide on gh-pages branch
- Added comprehensive build configuration guide on gh-pages branch

### Configuration
- Updated app.json with detailed app description and metadata
- Enhanced iOS-specific configurations:
  - Added proper bundle identifier
  - Set primary app color to #4CAF50
  - Configured localization settings
  - Set device capabilities requirements
  - Updated privacy settings with necessary declarations
- Removed web-specific configurations to focus on iOS platform
- Setup GitHub Pages with privacy policy and documentation
- Optimized build profiles for development workflow
- Updated .gitignore to exclude build artifacts and credentials

## [0.9.0] - 2025-03-28

### Added
- Initial project setup
- Basic navigation structure
- Tabbed interface with Home, Explore, and Cards sections
- Native iOS styling with blur effects and translucency
- Responsive parallax scrolling
- Adaptive light/dark theme support

---

**Note:** This changelog was initiated on April 11, 2025. Earlier changes may not be fully documented.

