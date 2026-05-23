# Build Configuration for Specimen Sandbox

This document provides an overview of the build configuration for the Specimen Sandbox app, including development and production build profiles.

## Build Profiles Overview

| Profile | Purpose | Distribution | Development Client | Updates Channel |
|---------|---------|--------------|-------------------|----------------|
| `development` | Local testing with native features | Internal | Yes | none |
| `development-simulator` | Simulator testing | Internal | Yes | none |
| `preview` | Internal testing/stakeholder review | Internal | No | main |
| `production` | App Store submission | Store | No | production |

## Development Build Configuration

```json
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "image": "latest"
  }
}
```

### Development Build Features
- Includes Expo development client for hot reloading
- Uses internal distribution for direct installation on registered devices
- Enables developer tools and debugging capabilities
- Required to exercise the one-shot location prompt and resolved-state cache
- Expires after 30 days from build date

### Creating Development Builds
```bash
# For physical device testing (recommended for animations/haptics)
eas build --profile development --platform ios

# For simulator testing
eas build --profile development-simulator --platform ios
```

## Production Build Configuration

```json
"production": {
  "channel": "production",
  "autoIncrement": true,
  "ios": {
    "image": "latest"
  }
}
```

### Production Build Features
- Optimized for App Store distribution
- Auto-increments build number
- Connected to "production" updates channel
- No development client or debugging tools included
- Full optimization for performance

### Creating Production Builds
```bash
# For App Store submission
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

## Current Setup State

- **Apple Team**: Scott Beilfuss (Individual) (ID: 3X872JR6P3)
- **Bundle Identifier**: com.djscottyb.playinginthesandoxlookingatflowers
- **Latest Production Build**: 1.2.0 (TBD — next build after pivot)
- **Registered Test Devices**: 2 (1 iPhone, 1 Mac)
- **EAS Project ID**: ce77dd42-8e41-4320-8eb3-6b96b801b3b6

### Registered Devices
- iPhone (UDID: 00008110-000A156A21E2801E)
- MacBook Pro (UDID: 00006031-000A70EE0C44001C)

## Testing Development Builds

### Method 1: Direct Installation
1. Build with `eas build --profile development --platform ios`
2. Download the .ipa file from EAS
3. Install via Apple Configurator or Xcode

### Method 2: QR Code / Development Client
1. Start the development server: `pnpm exec expo start --dev-client`
2. Scan the QR code with your device
3. App will connect to your local development server

## Notes and Limitations

- Free EAS account is limited to 10 iOS builds per month
- Simulator builds count toward monthly build limit
- Development builds expire after 30 days
- Testing the location prompt requires a physical device
- Image-fetch performance is best evaluated on cellular networks

## Troubleshooting

- If builds fail, check provisioning profile and certificate status
- For device installation issues, verify device UDID is registered
- For development client connection issues, ensure device and computer are on same network

