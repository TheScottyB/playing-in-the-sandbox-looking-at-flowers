# Voice

Sets the register for in-app copy, error states, accessibility labels,
and any store-listing language we eventually write. Draft until the
brand brief locks in Phase 2; treat the rules below as the working
baseline.

## Vibe (top line)

- **Quiet > loud.** No exclamations. No marketing voice.
- **Specific > abstract.** "Your area" > "your region". "Coming soon" > "Unavailable".
- **Curious > authoritative.** We're observing, not prescribing.
- **Botanical, not whimsical.** "Specimen", "stock", "in bloom" — not "blooooom!" or 🌸.
- **One verb per call-to-action.** "Try again", "Update location". Not "Click here to retry".

## Eyebrow style

Tracked uppercase, generous letter-spacing. Used for the region+date
label, badges, section markers, loading labels.

- Region · date: `YOUR AREA · MAY 14 2026`
- When location is known: two-letter state code in uppercase: `CA · MAY 14 2026`
- Offline badge: `OFFLINE · ARCHIVE`
- Loading label: `FINDING TODAY'S BLOOM`
- Back-of-card section: `SPECIES`

Letter-spacing tiers (see `constants/brand.ts EYEBROW`):
- `EYEBROW.base` (11px, 2.4 tracking) — main header eyebrows
- `EYEBROW.small` (10px, 2.8 tracking) — in-card labels
- `EYEBROW.tiny` (9px, 2 tracking) — fallback badges

## Error copy patterns

The current strings live in `app/index.tsx` as `ERROR_COPY`. Keep them
in this register if you change them:

| State | Title | Sub |
|---|---|---|
| 404 / unpublished | "Coming soon to your area" | "No flower has been published for this date yet. It usually arrives by 4 a.m. Pacific." |
| Network failure | "Couldn't reach the flower service" | "Check your connection, then tap Try again." |
| Service outage | "The flower service is having trouble" | "Please try again in a moment." |

Patterns:
- Titles are sentences (capital + period optional, not all-caps).
- Subs explain _what to do_ when there's something to do.
- Don't apologize. Don't catastrophize ("Something went terribly wrong").

## Accessibility labels

- **Flower image**: the common name only. `accessibilityLabel="California Poppy"` not `"Image of a California Poppy"`.
- **Buttons**: the verb the button performs. `"Close"`, `"View full screen"`, `"Try again"`. Don't say `"Close button"` (the role attribute carries that).
- **Decorative elements**: omit the label (don't say "divider").
- **Date/region eyebrow**: read as-is (`accessibilityLabel` not needed; the existing text reads cleanly).

## Microcopy library

Words we use, ranked by frequency:

- _specimen_ — preferred over "sample" or "card"
- _bloom_ — preferred over "flower" when describing the event/moment ("today's bloom")
- _native_ — anchors the regional angle
- _archive_ — for the bundled fallback set (matches OFFLINE · ARCHIVE)
- _stock_ — paper/card stock; used in the iridescent design language (App B)

Words we don't use:
- _content_, _experience_, _surface_, _platform_ — generic product-speak
- _click_, _tap here_ — verbs without their object
- _amazing_, _beautiful_, _stunning_ — let the flower speak

## Names

| Field | Value |
|---|---|
| App display name | TBD — to be filled from `docs/plans/2026-05-14-name-candidates.md` selection |
| App Store name | same as display name (≤30 chars) |
| Slug (unchanged for RC1) | `playing-in-the-sandbox-staring-at-flowers` |
| URL scheme (unchanged for RC1) | `staring-at-flowers` |
| Bundle ID (unchanged for RC1) | `com.djscottyb.playinginthesandoxlookingatflowers` |

Changing the slug or bundle ID would reset the EAS Update channel and
require new App Store / Play Store entries — both deferred to RC2.
