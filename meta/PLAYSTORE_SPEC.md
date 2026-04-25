# Play Store Release Spec: Sandbox Flowers

> **Status:** Draft — Review & Approve before implementation
> **Updated:** 2026-04-25 (post-pivot to daily AI-generated flower)
> **Target:** Google Play Store (Android)

---

## 1. Current State

A React Native / Expo SDK 55 app with a **single screen**: every morning it displays a fresh AI-generated picture of a flower native to the user's US state, matched to the current month.

| Component | State | Play Store Ready? |
|-----------|-------|-------------------|
| `app/index.tsx` | Single-screen flower card with full-bleed image, common name, latin name, blurb, ±6-day back-nav | YES |
| `lib/region.ts` | One-shot `expo-location` → US state code, cached in AsyncStorage | YES — needs Android permission audit |
| `lib/dailyFlower.ts` | Provider: fetches sidecar JSON + image URL from GH Pages | YES |
| `data/species.json` | 51 buckets + default with curated natives | YES |
| `scripts/generate-daily.mjs` + workflow | Cron 04:00 PT generator | YES |

---

## 2. What's Required for Play Store Submission

### P0 — Blockers

#### 2.1 Android `targetSdkVersion`
Google Play requires `targetSdkVersion` 34 or higher (as of August 2024). Verify in `app.json`:
```json
"android": {
  "compileSdkVersion": 35,
  "targetSdkVersion": 34
}
```
Expo SDK 55 already targets 34 by default.

#### 2.2 Android location permissions
`expo-location` requires explicit Android permission entries. The plugin block in `app.json` adds these automatically; verify the merged `AndroidManifest.xml` after build:
- `android.permission.ACCESS_COARSE_LOCATION` — required
- `android.permission.ACCESS_FINE_LOCATION` — optional (we use `Accuracy.Lowest`, so coarse is enough)

#### 2.3 Add Google Play submit configuration to `eas.json`
Currently only iOS submission is configured. Add:
```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "internal"
    }
  }
}
```

#### 2.4 Generate Android adaptive icon variants
`assets/images/adaptive-icon.png` exists; verify it renders correctly at the required mask sizes (108×108 dp foreground on a 432×432 dp background).

### P1 — Required content

- **Short description** (max 80 chars):
  > A new native flower every morning, picked for your state and the season.
- **Full description** (max 4000 chars): adapt from `SUBMISSION.md`
- **App icon** (512×512 PNG)
- **Feature graphic** (1024×500 PNG)
- **Screenshots**: 2-8 screenshots per device class (phone + 7-inch + 10-inch tablet)
  - Note: existing screenshots are from the deprecated tab UI — recapture against `app/index.tsx`

### P2 — Compliance

- **Data safety form** — declare:
  - Approximate location: collected, not shared, used for personalization, **not** transmitted off-device, ephemeral (resolved once → state code stored)
  - No other data collection
- **Content rating** (IARC questionnaire): "Everyone" expected
- **Target audience**: 13+ recommended (covers all use cases without triggering family-policy review)
- **Privacy policy URL**: https://thescottyb.github.io/playing-in-the-sandox-looking-at-flowers/privacy.html

---

## 3. Build & Submit Workflow

```bash
# Build for Play Internal track
eas build --profile production --platform android

# Submit to Play Console
eas submit --platform android --profile production
```

First-time setup also requires:
1. Create app in Play Console
2. Upload `google-service-account.json` (Service Account from Cloud Console with "Service Account User" + "Android Publisher" roles)
3. Complete app content questionnaire (data safety, ads, content rating)

---

## 4. Risk Notes

- **Location prompt phrasing on Android** is controlled by the system, not our `usageDescription` string. Make sure the in-app rationale (currently absent) is wired up before review — Play reviewers will reject if they can't find justification.
- **First-launch UX with no cached flower for today** — if the cron has not yet run for the user's state, the app shows an error. Pre-generate at least 7 days of buckets before submission and verify the fallback path.
- **Default bucket fallback** — when a non-US user installs from Google Play (Play distribution is global by default), they hit the `default` bucket. Consider geo-restricting to US in v1.1 if reviews surface confusion.

---

## 5. Open Questions

- Do we want to ship Play Store v1.1.0 in lockstep with iOS, or stagger?
- Is the `default` bucket sufficient for non-US installs, or should we restrict country availability?
- Donation IAPs from the boilerplate era are deprecated — confirm before configuring Play Billing.
