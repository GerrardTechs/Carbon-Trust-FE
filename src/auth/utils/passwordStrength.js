import { G } from "../constants/tokens.js";

export function pwStrength(pw, t) {
  if (!pw) return { score: 0, label: "", color: G.slate200 };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { score: 0, label: "",             color: G.slate200 },
    { score: 1, label: t.strength.weak,   color: G.err      },
    { score: 2, label: t.strength.fair,   color: "#f97316"  },
    { score: 3, label: t.strength.good,   color: "#eab308"  },
    { score: 4, label: t.strength.strong, color: G.green600 },
  ];
  return map[s];
}