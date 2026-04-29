# Calendar View & Skip Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a vertical upcoming-session timeline and a "Skip Day" button to the gym tracker, replacing the existing "After That" section.

**Architecture:** All changes are in `src/gym-cycle-tracker.jsx`. Two pure helper functions (`computeNextWorkoutDate`, `buildTimeline`) derive the schedule from existing history state plus a new `skipDays` integer. A new `UpcomingTimeline` component renders the day-by-day list. No new files, no new dependencies.

**Tech Stack:** React 19, browser localStorage, existing inline-style design system (Bebas Neue / DM Mono / DM Sans fonts, `#0d0d0d` dark theme)

---

## Files

- Modify: `src/gym-cycle-tracker.jsx`

---

### Task 1: Add `skipDays` state — load, save, and reset

**Files:**
- Modify: `src/gym-cycle-tracker.jsx`

- [ ] **Step 1: Add `skipDays` to component state**

  In `GymCycleTracker`, add a new state variable after the existing ones (after line 131):

  ```jsx
  const [skipDays, setSkipDays] = useState(0);
  ```

- [ ] **Step 2: Load `gym_skip_days` from localStorage in the `useEffect`**

  The existing `useEffect` (around lines 133–141) reads three keys. Add a fourth:

  ```jsx
  useEffect(() => {
    const idxR = localStorage.getItem("gym_cycle_index");
    const visR = localStorage.getItem("gym_session_visits");
    const hisR = localStorage.getItem("gym_cycle_history");
    const skipR = localStorage.getItem("gym_skip_days");
    if (idxR) setCurrentIndex(parseInt(idxR, 10));
    if (visR) setVisits(JSON.parse(visR));
    if (hisR) setHistory(JSON.parse(hisR));
    if (skipR) setSkipDays(parseInt(skipR, 10));
    setLoaded(true);
  }, []);
  ```

- [ ] **Step 3: Reset `skipDays` to 0 inside `markDone`**

  In the `markDone` function, add `setSkipDays(0)` after the existing `setJustDone(true)` call, and persist it in the existing try/catch block:

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
    setSkipDays(0);
    setJustDone(true);
    setTimeout(() => setJustDone(false), 2000);
    try {
      localStorage.setItem("gym_cycle_index", String(nextIndex));
      localStorage.setItem("gym_session_visits", JSON.stringify(newVisits));
      localStorage.setItem("gym_cycle_history", JSON.stringify(newHistory));
      localStorage.setItem("gym_skip_days", "0");
    } catch (_) {}
  }
  ```

- [ ] **Step 4: Add `skipDay` function**

  Add this function after `markDone`:

  ```jsx
  function skipDay() {
    const next = skipDays + 1;
    setSkipDays(next);
    try {
      localStorage.setItem("gym_skip_days", String(next));
    } catch (_) {}
  }
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add src/gym-cycle-tracker.jsx
  git commit -m "feat: add skipDays state with load, save, and reset"
  ```

---

### Task 2: Add `computeNextWorkoutDate` and `buildTimeline` pure functions

**Files:**
- Modify: `src/gym-cycle-tracker.jsx`

- [ ] **Step 1: Add `computeNextWorkoutDate` after the existing `getExercises` function (around line 72)**

  ```jsx
  function computeNextWorkoutDate(history, skipDays) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let base;
    if (history.length === 0) {
      base = new Date(today);
    } else {
      base = new Date(history[0].date);
      base.setHours(0, 0, 0, 0);
      base.setDate(base.getDate() + 2);
      if (base < today) base = new Date(today);
    }
    const result = new Date(base);
    result.setDate(result.getDate() + skipDays);
    return result;
  }
  ```

- [ ] **Step 2: Add `buildTimeline` immediately after `computeNextWorkoutDate`**

  ```jsx
  function buildTimeline(nextWorkoutDate, currentIndex, days = 14) {
    const entries = [];
    let workoutCount = 0;
    for (let i = 0; i < days; i++) {
      const date = new Date(nextWorkoutDate);
      date.setDate(date.getDate() + i);
      if (i % 2 === 0) {
        entries.push({
          date,
          type: "workout",
          sessionIndex: (currentIndex + workoutCount) % SESSIONS.length,
        });
        workoutCount++;
      } else {
        entries.push({ date, type: "rest" });
      }
    }
    return entries;
  }
  ```

- [ ] **Step 3: Verify the functions produce correct output**

  Start the dev server and open the browser console:

  ```bash
  npm run dev
  ```

  In the browser console, paste and run:

  ```js
  // Simulate: last workout was yesterday, skipDays = 0
  // Expected: next workout = tomorrow
  const h = [{ date: new Date(Date.now() - 86400000).toISOString() }];
  ```

  The next workout should be yesterday + 2 days = tomorrow. Confirm the logic looks right visually (the timeline component in Task 3 will make this visible in the UI).

- [ ] **Step 4: Commit**

  ```bash
  git add src/gym-cycle-tracker.jsx
  git commit -m "feat: add computeNextWorkoutDate and buildTimeline helpers"
  ```

---

### Task 3: Add `UpcomingTimeline` component, Skip button, remove "After That"

**Files:**
- Modify: `src/gym-cycle-tracker.jsx`

- [ ] **Step 1: Add `UpcomingTimeline` component**

  Add this component after `SessionCard` (around line 124), before `GymCycleTracker`:

  ```jsx
  const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  function UpcomingTimeline({ timeline }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {timeline.map((entry, i) => {
          if (entry.type === "rest") {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "#111", borderRadius: 2, opacity: 0.5 }}>
                <div style={{ minWidth: 36 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#333", letterSpacing: 1 }}>{DAY_NAMES[entry.date.getDay()]}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#333", lineHeight: 1.1 }}>{entry.date.getDate()}</div>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2a2a2a", letterSpacing: 1 }}>— REST —</div>
              </div>
            );
          }
          const session = SESSIONS[entry.sessionIndex];
          const isToday = entry.date.getTime() === today.getTime();
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: isToday ? "#1a1a1a" : "#161616", borderLeft: `3px solid ${session.color}`, borderRadius: 2 }}>
              <div style={{ minWidth: 36 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: isToday ? session.color : "#555", letterSpacing: 1 }}>{DAY_NAMES[entry.date.getDay()]}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: isToday ? session.color : "#666", lineHeight: 1.1 }}>{entry.date.getDate()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: isToday ? session.color : "#666", letterSpacing: 1 }}>{session.name.toUpperCase()}</div>
                {isToday && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#555", marginTop: 1 }}>TODAY</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 2: Compute `timeline` in `GymCycleTracker` and remove `nextSession`**

  In `GymCycleTracker`, replace the `nextSession` line (currently `const nextSession = SESSIONS[(currentIndex + 1) % SESSIONS.length];`) with the timeline computation:

  ```jsx
  const timeline = buildTimeline(
    computeNextWorkoutDate(history, skipDays),
    currentIndex
  );
  ```

- [ ] **Step 3: Add the Skip button below "MARK AS DONE"**

  Find the "MARK AS DONE" button (ends around line 237). Add the skip button immediately after it:

  ```jsx
  <button
    onClick={skipDay}
    style={{
      width: "100%", marginTop: 6, padding: "9px",
      background: "none", color: "#555",
      border: "1px solid #222", borderRadius: 2,
      fontFamily: "'DM Mono', monospace", fontSize: 11,
      letterSpacing: 2, cursor: "pointer", textTransform: "uppercase",
    }}
  >
    Skip Day — Push Schedule +1
  </button>
  ```

- [ ] **Step 4: Replace the "After That" section with the Upcoming timeline**

  Find and remove the entire "After That" block:

  ```jsx
  {/* Up next */}
  <div style={{ marginTop: 24 }}>
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 10 }}>After That</div>
    <SessionCard session={nextSession} visitCount={visits[nextSession.id]} mini />
  </div>
  ```

  Replace it with:

  ```jsx
  {/* Upcoming */}
  <div style={{ marginTop: 24 }}>
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 10 }}>Upcoming</div>
    <UpcomingTimeline timeline={timeline} />
  </div>
  ```

- [ ] **Step 5: Verify in the browser**

  ```bash
  npm run dev
  ```

  Open the local URL (usually http://localhost:5173). Verify:
  1. The "After That" mini card is gone; an "Upcoming" timeline appears in its place.
  2. The timeline shows alternating workout (coloured left border, session name) and rest rows.
  3. If the app has history, the first workout row reflects `last history date + 2 days`.
  4. Tapping "Skip Day — Push Schedule +1" shifts all workout dates forward by 1 day.
  5. Tapping "MARK AS DONE" resets `skipDays` to 0 (dates snap back to the default schedule).
  6. Reload the page — the skip offset persists via localStorage.

- [ ] **Step 6: Commit**

  ```bash
  git add src/gym-cycle-tracker.jsx
  git commit -m "feat: add upcoming timeline and skip day button"
  ```
