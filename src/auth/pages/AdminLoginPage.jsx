import { useState } from "react";
import { G } from "../constants/tokens.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";
import { adminLogin } from "../api/authApi.js";

export function AdminLoginPage({ lang, onBack, onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const data = await adminLogin(form.username, form.password);
      if (data.success) {
        onSuccess(data.user, data.token);
      } else {
        setError(data.message || (lang === "id" ? "Login gagal" : "Login failed"));
      }
    } catch {
      setError(lang === "id" ? "Tidak bisa terhubung ke server" : "Cannot connect to server");
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
          {Icons.arrowLeft} {lang === "id" ? "Kembali" : "Back"}
        </button>
        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-sub">
          {lang === "id"
            ? "Masuk ke panel kontrol utama CarbonTrust"
            : "Log in to the main CarbonTrust control panel"}
        </p>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32, marginTop: 10 }}>
          <div style={{
            position: "relative",
            width: 96,
            height: 96,
            borderRadius: "50%",
            padding: 4,
            background: G.white,
            border: `2px solid ${G.teal600}`,
            boxShadow: `0 12px 32px -8px ${G.teal700}60`,
          }}>
            <img
              src="/logoadm.png"
              alt="Carbon Trust Logo"
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", backgroundColor: G.white }}
              onError={e => { e.target.style.display = "none"; }}
            />
            <div style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              background: G.slate800,
              color: G.white,
              fontSize: 9,
              fontWeight: 900,
              padding: "4px 10px",
              borderRadius: 999,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}>
              Control
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div className="field-group">
            <label className="label" style={{ color: G.teal700 }}>Username</label>
            <input
              className={`input-field ${error ? "error" : ""}`}
              type="text"
              placeholder={lang === "id" ? "Masukkan username..." : "Enter username..."}
              value={form.username}
              onChange={e => {
                setForm(prev => ({ ...prev, username: e.target.value }));
                setError("");
              }}
            />
          </div>

          <div className="field-group">
            <label className="label" style={{ color: G.teal700 }}>Password</label>
            <input
              className={`input-field ${error ? "error" : ""}`}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => {
                setForm(prev => ({ ...prev, password: e.target.value }));
                setError("");
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              background: G.errBg,
              border: `1.5px solid ${G.err}`,
              borderRadius: 12,
              color: G.err,
              fontSize: 13,
              fontWeight: 700,
            }}>
              {error}
            </div>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: `linear-gradient(135deg, ${G.teal700}, ${G.slate800})`,
            boxShadow: `0 8px 20px -6px ${G.teal700}80`,
          }}
        >
          {loading ? <span className="spinner" /> : (lang === "id" ? "Masuk sebagai Admin →" : "Login as Admin →")}
        </button>
      </div>
    </div>
  );
}
