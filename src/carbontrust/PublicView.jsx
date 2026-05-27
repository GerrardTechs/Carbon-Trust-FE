import { useState, useEffect } from "react";
import { API } from "./shared.jsx"; 

const API = "https://carbon-trust-be.onrender.com/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .pv { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-height: 100dvh; background: #f8fafc; color: #1e293b; }
  .pv-inner { max-width: 430px; margin: 0 auto; min-height: 100dvh; display: flex; flex-direction: column; background: #fff; box-shadow: 0 0 40px rgba(0,0,0,.1); }
  /* header */
  .pv-header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 14px 16px; position: sticky; top: 0; z-index: 20; }
  .pv-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .pv-brand { display: flex; align-items: center; gap: 8px; }
  .pv-brand-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg,#166534,#0f766e); }
  .pv-brand-name { font-size: 16px; font-weight: 900; letter-spacing: -.02em; }
  .pv-brand-name span:first-child { color: #166534; }
  .pv-brand-name span:last-child  { color: #0f766e; }
  .pv-login-btn { font-size: 12px; font-weight: 700; color: #fff; background: linear-gradient(135deg,#166534,#0f766e); border: none; border-radius: 10px; padding: 7px 14px; cursor: pointer; font-family: inherit; text-decoration: none; display: inline-block; }
  .pv-search { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-family: inherit; outline: none; color: #1e293b; transition: border .15s; }
  .pv-search:focus { border-color: #16a34a; }
  /* filter */
  .pv-filters { display: flex; gap: 6px; padding: 10px 16px; overflow-x: auto; border-bottom: 1px solid #f1f5f9; }
  .pv-filter { shrink: 0; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all .15s; }
  .pv-filter.active { background: #166534; color: #fff; border-color: #166534; }
  /* hero banner */
  .pv-hero { background: linear-gradient(135deg,#166534,#0f766e); padding: 20px 16px; }
  .pv-hero-label { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.7); margin-bottom: 4px; }
  .pv-hero-title { font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 8px; }
  .pv-hero-sub { font-size: 12px; color: rgba(255,255,255,.7); line-height: 1.5; margin-bottom: 14px; }
  .pv-hero-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .pv-hero-stat { background: rgba(255,255,255,.15); border-radius: 10px; padding: 10px; text-align: center; }
  .pv-hero-stat-val { font-size: 18px; font-weight: 900; color: #fff; }
  .pv-hero-stat-label { font-size: 10px; color: rgba(255,255,255,.7); margin-top: 1px; }
  /* main */
  .pv-main { flex: 1; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
  /* company card */
  .pv-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px; overflow: hidden; cursor: pointer; transition: all .2s; }
  .pv-card:hover { border-color: #bbf7d0; box-shadow: 0 4px 16px rgba(22,101,52,.1); transform: translateY(-1px); }
  .pv-card-header { padding: 14px; display: flex; align-items: flex-start; gap: 12px; }
  .pv-card-icon { width: 44px; height: 44px; border-radius: 12px; background: #f0fdf4; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .pv-card-info { flex: 1; min-width: 0; }
  .pv-card-name { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pv-card-meta { font-size: 11px; color: #64748b; }
  .pv-card-price { text-align: right; flex-shrink: 0; }
  .pv-card-price-val { font-size: 16px; font-weight: 900; color: #166534; }
  .pv-card-price-unit { font-size: 10px; color: #64748b; }
  /* metrics */
  .pv-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border-top: 1px solid #f1f5f9; }
  .pv-metric { padding: 10px 8px; text-align: center; border-right: 1px solid #f1f5f9; }
  .pv-metric:last-child { border-right: none; }
  .pv-metric-val { font-size: 12px; font-weight: 700; color: #1e293b; }
  .pv-metric-label { font-size: 10px; color: #94a3b8; margin-top: 1px; }
  /* badges */
  .pv-card-badges { padding: 0 14px 12px; display: flex; gap: 6px; flex-wrap: wrap; }
  .pv-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
  .pv-badge-green { background: #dcfce7; color: #166534; }
  .pv-badge-amber { background: #fef3c7; color: #92400e; }
  .pv-badge-blue  { background: #dbeafe; color: #1e40af; }
  /* bottom sheet overlay */
  .pv-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 50; display: flex; align-items: flex-end; justify-content: center; }
  .pv-sheet { background: #fff; border-radius: 20px 20px 0 0; width: 100%; max-width: 430px; max-height: 88vh; overflow-y: auto; }
  .pv-sheet-handle { width: 40px; height: 4px; background: #e2e8f0; border-radius: 999px; margin: 12px auto 0; }
  .pv-sheet-header { padding: 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
  .pv-sheet-title { font-size: 15px; font-weight: 800; color: #1e293b; }
  .pv-sheet-close { font-size: 20px; color: #94a3b8; background: none; border: none; cursor: pointer; line-height: 1; }
  .pv-sheet-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  /* info grid */
  .pv-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .pv-info-cell { background: #f8fafc; border-radius: 10px; padding: 10px 12px; }
  .pv-info-label { font-size: 10px; color: #94a3b8; margin-bottom: 2px; }
  .pv-info-val { font-size: 13px; font-weight: 700; color: #1e293b; }
  /* carbon summary */
  .pv-carbon { background: linear-gradient(135deg,#166534,#0f766e); border-radius: 14px; padding: 16px; }
  .pv-carbon-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: rgba(255,255,255,.7); margin-bottom: 4px; }
  .pv-carbon-val { font-size: 32px; font-weight: 900; color: #fff; }
  .pv-carbon-sub { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; }
  .pv-carbon-row { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.2); }
  .pv-carbon-item-label { font-size: 11px; color: rgba(255,255,255,.7); }
  .pv-carbon-item-val { font-size: 13px; font-weight: 700; color: #fff; }
  /* parcel list */
  .pv-parcel { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; }
  .pv-parcel-icon { font-size: 20px; }
  .pv-parcel-name { font-size: 12px; font-weight: 700; color: #1e293b; }
  .pv-parcel-sub { font-size: 11px; color: #64748b; }
  .pv-parcel-abs { font-size: 12px; font-weight: 700; margin-left: auto; }
  /* CTA */
  .pv-cta { display: block; width: 100%; padding: 14px 0; border-radius: 14px; border: none; background: linear-gradient(135deg,#166534,#0f766e); color: #fff; font-size: 14px; font-weight: 700; text-align: center; cursor: pointer; font-family: inherit; text-decoration: none; transition: all .15s; }
  .pv-cta:hover { opacity: .92; }
  .pv-cta-sub { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 6px; }
  /* empty / loading */
  .pv-empty { text-align: center; padding: 60px 16px; }
  .pv-empty-icon { font-size: 48px; margin-bottom: 12px; }
  .pv-empty-text { font-size: 14px; font-weight: 700; color: #374151; }
  .pv-empty-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }
  /* footer */
  .pv-footer { padding: 20px 16px; border-top: 1px solid #f1f5f9; text-align: center; }
  .pv-footer-text { font-size: 11px; color: #94a3b8; line-height: 1.6; }
  .fade-up { animation: fadeUp .3s ease forwards; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

const TYPE_ICON = {
  forest:"🌲", peatland:"🌾", mangrove:"🌴",
  seawater:"🌊", agricultural:"🌱", industrial:"🏭",
  Reforestation:"🌲", "Renewable Energy":"☀️",
  "Blue Carbon":"🌊", "Peat Restoration":"🌾",
};

export default function PublicView() {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [detail, setDetail]       = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/public/projects`)
      .then(resp => resp.json())
      .then(fetchedData => {
        if (Array.isArray(fetchedData)) setProjects(fetchedData);
        else setError(true);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  async function openDetail(proj) {
    setDetail({ ...proj, companyDetail: null });
    setDetailLoading(true);
    const res = await fetch(`${API}/public/company/${proj.companyId}`).then(resp => resp.json()).catch(() => null);
    setDetail({ ...proj, companyDetail: res });
    setDetailLoading(false);
  }

  const types = ["all", ...new Set(projects.map(proj => proj.type).filter(Boolean))];

  const filtered = projects.filter(proj => {
    const qStr = search.toLowerCase();
    const matchSearch = !q ||
      (proj.company || "").toLowerCase().includes(qStr) ||
      (proj.country || "").toLowerCase().includes(qStr) ||
      (proj.type    || "").toLowerCase().includes(qStr);
    const matchFilter = filter === "all" || proj.type === filter;
    return matchSearch && matchFilter;
  });

  const totalCredits    = projects.reduce((sum,proj) => sum + (proj.available || 0), 0);
  const verifiedCount   = projects.filter(proj => proj.verified).length;
  const countryCount    = new Set(projects.map(proj => proj.country)).size;

  return (
    <div className="pv">
      <style>{CSS}</style>
      <div className="pv-inner">

        {/* Header */}
        <div className="pv-header">
          <div className="pv-header-top">
            <div className="pv-brand">
              <div className="pv-brand-dot" />
              <div className="pv-brand-name">
                <span>Carbon</span><span>Trust</span>
              </div>
            </div>
            <a href="/" className="pv-login-btn">Login / Daftar →</a>
          </div>
          <input className="pv-search"
            placeholder="🔍 Cari perusahaan, negara, tipe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        <div className="pv-filters">
          {types.map(typeStr => (
            <button key={t}
              className={`pv-filter ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}>
              {t === "all" ? "🌍 Semua" : `${TYPE_ICON[t] || "🌿"} ${t}`}
            </button>
          ))}
        </div>

        {/* Hero */}
        <div className="pv-hero">
          <div className="pv-hero-label">Carbon Credit Marketplace · Public View</div>
          <div className="pv-hero-title">Pasar Karbon Terbuka</div>
          <div className="pv-hero-sub">
            Lihat kredit karbon, emisi, dan serapan perusahaan secara transparan.
            Tidak perlu login untuk melihat data.
          </div>
          <div className="pv-hero-stats">
            {[
              { val:projects.length,              label:"Project"  },
              { val:verifiedCount,                label:"Verified" },
              { val:countryCount,                 label:"Negara"   },
            ].map((statItem,i) => (
              <div key={i} className="pv-hero-stat">
                <div className="pv-hero-stat-val">{statItem.val}</div>
                <div className="pv-hero-stat-label">{statItem.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project list */}
        <div className="pv-main">
          {loading ? (
            <div className="pv-empty">
              <div className="pv-empty-icon">⏳</div>
              <div className="pv-empty-text">Memuat data market...</div>
            </div>
          ) : error ? (
            <div className="pv-empty">
              <div className="pv-empty-icon">⚠️</div>
              <div className="pv-empty-text">Gagal memuat data</div>
              <div className="pv-empty-sub">Coba refresh halaman ini</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pv-empty">
              <div className="pv-empty-icon">🔍</div>
              <div className="pv-empty-text">Tidak ada project ditemukan</div>
              <div className="pv-empty-sub">Coba kata kunci lain</div>
            </div>
          ) : filtered.map((proj, idx) => (
            <div key={proj.id} className="pv-card fade-up" onClick={() => openDetail(proj)}
              style={{ animationDelay:`${idx * 40}ms` }}>
              <div className="pv-card-header">
                <div className="pv-card-icon">{TYPE_ICON[proj.type] || "🌿"}</div>
                <div className="pv-card-info">
                  <div className="pv-card-name">{proj.company}</div>
                  <div className="pv-card-meta">
                    {proj.flag} {proj.country} · {proj.type}
                  </div>
                </div>
                <div className="pv-card-price">
                  <div className="pv-card-price-val">${proj.price}</div>
                  <div className="pv-card-price-unit">/tCO₂</div>
                </div>
              </div>

              {/* Metrics */}
              <div className="pv-metrics">
                {[
                  { label:"Stok",       val:`${(proj.available||0).toLocaleString()} t` },
                  { label:"Serapan",    val:proj.absRate ? `${proj.absRate} t/ha` : "—" },
                  { label:"Emisi",      val:proj.totalAbsorption ? `${proj.totalAbsorption} t/bln` : "—" },
                  { label:"Rating",     val:`⭐ ${proj.rating}` },
                ].map((metricItem,i) => (
                  <div key={i} className="pv-metric">
                    <div className="pv-metric-val">{metricItem.val}</div>
                    <div className="pv-metric-label">{metricItem.label}</div>
                  </div>
                ))}
              </div>

              <div className="pv-card-badges">
                {proj.verified
                  ? <span className="pv-badge pv-badge-green">✅ ISO 14064</span>
                  : <span className="pv-badge pv-badge-amber">⏳ Pending ISO</span>
                }
                {proj.isoVerified && (
                  <span className="pv-badge pv-badge-blue">🔒 Terverifikasi</span>
                )}
                {proj.companyESG && (
                  <span className="pv-badge" style={{
                    background: proj.companyESG >= 70 ? "#dcfce7" : "#fef3c7",
                    color:      proj.companyESG >= 70 ? "#166534"  : "#92400e",
                  }}>
                    ESG {proj.companyESG}
                  </span>
                )}
                <span style={{ marginLeft:"auto", fontSize:11, color:"#94a3b8" }}>
                  Lihat detail →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pv-footer">
          <div className="pv-footer-text">
            CarbonTrust · ISO 14064:2018 · Paris Agreement Article 6<br />
            Data diperbarui real-time dari platform CarbonTrust
          </div>
          <a href="/" className="pv-cta" style={{ marginTop:12 }}>
            Daftar / Login untuk Bid →
          </a>
        </div>
      </div>

      {/* Detail bottom sheet */}
      {detail && (
        <div className="pv-overlay" onClick={() => setDetail(null)}>
          <div className="pv-sheet" onClick={e => e.stopPropagation()}>
            <div className="pv-sheet-handle" />
            <div className="pv-sheet-header">
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:24 }}>{TYPE_ICON[detail.type] || "🌿"}</span>
                <div>
                  <div className="pv-sheet-title">{detail.company}</div>
                  <div style={{ fontSize:11, color:"#64748b" }}>{detail.flag} {detail.country}</div>
                </div>
              </div>
              <button className="pv-sheet-close" onClick={() => setDetail(null)}>✕</button>
            </div>

            <div className="pv-sheet-body">
              {detailLoading ? (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>
                  Memuat detail...
                </div>
              ) : (
                <>
                  {/* Company info */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:8 }}>Profil Perusahaan</div>
                    <div className="pv-info-grid">
                      {[
                        { l:"Tipe Project",  v:detail.type },
                        { l:"Harga Ask",     v:`$${detail.price}/tCO₂` },
                        { l:"Stok Kredit",   v:`${(detail.available||0).toLocaleString()} t` },
                        { l:"Rating",        v:`⭐ ${detail.rating}` },
                        { l:"ESG Score",     v:detail.companyESG ?? "—" },
                        { l:"ISO Status",    v:detail.verified ? "✅ Terverifikasi" : "⏳ Pending" },
                        { l:"Total Lahan",   v:`${detail.companyDetail?.parcels?.length || 0} lahan` },
                        { l:"Total Area",    v:detail.companyDetail ? `${detail.companyDetail.parcels?.reduce((s,p) => s + p.area, 0)?.toLocaleString()} ha` : "—" },
                      ].map((item,i) => (
                        <div key={i} className="pv-info-cell">
                          <div className="pv-info-label">{item.l}</div>
                          <div className="pv-info-val">{item.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carbon summary */}
                  <div className="pv-carbon">
                    <div className="pv-carbon-label">Kredit Karbon Tersedia</div>
                    <div className="pv-carbon-val">{(detail.available||0).toLocaleString()}</div>
                    <div className="pv-carbon-sub">tCO₂e tersertifikasi</div>
                    <div className="pv-carbon-row">
                      <div>
                        <div className="pv-carbon-item-label">Serapan / bulan</div>
                        <div className="pv-carbon-item-val">
                          {detail.companyDetail?.totalAbsorption ?? detail.totalAbsorption ?? "—"} t
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div className="pv-carbon-item-label">Est. Nilai</div>
                        <div className="pv-carbon-item-val">
                          ${((detail.available || 0) * detail.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parcel list */}
                  {detail.companyDetail?.parcels?.length > 0 && (
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:8 }}>
                        Lahan & Serapan
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {detail.companyDetail.parcels.map(pItem => (
                          <div key={pItem.id} className="pv-parcel">
                            <span className="pv-parcel-icon">{TYPE_ICON[pItem.type] || "🌿"}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div className="pv-parcel-name" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                              <div className="pv-parcel-sub">{pItem.area} ha · {pItem.type} · {pItem.status}</div>
                            </div>
                            <div className={`pv-parcel-abs ${p.absorptionMonthly >= 0 ? "" : ""}`}
                              style={{ color: pItem.absorptionMonthly >= 0 ? "#166534" : "#dc2626" }}>
                              {pItem.absorptionMonthly >= 0 ? "▲" : "▼"}{Math.abs(pItem.absorptionMonthly)} t/bln
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emisi & serapan detail */}
                  {detail.companyDetail && (
                    <div style={{ background:"#f8fafc", borderRadius:12, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase" }}>Ringkasan Karbon</div>
                      {[
                        { l:"Total Serapan / bulan",  v:`+ ${detail.companyDetail.totalAbsorption} tCO₂`,  c:"#166534" },
                        { l:"Total Emisi / bulan",    v:`- ${detail.companyDetail.totalEmission} tCO₂`,    c:"#dc2626" },
                        { l:"Net / bulan",            v:`${detail.companyDetail.netMonthly ?? (detail.companyDetail.totalAbsorption - detail.companyDetail.totalEmission).toFixed(2)} tCO₂`, c:"#1e293b" },
                        { l:"Kredit Karbon / tahun",  v:`${detail.companyDetail.netCredits?.toLocaleString() ?? "—"} tCO₂e`, c:"#166534" },
                      ].map((row,i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between" }}>
                          <span style={{ fontSize:12, color:"#64748b" }}>{row.l}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:row.c }}>{row.v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <a href="/" className="pv-cta">Login untuk Ajukan Bid →</a>
                  <div className="pv-cta-sub">Butuh akun untuk mengajukan harga bid</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}