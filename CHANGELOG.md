# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-05-22

### Added
- **Offline SQLite Vector Database**: Compiled the species dataset into a local SQLite database (`assets/species.db`) with pre-calculated Float32 vector embeddings.
- **Semantic Search**: Added a search modal on the home screen for vibe-based/semantic queries (e.g., "yellow desert bloom") with similarity scoring.
- **Hybrid Search Engine**: Supported native JSI `sqlite-vec` search with a high-performance JavaScript dot-product scanner fallback for Expo Go.
- **Developer Controls**: Added a hidden coordinator override panel (triggered by double-tapping the region header) to simplify testing.
- **Expanded Regional Support**: Added geocoding and coordinates resolution support for Canada (`CAN`), Iceland (`ISL`), and subdivided regions of Russia, China, Mexico, and Brazil.
- **WebAssembly Support**: Added `.wasm` configuration to Metro for web-based `expo-sqlite` support.

### Changed
- **Rebrand**: Renamed the application to "Specimen Sandbox" across the package manifests and configuration screens (preserving EAS schemes/slugs).
- **WebP Image Compression**: Integrated `sharp` WebP compression at 85% quality in the daily generator cron, reducing asset storage size by ~93% (from 1.26 GB to 90 MB).
- **Consolidated Shared Constants**: Moved brand styling tokens and colors to a unified `/workspace/shared/constants/` directory, resolving pathing using local workspace symlinks.
- **Asset Relocation**: Relocated heavy App Store screenshots out of the runtime bundles.
- **Package Manager Update**: Upgraded pnpm to version `11.2.2` and migrated package settings to `.npmrc`.

### Removed
- **Purged Expo Boilerplate**: Deleted orphaned template files `ThemedText.tsx`, `ThemedView.tsx`, `useThemeColor.ts`, and `Colors.ts`.
- **Legacy PNG Assets**: Removed raw daily PNGs from Git history, replacing them with optimized WebP equivalents.

---

## [1.1.1] - 2026-04-25

### Fixed
- Fixed UTC-vs-local date mismatches causing daily flower fetch failures for US users after 5 p.m. Pacific.
- Anchored `offsetDate` navigation calculations at noon to prevent DST offset drift.
- Regenerated `pnpm-lock.yaml` to ensure `expo-location` matches SDK requirements.
- Replaced generic connection error messages with structured three-tier UX (unpublished, service trouble, and network offline).

### Changed
- Hardened daily generator script with exponential retry backoff, blurb preamble stripping, and zero-byte image guards.
- Ensured daily generator does not exit on partial errors, preserving successfully compiled assets.
- Simplified `_layout.tsx` by removing redundant font loader and splash screen boilerplate.
- Added region change shortcuts to the home card metadata and error screens.

### Infrastructure
- Cleared Expo configuration validation warnings in `app.json` and adjusted package exclusions to silence version mismatch notices.
- Added automated EAS Workflows for OTA updates.

### Tests & Docs
- Replaced Jest snapshot tests with Maestro E2E flows (`smoke.yml`, `flowers.yml`, `change-region.yml`).
- Added Play Store listing metadata copy and updated the project setup documentation.

---

## [1.1.0] - 2026-04-25

### Changed
- **Product Pivot**: Replaced the default tab-based gallery layout with a single-screen daily flower experience.
- Resolved user coordinates to regional state codes using one-shot location queries, caching results in `AsyncStorage`.

### Added
- Localized species dataset (`data/species.json`) supporting 51 regional buckets with 4 native species each.
- Daily Node generator cron to select daily seasonal flowers and retrieve AI-generated webp images.
- Location-data disclosures and privacy policy.

### Removed
- Unused tab screens and default template assets/hooks.

### Infrastructure
- Upgraded project base to Expo SDK 55, React Native 0.83.6, and React 19.2.0.
- Implemented Reanimated 4 and configured web support.

---

## [1.0.0] - 2025-04-11

### Features
- Added Flowers gallery with flip-card animations.
- Implemented client-side image caching.
- Setup app configuration metadata and store assets.

---

## [0.9.0] - 2025-03-28

### Added
- Initial project setup with standard tab layout.
- Native iOS blur styling and light/dark theme support.
