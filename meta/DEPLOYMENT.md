# Deployment

Step-by-step for shipping to TestFlight + Google Play Store internal track. This is the RC1 delivery path.

## Prerequisites

- `eas-cli` installed: `pnpm add -g eas-cli`
- Logged in: `eas login`
- Apple credentials configured via `eas credentials` → iOS → distribution cert + provisioning profile
- Google service account JSON at `./google-service-account.json` (gitignored). To create: Play Console → Setup → API access → grant a new service account.

## iOS — TestFlight

```bash
# production build, auto-increment build number, submit to App Store Connect
eas build -p ios --profile production --submit
```

This consumes `submit.production.ios` in `eas.json` (Apple ID + ASC App ID + Team ID already wired). When the build finishes processing, Apple emails you. The build then appears in TestFlight → Internal Testing. Add tester emails there.

Shortcut for iOS-only flow:

```bash
pnpm exec testflight
```

## Android — Internal Track

```bash
eas build -p android --profile production --submit
```

Uploads the AAB to Play Console's `internal` track (per `submit.production.android.track`). `releaseStatus: "draft"` means the release lands as a draft — promote to live in Play Console UI. To widen the audience later, move through: `internal` → `closed` → `open` → `production`.

## Version management

`appVersionSource: "remote"` in `eas.json` means EAS owns build numbers. Bump display version in `app.json` (`expo.version` and `expo.runtimeVersion`) for human-visible changes; build numbers auto-increment per build.

```bash
# Inspect current version numbers
eas build:version:get -p ios
eas build:version:get -p android

# Manually set a build number (rarely needed)
eas build:version:set -p ios --build-number 42
```

## OTA updates (EAS Update)

The app is wired to `https://u.expo.dev/e8192c1a-...` via `expo-updates`. For an in-flight beta:

```bash
# Ship a JS / asset update to the production channel
eas update --channel production --message "what changed"
```

Beta testers receive the update on next app launch (the `update-on-push.yml` EAS workflow does this automatically on every push to `main`).

**Limit**: OTA updates can only ship JS + asset changes. Anything that needs a native rebuild (new dep, new plugin, new permission) requires `eas build` again. Bumping `app.json.expo.runtimeVersion` is what tells the OTA system "this update isn't compatible with old binaries" — it should match a fresh build.

## Monitoring

```bash
# Recent builds + statuses
eas build:list

# Recent submission attempts
eas submit:list

# Latest OTA updates on a branch
eas update:list --branch production --json | jq '.currentPage[0]'
```

Per the `eas-update-insights` Expo skill — channel health:

```bash
eas channel:insights --channel production --runtime-version 1.1.1
```

Returns:
- `embeddedUpdateTotalUniqueUsers` — users on the binary build (no OTA picked up yet)
- `otaTotalUniqueUsers` — users on the latest OTA
- `mostPopularUpdates[]` — which updates are pulling traffic

Per-update health (crash rate, install counts):

```bash
GROUP=$(eas update:list --branch production --json --non-interactive | jq -r '.currentPage[0].group')
eas update:insights "$GROUP" --json --non-interactive \
  | jq '.platforms[] | {platform, installs: .totals.installs, crashRate: .totals.crashRatePercent}'
```

If crash rate > 1%, investigate via TestFlight crash reports / Play Console vitals. May warrant an OTA fix or a new build.

## Tester invites

### TestFlight (iOS)

1. App Store Connect → TestFlight → Internal Testing
2. Add testers by email (max 100 internal testers)
3. Testers get an email + TestFlight push to install

### Internal track (Android)

1. Play Console → Internal testing → Testers
2. Add a tester list (Google Group or email addresses)
3. Share the opt-in URL from the Testers tab — testers must opt in BEFORE the build is visible to them

## RC1 acceptance

A build is acceptable to ship to RC1 testers when:

- [ ] Built on `main`, tag `appA-rc1` applied
- [ ] EAS submission succeeded on both platforms
- [ ] No P0 lint or typecheck errors
- [ ] Manual smoke pass: offline experience, location flow, flip-to-back, navigation to flower-detail and back
- [ ] ≥1 external tester on each platform installs and runs for 24h crash-free
