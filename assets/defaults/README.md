# Default flower assets

Offline fallback. Used by `data/defaults.ts` when the GitHub Pages CDN is
unreachable or hasn't published a flower for today's date.

## What to drop here

Four images of **the same species** at different times of day:

| File | Local hour range | Tonal feel |
|---|---|---|
| `sunrise.png` | 05:00–09:59 | cool, low-angle, dew |
| `midday.png` | 10:00–16:59 | high contrast, saturated |
| `sunset.png` | 17:00–19:59 | warm gold, long shadows |
| `dusk.png` | 20:00–04:59 | low light, blue hour |

Suggested specs: 1024×1024 sRGB PNG, ≤200 KB each. Compress before committing —
these get bundled into the app binary and ship with every install.

`pickVariant()` in `data/defaults.ts` chooses the variant whose `fromHour`
the current local clock has just passed (wraps midnight to `dusk`).

## Current placeholder

`midday.png` is a copy of `assets/images/splash-icon.png` so the bundler has
something to resolve. Replace it (and add `sunrise.png` / `sunset.png` /
`dusk.png`) before shipping.
