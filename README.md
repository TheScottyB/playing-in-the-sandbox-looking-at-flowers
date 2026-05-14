# Specimen Sandbox

A daily ritual app: every morning, a fresh AI-generated picture of a flower native to your US state — matched to what's blooming this month.

## How it works

1. On first launch, the app asks for your location once and resolves it to a US state code (e.g. `CA`). The state is cached locally; no coordinates are stored or sent anywhere.
2. Each night at 04:00 PT, a GitHub Actions cron picks one in-season native species per state from `data/species.json`, generates an image with Gemini 2.5 Flash Image, and commits the `.png` + sidecar JSON to `docs/daily/{state}/{YYYY-MM-DD}.{png,json}`.
3. GitHub Pages serves those files as a free static CDN. The app fetches today's flower for your state and displays it full-bleed with the common name, latin name, and a short blurb.

If permission is denied, or you're outside the US, the app falls back to a curated `default` bucket.

## Repo layout

```
├── app/
│   ├── _layout.tsx            # Stack: index + flower-detail + +not-found
│   ├── index.tsx              # Home: daily flower card (flip-to-back for info)
│   ├── flower-detail.tsx      # Full-screen detail view with close button
│   └── +not-found.tsx
├── lib/
│   ├── region.ts              # One-prompt expo-location → state, cached in AsyncStorage
│   └── dailyFlower.ts         # Provider: fetches sidecar JSON + image URL from GH Pages
├── data/
│   └── species.json           # 3 native species per state (51 buckets + default)
├── scripts/
│   └── generate-daily.mjs     # Gemini 2.5 Flash Image generator (Node 20)
├── .github/workflows/
│   └── generate-daily.yml     # Cron 0 11 * * * UTC = 04:00 PT
├── docs/                      # GitHub Pages site (privacy + daily/ CDN tree)
│   ├── daily/{state}/{date}.png
│   ├── daily/{state}/{date}.json
│   ├── index.html
│   └── privacy.html
└── meta/                      # Internal docs (submission, dev, compliance)
```

## Quick start

```bash
pnpm install
pnpm exec expo start
```

Scan the QR code with **Expo Go** on iOS or Android. The app has no
custom native modules, so Expo Go covers all required APIs — no custom
build needed for day-to-day work.

For native verification (TestFlight / Play Internal prerelease check):

```bash
# iOS simulator (no signing)
eas build --profile development-simulator --platform ios --local

# iOS device (Apple credentials via `eas credentials`)
eas build --profile development --platform ios --local

# Android
eas build --profile development --platform android --local
```

See **[meta/DEVELOPMENT.md](meta/DEVELOPMENT.md)** for full dev loop +
**[meta/DEPLOYMENT.md](meta/DEPLOYMENT.md)** for TestFlight / Play
Internal submission.

## First-time setup

Before the cron fires for the first time, complete these three steps in order:

**1. Add the Gemini API key secret**

Repo → Settings → Secrets and variables → Actions → **New repository secret**

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | Your Google AI Studio key with Gemini 2.5 Flash Image access |

**2. Enable GitHub Pages**

Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `main`, folder: `/docs` → Save.

The CDN root will be `https://<owner>.github.io/playing-in-the-sandbox-staring-at-flowers/`.
Make sure that matches `BASE_URL` in `lib/dailyFlower.ts`.

**3. Smoke-test with a dry run**

Actions → "Generate Daily Flowers" → **Run workflow** → set `dry_run` to `true` → Run.

The workflow should complete in under a minute, commit placeholder files, and report
`52 generated, 0 skipped, 0 failed`. Merge or discard that commit before the first
real cron at 04:00 PT.

## Architecture

`lib/dailyFlower.ts` exposes a provider interface. v1 resolves to a static GitHub Pages URL. v2 can swap in a Cloudflare Worker (IP-based geo + on-demand generation) without touching any caller. v3 could move generation on-device once Gemini Nano ships in Expo.

## Cron operations

The daily generator needs:

1. `GEMINI_API_KEY` repo secret (Settings → Secrets → Actions)
2. GitHub Pages enabled from `docs/` on `main` (Settings → Pages)

### Manual runs

Actions → "Generate Daily Flowers" → **Run workflow**. Inputs:

| Input | Default | Use it for |
|---|---|---|
| `date` | today UTC | Generate flowers for a specific date (`2026-04-25`) |
| `states` | every bucket | Limit to a subset (`CA,NY,TX`) |
| `missing_only` | `false` | Conservative backfill: skip states that have any partial output (won't overwrite). Default behavior already skips states that are *fully* complete. |
| `dry_run` | `false` | Smoke-test the pipeline without burning Gemini credits |

### Backfilling missing states

If the cron has only generated a partial set (rate limits, bad API key, etc.),
re-run with `missing_only: true` for the affected dates. Existing valid files
are skipped; only the gaps get filled. The script tolerates per-state failures
without aborting the workflow's commit step, so partial progress is always
persisted.

Local backfill:

```bash
GEMINI_API_KEY=... node scripts/generate-daily.mjs \
  --date 2026-04-25 --missing-only
```

The script prints `Re-run with: --states ... --missing-only` after a partial
run so you can resume without re-paying for the states that already worked.

## Documentation

- **[CHANGELOG.md](CHANGELOG.md)** — release history
- **[meta/DEVELOPMENT.md](meta/DEVELOPMENT.md)** — local dev loop + SDK 55 maintenance
- **[meta/DEPLOYMENT.md](meta/DEPLOYMENT.md)** — TestFlight + Play Internal walkthrough
- **[meta/ERROR_STATES.md](meta/ERROR_STATES.md)** — error & offline behavior inventory + tester checklist
- **[meta/SUBMISSION.md](meta/SUBMISSION.md)** — App Store submission reference
- **[meta/PRIVACY.md](meta/PRIVACY.md)** — privacy policy (also at [docs/privacy.html](docs/privacy.html))
- **[docs/plans/](docs/plans/)** — design + implementation plans (active and archived)

## Support

Open an issue: https://github.com/TheScottyB/playing-in-the-sandbox-staring-at-flowers/issues
