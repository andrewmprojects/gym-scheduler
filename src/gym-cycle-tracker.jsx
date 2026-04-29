import { useState, useEffect } from "react";

const SESSIONS = [
  {
    id: "UA",
    name: "Upper A",
    focus: "Horizontal Push / Pull",
    tag: "Strength Focus",
    color: "#E8C547",
    slots: [
      { label: "Main Push", sets: "4×5", pool: ["Barbell Bench Press", "Incline Barbell Press", "Close-Grip Bench Press", "Dumbbell Bench Press", "Weighted Dip"] },
      { label: "Main Pull", sets: "4×5", pool: ["Barbell Row", "Pendlay Row", "T-Bar Row", "Chest-Supported DB Row", "Seated Cable Row"] },
      { label: "Accessory Push", sets: "3×10", pool: ["Incline DB Press", "Cable Fly", "Pec Deck", "Low-to-High Cable Fly", "DB Pullover"] },
      { label: "Accessory Pull", sets: "3×12", pool: ["Face Pulls", "Rear Delt Fly", "Straight-Arm Pulldown", "Band Pull-Apart", "Reverse Pec Deck"] },
      { label: "Triceps", sets: "3×12", pool: ["Skull Crushers", "Overhead Tricep Extension", "Cable Pushdown", "Tricep Kickback", "JM Press"] },
    ],
  },
  {
    id: "LA",
    name: "Lower A",
    focus: "Squat Dominant",
    tag: "Strength Focus",
    color: "#E8C547",
    slots: [
      { label: "Main Squat", sets: "4×5", pool: ["Back Squat", "Front Squat", "Hack Squat", "Safety Bar Squat", "Pause Squat"] },
      { label: "Quad Accessory", sets: "3×10", pool: ["Bulgarian Split Squat", "Leg Press", "Walking Lunges", "Step-Ups", "Goblet Squat"] },
      { label: "Unilateral", sets: "3×8 ea.", pool: ["Reverse Lunge", "Lateral Lunge", "Single-Leg Press", "Skater Squat", "Deficit Split Squat"] },
      { label: "Hamstrings", sets: "3×12", pool: ["Lying Leg Curl", "Seated Leg Curl", "Nordic Curl", "Single-Leg Curl", "Swiss Ball Leg Curl"] },
      { label: "Calves", sets: "4×15", pool: ["Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise", "Donkey Calf Raise", "Single-Leg Calf Raise"] },
    ],
  },
  {
    id: "UB",
    name: "Upper B",
    focus: "Vertical Push / Pull",
    tag: "Volume Focus",
    color: "#4FC3F7",
    slots: [
      { label: "Main Push", sets: "4×8", pool: ["Barbell Overhead Press", "Seated DB Press", "Arnold Press", "Push Press", "Landmine Press"] },
      { label: "Main Pull", sets: "4×10", pool: ["Lat Pulldown", "Pull-Up", "Neutral Grip Pull-Up", "Single-Arm Pulldown", "Wide-Grip Pull-Up"] },
      { label: "Shoulder Accessory", sets: "3×15", pool: ["Lateral Raises", "Cable Lateral Raise", "Upright Row", "Plate Front Raise", "Leaning Lateral Raise"] },
      { label: "Back Accessory", sets: "3×12", pool: ["Cable Pullover", "DB Pullover", "Rope Pulldown", "Scapular Pull-Up", "Shrugs"] },
      { label: "Biceps", sets: "3×12", pool: ["Barbell Curl", "Hammer Curl", "Incline DB Curl", "Cable Curl", "Preacher Curl"] },
    ],
  },
  {
    id: "LB",
    name: "Lower B",
    focus: "Hinge Dominant",
    tag: "Volume Focus",
    color: "#4FC3F7",
    slots: [
      { label: "Main Hinge", sets: "4×6", pool: ["Romanian Deadlift", "Conventional Deadlift", "Sumo Deadlift", "Trap Bar Deadlift", "Single-Leg RDL"] },
      { label: "Hip Accessory", sets: "3×10", pool: ["Hip Thrust", "Cable Pull-Through", "Kettlebell Swing", "Good Morning", "45° Back Extension"] },
      { label: "Glute Isolation", sets: "3×15", pool: ["Cable Kickback", "Abductor Machine", "Banded Clamshell", "Single-Leg Hip Thrust", "Frog Pump"] },
      { label: "Quad Finish", sets: "3×15", pool: ["Leg Extension", "Sissy Squat", "Spanish Squat", "Wall Sit (weighted)", "Narrow Leg Press"] },
      { label: "Calves", sets: "4×15", pool: ["Standing Calf Raise", "Seated Calf Raise", "Calf Press on Leg Press", "Single-Leg Calf Raise", "Donkey Calf Raise"] },
    ],
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getExercises(session, visitCount) {
  return session.slots.map((slot) => ({
    label: slot.label,
    sets: slot.sets,
    name: slot.pool[visitCount % slot.pool.length],
  }));
}

function SessionCard({ session, visitCount, mini = false }) {
  if (!session) return null;
  const exercises = getExercises(session, visitCount);
  const rotation = (visitCount % 5) + 1;

  return (
    <div style={{ border: "1px solid #1e1e1e", borderLeft: `4px solid ${session.color}`, borderRadius: 2, padding: mini ? "10px 14px" : "22px 24px", background: "#111" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: mini ? 2 : 6 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: mini ? 20 : 38, color: session.color, letterSpacing: 2, lineHeight: 1 }}>
            {session.name}
          </span>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#555", letterSpacing: 1, textTransform: "uppercase" }}>
            {session.tag}
          </span>
        </div>
        {!mini && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", letterSpacing: 1, background: "#161616", padding: "3px 8px", border: "1px solid #222", borderRadius: 2 }}>
            {rotation}/5
          </span>
        )}
      </div>

      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: mini ? 10 : 11, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: mini ? 8 : 18 }}>
        {session.focus}
      </div>

      {!mini ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {exercises.map((ex, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < exercises.length - 1 ? "1px solid #1a1a1a" : "none" }}>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#ddd", fontWeight: 500 }}>{ex.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3a3a3a", letterSpacing: 1, marginTop: 2 }}>{ex.label.toUpperCase()}</div>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: session.color, letterSpacing: 1 }}>{ex.sets}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {exercises.map((ex, i) => (
            <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3a3a3a", background: "#161616", padding: "3px 7px", borderRadius: 2, border: "1px solid #1e1e1e" }}>
              {ex.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GymCycleTracker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visits, setVisits] = useState({ UA: 0, LA: 0, UB: 0, LB: 0 });
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [justDone, setJustDone] = useState(false);
  const [skipDays, setSkipDays] = useState(0);

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

  function skipDay() {
    const next = skipDays + 1;
    setSkipDays(next);
    try {
      localStorage.setItem("gym_skip_days", String(next));
    } catch (_) {}
  }

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

  const currentSession = SESSIONS[currentIndex];
  const nextSession = SESSIONS[(currentIndex + 1) % SESSIONS.length];

  if (!loaded) {
    return (
      <div style={{ background: "#0d0d0d", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", color: "#333", fontSize: 11, letterSpacing: 3 }}>LOADING…</span>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#3a3a3a", textTransform: "uppercase", marginBottom: 4 }}>Upper / Lower Cycle</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>Training Log</div>
        </div>

        {/* Cycle progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {SESSIONS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ height: 3, width: "100%", borderRadius: 2, background: i === currentIndex ? s.color : "#1a1a1a", boxShadow: i === currentIndex ? `0 0 8px ${s.color}55` : "none", transition: "all 0.3s" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1, color: i === currentIndex ? s.color : "#2a2a2a", textTransform: "uppercase" }}>{s.id}</span>
            </div>
          ))}
        </div>

        {/* Session visit counts */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {SESSIONS.map((s) => (
            <div key={s.id} style={{ flex: 1, textAlign: "center", padding: "7px 4px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 2 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: s.color, lineHeight: 1 }}>{visits[s.id]}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#2e2e2e", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{s.id}</div>
            </div>
          ))}
        </div>

        {/* Current session */}
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 10 }}>Next Session</div>
        <SessionCard session={currentSession} visitCount={visits[currentSession.id]} />

        {/* Mark done button */}
        <button
          onClick={markDone}
          style={{
            width: "100%", marginTop: 14, padding: "15px",
            background: justDone ? "transparent" : currentSession.color,
            color: justDone ? "#4caf50" : "#0d0d0d",
            border: justDone ? "2px solid #4caf50" : `2px solid ${currentSession.color}`,
            borderRadius: 2, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, cursor: "pointer", transition: "all 0.2s",
          }}
        >
          {justDone ? "✓  LOGGED" : "MARK AS DONE"}
        </button>

        {/* Up next */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 10 }}>After That</div>
          <SessionCard session={nextSession} visitCount={visits[nextSession.id]} mini />
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 12 }}>History</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {history.map((h, i) => {
                const s = SESSIONS.find((s) => s.id === h.sessionId);
                return (
                  <div key={i} style={{ padding: "10px 14px", background: "#111", borderLeft: `3px solid ${s?.color || "#333"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, color: s?.color }}>{h.sessionName}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444" }}>{formatDate(h.date)}</span>
                    </div>
                    {h.exercises && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {h.exercises.map((ex, j) => (
                          <span key={j} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3a3a3a", background: "#161616", padding: "2px 6px", borderRadius: 2 }}>
                            {ex}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset */}
        {history.length > 0 && (
          <button onClick={reset} style={{ marginTop: 24, background: "none", border: "1px solid #1e1e1e", color: "#333", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, padding: "8px 14px", cursor: "pointer", textTransform: "uppercase", borderRadius: 2 }}>
            Reset Cycle
          </button>
        )}
      </div>
    </>
  );
}
