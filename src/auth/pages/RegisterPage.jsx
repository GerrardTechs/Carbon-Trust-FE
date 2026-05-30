import { useState, useRef, useEffect } from "react";
import { API } from "../../carbontrust/shared.jsx";
import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";
import { pwStrength } from "../utils/passwordStrength.js";
import { generateInstitutionId } from "../utils/institutionId.js";

import { AuthSwitchLink } from "../components/AuthSwitchLink.jsx";

export function RegisterPage({ role, onSubmit, onBack, onGoToLogin, lang }) {
  const [form, setForm] = useState({
    name: "", email: "", username: "", password: "",
    institutionId: "", position: "", customPosition: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const usernameCheckRef = useRef({ lastChecked: "", timer: null });

  const t = LANGS[lang].register;
  const strength = pwStrength(form.password, t);
  const isCompany = role === "company";

  // Auto-generate institution ID whenever company name changes
  function setField(name, value) {
    if (name === "name" && role === "company") {
      const newId = generateInstitutionId(value);
      setForm(prev => ({ ...prev, [name]: value, institutionId: newId }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function copyId() {
    if (!form.institutionId) return;
    navigator.clipboard.writeText(form.institutionId).catch(() => {});
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  }

  function validate() {
    const e = {};
    if (!form.name.trim())                    e.name = t.errors.nameReq;
    if (!/\S+@\S+\.\S+/.test(form.email))     e.email = t.errors.emailInvalid;
    if (!form.username.trim())                e.username = t.errors.usernameReq;
    if (form.password.length < 8)             e.password = t.errors.pwShort;
    if (isCompany && !form.position)          e.position = t.errors.positionReq;
    if (isCompany && form.position === t.positions[5] && !form.customPosition.trim())
                                               e.customPosition = t.errors.customPositionReq;
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    const ok = await onSubmit(form);
    setLoading(false);
    if (ok === false) return;
  }

  function checkUsernameAvailable(name) {
    const u = form[name]?.trim();
    if (!u) return;

    const normalized = u.toLowerCase();
    if (usernameCheckRef.current.lastChecked === normalized) return;

    clearTimeout(usernameCheckRef.current.timer);
    usernameCheckRef.current.timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/auth/check-username?username=${encodeURIComponent(u)}`);
        if (res.status === 429) return;
        const data = await res.json();
        usernameCheckRef.current.lastChecked = normalized;
        if (data.available === false) {
          setErrors(prev => ({
            ...prev,
            username: data.reason === "reserved"
              ? (lang === "id" ? "Username sistem — gunakan nama lain" : "Reserved system username")
              : (lang === "id" ? "Username sudah digunakan" : "Username already taken"),
          }));
        }
      } catch { /* ignore */ }
    }, 500);
  }

  const rt = (LANGS[lang].register[role] || LANGS[lang].register.company);

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="register" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{rt.title}</h2>
        <p className="auth-sub">{rt.sub}</p>
        <div className="role-badge">
          {role === "company" ? Icons.building(G.green800) : Icons.tree(G.teal700)}
          {isCompany ? LANGS[lang].role.company.title : LANGS[lang].role.landlord.title}
        </div>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>

          {/* — Account Info section — */}
          <p className="section-label">Account Info</p>

          {/* Name / Company name */}
          <div className="field-group">
            <label className="label">{isCompany ? t.companyLabel : t.nameLabel}</label>
            <input
              className={`input-field ${errors.name ? "error" : ""}`}
              type="text"
              placeholder={isCompany ? t.companyPlaceholder : t.namePlaceholder}
              value={form.name}
              onChange={e => setField("name", e.target.value)}
            />
            {errors.name && <p className="err-msg">{errors.name}</p>}
          </div>

          {/* Full name (company only - contact person) */}
          {isCompany && (
            <div className="field-group">
              <label className="label">{t.nameLabel}</label>
              <input
                className="input-field"
                type="text"
                placeholder={t.namePlaceholder}
                value={form.contactName || ""}
                onChange={e => setField("contactName", e.target.value)}
              />
            </div>
          )}

          {/* Email */}
          <div className="field-group">
            <label className="label">
              {isCompany ? t.emailLabelCompany : t.emailLabelLandlord}
            </label>
            <input
              className={`input-field ${errors.email ? "error" : ""}`}
              type="email"
              placeholder={isCompany ? t.emailPlaceholderCompany : t.emailPlaceholderLandlord}
              value={form.email}
              onChange={e => setField("email", e.target.value)}
            />
            {errors.email && <p className="err-msg">{errors.email}</p>}
          </div>

          {/* Username */}
          <div className="field-group">
            <label className="label">{t.usernameLabel}</label>
            <input
              className={`input-field ${errors.username ? "error" : ""}`}
              type="text"
              placeholder={t.usernamePlaceholder}
              value={form.username}
              onChange={e => setField("username", e.target.value)}
              onBlur={() => checkUsernameAvailable("username")}
            />
            {errors.username && <p className="err-msg">{errors.username}</p>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="label">{t.passwordLabel}</label>
            <div className="pw-wrap">
              <input
                className={`input-field ${errors.password ? "error" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={form.password}
                style={{ paddingRight: 44 }}
                onChange={e => setField("password", e.target.value)}
              />
              <button className="pw-toggle" type="button" onClick={() => setShowPw(prev => !prev)}>
                {showPw ? Icons.eyeOff : Icons.eye}
              </button>
            </div>
            {form.password && (
              <div>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${strength.score * 25}%`, background: strength.color }} />
                </div>
                <p style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 600 }}>
                  {strength.label}
                </p>
              </div>
            )}
            {errors.password && <p className="err-msg">{errors.password}</p>}
          </div>

          {/* — Institution section (company only) — */}
          {isCompany && (
            <>
              <p className="section-label" style={{ marginTop: 4 }}>Institution</p>

              {/* Institution ID — auto-generated, read-only */}
              <div className="field-group">
                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t.institutionIdLabel}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 999, background: G.green100, color: G.green800,
                    letterSpacing: ".04em", textTransform: "uppercase",
                  }}>Auto</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input-field"
                    type="text"
                    readOnly
                    value={form.institutionId || (lang === "id" ? "Otomatis dari nama PT..." : "Generated from company name...")}
                    style={{
                      background: form.institutionId ? G.green50 : G.slate100,
                      borderColor: form.institutionId ? G.green500 : G.slate200,
                      color: form.institutionId ? G.green800 : G.slate400,
                      fontWeight: form.institutionId ? 700 : 400,
                      fontFamily: form.institutionId ? "monospace" : "inherit",
                      letterSpacing: form.institutionId ? ".06em" : "normal",
                      paddingRight: 80,
                      cursor: "default",
                    }}
                  />
                  {form.institutionId && (
                    <button
                      type="button"
                      onClick={copyId}
                      style={{
                        position: "absolute", right: 10, top: "50%",
                        transform: "translateY(-50%)",
                        background: idCopied ? G.green600 : G.green100,
                        border: "none", borderRadius: 8,
                        padding: "4px 10px", fontSize: 11, fontWeight: 700,
                        color: idCopied ? G.white : G.green800,
                        cursor: "pointer", transition: "all .15s",
                        fontFamily: "inherit",
                      }}
                    >
                      {idCopied ? "✓ Copied" : "Copy"}
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: G.slate400, marginTop: 4 }}>
                  {lang === "id"
                    ? "ID ini otomatis dibuat dari nama perusahaan Anda."
                    : "This ID is automatically generated from your company name."}
                </p>
              </div>

              {/* Position dropdown */}
              <div className="field-group">
                <label className="label">{t.positionLabel}</label>
                <select
                  className={`select-field ${!form.position ? "placeholder" : ""} ${errors.position ? "error" : ""}`}
                  value={form.position}
                  onChange={e => setField("position", e.target.value)}
                >
                  <option value="">{t.positionPlaceholder}</option>
                  {t.positions.map((pos, i) => (
                    <option key={i} value={pos}>{pos}</option>
                  ))}
                </select>
                {errors.position && <p className="err-msg">{errors.position}</p>}
              </div>

              {/* Custom position — shown when "Other" selected */}
              {form.position === t.positions[5] && (
                <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
                  <label className="label" style={{ color: G.green700 }}>Your Position</label>
                  <input
                    className={`input-field ${errors.customPosition ? "error" : ""}`}
                    style={{ borderColor: errors.customPosition ? G.err : G.green500, boxShadow: `0 0 0 3px ${G.green100}` }}
                    type="text"
                    placeholder={t.customPositionPlaceholder}
                    value={form.customPosition}
                    onChange={e => setField("customPosition", e.target.value)}
                    autoFocus
                  />
                  {errors.customPosition && <p className="err-msg">{errors.customPosition}</p>}
                </div>
              )}
            </>
          )}
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="spinner" /> : t.createBtn}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: G.slate400, marginTop: 16 }}>
          {t.otpNote}
        </p>

        <AuthSwitchLink
          prefix={t.hasAccount}
          linkText={t.hasAccountLink}
          onClick={onGoToLogin}
        />
      </div>
    </div>
  );
}