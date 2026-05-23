# Play Store Release Spec: Specimen Sandbox

> **Status:** In progress — listing copy ready, assets and backfill remain
> **Updated:** 2026-04-25 (post-pivot to daily AI-generated flower)
> **Target:** Google Play Store (Android)
> **Companion docs:**
> - [PLAYSTORE_LISTING.md](PLAYSTORE_LISTING.md) — drop-in copy and questionnaire answers
> - [SUBMISSION.md](SUBMISSION.md) — App Store equivalent
> - [SCREENSHOTS.md](SCREENSHOTS.md) — capture procedure

---

## 1. Current State

A React Native / Expo SDK 56 app with a **single screen**: every morning it displays a fresh AI-generated picture of a flower native to the user's region, matched to the current month.

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
✅ Done. Expo SDK 55 targets Android 15 (`compileSdkVersion: 35`,
`targetSdkVersion: 35`) by default — well above Google's August 2024
floor of 34.

#### 2.2 Android location permissions
✅ Done. `expo-location` plugin in `app.json` adds
`ACCESS_COARSE_LOCATION` automatically. We use `Accuracy.Lowest` so
fine-location isn't requested.

#### 2.3 Add Google Play submit configuration to `eas.json`
🟡 In progress (handled separately in the EAS pipeline workstream). The
target shape:
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
✅ Done. `assets/images/adaptive-icon.png` is in place; the
`android.adaptiveIcon` block in `app.json` is configured with the brand
green background.

### P1 — Required content

| Item | Status | Where it lives |
|---|---|---|
| App name (≤ 30 chars) | ✅ | "Specimen Sandbox" |
| Short description (≤ 80 chars) | ✅ | [PLAYSTORE_LISTING.md](PLAYSTORE_LISTING.md) |
| Full description (≤ 4000 chars) | ✅ | [PLAYSTORE_LISTING.md](PLAYSTORE_LISTING.md) |
| App icon (512×512 PNG) | ❌ | Resize from `assets/images/icon.png` |
| Feature graphic (1024×500) | ❌ | Not yet created — see PLAYSTORE_LISTING.md |
| Phone screenshots (2–8) | ❌ | Recapture against current single-screen UI |
| Tablet screenshots (2–8, optional) | ❌ | Optional but improves search |

### P2 — Compliance

| Item | Status | Notes |
|---|---|---|
| Data safety form answers | ✅ | [PLAYSTORE_LISTING.md → Data safety](PLAYSTORE_LISTING.md#app-content--data-safety) |
| Content rating (IARC) answers | ✅ | [PLAYSTORE_LISTING.md → IARC](PLAYSTORE_LISTING.md#app-content--content-rating-iarc-questionnaire) |
| Target audience (13+) | ✅ | documented |
| Privacy policy URL | ✅ | `app.json` `extra.privacyPolicyUrl` |
| Government / financial / health declarations | ✅ | All "no" — answers in PLAYSTORE_LISTING.md |

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

- **Location prompt phrasing on Android** is controlled by the system, not our `usageDescription` string. Make sure the in-app rationale (now visible as "Finding flowers in your area…" under the loading spinner) is wired up before review — Play reviewers will reject if they can't find justification.
- **First-launch UX with no cached flower for today** — when the cron has not yet run for the user's state, the app now shows a friendly "Coming soon to your area" message instead of a raw HTTP error. Pre-generate at least 7 days of buckets before submission and verify the fallback path. The generator's new `--missing-only` flag makes a one-shot backfill cheap.
- **Default bucket fallback** — when a non-US user installs from Google Play (Play distribution is global by default), they hit the `default` bucket. v1 is gated to US-only via Play Console Distribution settings; revisit after Canadian provinces ship.
- **Bundle identifier typo** (`playinginthesandoxlookingatflowers` — missing a `b`) is locked in once registered and CANNOT be changed. Lives with us forever; the GH Pages URL has been corrected to use the typo-free form, the package name has not.

---

## 5. Open Questions

- Do we want to ship Play Store v1.2.0 in lockstep with iOS, or stagger?
  Recommended: stagger. iOS first (existing TestFlight pipeline + screenshots), then Play 1–2 weeks later once the daily cron has produced ≥ 7 days of clean data across all 51 buckets.
- Is the `default` bucket sufficient for non-US installs, or should we restrict country availability?
  Decision in PLAYSTORE_LISTING.md: **gate to US-only** for v1. Expand once provincial buckets exist for Canada.
- Donation IAPs from the boilerplate era are deprecated — confirm before configuring Play Billing.
  Decision: **no Play Billing in v1.** Re-evaluate if/when there's a real donation flow in the UI.

## 6. Sequence to ship

1. **EAS pipeline lands** (separate workstream — owner config, Android submit profile, GitHub Actions integration). Without this, the rest is moot.
2. **Backfill the data**: Actions → Generate Daily Flowers → Run workflow with no inputs. Verify all 52 buckets have files for today + ≥ 7 prior days.
3. **Resize app icon to 512×512** + create the **1024×500 feature graphic**.
4. **Capture Android screenshots** against the dev build on emulator — see SCREENSHOTS.md § Android.
5. **Create the Play Console app entry**, paste in answers from PLAYSTORE_LISTING.md.
6. **First production AAB**: `eas build --profile production --platform android` then `eas submit --platform android --profile production --latest`.
7. **Internal → closed → open → production** rollout ladder per PLAYSTORE_LISTING.md.
