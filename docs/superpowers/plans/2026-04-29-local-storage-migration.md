# Local Storage Migration & App Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom async `window.storage` API with browser-native `localStorage` and wire `GymCycleTracker` into `src/App.jsx` so the app renders.

**Architecture:** Two file edits only. `gym-cycle-tracker.jsx` drops its async storage calls in favour of synchronous `localStorage` reads/writes. `src/App.jsx` replaces the default Vite template with a single `<GymCycleTracker />` render.

**Tech Stack:** React 19, Vite, browser localStorage API

---

## Files

- Modify: `gym-cycle-tracker.jsx` — swap `window.storage` → `localStorage`, remove `async/await`
- Modify: `src/App.jsx` — remove Vite boilerplate, render `GymCycleTracker`

---

### Task 1: Swap `window.storage` for `localStorage` in `gym-cycle-tracker.jsx`

**Files:**
- Modify: `gym-cycle-tracker.jsx`

- [ ] **Step 1: Replace the load `useEffect`**

  Find the current `useEffect` block (lines 133–146) and replace it with the synchronous version:

  ```jsx
  useEffect(() => {
    const idxR = localStorage.getItem("gym_cycle_index");
    const visR = localStorage.getItem("gym_session_visits");
    const hisR = localStorage.getItem("gym_cycle_history");
    if (idxR) setCurrentIndex(parseInt(idxR, 10));
    if (visR) setVisits(JSON.parse(visR));
    if (hisR) setHistory(JSON.parse(hisR));
    setLoaded(true);
  }, []);
  ```

- [ ] **Step 2: Replace `markDone`**

  Replace the current `async function markDone()` (lines 148–170) with:

  ```jsx
  function markDone() {
    const session = SESSIONS[currentIndex];
    const exercises = getExercises(session, visits[session.id]);
    const entry = {
      sessionId: session.id,
      sessionName: session.name,
      date: new Date().toISOString(),
      exercises: exercises.map((e) => e.name),
    };
    const newVisits = { ...visits, [session.id]: visits[session.id] + 1 };
    const newHistory = [entry, ...history].slice(0, 30);
    const nextIndex = (currentIndex + 1) % SESSIONS.length;
    setVisits(newVisits);
    setHistory(newHistory);
    setCurrentIndex(nextIndex);
    setJustDone(true);
    setTimeout(() => setJustDone(false), 2000);
    try {
      localStorage.setItem("gym_cycle_index", String(nextIndex));
      localStorage.setItem("gym_session_visits", JSON.stringify(newVisits));
      localStorage.setItem("gym_cycle_history", JSON.stringify(newHistory));
    } catch (_) {}
  }
  ```

- [ ] **Step 3: Replace `reset`**

  Replace the current `async function reset()` (lines 172–182) with:

  ```jsx
  function reset() {
    const fresh = { UA: 0, LA: 0, UB: 0, LB: 0 };
    setCurrentIndex(0);
    setVisits(fresh);
    setHistory([]);
    try {
      localStorage.setItem("gym_cycle_index", "0");
      localStorage.setItem("gym_session_visits", JSON.stringify(fresh));
      localStorage.setItem("gym_cycle_history", JSON.stringify([]));
    } catch (_) {}
  }
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add gym-cycle-tracker.jsx
  git commit -m "feat: swap window.storage for localStorage"
  ```

---

### Task 2: Wire `GymCycleTracker` into `src/App.jsx`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace `src/App.jsx` content**

  Replace the entire file with:

  ```jsx
  import GymCycleTracker from '../gym-cycle-tracker.jsx'

  export default function App() {
    return <GymCycleTracker />
  }
  ```

- [ ] **Step 2: Start the dev server and verify**

  ```bash
  npm run dev
  ```

  Open the local URL in a browser. Expected: the gym tracker UI loads (dark background, "Training Log" heading, session card, "MARK AS DONE" button). No console errors about `window.storage`.

- [ ] **Step 3: Smoke-test persistence**

  Click "MARK AS DONE". Reload the page. Expected: the session advances to the next one and the history entry appears — confirming `localStorage` is being written and read correctly.

- [ ] **Step 4: Commit**

  ```bash
  git add src/App.jsx
  git commit -m "feat: render GymCycleTracker from App"
  ```
