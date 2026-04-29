# Local Storage Migration & App Wiring Design

**Date:** 2026-04-29

## Overview

Two changes: replace the custom `window.storage` async API with browser-native synchronous `localStorage`, and wire `GymCycleTracker` into `src/App.jsx` so the app actually renders.

## 1. Storage Layer — `gym-cycle-tracker.jsx`

**Current state:** All persistence goes through `window.storage.get(key)` / `window.storage.set(key, value)`, an async custom API (WebView/Electron host). `markDone`, `reset`, and the load `useEffect` are all `async`.

**Change:** Replace with synchronous `localStorage.getItem(key)` / `localStorage.setItem(key, value)`. Remove `async/await` from all three functions. The three persisted keys stay the same:

- `gym_cycle_index` — current session index (stored as a string)
- `gym_session_visits` — visit counts per session (JSON string)
- `gym_cycle_history` — last 30 workout entries (JSON string)

**Load logic (useEffect):** Read all three keys synchronously at mount, parse, set state, then set `loaded = true`. `localStorage.getItem` returns `null` for missing keys (no throw), so no error handling needed on reads. Writes (`setItem`) are wrapped in a try/catch to silently handle `QuotaExceededError` — matching the existing error-suppression behavior.

**markDone / reset:** Both become plain (non-async) functions. State updates and `localStorage.setItem` calls stay in the same order as today.

## 2. App Entry Point — `src/App.jsx`

**Current state:** Default Vite template — logo images, counter button, docs/social links. Imports `App.css`.

**Change:** Remove all boilerplate. Import `GymCycleTracker` from `../gym-cycle-tracker.jsx` and render it as the sole child. No CSS import needed (the tracker uses inline styles). `src/App.css` and `src/index.css` are left untouched.

## Out of Scope

- Moving `gym-cycle-tracker.jsx` into `src/` — not needed.
- Changes to `src/index.css` or `src/App.css`.
- Any changes to the SESSIONS data or UI.
