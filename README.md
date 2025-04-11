# Sandbox Flowers

An interactive app for creative expression and exploration with immersive iOS-native experiences.

## Features

- **NEW! Animated Card Interactions** - Expandable cards with fluid spring animations
- **NEW! Haptic Feedback Integration** - Tactile response on card interactions and tab changes
- **NEW! Tabbed Navigation Structure** - Home, Explore, and Cards sections
- Native iOS styling with blur effects and translucency
- iOS-optimized performance and animations
- Responsive parallax scrolling
- Adaptive light/dark theme support

## Development Setup

**Important**: This app requires iOS hardware testing for proper development. Web and simulator environments may not accurately represent the final product, especially haptic feedback and animation performance.

For detailed development instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. For iOS hardware development (recommended):
   ```bash
   npx expo install expo-dev-client
   eas build --profile development --platform ios
   npx expo start --dev-client
   ```

3. For quick testing in simulator:
   ```bash
   npx expo start --ios
   ```

## Navigation Structure

The app features a tab-based navigation system:

- **Home** - Welcome screen with parallax effect and getting started guide
- **Explore** - Discover features and capabilities of the app
- **Cards** - Interactive animated cards with expand/collapse animations and haptic feedback

## Requirements

- macOS computer
- Xcode 15.0 or later
- Apple Developer Account
- Physical iOS device (required for haptic feedback testing)
- Node.js 16 or later

## Project Structure

```
├── app/                   # Main application screens
│   ├── (tabs)/            # Tab-based navigation screens
│   └── _layout.tsx        # Main navigation layout
├── components/            # Reusable components
│   ├── AnimatedCard.tsx   # Spring-animated card component
│   ├── HapticTab.tsx      # Tactile feedback tab buttons
│   └── ui/                # UI primitives and styled components
├── assets/                # Images and other assets
├── constants/             # App constants
├── docs/                  # GitHub Pages documentation
│   ├── index.html         # Documentation landing page
│   └── privacy.html       # Privacy policy for App Store
├── hooks/                 # Custom React hooks
└── scripts/               # Build and utility scripts
```

> **Note on GitHub Pages**: The project uses GitHub Pages to host the [privacy policy](https://thescottyb.github.io/playing-in-the-sandox-looking-at-flowers/privacy.html) required for App Store submission. To enable or update GitHub Pages, go to the repository settings under Pages and set the source to the `main` branch and `/docs` folder.

## iOS-Specific Optimizations

- Native blur effects in tab bar
- iOS-specific haptic feedback patterns
- Optimized spring animations for iOS devices
- Adaptive styling based on device capabilities

## Building for Production

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed instructions on creating production builds.

## Support

For development issues, refer to [DEVELOPMENT.md](DEVELOPMENT.md).
For other questions, open an issue in the GitHub repository.
