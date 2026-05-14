# Development Guide for Specimen Sandbox

## Dev loop (start here)

**Default: Expo Go.** This app has no custom native modules — Expo Go covers all required APIs (expo-location, expo-image, expo-router, etc.). Use this for day-to-day work.

```bash
pnpm install
pnpm exec expo start
# scan the QR with Expo Go on iOS/Android
```

For web preview:

```bash
pnpm exec expo start --web --port 8081
```

### When to use EAS dev builds instead

Only when verifying behavior Expo Go doesn't cover:

- Pre-release native smoke (the path TestFlight will exercise)
- Native build pipeline changes (`eas.json`, `app.json` plugins)
- A third-party native module that isn't in Expo Go's set (we don't have any in RC1)

```bash
# iOS simulator (no Apple signing)
eas build --profile development-simulator --platform ios --local

# iOS device (Apple credentials via `eas credentials`)
eas build --profile development --platform ios --local

# Android
eas build --profile development --platform android --local
```

EAS local builds produce a `build-*.tar.gz` at the project root — gitignored, safe to delete after install.

### Install a local build

```bash
# iOS simulator
tar -xzf build-*.tar.gz
xcrun simctl install booted ./SandboxStaringatFlowers.app

# Android device
adb install build.apk
```

## SDK maintenance

The project is on **Expo SDK 55**. Patch bumps happen frequently — run monthly:

```bash
pnpm exec expo install expo@latest --fix
pnpm exec expo install --fix
```

This pins each dep to its SDK-matched version. After a patch bump, re-run `pnpm typecheck` and the EAS simulator build to catch any plugin regressions.

For minor or major SDK upgrades (55 → 56), follow the `upgrading-expo` Expo skill guidance: read release notes, clear caches (`rm -rf node_modules .expo ios android`), audit `expo.install.exclude` entries in `package.json`, remove deprecated packages.

### Hermes v1 (deferred)

Expo SDK 55 supports Hermes v1 opt-in. To enable later (deferred to RC2 — needs a measured perf gain on real-device profiling to justify the risk):

```json
"plugins": [["expo-build-properties", { "useHermesV1": true }]]
```

---

The sections below are deeper-dive reference for hardware-first scenarios, pre-existing build profiles, and historical troubleshooting. The dev loop above supersedes the hardware-first recommendation that this guide originally led with.

## Development Environments

### 1. iOS Hardware Development (Recommended)
This is the primary development environment. Hardware is required to exercise the one-shot location prompt (`expo-location`) and the resolved-state cache that drives the daily flower fetch.

#### Prerequisites:
- macOS computer
- Xcode 15.0 or later
- Apple Developer Account
- Physical iOS device (iPhone/iPad)
- Apple Developer Program membership ($99/year)

#### Setup Steps:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure development build:
   ```bash
   npx expo install expo-dev-client
   ```

3. Create development build for hardware:
   ```bash
   eas build --profile development --platform ios
   ```

4. Install the build on your device:
   - Connect your iOS device to your Mac
   - Open Xcode
   - Go to Window → Devices and Simulators
   - Select your device
   - Drag and drop the .ipa file from the build output

5. Run the development server:
   ```bash
   npx expo start --dev-client
   ```

6. Open the app on your device and shake to open the developer menu

### 2. iOS Simulator (Quick Testing)
Useful for quick testing but may not accurately represent hardware performance.

#### Setup:
1. Install Xcode from Mac App Store
2. Open Xcode → Settings → Platforms
3. Install iOS simulator
4. Run development server:
   ```bash
   npx expo start --ios
   ```

### 3. Web Development (Limited Use)
Not recommended for primary development due to differences in styling and performance.

#### Setup:
```bash
npx expo start --web
```

## Build Profiles

### Development Build (Hardware)
```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "ios": {
      "image": "latest"
    }
  }
}
```

### Production Build
```json
{
  "production": {
    "channel": "production",
    "autoIncrement": true,
    "ios": {
      "image": "latest"
    }
  }
}
```

## Important Notes

1. **Hardware Testing**
   - Always test on physical devices before production builds
   - Pay special attention to:
     - First-launch location permission prompt
     - Resolved region matches your actual US state
     - `docs/daily/{state}/{today}.json` exists on GH Pages before testing
     - Image fetch + render performance
     - Offline / no-network behavior

2. **Development Workflow**
   - Use hardware builds for all styling and animation work
   - Use simulator for quick layout checks
   - Avoid web development for final testing

3. **Build Process**
   - Development builds expire after 30 days
   - Keep track of build expiration dates
   - Create new development builds before expiration

4. **Troubleshooting**
   - If builds fail, check:
     - Apple Developer account status
     - Provisioning profiles
     - Certificates
     - Bundle identifier matches
     - Team ID in app.json

## EAS Build Commands

### Create Development Build
```bash
eas build --profile development --platform ios
```

### Create Production Build
```bash
eas build --profile production --platform ios
```

### Update Development Build
```bash
eas build --profile development --platform ios --auto-submit
```

## Required Configuration

Make sure these are set in your `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.djscottyb.playinginthesandoxlookingatflowers",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}
```

## Support

For build issues:
1. Check EAS build logs
2. Verify Apple Developer account status
3. Ensure all certificates are valid
4. Contact Expo support if needed

## Troubleshooting Guide

### Common Build Issues and Solutions

#### 1. EAS Build Failures

**Issue**: Build fails with certificate or provisioning profile errors
```
Error: No valid iOS Distribution certificate was found
```
**Solution**:
1. Check Apple Developer account:
   ```bash
   eas credentials
   ```
2. If credentials are missing:
   ```bash
   eas credentials
   eas build:configure
   ```
3. Verify in Apple Developer Portal:
   - Certificates are valid (not expired)
   - Provisioning profiles match bundle ID
   - Device UDID is registered

#### 2. Development Client Installation Issues

**Issue**: App fails to install on device
```
Failed to install the app on the device
```
**Solution**:
1. Check device trust settings:
   - Settings → General → Device Management
   - Trust the developer certificate
2. Verify provisioning profile:
   - Xcode → Preferences → Accounts
   - Download all profiles
3. Clean build:
   ```bash
   rm -rf ios/build
   eas build --profile development --platform ios --clear-cache
   ```

#### 3. Metro Bundler Connection Issues

**Issue**: App can't connect to development server
```
Unable to connect to Metro
```
**Solution**:
1. Check network:
   - Ensure device and computer are on same network
   - Try turning off firewall temporarily
2. Alternative connection methods:
   ```bash
   # Use tunnel connection
   npx expo start --tunnel
   
   # Or specify LAN IP
   npx expo start --lan --host <your-ip>
   ```

#### 4. Bundle Identifier Conflicts

**Issue**: Build fails due to bundle ID conflict
```
Bundle identifier is already in use
```
**Solution**:
1. Check app.json:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourdomain.appname"
       }
     }
   }
   ```
2. Ensure uniqueness:
   - Add development suffix: `.dev`
   - Use reverse domain notation
   - Check Apple Developer Portal for conflicts

#### 5. Build Expiration Issues

**Issue**: App stops working after 30 days
```
Development build has expired
```
**Solution**:
1. Create new build before expiration:
   ```bash
   eas build --profile development --platform ios
   ```
2. Set calendar reminder for build expiration
3. Consider using longer expiration profiles

#### 6. Xcode Build Issues

**Issue**: Xcode build fails with signing errors
```
Code signing failed
```
**Solution**:
1. Clean Xcode build:
   ```bash
   xcodebuild clean
   ```
2. Reset certificates:
   ```bash
   # In Xcode
   Xcode → Preferences → Accounts → Download All Profiles
   ```
3. Verify team selection in Xcode project settings

#### 7. Performance Issues

**Issue**: App runs slowly on device
```
Performance degradation
```
**Solution**:
1. Check for memory leaks:
   - Use Xcode Instruments
   - Monitor memory usage
2. Optimize assets:
   - Compress images
   - Use appropriate image formats
3. Profile with React Native Debugger

#### 8. Common Error Messages

| Error Message | Solution |
|--------------|----------|
| "No iOS Distribution certificate" | Run `eas credentials` and configure certificates |
| "Provisioning profile not found" | Download profiles in Xcode → Preferences |
| "Device not registered" | Add UDID to Apple Developer Portal |
| "Bundle ID conflict" | Use unique bundle identifier |
| "Metro connection failed" | Try `--tunnel` or `--lan` options |

### Debugging Tools

1. **React Native Debugger**
   ```bash
   npm install -g react-native-debugger
   ```

2. **Xcode Instruments**
   - Profile performance
   - Monitor memory usage
   - Track network activity

3. **Expo DevTools**
   - Monitor logs
   - Inspect elements
   - Performance profiling

### Getting Help

1. **Expo Documentation**
   - [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
   - [EAS Build](https://docs.expo.dev/build/introduction/)
   - [Troubleshooting](https://docs.expo.dev/troubleshooting/common-issues/)

2. **Apple Developer Resources**
   - [Certificates and Profiles](https://developer.apple.com/support/certificates/)
   - [Device Management](https://developer.apple.com/support/device-management/)

3. **Community Support**
   - [Expo Discord](https://chat.expo.dev)
   - [GitHub Issues](https://github.com/expo/expo/issues)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

Remember to:
- Keep certificates and profiles up to date
- Document any custom solutions
- Share solutions with team members
- Update this guide with new issues and solutions 