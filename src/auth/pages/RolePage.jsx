import { useState } from "react";
import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";
export function RolePage({ onSelect, onGuest, onBack, lang }) {
  const [selected, setSelected] = useState(null);
  const t = LANGS[lang].role;

  const ROLES = [
    { id: "company",  title: t.company.title,  desc: t.company.desc,  icon: Icons.building, iconBg: "role-icon-green" },
    { id: "landlord", title: t.landlord.title, desc: t.landlord.desc, icon: Icons.tree,     iconBg: "role-icon-teal"  },
  ];

  const selectedRole = ROLES.find(roleItem => roleItem.id === selected);

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="role" />
      </div>

      <div className="role-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="role-title">{t.title}</h2>
        <p className="role-sub">{t.sub}</p>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {ROLES.map(role => (
            <div
              key={role.id}
              className={`role-card ${selected === role.id ? "active" : ""}`}
              onClick={() => setSelected(role.id)}
            >
              <div className={`role-icon ${role.iconBg}`}>
                {role.icon()}
              </div>
              <div style={{ flex: 1 }}>
                <p className="role-card-title">{role.title}</p>
                <p className="role-card-desc">{role.desc}</p>
              </div>
              <div className="role-radio">
                <div className="role-radio-dot" />
              </div>
            </div>
          ))}

          {/* Tambah setelah card Landlord */}
          <button 
            className="role-card" 
            onClick={() => onSelect("admin")}
            style={{ textAlign: "left", background: "white", border: "1px solid var(--border-color, #e2e8f0)", cursor: "pointer", width: "100%", padding: "16px", fontFamily: "inherit" }}
          >
            <div className="role-icon" style={{ background:"#fef3c7" }}>
              🛡️
            </div>
            <div style={{ flex: 1 }}>
              <p className="role-card-title">Admin</p>
              <p className="role-card-desc">
                {lang === "id" 
                  ? "Pantau seluruh platform — perusahaan, lahan, emisi & kredit karbon." 
                  : "Monitor the entire platform — companies, parcels, emissions & carbon credits."}
              </p>
            </div>
          </button>
        </div>

        <button
          className="btn-primary"
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          {t.continueAs} {selectedRole ? selectedRole.title : "..."}
        </button>

        <div style={{ marginTop: 8 }}>
          <div className="divider" style={{ margin: "16px 0" }}>or</div>
          <a href="#" className="guest-link" onClick={e => { e.preventDefault(); onGuest(); }}>
            {t.guest}
          </a>
          <p style={{ textAlign: "center", fontSize: 11, color: G?.slate400 || "#94a3b8", marginTop: 4 }}>
            {t.guestSub}
          </p>
        </div>
      </div>
    </div>
  );
}