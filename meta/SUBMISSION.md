# App Store Submission Reference for Sandbox Staring at Flowers

## Critical App Information
| Field | Value |
|-------|-------|
| App Name | Sandbox Staring at Flowers |
| Bundle ID | com.djscottyb.playinginthesandoxlookingatflowers |
| SKU | EX1744334003092 |
| Apple ID | 6744488642 |
| Version | 1.1.0 |
| Build Number | TBD (next build after pivot) |

## Required URLs
| URL Type | Value |
|----------|-------|
| Privacy Policy URL | https://thescottyb.github.io/playing-in-the-sandbox-staring-at-flowers/privacy.html |
| Support URL | https://github.com/TheScottyB/playing-in-the-sandbox-staring-at-flowers/issues |
| Marketing URL (Optional) | - |
| User Privacy Choices URL (Optional) | - |

## App Store Metadata
| Field | Value |
|-------|-------|
| Primary Category | Entertainment |
| Secondary Category | Lifestyle |
| Age Rating | 4+ |
| Content Rights | Original content + AI-generated imagery (Gemini 2.5 Flash Image) |
| Features | Daily AI-generated native flower images, region-aware (US states), one-shot location, swipe-back to past 6 days, light/dark theme |

## App Review Information
| Field | Value |
|-------|-------|
| Contact Email | beilsco@gmail.com |
| Contact Phone | - |
| Demo Account | Not required |
| Notes | The app requests location permission **once** on first launch to resolve the user's US state via reverse-geocoding. The state code is cached locally and the location is never transmitted off-device. Daily flower images are pre-generated server-side via a GitHub Actions cron and served from GitHub Pages — no user data is sent with these requests. Falls back to a default bucket if permission is denied or the user is outside the US. |

## In-App Purchases
None in v1.1.0. (The boilerplate-era donation tier configuration is deprecated; do not re-enable without a real donation flow in the UI.)

## App Store Screenshots Requirements
| Device | Size | Minimum Required | Key Features to Showcase |
|--------|------|------------------|--------------------------|
| iPhone 6.5"+ | 1290 × 2796 pixels | 3-5 screenshots | Today's flower, yesterday's flower, different region, dark mode |
| iPad 12.9" | 2048 × 2732 pixels | 3-5 screenshots | Same flow, tablet layout |

**Important**: See [SCREENSHOTS.md](SCREENSHOTS.md) for capture guidelines. The previous screenshots show the deprecated tab UI and **must be recaptured** against the daily-flower screen before submission.

## App Store Legal Questionnaire Responses

### Age Rating Questionnaire
All categories: None

### Export Compliance
- Encryption: Standard HTTPS for network calls only
- ITSAppUsesNonExemptEncryption: false (configured in `app.json`)

### Content Rights
- Third-party Content: No
- Licensed Content: No
- AI-Generated Content: Yes — flower images generated daily via Google Gemini 2.5 Flash Image. Images are owned by the developer per Google's AI Studio terms.

### Data Collection
- Analytics: None
- Advertising: None
- User Data Collection: None transmitted off-device
- Location: Requested once, resolved to US state code, cached locally only

### Digital Services Act (EU Compliance)
- Developer Identity: Verified
- Content Type: Entertainment / Lifestyle
- Target Audience: All ages
- No commercial communication

## Submission Checklist
- [x] App icon uploaded (1024×1024 px)
- [ ] Screenshots recaptured for new daily-flower UI (iPhone + iPad)
- [ ] App Preview video showing the daily ritual (optional)
- [ ] Description finalized describing the daily-flower product
- [ ] Keywords updated: "flowers,native,daily,wildflowers,bloom,nature,seasons,states"
- [x] Privacy policy URL updated with location-data disclosure
- [x] Support URL valid
- [ ] Age rating questionnaire submitted
- [x] Pricing: Free
- [ ] App Review notes explaining one-shot location + cached-only behavior
- [ ] Manual release set
- [ ] Build selected
- [ ] First 7 days of daily flowers pre-generated before submission

## Additional Notes
- Privacy policy hosted at `docs/privacy.html` via GitHub Pages
- No user data transmitted off-device beyond the standard HTTP fetch for the daily image
- No login or account creation
- Hardware testing required to exercise the location prompt
- Daily images are generated via GitHub Actions cron at 04:00 PT and served from GitHub Pages
- See `BUILD_CONFIG.md` for build details
