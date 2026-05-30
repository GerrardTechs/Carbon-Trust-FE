import { useState } from "react";
import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";
import { AuthSwitchLink } from "../components/AuthSwitchLink.jsx";
import { loginUser } from "../api/authApi.js";

export function LoginLandlord({ lang, onBack, onGoToRegister, onSuccess }) {
  const t = LANGS[lang].login;
  const rt = t.landlord;
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.identifier.trim() || !form.password) {
      setError(t.errors.required);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await loginUser({
        identifier: form.identifier,
        password: form.password,
        role: "landlord",
      });

      if (data.success) {
        onSuccess(data.user, data.token);
        return;
      }

      if (data.status === 403) {
        setError(t.errors.wrongRole);
      } else {
        setError(data.message || t.errors.failed);
      }
    } catch {
      setError(t.errors.network);
    }
    setLoading(false);
  }

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="role" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>
          {Icons.arrowLeft} {t.back}
        </button>
        <h2 className="auth-title">{rt.title}</h2>
        <p className="auth-sub">{rt.sub}</p>
        <div className="role-badge" style={{ background: "#ccfbf1", color: G.teal700 }}>
          {Icons.tree(G.teal700)}
          {LANGS[lang].role.landlord.title}
        </div>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
          <div className="field-group">
            <label className="label">{t.identifierLabel}</label>
            <input
              className={`input-field ${error ? "error" : ""}`}
              type="text"
              placeholder={t.identifierPlaceholderLandlord}
              value={form.identifier}
              onChange={e => {
                setForm(prev => ({ ...prev, identifier: e.target.value }));
                setError("");
              }}
              autoComplete="username"
            />
          </div>

          <div className="field-group">
            <label className="label">{t.passwordLabel}</label>
            <div className="pw-wrap">
              <input
                className={`input-field ${error ? "error" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={form.password}
                style={{ paddingRight: 44 }}
                onChange={e => {
                  setForm(prev => ({ ...prev, password: e.target.value }));
                  setError("");
                }}
                autoComplete="current-password"
              />
              <button className="pw-toggle" type="button" onClick={() => setShowPw(prev => !prev)}>
                {showPw ? Icons.eyeOff : Icons.eye}
              </button>
            </div>
          </div>

          {error && <p className="err-msg">{error}</p>}
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ background: `linear-gradient(135deg, ${G.teal700}, ${G.green800})` }}
        >
          {loading ? <span className="spinner" /> : t.btn}
        </button>

        <AuthSwitchLink
          prefix={t.noAccount}
          linkText={t.noAccountLink}
          onClick={onGoToRegister}
        />
      </div>
    </div>
  );
}
