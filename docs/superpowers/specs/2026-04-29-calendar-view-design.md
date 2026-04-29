# Calendar View & Skip Design

**Date:** 2026-04-29

## Overview

Add a vertical day-by-day upcoming schedule (timeline) to the gym tracker, replacing the existing "After That" mini card. Add a "Skip Day" button that shifts the next scheduled date forward by 1 day without changing the cycle order or logging a session.

## Schedule Logic

**Next workout date** is derived from existing state — no new date bookkeeping:

1. If `history` is empty → next workout date = today.
2. If `history` has entries → next workout date = `new Date(history[0].date)` + 2 days (1 rest day between sessions). `history[0]` is the most recent entry (history is stored newest-first).
3. If the computed date is in the past → clamp to today.
4. Add `skipDays` offset on top of the computed date.

**`gym_skip_days`** — new localStorage key, stores an integer (default 0):
- Incremented by 1 when the user taps "Skip Day".
- Reset to 0 when `markDone` is called.
- Never goes below 0.

`skipDays` is loaded from localStorage at startup alongside the other keys.

## Timeline Generation

Starting from the computed next workout date, generate a flat list of day entries for the next **14 days** (2 full weeks from the next workout date):

```
[
  { date: Date, type: "workout", sessionIndex: number },
  { date: Date, type: "rest" },
  { date: Date, type: "workout", sessionIndex: number },
  ...
]
```

- Workout days alternate with rest days. The session type follows the current cycle from `currentIndex` (UA → LA → UB → LB → UA…).
- The cycle index for each projected workout is computed by advancing `currentIndex` by the workout's position in the list: session `n` (0-based) = `SESSIONS[(currentIndex + n) % SESSIONS.length]`.

## UI Changes

### Remove
- The "After That" section (the mini `SessionCard` and its label).

### Add — Upcoming Timeline (replaces "After That")

Placed in the same position in the layout. Section label: `UPCOMING`.

Each row is a `div` with:
- **Workout row:** left border coloured with `session.color`, dark background (`#1a1a1a` for today, `#161616` for future). Shows weekday abbreviation, day-of-month, session name. Today's row gets a `TODAY` sub-label.
- **Rest row:** no left border, fully dimmed, shows `— REST —`.

Today's workout row is visually highlighted (brighter text, slightly darker background).

### Add — Skip Day Button

Placed immediately below the "MARK AS DONE" button. Appearance:
- `width: 100%`, `margin-top: 6px`
- `background: none`, `border: 1px solid #222`, `color: #555`
- Label: `SKIP DAY — PUSH SCHEDULE +1`
- Font: `'DM Mono'`, `11px`, `letterSpacing: 2`, uppercase

Behaviour: increments `skipDays` by 1, saves to localStorage, re-renders the timeline.

### MARK AS DONE change

When `markDone` is called, reset `skipDays` to 0 and save `gym_skip_days = "0"` to localStorage.

## New localStorage Key

| Key | Type | Default | Reset on |
|---|---|---|---|
| `gym_skip_days` | string (integer) | `"0"` | `markDone` |

## File Changes

- Modify: `src/gym-cycle-tracker.jsx` — all changes confined to this one file.

## Out of Scope

- No change to the History section.
- No change to the existing cycle progress bar, visit counts, or session card.
- No calendar grid view (month layout).
- No ability to skip individual sessions (only date offset).
