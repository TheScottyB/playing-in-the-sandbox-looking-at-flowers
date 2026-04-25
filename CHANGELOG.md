## [Unreleased]

### Changed
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

### Added
- Streamlined iOS hardware build workflow configured for development and production
- Automatic device installation for hardware testing (UDID: 00008110-000A156A21E2801E)
- Secure handling of all build credentials through GitHub Secrets
- Integration with App Store Connect API for TestFlight deployment

### Changed
- Simplified CI/CD pipeline to focus on iOS hardware builds
- Updated workflow triggers to use gh-pages branch
- Reorganized App Store preparation documentation

### Infrastructure
- Configured GitHub Actions secrets for secure credential management
- Set up comprehensive build environment variables
- Added build caching for improved performance
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

