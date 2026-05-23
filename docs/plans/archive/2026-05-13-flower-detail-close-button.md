# Flower-detail Close Button — Finish Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Land the in-flight close-button WIP on `app/flower-detail.tsx` plus the route-type cleanup in `app/index.tsx`. The implementation already exists locally; this plan finalizes verification and ships it.

**Architecture:** Two-file change. `app/flower-detail.tsx` gains a top-left ✕ button calling `router.back()`. `app/index.tsx` drops `as any` from the `pathname: '/flower-detail'` Link prop now that expo-router's generated route types resolve the path. Style mirrors the existing expand-button (34×34, radius 17, dark scrim, hairline border).

**Tech Stack:** Expo SDK 55, Expo Router (file-based + auto-generated route types), React Native 0.83, TypeScript strict.

**Verification cadence:** No unit tests in this project (only Maestro E2E + `tsc --noEmit`). Use `pnpm typecheck` as the syntactic gate. Manual smoke or Maestro is out of scope for this plan — added as a follow-up task only.

**Commit cadence:** Single commit. Scope is small and atomic.

---

## Task 0: Pre-flight

**Step 1:** Verify the expected WIP files are the only modified ones.

```bash
git status --short
```

Expected output:
```
 M app/flower-detail.tsx
 M app/index.tsx
```

If anything else shows up, surface it before proceeding. Stash unrelated edits.

**Step 2:** Verify we're on `main` and synced.

```bash
git rev-parse --abbrev-ref HEAD
git fetch --quiet origin main
git log --oneline HEAD..origin/main | head -3
```

Expected: branch is `main`; second log returns nothing (we're up-to-date). If commits appear, `git pull --rebase origin main` first.

No commit — these are checks.

---

## Task 1: Typecheck the WIP

**Files:**
- Read: `app/flower-detail.tsx:1-188`
- Read: `app/index.tsx` (around the Link block)

**Step 1: Run typecheck**

```bash
pnpm typecheck
```

Expected: exit 0, no output beyond the `> tsc --noEmit` banner.

**Step 2: If it fails on the removed `as any`** — the expo-router generated types may need refreshing. Run:

```bash
pnpm exec expo customize  # only if route type resolution issues appear
# Or manually:
rm -f expo-env.d.ts && pnpm exec expo start --web --port 8081 &
sleep 5
kill %1
```

The expo dev server regenerates `expo-env.d.ts` on boot. Re-run typecheck.

**Step 3: If still failing** — re-add `as any` on the pathname temporarily and surface the error to the user. Do not silently revert other parts of the WIP.

No commit — typecheck is the gate, not a deliverable.

---

## Task 2: Commit the WIP

**Files:**
- Stage: `app/flower-detail.tsx`, `app/index.tsx`

**Step 1: Stage**

```bash
git add app/flower-detail.tsx app/index.tsx
git diff --stat --staged
```

Expected:
```
 app/flower-detail.tsx | 34 +++++++++++++++++++++++++++++++---
 app/index.tsx         |  3 +--
 2 files changed, 32 insertions(+), 5 deletions(-)
```

**Step 2: Commit with a descriptive message**

```bash
git commit -m "$(cat <<'EOF'
feat: close button on flower-detail + drop route-type any-cast

Adds a 34×34 ✕ button at the top-left of the flower-detail full-screen
view, calling router.back() to return to home. Visually mirrors the
expand button on the home card (same scrim, radius, hairline border) so
in/out feels symmetric.

Also drops `pathname: '/flower-detail' as any` from app/index.tsx — the
expo-router generated route types now resolve the path directly.

EOF
)"
```

**Step 3: Verify**

```bash
git log -1 --stat
```

Expected: one commit on `main` with the two-file diff.

---

## Task 3: Push to origin

**Step 1: Push**

```bash
git push origin main
```

Expected: fast-forward push. If rejected (concurrent commits on origin), `git pull --rebase origin main` then re-push.

**Step 2: Confirm**

```bash
git log --oneline -3
gh api repos/TheScottyB/playing-in-the-sandbox-staring-at-flowers/branches/main --jq .commit.sha
```

Both should print the same SHA at HEAD.

---

## Done criteria

- [ ] `pnpm typecheck` passes
- [ ] Single commit on `main` containing the two-file diff
- [ ] Origin `main` matches local `main`
- [ ] No other files modified

## Out of scope (deferred follow-ups)

These are real follow-ups but not part of this plan:

1. **Maestro smoke test** for the home → flower-detail → close → home round trip. Blocked: today's flower JSON is 404 (Gemini billing), so the home screen's `ok` state can't be reached on `today`. Once flower data is back, add `.maestro/flower-detail.yml` that taps the expand button, asserts the detail screen, taps the close button, asserts return to home.
2. **`router.back()` deep-link robustness**: if a future deep-link allows entering `/flower-detail` directly, `back()` may no-op. Guard with `router.canGoBack() ? router.back() : router.replace('/')` when deep-linking gets added.
3. **Native iOS verification**: blocked on iOS 26.5 simulator runtime install (`xcodebuild -downloadPlatform iOS`).
