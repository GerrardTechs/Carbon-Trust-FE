import { useState, useEffect } from "react";
import { API, apiFetch } from "./shared.jsx";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .adm { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-height: 100dvh; background: #0f172a; color: #e2e8f0; }
  .adm-inner { max-width: 430px; margin: 0 auto; min-height: 100dvh; display: flex; flex-direction: column; }
  /* header */
  .adm-header { background: #1e293b; border-bottom: 1px solid #334155; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 20; }
  .adm-logo { display: flex; align-items: center; gap: 10px; }
  .adm-logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg,#166534,#0f766e); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .adm-logo-text { font-size: 14px; font-weight: 800; color: #f1f5f9; }
  .adm-logo-sub { font-size: 10px; color: #64748b; margin-top: 1px; }
  .adm-logout { font-size: 12px; font-weight: 700; color: #ef4444; background: #1c1917; border: 1px solid #3f3f46; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all .15s; font-family: inherit; }
  .adm-logout:hover { background: #450a0a; }
  /* tabs */
  .adm-tabs { display: flex; background: #1e293b; border-bottom: 1px solid #334155; }
  .adm-tab { flex: 1; padding: 11px 0; font-size: 11px; font-weight: 700; color: #64748b; background: none; border: none; cursor: pointer; transition: all .15s; font-family: inherit; letter-spacing: .02em; border-bottom: 2px solid transparent; }
  .adm-tab.active { color: #4ade80; border-bottom-color: #4ade80; }
  /* main */
  .adm-main { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  /* kpi grid */
  .adm-kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .adm-kpi { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 14px; }
  .adm-kpi-icon { font-size: 20px; margin-bottom: 6px; }
  .adm-kpi-val { font-size: 20px; font-weight: 900; color: #f1f5f9; }
  .adm-kpi-label { font-size: 11px; color: #64748b; margin-top: 2px; }
  .adm-kpi-sub { font-size: 10px; color: #475569; margin-top: 1px; }
  /* net banner */
  .adm-net { border-radius: 16px; padding: 18px; color: #fff; }
  .adm-net-label { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; opacity: .7; margin-bottom: 4px; }
  .adm-net-val { font-size: 36px; font-weight: 900; }
  .adm-net-sub { font-size: 12px; opacity: .7; margin-top: 4px; }
  /* section */
  .adm-section { background: #1e293b; border: 1px solid #334155; border-radius: 14px; overflow: hidden; }
  .adm-section-header { padding: 12px 16px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; }
  .adm-section-title { font-size: 13px; font-weight: 700; color: #f1f5f9; }
  .adm-section-sub { font-size: 11px; color: #64748b; }
  /* row */
  .adm-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #1e293b; cursor: pointer; transition: background .15s; }
  .adm-row:last-child { border-bottom: none; }
  .adm-row:hover { background: #0f172a; }
  .adm-rank { font-size: 12px; font-weight: 900; color: #475569; min-width: 20px; }
  .adm-row-name { font-size: 12px; font-weight: 700; color: #e2e8f0; }
  .adm-row-sub { font-size: 11px; color: #64748b; }
  .adm-row-val { font-size: 13px; font-weight: 900; color: #4ade80; margin-left: auto; text-align: right; }
  .adm-row-val-sub { font-size: 10px; color: #475569; }
  /* badge */
  .adm-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
  .adm-badge-green { background: #14532d; color: #4ade80; }
  .adm-badge-amber { background: #451a03; color: #fbbf24; }
  .adm-badge-red   { background: #450a0a; color: #f87171; }
  .adm-badge-blue  { background: #0c2461; color: #60a5fa; }
  /* search */
  .adm-search { width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 10px 16px; font-size: 13px; color: #e2e8f0; font-family: inherit; outline: none; }
  .adm-search:focus { border-color: #4ade80; }
  .adm-search::placeholder { color: #475569; }
  /* company card */
  .adm-company { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 14px; }
  .adm-company-name { font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
  .adm-company-id { font-size: 10px; color: #64748b; font-family: monospace; }
  .adm-company-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin: 10px 0; }
  .adm-company-stat { background: #0f172a; border-radius: 8px; padding: 8px; text-align: center; }
  .adm-company-stat-val { font-size: 13px; font-weight: 800; color: #e2e8f0; }
  .adm-company-stat-label { font-size: 10px; color: #64748b; }
  .adm-company-footer { display: flex; justify-content: space-between; align-items: center; }
  .adm-company-email { font-size: 11px; color: #64748b; }
  .adm-esg { font-size: 11px; font-weight: 700; }
  /* alert */
  .adm-alert { background: #1e293b; border-radius: 12px; padding: 14px; display: flex; gap: 12px; align-items: flex-start; border-left: 3px solid; }
  .adm-alert-critical { border-color: #ef4444; }
  .adm-alert-warning  { border-color: #f59e0b; }
  .adm-alert-info     { border-color: #3b82f6; }
  .adm-alert-icon { font-size: 18px; flex-shrink: 0; }
  .adm-alert-msg { font-size: 12px; color: #e2e8f0; line-height: 1.4; }
  .adm-alert-meta { font-size: 10px; color: #64748b; margin-top: 3px; }
  .adm-empty { text-align: center; padding: 48px 0; }
  .adm-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .adm-empty-text { font-size: 13px; color: #64748b; }
  .fade-up { animation: fadeUp .3s ease forwards; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

export default function AdminApp({ onLogout, user }) {
  const [tab, setTab]         = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [alerts, setAlerts]   = useState([]);

  useEffect(() => {
    apiFetch("/admin/overview").then(d => {
      if (d) { setOverview(d); setAlerts(d.recentAlerts || []); }
      setLoading(false);
    });
  }, []);

  const filtered = (overview?.companies || []).filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toLowerCase().includes(search.toLowerCase())
  );

  const net = overview ? overview.totalAbsorption - overview.totalEmission : 0;

  return (
    <div className="adm">
      <style>{CSS}</style>
      <div className="adm-inner">

        {/* Header */}
        <div className="adm-header">
          <div className="adm-logo">
            <div className="adm-logo-icon">🛡️</div>
            <div>
              <div className="adm-logo-text">Admin Dashboard</div>
              <div className="adm-logo-sub">CarbonTrust Platform · {user?.name || "Super Admin"}</div>
            </div>
          </div>
          <button className="adm-logout" onClick={onLogout}>Logout</button>
        </div>

        {/* Tabs */}
        <div className="adm-tabs">
          {[
            { key:"overview",  label:"Overview"   },
            { key:"companies", label:"Perusahaan" },
            { key:"alerts",    label:"Alerts"     },
          ].map(t => (
            <button key={t.key}
              className={`adm-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="adm-main">
          {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"#64748b" }}>
              Memuat data platform...
            </div>
          ) : !overview ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"#ef4444", fontSize:13 }}>
              Gagal memuat. Cek koneksi BE & endpoint /api/admin/overview.
            </div>
          ) : (
            <>
              {/* ── OVERVIEW ── */}
              {tab === "overview" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }} className="fade-up">

                  <div className="adm-kpi-grid">
                    {[
                      { icon:"🏢", label:"Total Perusahaan",  val:overview.totalCompanies, sub:"terdaftar" },
                      { icon:"🌿", label:"Total Lahan",        val:overview.totalParcels,   sub:"parcel aktif" },
                      { icon:"📊", label:"Serapan / bulan",    val:`${overview.totalAbsorption} t`, sub:"tCO₂e" },
                      { icon:"🏭", label:"Emisi / bulan",      val:`${overview.totalEmission} t`,   sub:"tCO₂e" },
                      { icon:"🎫", label:"Total Kredit",       val:overview.totalCredits?.toLocaleString(), sub:"tCO₂e/yr" },
                      { icon:"✅", label:"ISO Verified",       val:overview.verifiedCount,  sub:"perusahaan" },
                    ].map((k,i) => (
                      <div key={i} className="adm-kpi">
                        <div className="adm-kpi-icon">{k.icon}</div>
                        <div className="adm-kpi-val">{k.val}</div>
                        <div className="adm-kpi-label">{k.label}</div>
                        <div className="adm-kpi-sub">{k.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Net balance */}
                  <div className="adm-net" style={{
                    background: net >= 0
                      ? "linear-gradient(135deg,#14532d,#134e4a)"
                      : "linear-gradient(135deg,#450a0a,#431407)"
                  }}>
                    <div className="adm-net-label">Net Platform Carbon Balance</div>
                    <div className="adm-net-val">{net >= 0 ? "+" : ""}{(net || 0).toFixed(2)}</div>
                    <div className="adm-net-sub">tCO₂e / bulan · seluruh platform</div>
                  </div>

                  {/* Critical alerts */}
                  {overview.alertsCount > 0 && (
                    <div style={{
                      background:"#450a0a", border:"1px solid #7f1d1d",
                      borderRadius:12, padding:"12px 16px",
                      display:"flex", alignItems:"center", gap:12
                    }}>
                      <span style={{ fontSize:22 }}>🚨</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#fca5a5" }}>
                          {overview.alertsCount} Critical Alert Aktif
                        </div>
                        <div style={{ fontSize:11, color:"#f87171", marginTop:2 }}>
                          Perlu tindakan segera
                        </div>
                      </div>
                      <button
                        onClick={() => setTab("alerts")}
                        style={{ fontSize:11, fontWeight:700, color:"#f87171", background:"none", border:"1px solid #7f1d1d", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                        Lihat →
                      </button>
                    </div>
                  )}

                  {/* Top companies */}
                  <div className="adm-section">
                    <div className="adm-section-header">
                      <span className="adm-section-title">Top Perusahaan — Kredit Karbon</span>
                      <span className="adm-section-sub">{overview.companies?.length} total</span>
                    </div>
                    {[...( overview.companies || [])]
                      .sort((a,b) => (b.netCredits||0) - (a.netCredits||0))
                      .slice(0,5)
                      .map((c,i) => (
                        <div key={c.id} className="adm-row">
                          <span className="adm-rank">#{i+1}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="adm-row-name" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                            <div className="adm-row-sub">{c.parcelsCount} lahan · {c.totalArea?.toLocaleString()} ha</div>
                          </div>
                          <div>
                            <div className="adm-row-val">{c.netCredits?.toLocaleString()}</div>
                            <div className="adm-row-val-sub">kredit</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ── COMPANIES ── */}
              {tab === "companies" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="fade-up">
                  <input className="adm-search" placeholder="🔍 Cari perusahaan atau ID..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                  <div style={{ fontSize:11, color:"#64748b" }}>{filtered.length} perusahaan</div>

                  {filtered.map(c => (
                    <div key={c.id} className="adm-company">
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                        <div>
                          <div className="adm-company-name">{c.name}</div>
                          <div className="adm-company-id">{c.id}</div>
                        </div>
                        <span className={`adm-badge ${c.isoCertVerified ? "adm-badge-green" : "adm-badge-amber"}`}>
                          {c.isoCertVerified ? "✅ ISO" : "⏳ Pending"}
                        </span>
                      </div>

                      <div className="adm-company-grid">
                        {[
                          { label:"Lahan",    val:c.parcelsCount },
                          { label:"Serapan",  val:`${c.totalAbsorption}t` },
                          { label:"Kredit",   val:(c.netCredits||0).toLocaleString() },
                        ].map((s,i) => (
                          <div key={i} className="adm-company-stat">
                            <div className="adm-company-stat-val">{s.val}</div>
                            <div className="adm-company-stat-label">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="adm-company-footer">
                        <span className="adm-company-email">{c.email}</span>
                        <span className="adm-esg" style={{
                          color: c.esgScore >= 70 ? "#4ade80" : c.esgScore ? "#fbbf24" : "#64748b"
                        }}>
                          ESG: {c.esgScore ?? "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── ALERTS ── */}
              {tab === "alerts" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="fade-up">
                  <div style={{ fontSize:11, color:"#64748b" }}>Alert aktif di seluruh platform</div>

                  {overview.alertsCount === 0 ? (
                    <div className="adm-empty">
                      <div className="adm-empty-icon">✅</div>
                      <div className="adm-empty-text">Tidak ada critical alert</div>
                    </div>
                  ) : (
                    <div style={{
                      background:"#1e293b", border:"1px solid #334155",
                      borderRadius:12, padding:"14px 16px"
                    }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#f87171", marginBottom:6 }}>
                        🚨 {overview.alertsCount} Critical Alert
                      </div>
                      <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>
                        Detail alert tersedia di dashboard masing-masing perusahaan.
                        Alert dihasilkan otomatis dari perubahan status lahan (flooded, burned, degraded).
                      </div>
                    </div>
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