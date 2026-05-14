# Encryption Information for App Store Submission

## Summary of Encryption Usage

**Specimen Sandbox** does not implement any custom encryption algorithms or cryptographic functionality. The application only uses standard HTTPS/TLS for secure network communications provided by the operating system.

## Declaration

This application:

1. Does NOT use encryption algorithms that are proprietary or not accepted as standard by international standard bodies
2. Does NOT implement standard encryption algorithms instead of, or in addition to, using or accessing the encryption within Apple's operating system
3. Does NOT contain any encryption functionality except for that which is provided by Apple's operating system for secure network communications (HTTPS/TLS)

## Implementation Details

| Technology | Usage | Implementation |
|------------|-------|----------------|
| HTTPS/TLS | Secure communication for image loading | Provided by iOS/macOS (Not custom) |

## Export Compliance

The app qualifies for exemption under the Export Administration Regulations (EAR) Section 740.17(b)(1) "Mass Market Encryption" exemption, as it only uses:

1. Standard HTTPS/TLS encryption provided by the operating system
2. No custom implementation of cryptographic algorithms
3. No non-standard or proprietary encryption methods

## Configuration in Info.plist

The application's Info.plist includes the following declaration:

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

This confirms that the app:
1. Only uses encryption that is exempt from export compliance documentation requirements
2. Does not implement or directly access cryptographic functionality

## Documentation

No additional documentation is required for App Store submission as the application falls under the exemption guidelines, using only standard encryption provided by the operating system for HTTPS/TLS connections.

Last Updated: April 11, 2025

