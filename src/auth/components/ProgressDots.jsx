// ─── Progress Dots (6 steps) ─────────────────────────────────
// steps: welcome(0) role(1) register(2) verify(3) operational(4) calcmethod(5)
const STEP_INDEX = { welcome: 0, role: 1, register: 2, verify: 3, operational: 4, calcmethod: 5, success: 5 };

export function ProgressDots({ step }) {
  const active = STEP_INDEX[step] ?? 0;
  return (
    <div className="progress-dots">
      {[0,1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`dot ${i === active ? "active" : i < active ? "done" : ""}`}
        />
      ))}
    </div>
  );
}