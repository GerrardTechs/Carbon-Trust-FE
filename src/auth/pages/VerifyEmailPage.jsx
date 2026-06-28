import { useState, useEffect, useRef } from "react";
import { API } from "../../carbontrust/shared.jsx";
import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";


export function VerifyEmailPage({ email, role, userData, onVerified, onBack, onResend, lang, initialToken = "" }) {
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [resendCd, setResendCd] = useState(30);
  const [resent, setResent] = useState(false);
  const autoSubmitted = useRef(false);

  const t = LANGS[lang].verify;

  function normalizeToken(value) {
    return String(value || "").trim().toUpperCase();
  }

  useEffect(() => {
    if (resendCd <= 0) return;
    const id = setTimeout(() => setResendCd(prev => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCd]);

  useEffect(() => {
    if (initialToken && initialToken.length >= 8 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      submitToken(initialToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitToken(code) {
    const trimmed = normalizeToken(code || token);
    if (trimmed.length < 8) {
      setErrMsg(t.invalidCode);
      return;
    }
    setLoading(true);
    setErrMsg("");
    try {
      const res = await fetch(`${API}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: trimmed, email }),
      });
      const data = await res.json();
      if (data.success) {
        onVerified(data.verificationToken, data);
      } else {
        setErrMsg(data.message || t.invalidCode);
      }
    } catch {
      setErrMsg(lang === "id" ? "Tidak bisa terhubung ke server" : "Cannot reach server");
    }
    setLoading(false);
  }

  async function resend() {
    if (resendCd > 0 || !onResend) return;
    setResent(false);
    const ok = await onResend();
    if (ok) {
      setResent(true);
      setResendCd(60);
      setTimeout(() => setResent(false), 3000);
    }
  }

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="verify" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{t.title}</h2>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: G.green100, border: `1.5px solid ${G.green500}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Icons.mail}
          </div>
        </div>

        <p className="otp-desc">
          {t.desc}{" "}
          <span className="otp-email">{email}</span>{t.desc2}
        </p>

        <div className="field-group" style={{ marginTop: 20 }}>
          <label className="label">{t.tokenLabel}</label>
          <input
            className={`input-field ${errMsg ? "error" : ""}`}
            type="text"
            placeholder={t.tokenPlaceholder}
            value={token}
            onChange={e => { setToken(normalizeToken(e.target.value)); setErrMsg(""); }}
            autoComplete="one-time-code"
          />
        </div>

        {errMsg && <p className="err-msg" style={{ textAlign: "center", marginTop: 10 }}>{errMsg}</p>}

        <div style={{ marginTop: 28 }}>
          {loading ? (
            <button className="btn-primary" disabled><span className="spinner" /></button>
          ) : (
            <button className="btn-primary" disabled={token.length < 8} onClick={() => submitToken(token)}>
              {t.btn}
            </button>
          )}
        </div>

        <div className="resend-row">
          <span>{t.didntReceive}</span>
          <button className="resend-btn" onClick={resend} disabled={resendCd > 0}>
            {resendCd > 0 ? `${t.resendIn} ${resendCd}s` : t.resend}
          </button>
        </div>
        {resent && <p style={{ textAlign: "center", fontSize: 12, color: G.green600, marginTop: 8, fontWeight: 600 }}>{t.codeResent}</p>}
        <p style={{ textAlign: "center", fontSize: 11, color: G.slate400, marginTop: 20, lineHeight: 1.5 }}>
          {t.spamNote}
        </p>
        {role === "company" && (
          <p style={{ textAlign: "center", fontSize: 11, color: G.green700, marginTop: 12, fontWeight: 600 }}>
            {lang === "id" ? "Setelah verifikasi, lanjut isi data operasional perusahaan." : "After verification, continue with your company profile."}
          </p>
        )}
      </div>
    </div>
  );
}