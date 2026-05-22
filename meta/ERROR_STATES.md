# Error states

Every place the app can fail, the expected user-facing behavior, and the
implementation status. Use this as the spec when verifying offline /
degraded behavior during QA.

## Inventory

| Failure | Surface | Current behavior | Target for RC1 | Status |
|---|---|---|---|---|
| Daily JSON 404 (`FlowerFetchError.status === 404`) | Home | "Coming soon to your area" error placeholder | Same — legitimate "no flower for this date" | ✅ shipped |
| Daily JSON 5xx (`FlowerFetchError.status >= 500`) | Home | Falls through to `getDefaultFlower(date)` silently | Retry once with 1.5s backoff before falling through | 🚧 Task 3.4 |
| Network unreachable (fetch TypeError) | Home | Same as 5xx (silent fallback) | Explicit OFFLINE state + bundled fallback with `OFFLINE · ARCHIVE` badge | 🚧 Task 3.4 |
| Location permission denied | Home → location update | `Alert.alert("Location access is off", …, [..., "Open Settings"])` | Same. Document for App Store reviewer in privacy text. | ✅ shipped |
| Region not in `STATE_NAME_TO_CODE` | Home (region resolve) | Returns `null` → falls back to `default` bucket | Same. The default bucket has its own daily flower. | ✅ shipped |
| Image fails to load — remote URL 404 | Home / detail | `expo-image` shows blank `cardstock` background | Add fallback: use `assets/defaults/{timeOfDay}.png` | ⚠️ deferred (not blocking RC1) |
| Image fails to load — network error | Home / detail | Same as above | Same | ⚠️ deferred |
| Deep link to `/flower-detail` without prior history | Detail close button | `router.back()` no-ops on some platforms | Guard with `canGoBack() ? back() : replace('/')` | ⚠️ deferred — no deep-linking entry exists in RC1 |

## Implementation pointers

- `FlowerFetchError`: `lib/dailyFlower.ts:40`. Throws on `!sidecar.ok` at line 68.
- Current `catch` in `app/index.tsx:108-119`: distinguishes 404 from everything else; falls through to `getDefaultFlower(date)` on non-404. **No retry yet.**
- `getDefaultFlower(date)`: in `lib/dailyFlower.ts` (not shown in this file but referenced). Returns a bundled fallback. Should set `isDefault: true` on the returned object (Task 3.5 verifies).
- The `<View style={styles.fallbackBadge}>` in `app/index.tsx` already renders `OFFLINE · ARCHIVE` when `state.flower.isDefault`. Wiring offline detection just means routing `!online` events into the same code path.

## Tester checklist (for the closed beta)

Before sending a build to TestFlight / Play Internal, manually verify:

- [ ] Today's flower hasn't published yet → "Coming soon to your area"
- [ ] Airplane mode → `OFFLINE · ARCHIVE` badge appears, fallback flower shown
- [ ] Reconnect from airplane mode → next refresh pulls today's flower
- [ ] Cold start with no network → fallback flower shown immediately, no spinner-spin-forever
- [ ] Location permission denied → alert appears with "Open Settings" link
