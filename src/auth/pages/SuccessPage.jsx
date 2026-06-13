import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
export function SuccessPage({ role, name, lang }) {
  const t = LANGS[lang].success;
  const m = t[role] || t.company;
  return (
    <div className="shell">
      <div className="success-screen">
        <div className="success-ring">{Icons.check}</div>
        <h2 className="success-title">{m.title}</h2>
        <p style={{ fontSize: 16, color: G.green700, fontWeight: 700, marginBottom: 8 }}>
          {t.welcome} {name}
        </p>
        <p className="success-sub">{m.sub}</p>
        <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
          <span className="pill pill-green">{t.verified}</span>
          <span className="pill pill-teal">ISO 14064</span>
        </div>
      </div>
      <div style={{ padding: "0 28px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.green500, animation: "spin 1s linear infinite", borderTop: `2px solid ${G.green100}` }} />
          <span style={{ fontSize: 13, color: G.slate600 }}>{t.loading}</span>
        </div>
      </div>
    </div>
  );
}