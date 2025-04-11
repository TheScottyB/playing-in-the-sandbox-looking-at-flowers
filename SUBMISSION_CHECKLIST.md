# App Store Submission Checklist

This document tracks all requirements for submitting "Sandbox Playing Flowers" to the App Store.

## App Store Metadata Requirements

- [x] **App Name**: "Sandbox Playing Flowers"
- [x] **Bundle ID**: com.djscottyb.playinginthesandoxlookingatflowers
- [x] **Primary Category**: Entertainment
- [x] **Secondary Category**: Education
- [x] **Age Rating**: 4+ / Everyone
- [x] **App Description**: Complete (see app.json)
- [x] **Keywords**: Implemented in app.json
- [x] **Support URL**: GitHub issues page
- [x] **Marketing URL**: N/A (optional)
- [x] **Privacy Policy URL**: GitHub Pages hosted policy

## Compliance Documentation

- [x] **Export Compliance**:
  - [x] App uses only exempt encryption (standard HTTPS)
  - [x] ITSAppUsesNonExemptEncryption set to false in Info.plist
  - [x] Documented in ENCRYPTION_NOTICE.md

- [x] **Digital Services Act (EU) Compliance**:
  - [x] Company/developer information provided
  - [x] Data processing information provided
  - [x] Documented in DSA_COMPLIANCE.md

- [x] **Content Rights**: Original content

## Asset Requirements

- [ ] **App Icon**:
  - [x] 1024x1024 icon created
  - [ ] Verify icon meets Apple's guidelines
  - [ ] Verify icon displays properly on different backgrounds

- [ ] **Screenshots**:
  - [ ] 6.5" iPhone (1284 x 2778 px) - Required - 5 screenshots
  - [ ] 5.5" iPhone (1242 x 2208 px) - Required - 5 screenshots
  - [ ] 12.9" iPad (2048 x 2732 px) - Required - 5 screenshots
  - [ ] All screenshots show core features (see SCREENSHOTS.md for details)

- [ ] **App Preview Video** (Optional):
  - [ ] 15-30 second demo video
  - [ ] Shows core features and animations
  - [ ] Device frame/bezel removed

## Technical Requirements

- [x] **Build Configuration**:
  - [x] Development profile configured
  - [x] Production profile configured
  - [x] Preview profile configured

- [ ] **Device Compatibility**:
  - [x] iOS 15.1+ compatibility
  - [ ] iPad compatibility tested
  - [x] iPhone compatibility tested
  - [ ] Performance testing on older devices

- [x] **Code Signing**:
  - [x] Distribution certificate created
  - [x] Provisioning profiles configured

- [x] **Privacy Declarations**:
  - [x] App privacy details provided
  - [x] Data collection policies documented
  - [x] Third-party code usage documented

## Functional Testing

- [ ] **Core Functionality**:
  - [x] Home screen displays correctly
  - [x] Tab navigation works
  - [x] Animations function properly
  - [x] Flower gallery with card flipping works
  - [ ] Test on low memory conditions
  - [ ] Test with slow network connections

- [ ] **User Experience**:
  - [x] Haptic feedback works correctly
  - [ ] Dark/light mode transitions
  - [ ] Accessibility features tested
  - [ ] Proper keyboard handling

- [ ] **Performance**:
  - [ ] App size optimization
  - [ ] Memory usage monitoring
  - [ ] Battery consumption testing
  - [ ] Cold/warm startup times

## Localization and Content

- [ ] **Localization**:
  - [x] English language implementation
  - [x] Basic locale files created
  - [ ] Additional languages (optional)

- [ ] **Accessibility**:
  - [ ] VoiceOver support
  - [ ] Dynamic text sizing
  - [ ] Sufficient color contrast

## Build and Submission

- [ ] **Final Build**:
  - [ ] Production build created via EAS
  - [ ] All console logs and debug code removed
  - [ ] Build tested on physical device

- [ ] **App Store Connect**:
  - [ ] All required fields completed
  - [ ] Build uploaded
  - [ ] Screenshots uploaded
  - [ ] Privacy questionnaire completed
  - [ ] Release information filled out

## Post-Submission

- [ ] **TestFlight Testing**:
  - [ ] Internal testing group created
  - [ ] External testing group created (optional)
  - [ ] Feedback collection process defined

- [ ] **Launch Plan**:
  - [ ] Release date determined
  - [ ] Marketing assets prepared
  - [ ] Support response plan in place

## Notes

- Current API endpoints and services are configured for production use
- App has been tested with the latest iOS version
- All code changes have been reviewed and committed to the main branch
- The app does not collect any user data and this is properly declared

---

Last Updated: April 11, 2025

