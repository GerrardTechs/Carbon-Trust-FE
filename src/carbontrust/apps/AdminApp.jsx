import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../shared.jsx";

// ─── Shield SVG Logo ─────────────────────────────────────────────────────────
const ShieldLogo = ({ size = 48 }) => (
  <img 
    src="/logoadm.png" 
    alt="Shield Logo Administrator" 
    style={{ width: size, height: size, objectFit: 'contain' }} 
  />
);


export default function AdminApp({ onLogout, user }) {
  const [tab, setTab]           = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionMsg, setActionMsg]   = useState("");

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
      setActionMsg(approved ? "✅ Sertifikat ISO disetujui" : "❌ Sertifikat ISO ditolak");
      loadOverview();
      setTimeout(() => setActionMsg(""), 3000);
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
    <div style={{ minHeight:"100dvh", background:"#f1f5f9", fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif", color:"#1e293b" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .adm-fade { animation: fadeIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px) translateX(-50%); } to { opacity:1; transform:translateY(0) translateX(-50%); } }
        .adm-toast-anim { animation: slideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .adm-spin { animation: spin 0.8s linear infinite; }
        @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
        .adm-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
        @keyframes pulse { 50% { opacity:.5; } }
        .adm-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .adm-hide-scroll::-webkit-scrollbar { display:none; }
        .adm-hide-scroll { -ms-overflow-style:none; scrollbar-width:none; }
        .adm-tab-btn { flex:1; min-width:72px; padding:12px 4px; font-size:11px; font-weight:800; background:none; border:none; cursor:pointer; font-family:inherit; border-bottom:2px solid transparent; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; white-space:nowrap; transition:color .15s; }
        .adm-tab-btn.active { color:#0f766e; border-bottom-color:#0f766e; }
        .adm-tab-btn:hover:not(.active) { color:#64748b; }
        .adm-kpi-card { background:#fff; border-radius:24px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,.06); padding:16px; position:relative; overflow:hidden; }
        .adm-company-card { background:#fff; border:1px solid #f1f5f9; border-radius:24px; box-shadow:0 1px 4px rgba(0,0,0,.06); padding:20px; transition:box-shadow .15s; }
        .adm-company-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
        .adm-btn-approve { flex:1; background:#0f766e; color:#fff; border:none; border-radius:12px; padding:12px; font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:background .15s; }
        .adm-btn-approve:hover { background:#115e59; }
        .adm-btn-reject { flex:1; background:#fff; color:#e11d48; border:1px solid #fecdd3; border-radius:12px; padding:12px; font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; transition:background .15s; }
        .adm-btn-reject:hover { background:#fff1f2; }
        .adm-input { width:100%; padding:14px 14px 14px 44px; background:#fff; border:1px solid #e2e8f0; border-radius:16px; font-size:14px; font-weight:600; font-family:inherit; outline:none; color:#0f172a; box-shadow:0 1px 3px rgba(0,0,0,.05); transition:border-color .15s, box-shadow .15s; }
        .adm-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,.1); }
        .adm-filter-btn { padding:8px 14px; border-radius:10px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; cursor:pointer; font-family:inherit; transition:all .15s; flex-shrink:0; border:1px solid #e2e8f0; background:#fff; color:#94a3b8; }
        .adm-filter-btn.active { background:#0f766e; color:#fff; border-color:#0f766e; box-shadow:0 2px 8px rgba(15,118,110,.25); }
        .adm-alert-card { background:#fff; border-left:4px solid #ef4444; border-top:1px solid #f1f5f9; border-right:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; border-radius:0 20px 20px 0; padding:20px; box-shadow:0 1px 4px rgba(0,0,0,.06); position:relative; overflow:hidden; }
        .adm-logout-btn { font-size:10px; font-weight:800; color:#e11d48; background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:8px 14px; cursor:pointer; font-family:inherit; text-transform:uppercase; letter-spacing:.06em; transition:all .15s; }
        .adm-logout-btn:hover { background:#ffe4e6; transform:scale(1.03); }
      `}</style>

      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100dvh", display:"flex", flexDirection:"column", background:"#f8fafc", boxShadow:"0 0 60px rgba(0,0,0,.12)", position:"relative", overflow:"hidden" }}>

        {/* Toast */}
        {actionMsg && (
          <div className="adm-toast-anim" style={{
            position:"absolute", top:76, left:"50%", zIndex:50,
            background:"#134e4a", color:"#fff", padding:"10px 20px",
            borderRadius:16, boxShadow:"0 8px 32px rgba(0,0,0,.18)",
            fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:8,
            border:"1px solid #0d9488", whiteSpace:"nowrap"
          }}>
            {actionMsg}
          </div>
        )}

        {/* ── Header ── */}
        <div style={{
          background:"#fff", borderBottom:"1px solid #e2e8f0",
          padding:"12px 18px", display:"flex", alignItems:"center",
          justifyContent:"space-between", position:"sticky", top:0, zIndex:20
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <ShieldLogo size={48} />
            <div>
              <div style={{ fontSize:15, fontWeight:900, color:"#0f172a", letterSpacing:"-.02em" }}>Admin Control</div>
              <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginTop:2 }}>
                CarbonTrust · {user?.username || "Root"}
              </div>
            </div>
          </div>
          <button className="adm-logout-btn" onClick={onLogout}>Logout</button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", overflowX:"auto", position:"relative", zIndex:10 }} className="adm-hide-scroll">
          {[
            { key:"overview",  label:"Overview"       },
            { key:"companies", label:"Manajemen Akun" },
            { key:"alerts",    label:"Sistem Alerts"  },
          ].map(t => (
            <button key={t.key} className={`adm-tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
              {t.key === "alerts" && (overview?.alertsCount > 0) && (
                <span style={{ marginLeft:4, background:"#ef4444", color:"#fff", fontSize:9, fontWeight:900, padding:"1px 5px", borderRadius:99 }}>
                  {overview.alertsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:256, gap:16 }}>
              <div className="adm-spin" style={{ width:32, height:32, border:"4px solid #e2e8f0", borderTopColor:"#0f766e", borderRadius:"50%" }} />
              <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em" }}>Sinkronisasi Data...</p>
            </div>
          ) : !overview ? (
            <div style={{ padding:32, textAlign:"center", marginTop:40 }}>
              <div style={{ width:64, height:64, background:"#fff1f2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg style={{ width:32, height:32, color:"#e11d48" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p style={{ fontSize:14, fontWeight:700, color:"#334155" }}>Koneksi Server Gagal</p>
              <p style={{ fontSize:12, color:"#94a3b8", marginTop:8 }}>Pastikan backend berjalan dan Anda memiliki akses admin.</p>
              <button onClick={loadOverview} style={{ marginTop:16, padding:"10px 20px", background:"#0f766e", color:"#fff", border:"none", borderRadius:12, fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>
                Coba Lagi
              </button>
            </div>
          ) : (
            <div style={{ padding:16 }}>

              {/* ══════ OVERVIEW ══════ */}
              {tab === "overview" && (
                <div className="adm-fade" style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:40 }}>

                  {/* KPI Grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"Perusahaan Aktif",   val: overview.totalCompanies                               },
                      { label:"Total Lahan",         val: overview.totalParcels                                 },
                      { label:"Serapan / Bulan",     val: `${overview.totalAbsorption ?? 0} t`                 },
                      { label:"Emisi / Bulan",       val: `${overview.totalEmission ?? 0} t`                   },
                      { label:"Total Kredit / Tahun",val: (overview.totalCredits || 0).toLocaleString()        },
                      { label:"Sertifikasi ISO OK",  val: overview.verifiedCount                               },
                    ].map((kpi, i) => (
                      <div key={i} className="adm-kpi-card">
                        <div style={{ position:"absolute", right:-12, top:-12, width:56, height:56, background:"#f8fafc", borderRadius:"50%", opacity:.6 }} />
                        <div style={{ position:"relative", zIndex:1 }}>
                          <div style={{ fontSize:22, fontWeight:900, color:"#0f172a", letterSpacing:"-.03em" }}>{kpi.val ?? "—"}</div>
                          <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", marginTop:6 }}>{kpi.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Net Balance */}
                  <div style={{
                    borderRadius:24, padding:24, color:"#fff", position:"relative", overflow:"hidden",
                    background: net >= 0
                      ? "linear-gradient(135deg,#0f766e,#065f46)"
                      : "linear-gradient(135deg,#dc2626,#991b1b)"
                  }}>
                    <div style={{ position:"absolute", top:0, right:0, marginRight:-32, marginTop:-32, width:120, height:120, background:"rgba(255,255,255,.08)", borderRadius:"50%", filter:"blur(24px)" }} />
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", opacity:.75, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                      <svg style={{ width:14, height:14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
                      </svg>
                      Net Platform Balance
                    </p>
                    <div style={{ fontSize:36, fontWeight:900, letterSpacing:"-.04em", display:"flex", alignItems:"baseline", gap:6 }}>
                      {net >= 0 ? "+" : ""}{(net || 0).toLocaleString("id-ID", { minimumFractionDigits:2, maximumFractionDigits:2 })}
                      <span style={{ fontSize:13, fontWeight:600, opacity:.8 }}>tCO₂e/bln</span>
                    </div>
                  </div>

                  {/* Alert Banner */}
                  {overview.alertsCount > 0 && (
                    <button type="button" onClick={() => setTab("alerts")} style={{
                      width:"100%", background:"#fff", border:"1px solid #fecdd3",
                      borderLeft:"5px solid #ef4444", borderRadius:"0 20px 20px 0",
                      padding:"14px 16px", textAlign:"left", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      boxShadow:"0 1px 4px rgba(0,0,0,.06)", transition:"background .15s", fontFamily:"inherit"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background="#fff1f2"}
                    onMouseLeave={e => e.currentTarget.style.background="#fff"}>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:36, height:36, background:"#fff1f2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                          <span className="adm-ping" style={{ position:"absolute", display:"inline-flex", width:14, height:14, borderRadius:"50%", background:"#fca5a5", opacity:.75 }} />
                          <span style={{ position:"relative", display:"inline-flex", width:14, height:14, borderRadius:"50%", background:"#ef4444" }} />
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:800, color:"#be123c" }}>{overview.alertsCount} Sistem Alert Aktif</div>
                          <div style={{ fontSize:10, fontWeight:700, color:"#f87171", textTransform:"uppercase", letterSpacing:".06em", marginTop:2 }}>Perlu perhatian segera di lahan</div>
                        </div>
                      </div>
                      <svg style={{ width:20, height:20, color:"#fca5a5" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  )}

                  {/* Top Kredit */}
                  <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:24, boxShadow:"0 1px 4px rgba(0,0,0,.06)", overflow:"hidden" }}>
                    <div style={{ background:"#f8fafc", borderBottom:"1px solid #f1f5f9", padding:"14px 20px", display:"flex", alignItems:"center", gap:8 }}>
                      <svg style={{ width:16, height:16, color:"#0f766e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                      <span style={{ fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:".06em" }}>Peringkat Top Kredit Karbon</span>
                    </div>
                    <div>
                      {[...companies]
                        .sort((a, b) => (b.netCredits || 0) - (a.netCredits || 0))
                        .slice(0, 5)
                        .map((comp, i) => (
                          <div key={comp.id} style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:14, borderBottom: i < 4 ? "1px solid #f8fafc" : "none" }}>
                            <div style={{ fontSize:17, fontWeight:900, color:"#cbd5e1", width:24, textAlign:"center" }}>#{i+1}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:13, fontWeight:700, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{comp.name}</p>
                              <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginTop:3 }}>
                                {comp.role === "company" ? "Perusahaan" : "Pemilik Lahan"} · {comp.parcelsCount} area
                              </p>
                            </div>
                            <div style={{ fontSize:13, fontWeight:800, color:"#0f766e", background:"#f0fdf4", padding:"4px 10px", borderRadius:10, border:"1px solid #dcfce7" }}>
                              {(comp.netCredits || 0).toLocaleString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════ COMPANIES ══════ */}
              {tab === "companies" && (
                <div className="adm-fade" style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:40 }}>

                  {/* Search */}
                  <div style={{ position:"relative" }}>
                    <input type="text" className="adm-input"
                      placeholder="Cari nama perusahaan atau ID..."
                      value={search}
                      onChange={e => setSearch(e.target.value)} />
                    <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", width:18, height:18, color:"#94a3b8", pointerEvents:"none" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>

                  {/* Role Filter */}
                  <div style={{ display:"flex", gap:8, overflowX:"auto" }} className="adm-hide-scroll">
                    {[
                      { key:"all",      label:"Semua Akun"   },
                      { key:"company",  label:"Perusahaan"   },
                      { key:"landlord", label:"Pemilik Lahan"},
                    ].map(f => (
                      <button key={f.key} className={`adm-filter-btn ${roleFilter === f.key ? "active" : ""}`}
                        onClick={() => setRoleFilter(f.key)}>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em" }}>
                    {filtered.length} Entitas Ditemukan
                  </p>

                  {filtered.length === 0 ? (
                    <div style={{ textAlign:"center", padding:40 }}>
                      <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
                      <p style={{ fontSize:13, color:"#94a3b8" }}>Tidak ada akun ditemukan</p>
                    </div>
                  ) : filtered.map(comp => (
                    <div key={comp.id} className="adm-company-card">

                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                        <div style={{ minWidth:0 }}>
                          <h3 style={{ fontSize:15, fontWeight:900, color:"#0f172a" }}>{comp.name}</h3>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                            <span style={{ fontSize:10, fontWeight:700, color:"#94a3b8", background:"#f8fafc", padding:"2px 6px", borderRadius:6, border:"1px solid #e2e8f0", fontFamily:"monospace" }}>
                              {comp.id}
                            </span>
                            <span style={{ fontSize:11, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>
                              {comp.email}
                            </span>
                          </div>
                        </div>
                        <span style={{
                          padding:"5px 10px", borderRadius:10, fontSize:10, fontWeight:800,
                          textTransform:"uppercase", letterSpacing:".06em", flexShrink:0,
                          ...(comp.isoCertVerified
                            ? { background:"#f0fdf4", color:"#16a34a", border:"1px solid #dcfce7" }
                            : { background:"#fffbeb", color:"#d97706", border:"1px solid #fef3c7" })
                        }}>
                          {comp.isoCertVerified ? "ISO ✓" : "ISO ⏳"}
                        </span>
                      </div>

                      {/* Stat mini */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginTop:16 }}>
                        {[
                          { label:"Parcels",       val: comp.parcelsCount },
                          { label:"Absorption/mo", val: `${comp.totalAbsorption ?? 0}t` },
                          { label:"Emission/mo",   val: `${comp.totalEmission ?? 0}t`,  red: true },
                          { label:"Net Credits",   val: (comp.netCredits || 0).toLocaleString(), green: true },
                        ].map((stat, i) => (
                          <div key={i} style={{ background:"#f8fafc", borderRadius:12, padding:"8px 6px", textAlign:"center", border:"1px solid #f1f5f9" }}>
                            <div style={{ fontSize:13, fontWeight:900, color: stat.green ? "#0f766e" : stat.red ? "#dc2626" : "#1e293b" }}>{stat.val}</div>
                            <div style={{ fontSize:8, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginTop:3 }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      {comp.emissionScope && (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginTop:6 }}>
                          {[
                            { label:"Scope 1", val:`${((comp.emissionScope.s1||0)/1000/12).toFixed(1)}t/mo` },
                            { label:"Scope 2", val:`${((comp.emissionScope.s2||0)/1000/12).toFixed(1)}t/mo` },
                            { label:"Scope 3", val:`${((comp.emissionScope.s3||0)/1000/12).toFixed(1)}t/mo` },
                          ].map((sc, i) => (
                            <div key={i} style={{ background:"#fff1f2", borderRadius:8, padding:"5px 6px", textAlign:"center" }}>
                              <div style={{ fontSize:11, fontWeight:700, color:"#dc2626" }}>{sc.val}</div>
                              <div style={{ fontSize:8, color:"#94a3b8", textTransform:"uppercase", marginTop:1 }}>{sc.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {comp.lastEmissionUpdate && (
                        <p style={{ fontSize:9, color:"#94a3b8", marginTop:4 }}>
                          Last update: {new Date(comp.lastEmissionUpdate).toLocaleDateString()}
                        </p>
                      )}

                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, padding:"0 2px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <svg style={{ width:14, height:14, color:"#94a3b8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                          <span style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em" }}>
                            {comp.role === "company" ? "Perusahaan" : "Pemilik Lahan"}
                          </span>
                        </div>
                        <span style={{
                          fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:".06em",
                          background:"#f8fafc", padding:"4px 8px", borderRadius:8, border:"1px solid #e2e8f0",
                          color: comp.esgScore >= 70 ? "#0f766e" : "#94a3b8"
                        }}>
                          ESG: {comp.esgScore ?? "N/A"}
                        </span>
                      </div>

                      {/* ISO action */}
                      {!comp.isoCertVerified && comp.role === "company" && (
                        <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #f1f5f9", display:"flex", gap:10 }}>
                          <button className="adm-btn-approve" onClick={() => verifyIso(comp.id, true)}>
                            <svg style={{ width:14, height:14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            Terima ISO
                          </button>
                          <button className="adm-btn-reject" onClick={() => verifyIso(comp.id, false)}>
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ══════ ALERTS ══════ */}
              {tab === "alerts" && (
                <div className="adm-fade" style={{ display:"flex", flexDirection:"column", gap:14, paddingBottom:40 }}>

                  {/* Status bar */}
                  <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <p style={{ fontSize:11, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em" }}>Status Pemantauan</p>
                      <p style={{ fontSize:14, fontWeight:700, color:"#1e293b", marginTop:3 }}>
                        {overview.alertsCount} Alert Aktif Terdeteksi
                      </p>
                    </div>
                    <div style={{ width:40, height:40, background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,.08)", border:"1px solid #f1f5f9" }}>
                      <svg style={{ width:20, height:20, color:"#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    </div>
                  </div>

                  {(overview.recentAlerts || []).length === 0 ? (
                    <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:24, padding:40, textAlign:"center" }}>
                      <div style={{ width:64, height:64, background:"#f0fdf4", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", border:"1px solid #dcfce7" }}>
                        <svg style={{ width:32, height:32, color:"#16a34a" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <p style={{ fontSize:15, fontWeight:900, color:"#334155" }}>Semua Sistem Aman</p>
                      <p style={{ fontSize:12, color:"#94a3b8", marginTop:8 }}>Tidak ada aktivitas mencurigakan di lahan saat ini.</p>
                    </div>
                  ) : (overview.recentAlerts || []).map((alertItem, i) => (
                    <div key={alertItem._id || i} className="adm-alert-card">
                      <div style={{ position:"absolute", top:0, right:0, padding:16, opacity:.04 }}>
                        <svg style={{ width:64, height:64, color:"#dc2626" }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span className="adm-pulse" style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", display:"inline-block" }} />
                        <p style={{ fontSize:10, fontWeight:800, color:"#ef4444", textTransform:"uppercase", letterSpacing:".08em" }}>{alertItem.type}</p>
                      </div>
                      <p style={{ fontSize:13, fontWeight:700, color:"#1e293b", lineHeight:1.6, paddingRight:32 }}>{alertItem.message}</p>
                      <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid #f8fafc", display:"flex", alignItems:"flex-start", gap:10 }}>
                        <svg style={{ width:14, height:14, color:"#94a3b8", flexShrink:0, marginTop:1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <div>
                          <span style={{ fontSize:11, fontWeight:700, color:"#475569", display:"block" }}>{alertItem.companyName}</span>
                          <span style={{ fontSize:10, color:"#94a3b8", display:"block", marginTop:2 }}>{alertItem.parcelName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}