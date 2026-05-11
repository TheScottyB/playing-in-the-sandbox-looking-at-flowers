# Play Store Listing Copy & Questionnaire Answers

> Drop-in answers and copy for the Google Play Console submission flow.
> Field names below match the Play Console UI as of 2026-04. Keep this in
> sync with `meta/SUBMISSION.md` (App Store equivalent).

---

## Store Listing → App details

### App name
Length limit: 30 characters

```
Sandbox Staring at Flowers
```
(15 chars)

### Short description
Length limit: 80 characters

```
A new native flower every morning, picked for your state and the season.
```
(72 chars)

### Full description
Length limit: 4000 characters

```
Wake up to a fresh AI-generated picture of a flower blooming near you today.

Every morning, Sandbox Staring at Flowers picks a native species for your US state and
the current month, then delivers a new image with a botanical blurb. One tap
takes you to yesterday's flower, or any day from the last week. That's it —
no scrolling feed, no ads, no streaks, no notifications.

A daily ritual, not a habit loop.

WHAT YOU GET EACH DAY
• A photorealistic image of a wildflower, garden flower, or shrub bloom
  native to your state, generated fresh every day
• Common name and Latin name
• A one-sentence note on the flower's appearance or ecological role
• A "← Yesterday" button to see what was published any day this week

HOW IT WORKS
• On first launch, the app asks for your location once and resolves it to a
  US state code (e.g. CA, NY). That code is stored only on your device.
• Each night at 4 AM Pacific, our generator picks an in-season native
  species for every state and creates a new image using Google Gemini.
• The app fetches today's image for your state from a static CDN. No
  account, no profile, no server-side history of you.
• If you deny location, or you're outside the US, you'll see a flower
  from a curated default collection.

PRIVACY FIRST
• Location is requested ONCE on first launch and resolved on-device to a
  state code. Your coordinates never leave your phone.
• No analytics. No ad SDKs. No third-party trackers.
• No account, no login, no email.
• You can clear the cached region at any time from the in-app menu — the
  app will re-prompt you on next launch.

NATIVE SPECIES, BLOOMING NOW
The species pool is curated for each state and tagged with bloom months,
so you'll see California Poppies in spring, Goldenrod in late summer,
Witch Hazel in winter. Every flower shown actually grows wild somewhere
near you, in season.

NO FEED, NO HOOKS
We deliberately don't show you a stream, a streak counter, or a
"see all 47 flowers you've missed" upsell. One picture, once a day. If
you forget for a week, you can scroll back six days, and that's it.
Then close the app and go outside.
```
(1846 chars — well under the 4000 limit)

### App icon
Length: 512×512 PNG, 32-bit (with alpha)

Source: `assets/images/icon.png` (1024×1024) — must be exported to 512×512
for Play Console. ImageMagick:

```bash
magick assets/images/icon.png -resize 512x512 play_store_assets/icon-512.png
```

### Feature graphic
Length: 1024×500 PNG or JPG, no alpha

Required for store discovery. **Not yet created.** Suggested composition:
- Background: brand green (`#4CAF50`)
- Center-left: small icon mark
- Right two-thirds: a single illustrated flower silhouette in white or pale
- Bottom-left: tagline "A flower a day, native to you" (white, small)

Tools: Figma, Canva, or `magick -size 1024x500 ...` for a quick solid-color
placeholder.

### Phone screenshots
Length: 2–8 screenshots, PNG/JPG, 16:9 or 9:16, 320–3840 px on long edge.
Recommend 1080×2400 (modern phone aspect ratio).

Reuse the iPhone screenshots from `screenshots/iphone_pro_max/` if those
have been recaptured against the daily-flower UI; otherwise capture fresh
on Android emulator with `adb shell screencap`.

Required content (matches App Store priority order):
1. Today's flower (full-bleed)
2. Yesterday's flower (shows back-nav)
3. Different region (shows personalization)
4. Loading / first-launch state
5. Dark mode
6. Error / "Coming soon to your area" friendly state

### Tablet screenshots (7-inch & 10-inch)
Optional but improves search ranking on tablets. Same content as phone, on
the appropriate canvas. If skipping, mark "phone only" in Distribution.

---

## Store Listing → Categorization

| Field | Value |
|---|---|
| Application type | App |
| Category | Lifestyle |
| Tags | Lifestyle / Nature & outdoors |
| Email | beilsco@gmail.com |
| Phone (optional) | leave blank |
| Website (optional) | https://github.com/TheScottyB/playing-in-the-sandbox-staring-at-flowers |
| Privacy policy URL | https://thescottyb.github.io/playing-in-the-sandbox-staring-at-flowers/privacy.html |

---

## App content → Privacy policy

URL (already configured in `app.json`):
```
https://thescottyb.github.io/playing-in-the-sandbox-staring-at-flowers/privacy.html
```

---

## App content → App access

> "Is all functionality of your app available without any access restrictions?"

**Answer: Yes**

No login. No paywall. No region-gating beyond the visible "default" fallback
for non-US users.

---

## App content → Ads

> "Does your app contain ads?"

**Answer: No**

The app makes only one outbound HTTPS call (to GitHub Pages for the daily
sidecar JSON + image). No SDKs that could serve ads.

---

## App content → Content rating (IARC questionnaire)

Walk through the questionnaire with these answers:

| Section | Question | Answer |
|---|---|---|
| Category | Tools, Productivity, Communication, or Other | **Other** |
| Violence | Does the app contain violence of any kind? | **No** |
| Sexuality | Sexual content, nudity, partial nudity, suggestive themes? | **No** |
| Language | Profanity, crude humor? | **No** |
| Controlled substances | References to drugs, alcohol, tobacco? | **No** |
| Gambling | Real or simulated gambling? | **No** |
| User-generated content | Does the app feature user-generated content, content sharing, social interaction, location sharing, personal info sharing, IAP, or unrestricted internet access? | **No** to all six |
| Miscellaneous | Anything else parents/users should know? | **No** |

**Expected rating:** Everyone (IARC Generic 3+).

> Note: location access is asked here but should be answered **No** — the
> app does not *share* location, it resolves it locally to a state code.
> Google's question is specifically "lets users share their physical
> location with other users."

---

## App content → Target audience and content

| Field | Answer |
|---|---|
| Target age group | **13+** (covers all use cases without triggering Designed for Families review) |
| Does your store listing target children? | **No** |
| Could children unintentionally view your app? | No (the listing is general-audience, not kid-targeted) |
| Are children likely to be using your app? | No |

If asked about ad disclosure for kids: **N/A — no ads.**

---

## App content → News app

**Answer: No, my app is not a news app.**

---

## App content → COVID-19 contact tracing and status

**Answer: My app is not a publicly available COVID-19 contact tracing or status app.**

---

## App content → Data safety

This is the most scrutinized section. The full answer set:

### Data collection and security

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS only — fetch to GitHub Pages CDN) |
| Do you provide a way for users to request that their data be deleted? | **Yes** (in-app "Change region" + uninstalling clears all local data) |

### Data types — what we collect

Only **one** data type is touched, and never transmitted off-device:

| Data type | Collected? | Shared? | Optional? | Purpose | Why |
|---|---|---|---|---|---|
| **Approximate location** | Yes | **No** | Yes (denying falls back to default) | App functionality, Personalization | Resolves once on first launch via `expo-location` `Accuracy.Lowest`, reverse-geocodes to a US state code, caches the code locally. Coordinates never leave the device. |

> Important: Mark "approximate" not "precise". The app uses
> `Accuracy.Lowest` which on iOS 14+ skips the precise-location prompt
> entirely and on Android requests `ACCESS_COARSE_LOCATION` only.

### Data types — what we DON'T collect

Tick **none** for every other category in the questionnaire:
- Personal info (name, email, phone, address, IDs, racial/ethnic, political, religious, sexual orientation)
- Financial info
- Health & fitness
- Messages
- Photos & videos
- Audio files
- Files & docs
- Calendar
- Contacts
- App activity
- Web browsing
- App info & performance (no crash logs, no analytics)
- Device & other IDs

### Tracking

> Does your app share user data with third parties for tracking?

**Answer: No.**

No SDKs that send data anywhere. The single outbound HTTPS call fetches a
publicly-cached image and JSON; the GH Pages CDN sees only IP + UA, which
is unavoidable for any HTTP fetch and not classified as "tracking" by
Google's rules (no joining across services, no advertising ID).

### Security practices declaration

| Practice | Answer |
|---|---|
| Data is encrypted in transit | **Yes** |
| Users can request data deletion | **Yes** (uninstall clears, in-app reset clears region) |
| App follows Play Store Families Policy (if targeting children) | N/A — 13+ |
| App has been independently security-validated | No |

---

## App content → Government apps

**Answer: My app is not a government app.**

---

## App content → Financial features

**Answer: My app does not provide any financial features.**

---

## App content → Health

**Answer: My app does not provide health features.**

---

## Pricing & distribution → Countries / regions

For v1: **United States only.** The species data is US-state-native;
non-US users would only ever see the `default` bucket, which is a
degraded experience.

To gate to US in Play Console: Distribution → Countries → uncheck "All
countries" → tick only "United States".

(In a later version, expand to Canada once `data/species.json` adds
provincial buckets.)

---

## Pricing & distribution → Pricing

**Free.** Confirm "I confirm that I want to make this app free."

---

## Pricing & distribution → Device categories

| Category | Distribute? |
|---|---|
| Phone | **Yes** |
| Tablet | **Yes** (single-screen layout adapts; nothing tablet-specific) |
| Wear OS | No |
| Android TV | No |
| Chromebook | Yes (no harm; the app runs as a tablet-class device) |
| Android Auto | No |

---

## Releases → Production → Release

After EAS Build produces a `.aab`:

```bash
# Submit to internal testing first (use eas.json submit profile)
eas submit --platform android --profile production --latest

# Or upload manually:
# Play Console → Production → Create new release → Upload [aab]
```

Recommended ladder:
1. Internal testing (you + 2 testers, 1 week)
2. Closed testing (10–20 testers, 1 week)
3. Open testing (no audience, 1 week — gives Google's automated reviews
   time to check installs across device classes)
4. Production rollout: start at 5% staged rollout, ramp to 100% over 3 days

---

## What the maintainer still has to do

- [ ] **Backfill the daily flowers** (49 missing states + `default` bucket)
  — Actions → Generate Daily Flowers → Run workflow with no inputs.
  Defaults to today's date, all states, heal mode. Takes ~6 minutes if no
  rate limits hit.
- [ ] **Capture Android screenshots** against the new daily-flower UI
  (see `meta/SCREENSHOTS.md` § Android — `adb shell screencap` on an
  emulator running the dev build)
- [ ] **Create the 1024×500 feature graphic** (no current asset)
- [ ] **Resize the app icon to 512×512** for Play Console upload
- [ ] **Set up Google Play Console app entry** ($25 one-time dev fee if
  not already paid)
- [ ] **Generate `google-service-account.json`** for `eas submit`:
  Cloud Console → IAM → Service Accounts → create → grant
  "Service Account User" + "Android Publisher" roles → Keys → Add Key →
  JSON → store as `google-service-account.json` (gitignored) and as a
  GitHub Secret for the EAS Workflow
- [ ] Walk through Play Console wizards, pasting the answers above
