import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "./shared.jsx";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .adm { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-height: 100dvh; background: #0f172a; color: #e2e8f0; }
  .adm-inner { max-width: 480px; margin: 0 auto; min-height: 100dvh; display: flex; flex-direction: column; }
  .adm-header { background: linear-gradient(135deg,#1e293b,#0f172a); border-bottom: 1px solid #334155; padding: 16px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 20; }
  .adm-logo { display: flex; align-items: center; gap: 12px; }
  .adm-logo-img { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; border: 2px solid #14b8a6; background: #fff; }
  .adm-logo-text { font-size: 15px; font-weight: 900; color: #f8fafc; letter-spacing: -.02em; }
  .adm-logo-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; letter-spacing: .06em; }
  .adm-logout { font-size: 12px; font-weight: 700; color: #fecaca; background: #450a0a; border: 1px solid #7f1d1d; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-family: inherit; }
  .adm-tabs { display: flex; background: #1e293b; border-bottom: 1px solid #334155; overflow-x: auto; }
  .adm-tab { flex: 1; min-width: 72px; padding: 12px 4px; font-size: 10px; font-weight: 800; color: #64748b; background: none; border: none; cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent; text-transform: uppercase; letter-spacing: .04em; }
  .adm-tab.active { color: #4ade80; border-bottom-color: #4ade80; }
  .adm-main { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .adm-kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .adm-kpi { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 14px; }
  .adm-kpi-val { font-size: 22px; font-weight: 900; color: #f8fafc; }
  .adm-kpi-label { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  .adm-net { border-radius: 18px; padding: 20px; color: #fff; }
  .adm-section { background: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; }
  .adm-section-header { padding: 12px 16px; border-bottom: 1px solid #334155; }
  .adm-section-title { font-size: 13px; font-weight: 800; color: #f1f5f9; }
  .adm-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #0f172a; }
  .adm-company { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 14px; }
  .adm-company-name { font-size: 14px; font-weight: 800; color: #f1f5f9; }
  .adm-company-id { font-size: 10px; color: #64748b; font-family: monospace; margin-top: 2px; }
  .adm-badge { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 999px; }
  .adm-badge-green { background: #14532d; color: #4ade80; }
  .adm-badge-amber { background: #451a03; color: #fbbf24; }
  .adm-badge-blue { background: #0c2461; color: #60a5fa; }
  .adm-search { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 11px 14px; font-size: 13px; color: #e2e8f0; font-family: inherit; outline: none; }
  .adm-search:focus { border-color: #4ade80; }
  .adm-btn { font-size: 11px; font-weight: 800; padding: 8px 12px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; }
  .adm-btn-approve { background: #14532d; color: #4ade80; border: 1px solid #166534; }
  .adm-btn-reject { background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; margin-left: 6px; }
  .adm-alert { background: #1e293b; border-radius: 12px; padding: 12px; border-left: 3px solid #ef4444; margin-bottom: 8px; }
  .adm-filter { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
  .adm-filter-btn { font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 999px; border: 1px solid #334155; background: #0f172a; color: #94a3b8; cursor: pointer; font-family: inherit; }
  .adm-filter-btn.active { background: #14532d; color: #4ade80; border-color: #166534; }
  .fade-up { animation: fadeUp .3s ease forwards; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

export default function AdminApp({ onLogout, user }) {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionMsg, setActionMsg] = useState("");

  const loadOverview = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/overview").then(data => {
      if (data && data.totalCompanies !== undefined) setOverview(data);
      else setOverview(null);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  async function verifyIso(companyId, approved) {
    const data = await apiFetch(`/admin/company/${companyId}/verify-iso`, {
      method: "PATCH",
      body: JSON.stringify({ approved, note: approved ? "Verified by admin" : "Rejected by admin" }),
    });
    if (data?.success) {
      setActionMsg(approved ? "ISO disetujui" : "ISO ditolak");
      loadOverview();
      setTimeout(() => setActionMsg(""), 2500);
    }
  }

  const companies = overview?.companies || [];
  const filtered = companies.filter(comp => {
    const matchSearch =
      comp.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(comp.id || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || comp.role === roleFilter;
    return matchSearch && matchRole;
  });

  const net = overview ? (overview.totalAbsorption || 0) - (overview.totalEmission || 0) : 0;

  return (
    <div className="adm">
      <style>{CSS}</style>
      <div className="adm-inner">
        <div className="adm-header">
          <div className="adm-logo">
            <img src="/logoadm.png" alt="Admin" className="adm-logo-img" onError={e => { e.target.style.display = "none"; }} />
            <div>
              <div className="adm-logo-text">Admin Control</div>
              <div className="adm-logo-sub">CarbonTrust · {user?.name || "Administrator"}</div>
            </div>
          </div>
          <button type="button" className="adm-logout" onClick={onLogout}>Logout</button>
        </div>

        <div className="adm-tabs">
          {[
            { key: "overview", label: "Overview" },
            { key: "companies", label: "Akun" },
            { key: "alerts", label: "Alerts" },
          ].map(tabItem => (
            <button
              key={tabItem.key}
              type="button"
              className={`adm-tab ${tab === tabItem.key ? "active" : ""}`}
              onClick={() => setTab(tabItem.key)}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="adm-main">
          {actionMsg && (
            <div style={{ background: "#14532d", color: "#4ade80", padding: "10px 14px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
              ✓ {actionMsg}
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: "center", padding: "48px 0", color: "#64748b", fontSize: 13 }}>Memuat data platform...</p>
          ) : !overview ? (
            <p style={{ textAlign: "center", padding: "48px 0", color: "#f87171", fontSize: 13 }}>
              Gagal memuat. Pastikan BE berjalan dan Anda login sebagai admin.
            </p>
          ) : (
            <>
              {tab === "overview" && (
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="adm-kpi-grid">
                    {[
                      { label: "Perusahaan", val: overview.totalCompanies },
                      { label: "Lahan", val: overview.totalParcels },
                      { label: "Serapan/bln", val: `${overview.totalAbsorption} t` },
                      { label: "Emisi/bln", val: `${overview.totalEmission} t` },
                      { label: "Kredit/thn", val: (overview.totalCredits || 0).toLocaleString() },
                      { label: "ISO OK", val: overview.verifiedCount },
                    ].map((kpi, i) => (
                      <div key={i} className="adm-kpi">
                        <div className="adm-kpi-val">{kpi.val}</div>
                        <div className="adm-kpi-label">{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="adm-net"
                    style={{
                      background: net >= 0
                        ? "linear-gradient(135deg,#14532d,#134e4a)"
                        : "linear-gradient(135deg,#450a0a,#431407)",
                    }}
                  >
                    <p style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: ".08em" }}>Net Platform Balance</p>
                    <p style={{ fontSize: 36, fontWeight: 900, marginTop: 4 }}>{net >= 0 ? "+" : ""}{(net || 0).toFixed(2)} tCO₂e/bln</p>
                  </div>

                  {overview.alertsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setTab("alerts")}
                      style={{
                        background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 14,
                        padding: 14, textAlign: "left", cursor: "pointer", color: "#fca5a5", fontFamily: "inherit",
                      }}
                    >
                      <strong style={{ fontSize: 14 }}>🚨 {overview.alertsCount} alert aktif</strong>
                      <p style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>Ketuk untuk detail</p>
                    </button>
                  )}

                  <div className="adm-section">
                    <div className="adm-section-header">
                      <div className="adm-section-title">Top — Kredit Karbon</div>
                    </div>
                    {[...companies]
                      .sort((a, b) => (b.netCredits || 0) - (a.netCredits || 0))
                      .slice(0, 5)
                      .map((comp, i) => (
                        <div key={comp.id} className="adm-row">
                          <span style={{ fontWeight: 900, color: "#475569", minWidth: 24 }}>#{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{comp.name}</p>
                            <p style={{ fontSize: 10, color: "#64748b" }}>{comp.role} · {comp.parcelsCount} lahan</p>
                          </div>
                          <span style={{ fontWeight: 900, color: "#4ade80", fontSize: 13 }}>{(comp.netCredits || 0).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {tab === "companies" && (
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    className="adm-search"
                    placeholder="Cari nama, email, atau ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="adm-filter">
                    {[
                      { key: "all", label: "Semua" },
                      { key: "company", label: "Company" },
                      { key: "landlord", label: "Landlord" },
                    ].map(f => (
                      <button
                        key={f.key}
                        type="button"
                        className={`adm-filter-btn ${roleFilter === f.key ? "active" : ""}`}
                        onClick={() => setRoleFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#64748b" }}>{filtered.length} akun</p>

                  {filtered.map(comp => (
                    <div key={comp.id} className="adm-company">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <div className="adm-company-name">{comp.name}</div>
                          <div className="adm-company-id">{comp.id}</div>
                          <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{comp.email}</p>
                        </div>
                        <span className={`adm-badge ${comp.isoCertVerified ? "adm-badge-green" : "adm-badge-amber"}`}>
                          {comp.isoCertVerified ? "ISO ✓" : "ISO ⏳"}
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, margin: "12px 0" }}>
                        <div style={{ background: "#0f172a", borderRadius: 8, padding: 8, textAlign: "center" }}>
                          <p style={{ fontSize: 13, fontWeight: 800 }}>{comp.parcelsCount}</p>
                          <p style={{ fontSize: 10, color: "#64748b" }}>Lahan</p>
                        </div>
                        <div style={{ background: "#0f172a", borderRadius: 8, padding: 8, textAlign: "center" }}>
                          <p style={{ fontSize: 13, fontWeight: 800 }}>{comp.totalAbsorption}t</p>
                          <p style={{ fontSize: 10, color: "#64748b" }}>Serap</p>
                        </div>
                        <div style={{ background: "#0f172a", borderRadius: 8, padding: 8, textAlign: "center" }}>
                          <p style={{ fontSize: 13, fontWeight: 800 }}>{(comp.netCredits || 0).toLocaleString()}</p>
                          <p style={{ fontSize: 10, color: "#64748b" }}>Kredit</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <span className={`adm-badge adm-badge-blue`}>{comp.role || "company"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: comp.esgScore >= 70 ? "#4ade80" : "#94a3b8" }}>
                          ESG: {comp.esgScore ?? "—"}
                        </span>
                      </div>

                      {!comp.isoCertVerified && comp.role === "company" && (
                        <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                          <button type="button" className="adm-btn adm-btn-approve" onClick={() => verifyIso(comp.id, true)}>
                            ✓ Verifikasi ISO
                          </button>
                          <button type="button" className="adm-btn adm-btn-reject" onClick={() => verifyIso(comp.id, false)}>
                            ✕ Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "alerts" && (
                <div className="fade-up">
                  <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>
                    {overview.alertsCount} alert dari seluruh lahan
                  </p>
                  {(overview.recentAlerts || []).length === 0 ? (
                    <p style={{ textAlign: "center", padding: 40, color: "#64748b", fontSize: 13 }}>Tidak ada alert aktif</p>
                  ) : (
                    overview.recentAlerts.map((alertItem, i) => (
                      <div key={alertItem._id || i} className="adm-alert">
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5" }}>{alertItem.type?.toUpperCase()}</p>
                        <p style={{ fontSize: 12, color: "#e2e8f0", marginTop: 4, lineHeight: 1.4 }}>{alertItem.message}</p>
                        <p style={{ fontSize: 10, color: "#64748b", marginTop: 6 }}>
                          {alertItem.companyName} · {alertItem.parcelName}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
