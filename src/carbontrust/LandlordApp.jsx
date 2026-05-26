import { useState, useEffect } from "react";
import { API, apiFetch, calcAbsorption, Modal } from "./shared.jsx";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ll { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-height: 100dvh; background: #f0fdf4; }
  .ll-inner { max-width: 430px; margin: 0 auto; min-height: 100dvh; display: flex; flex-direction: column; background: #f0fdf4; box-shadow: 0 0 40px rgba(0,0,0,.12); }
  /* header */
  .ll-header { background: linear-gradient(135deg,#14532d,#134e4a); padding: 0; position: sticky; top: 0; z-index: 20; }
  .ll-header-top { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
  .ll-logo { display: flex; align-items: center; gap: 10px; }
  .ll-logo-icon { width: 38px; height: 38px; background: rgba(255,255,255,.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .ll-logo-title { font-size: 14px; font-weight: 800; color: #fff; }
  .ll-logo-sub { font-size: 10px; color: rgba(255,255,255,.6); margin-top: 1px; }
  .ll-header-actions { display: flex; align-items: center; gap: 8px; }
  .ll-iso-btn { font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 8px; border: none; cursor: pointer; font-family: inherit; transition: all .15s; }
  .ll-iso-btn-ok     { background: rgba(255,255,255,.2); color: #fff; }
  .ll-iso-btn-pending { background: #fef3c7; color: #92400e; }
  .ll-exit { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.7); background: none; border: none; cursor: pointer; font-family: inherit; }
  /* tabs */
  .ll-tabs { display: flex; background: rgba(0,0,0,.2); }
  .ll-tab { flex: 1; padding: 10px 0; font-size: 11px; font-weight: 700; color: rgba(255,255,255,.5); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: all .15s; }
  .ll-tab.active { color: #fff; border-bottom-color: #86efac; }
  /* main */
  .ll-main { flex: 1; overflow-y: auto; padding-bottom: 24px; }
  /* hero */
  .ll-hero { background: linear-gradient(135deg,#14532d,#134e4a); padding: 20px 16px 28px; }
  .ll-hero-greeting { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.6); margin-bottom: 4px; }
  .ll-hero-name { font-size: 22px; font-weight: 900; color: #fff; margin-bottom: 2px; }
  .ll-hero-sub { font-size: 12px; color: rgba(255,255,255,.6); }
  /* wave */
  .ll-wave { height: 24px; background: linear-gradient(135deg,#14532d,#134e4a); }
  .ll-wave svg { display: block; width: 100%; }
  /* kpi */
  .ll-kpi-wrap { padding: 0 16px; margin-top: -8px; margin-bottom: 12px; }
  .ll-kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ll-kpi { background: #fff; border-radius: 16px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .ll-kpi-icon { font-size: 22px; margin-bottom: 6px; }
  .ll-kpi-val { font-size: 18px; font-weight: 900; }
  .ll-kpi-label { font-size: 11px; color: #6b7280; margin-top: 2px; }
  /* section */
  .ll-section { margin: 0 16px 12px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
  .ll-section-header { padding: 12px 16px; border-bottom: 1px solid #f0fdf4; display: flex; align-items: center; justify-content: space-between; }
  .ll-section-title { font-size: 13px; font-weight: 700; color: #1f2937; }
  /* parcel card */
  .ll-parcel { padding: 14px 16px; border-bottom: 1px solid #f9fafb; cursor: pointer; transition: background .15s; }
  .ll-parcel:last-child { border-bottom: none; }
  .ll-parcel:hover { background: #f0fdf4; }
  .ll-parcel-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
  .ll-parcel-name { font-size: 13px; font-weight: 700; color: #1f2937; }
  .ll-parcel-type { font-size: 11px; color: #6b7280; }
  .ll-parcel-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
  .ll-parcel-stat { background: #f0fdf4; border-radius: 8px; padding: 6px; text-align: center; }
  .ll-parcel-stat-val { font-size: 12px; font-weight: 700; color: #166534; }
  .ll-parcel-stat-label { font-size: 10px; color: #6b7280; }
  /* status badge */
  .ll-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
  .ll-badge-healthy  { background: #dcfce7; color: #166534; }
  .ll-badge-flooded  { background: #dbeafe; color: #1e40af; }
  .ll-badge-degraded { background: #fef3c7; color: #92400e; }
  .ll-badge-burned   { background: #fee2e2; color: #991b1b; }
  .ll-badge-drying   { background: #ffedd5; color: #9a3412; }
  /* maps link */
  .ll-maps { font-size: 11px; font-weight: 700; color: #16a34a; text-decoration: none; display: block; margin-top: 8px; }
  .ll-maps:hover { text-decoration: underline; }
  /* empty */
  .ll-empty { text-align: center; padding: 48px 16px; }
  .ll-empty-icon { font-size: 48px; margin-bottom: 12px; }
  .ll-empty-title { font-size: 14px; font-weight: 700; color: #374151; }
  .ll-empty-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }
  /* add btn */
  .ll-add-btn { margin: 0 16px; width: calc(100% - 32px); padding: 14px; border-radius: 14px; border: none; background: linear-gradient(135deg,#166534,#0f766e); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; }
  .ll-add-btn:hover { opacity: .92; }
  .ll-add-btn:active { transform: scale(.98); }
  /* form */
  .ll-form { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .ll-label { font-size: 12px; font-weight: 700; color: #374151; display: block; margin-bottom: 4px; }
  .ll-input { width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-family: inherit; outline: none; color: #1f2937; transition: border .15s; }
  .ll-input:focus { border-color: #16a34a; }
  .ll-select { width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-family: inherit; outline: none; color: #1f2937; }
  .ll-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ll-note { font-size: 11px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 8px 10px; color: #92400e; line-height: 1.4; }
  .ll-maps-preview { font-size: 11px; font-weight: 700; color: #16a34a; text-decoration: none; display: block; }
  /* market */
  .ll-market-banner { margin: 16px; background: linear-gradient(135deg,#14532d,#134e4a); border-radius: 16px; padding: 16px; }
  .ll-market-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: rgba(255,255,255,.6); margin-bottom: 4px; }
  .ll-market-val { font-size: 36px; font-weight: 900; color: #fff; }
  .ll-market-sub { font-size: 12px; color: rgba(255,255,255,.6); margin-top: 2px; }
  /* upload zone */
  .ll-upload { border: 2px dashed #d1fae5; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all .15s; }
  .ll-upload:hover { border-color: #16a34a; background: #f0fdf4; }
  .ll-upload-ok { border-color: #16a34a; background: #f0fdf4; }
  .ll-upload-err { border-color: #ef4444; background: #fef2f2; }
  .fade-up { animation: fadeUp .3s ease forwards; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

const TYPE_ICON = { forest:"🌲", peatland:"🌾", mangrove:"🌴", seawater:"🌊", agricultural:"🌱", industrial:"🏭" };

const BADGE_CLASS = { healthy:"ll-badge-healthy", flooded:"ll-badge-flooded", degraded:"ll-badge-degraded", burned:"ll-badge-burned", drying:"ll-badge-drying" };

export default function LandlordApp({ onLogout, onExit, user, lang }) {
  const [tab, setTab]           = useState("dashboard");
  const [parcels, setParcels]   = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [certModal, setCertModal] = useState(false);
  const [isoCert, setIsoCert]   = useState(null);
  const [certOk, setCertOk]     = useState(false);
  const [certError, setCertError] = useState("");
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    name:"", type:"forest", area:"", lat:"", lng:"", depth:"", humidity:"",
  });
  const [offerCredits, setOfferCredits] = useState("");
  const [offerPrice, setOfferPrice]     = useState("");
  const [offered, setOffered]           = useState(false);

  const userId = user?.id || "LANDLORD-001";

  useEffect(() => {
    apiFetch(`/landlord/${userId}/parcels`).then(fetchedData => {
      if (Array.isArray(fetchedData)) setParcels(fetchedData);
    });
  }, []);

  function setF(kk, vv) { setForm(prev => ({ ...prev, [kk]: vv })); }

  async function addParcel() {
    if (!form.name || !form.area || !form.lat || !form.lng) return;
    setSaving(true);
    const body = {
      ...form, companyId: userId,
      area: parseFloat(form.area), lat: parseFloat(form.lat), lng: parseFloat(form.lng),
      depth:    form.depth    ? parseFloat(form.depth)    : null,
      humidity: form.humidity ? parseFloat(form.humidity) : null,
    };
    const res = await apiFetch("/parcels", { method:"POST", body: JSON.stringify(body) });
    if (res?.id) {
      setParcels(prev => [...prev, res]);
      setAddModal(false);
      setForm({ name:"", type:"forest", area:"", lat:"", lng:"", depth:"", humidity:"" });
    }
    setSaving(false);
  }

  function handleCertUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf","image/jpeg","image/png"];
    if (!allowed.includes(file.type)) {
      setCertError("File ditolak — harus PDF atau JPG/PNG"); setCertOk(false); return;
    }
    setIsoCert(file); setCertOk(true); setCertError("");
  }

  const totalAbs = parseFloat(parcels.reduce((s,p) => s + Math.max(0,  calcAbsorption(p)), 0).toFixed(2));
  const totalEm  = parseFloat(parcels.reduce((s,p) => s + Math.max(0, -calcAbsorption(p)), 0).toFixed(2));
  const net      = parseFloat((totalAbs - totalEm).toFixed(2));
  const credits  = Math.max(0, Math.floor(net * 12));

  return (
    <div className="ll">
      <style>{CSS}</style>
      <div className="ll-inner">

        {/* Header */}
        <div className="ll-header">
          <div className="ll-header-top">
            <div className="ll-logo">
              <div className="ll-logo-icon">🌿</div>
              <div>
                <div className="ll-logo-title">Landlord Portal</div>
                <div className="ll-logo-sub">{user?.name || "Pemilik Lahan"}</div>
              </div>
            </div>
            <div className="ll-header-actions">
              <button className={`ll-iso-btn ${certOk ? "ll-iso-btn-ok" : "ll-iso-btn-pending"}`}
                onClick={() => setCertModal(true)}>
                {certOk ? "✅ ISO Uploaded" : "⏳ Upload ISO"}
              </button>
              <button className="ll-exit" onClick={onExit || onLogout}>Keluar</button>
            </div>
          </div>
          <div className="ll-tabs">
            {[
              { key:"dashboard", label:"Dashboard" },
              { key:"parcels",   label:"Lahan Saya" },
              { key:"market",    label:"Tawarkan" },
            ].map(tabItem => (
              <button key={t.key}
                className={`ll-tab ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ll-main">

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div className="fade-up">
              <div className="ll-hero">
                <div className="ll-hero-greeting">Landlord Portal · CarbonTrust</div>
                <div className="ll-hero-name">Halo, {user?.name?.split(" ")[0] || "Pemilik Lahan"} 👋</div>
                <div className="ll-hero-sub">{parcels.length} lahan terdaftar · pantau serapan karbon kamu</div>
              </div>
              <div className="ll-wave">
                <svg viewBox="0 0 430 24" preserveAspectRatio="none" style={{ height:24 }}>
                  <path d="M0,0 C80,24 180,0 280,12 C360,20 400,4 430,8 L430,24 L0,24 Z" fill="#f0fdf4"/>
                </svg>
              </div>

              <div className="ll-kpi-wrap" style={{ marginTop:12 }}>
                <div className="ll-kpi-grid">
                  {[
                    { icon:"🌿", label:"Serapan / bulan",  val:`${totalAbs} t`,  color:"#166534" },
                    { icon:"🏭", label:"Emisi / bulan",    val:`${totalEm} t`,   color:"#dc2626" },
                    { icon:"⚖️", label:"Net Karbon",        val:`${net} t/bln`,  color: net >= 0 ? "#0f766e" : "#dc2626" },
                    { icon:"🎫", label:"Kredit Karbon",    val:credits.toLocaleString(), color:"#1d4ed8" },
                  ].map((k,i) => (
                    <div key={i} className="ll-kpi">
                      <div className="ll-kpi-icon">{k.icon}</div>
                      <div className="ll-kpi-val" style={{ color:k.color }}>{k.val}</div>
                      <div className="ll-kpi-label">{k.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ISO Status */}
              <div className="ll-section" style={{ margin:"0 16px 12px" }}>
                <div className="ll-section-header">
                  <span className="ll-section-title">Sertifikat ISO 14064</span>
                  <span className={`ll-badge ${certOk ? "ll-badge-healthy" : "ll-badge-drying"}`}>
                    {certOk ? "✅ Terverifikasi" : "⏳ Belum Upload"}
                  </span>
                </div>
                <div style={{ padding:"12px 16px" }}>
                  <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.5 }}>
                    {certOk
                      ? `${isoCert?.name} — kredit karbon siap ditawarkan di Market.`
                      : "Upload sertifikat ISO dari lembaga verifikasi untuk mengaktifkan penawaran kredit karbon."}
                  </p>
                  {!certOk && (
                    <button onClick={() => setCertModal(true)}
                      style={{ marginTop:8, fontSize:12, fontWeight:700, color:"#166534", background:"#dcfce7", border:"none", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontFamily:"inherit" }}>
                      Upload Sekarang →
                    </button>
                  )}
                </div>
              </div>

              {/* Quick parcel list */}
              {parcels.length > 0 && (
                <div className="ll-section" style={{ margin:"0 16px 12px" }}>
                  <div className="ll-section-header">
                    <span className="ll-section-title">Lahan Terdaftar</span>
                    <button onClick={() => setTab("parcels")}
                      style={{ fontSize:11, fontWeight:700, color:"#16a34a", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                      Lihat semua →
                    </button>
                  </div>
                  {parcels.slice(0,3).map(parcelItem => (
                    <div key={p.id} className="ll-parcel">
                      <div className="ll-parcel-top">
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:22 }}>{TYPE_ICON[p.type]}</span>
                          <div>
                            <div className="ll-parcel-name">{p.name}</div>
                            <div className="ll-parcel-type">{p.area} ha · {p.type}</div>
                          </div>
                        </div>
                        <span className={`ll-badge ${BADGE_CLASS[p.status] || "ll-badge-healthy"}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PARCELS ── */}
          {tab === "parcels" && (
            <div className="fade-up" style={{ paddingTop:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#1f2937" }}>{parcels.length} Lahan Terdaftar</div>
                <button onClick={() => setAddModal(true)}
                  style={{ fontSize:12, fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#166534,#0f766e)", border:"none", borderRadius:10, padding:"7px 14px", cursor:"pointer", fontFamily:"inherit" }}>
                  + Tambah Lahan
                </button>
              </div>

              {parcels.length === 0 ? (
                <div className="ll-empty">
                  <div className="ll-empty-icon">🌱</div>
                  <div className="ll-empty-title">Belum ada lahan</div>
                  <div className="ll-empty-sub">Tambah lahan pertamamu untuk mulai melacak serapan karbon</div>
                  <button onClick={() => setAddModal(true)} className="ll-add-btn" style={{ marginTop:16, width:"auto", padding:"10px 24px" }}>
                    + Tambah Lahan
                  </button>
                </div>
              ) : (
                <div className="ll-section" style={{ margin:"0 16px" }}>
                  {parcels.map(parcelItem => (
                    <div key={p.id} className="ll-parcel">
                      <div className="ll-parcel-top">
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:24 }}>{TYPE_ICON[p.type]}</span>
                          <div>
                            <div className="ll-parcel-name">{p.name}</div>
                            <div className="ll-parcel-type">{p.type} · {p.area} ha</div>
                          </div>
                        </div>
                        <span className={`ll-badge ${BADGE_CLASS[p.status] || "ll-badge-healthy"}`}>{p.status}</span>
                      </div>
                      <div className="ll-parcel-grid">
                        {[
                          { l:"NDVI",       v:p.ndvi },
                          { l:"Serapan",    v:`${Math.max(0, calcAbsorption(p))} t/bln` },
                          { l:"Humidity",   v:p.humidity ? `${p.humidity}%` : "—" },
                        ].map((s,i) => (
                          <div key={i} className="ll-parcel-stat">
                            <div className="ll-parcel-stat-val">{s.v}</div>
                            <div className="ll-parcel-stat-label">{s.l}</div>
                          </div>
                        ))}
                      </div>
                      {p.lat && p.lng && (
                        <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}&t=k`}
                          target="_blank" rel="noreferrer" className="ll-maps">
                          🛰️ Lihat di Google Maps Satellite
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding:"16px 0" }}>
                <button onClick={() => setAddModal(true)} className="ll-add-btn">
                  + Tambah Lahan Baru
                </button>
              </div>
            </div>
          )}

          {/* ── MARKET / TAWARKAN ── */}
          {tab === "market" && (
            <div className="fade-up" style={{ paddingTop:16 }}>
              <div className="ll-market-banner">
                <div className="ll-market-label">Net Kredit Karbon Kamu</div>
                <div className="ll-market-val">{credits.toLocaleString()}</div>
                <div className="ll-market-sub">tCO₂e / tahun · ≈ ${(credits * 18.5).toLocaleString()} USD</div>
              </div>

              <div style={{ padding:"0 16px" }}>
                {!certOk ? (
                  <div style={{ background:"#fff", border:"1.5px solid #fde68a", borderRadius:16, padding:16, marginBottom:12 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#92400e", marginBottom:4 }}>⚠️ Sertifikat ISO Diperlukan</div>
                    <div style={{ fontSize:12, color:"#b45309", lineHeight:1.5, marginBottom:12 }}>
                      Upload sertifikat ISO 14064 dari lembaga verifikasi untuk mengaktifkan penawaran kredit karbon di market.
                    </div>
                    <button onClick={() => setCertModal(true)}
                      style={{ width:"100%", padding:"11px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#d97706,#b45309)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      Upload Sertifikat ISO →
                    </button>
                  </div>
                ) : offered ? (
                  <div style={{ background:"#dcfce7", border:"1.5px solid #86efac", borderRadius:16, padding:16, textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#166534" }}>Penawaran Aktif!</div>
                    <div style={{ fontSize:12, color:"#16a34a", marginTop:4 }}>
                      {offerCredits} tCO₂e @ ${offerPrice}/ton sudah dipublish ke market.
                    </div>
                    <button onClick={() => setOffered(false)}
                      style={{ marginTop:12, fontSize:12, fontWeight:700, color:"#dc2626", background:"none", border:"1px solid #fca5a5", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontFamily:"inherit" }}>
                      Tarik Penawaran
                    </button>
                  </div>
                ) : (
                  <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 1px 4px rgba(0,0,0,.06)", display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1f2937" }}>Tawarkan Kredit Karbon</div>
                    <div>
                      <label className="ll-label">Jumlah Kredit (tCO₂e)</label>
                      <input className="ll-input" type="number" placeholder={`Maks. ${credits}`}
                        value={offerCredits} onChange={e => setOfferCredits(e.target.value)} />
                    </div>
                    <div>
                      <label className="ll-label">Harga per Ton (USD)</label>
                      <input className="ll-input" type="number" placeholder="e.g. 18.5"
                        value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                    </div>
                    {offerCredits && offerPrice && (
                      <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 12px", fontSize:12, color:"#166534" }}>
                        Total nilai: <strong>${(parseFloat(offerCredits) * parseFloat(offerPrice)).toLocaleString()} USD</strong>
                      </div>
                    )}
                    <button
                      onClick={() => { if (offerCredits && offerPrice) setOffered(true); }}
                      disabled={!offerCredits || !offerPrice}
                      style={{ padding:"13px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#166534,#0f766e)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity: (!offerCredits || !offerPrice) ? .5 : 1, transition:"all .15s" }}>
                      Publish ke Market →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Parcel Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="🌱 Tambah Lahan Baru">
        <div className="ll-form">
          <div>
            <label className="ll-label">Nama Lahan</label>
            <input className="ll-input" placeholder="e.g. Kebun Karet Jambi" value={form.name} onChange={e => setF("name", e.target.value)} />
          </div>
          <div>
            <label className="ll-label">Tipe Lahan</label>
            <select className="ll-select" value={form.type} onChange={e => setF("type", e.target.value)}>
              {Object.entries(TYPE_ICON).map(([k,v]) => (
                <option key={k} value={k}>{v} {k.charAt(0).toUpperCase() + k.slice(1)}</option>
              ))}
            </select>
          </div>
          {form.type === "peatland" && (
            <div className="ll-note">⚠️ Untuk gambut: kedalaman wajib diisi. Humidity sangat mempengaruhi serapan — gambut kering melepas CO₂.</div>
          )}
          <div className="ll-input-grid">
            <div>
              <label className="ll-label">Luas (ha)</label>
              <input className="ll-input" type="number" placeholder="120" value={form.area} onChange={e => setF("area", e.target.value)} />
            </div>
            <div>
              <label className="ll-label">Kedalaman (m)</label>
              <input className="ll-input" type="number" placeholder={form.type === "peatland" ? "4.5 *" : "opsional"} value={form.depth} onChange={e => setF("depth", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="ll-label">Humidity Sensor (%)</label>
            <input className="ll-input" type="number" min="0" max="100" placeholder="e.g. 65" value={form.humidity} onChange={e => setF("humidity", e.target.value)} />
          </div>
          <div className="ll-input-grid">
            <div>
              <label className="ll-label">Latitude</label>
              <input className="ll-input" type="number" placeholder="-1.2412" value={form.lat} onChange={e => setF("lat", e.target.value)} />
            </div>
            <div>
              <label className="ll-label">Longitude</label>
              <input className="ll-input" type="number" placeholder="103.61" value={form.lng} onChange={e => setF("lng", e.target.value)} />
            </div>
          </div>
          {form.lat && form.lng && (
            <a href={`https://www.google.com/maps?q=${form.lat},${form.lng}&t=k`} target="_blank" rel="noreferrer" className="ll-maps-preview">
              🛰️ Preview di Google Maps Satellite →
            </a>
          )}
          <button onClick={addParcel} disabled={saving || !form.name || !form.area || !form.lat || !form.lng}
            style={{ padding:"13px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#166534,#0f766e)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity: (saving || !form.name || !form.area) ? .5 : 1 }}>
            {saving ? "Menyimpan..." : "Simpan Lahan"}
          </button>
        </div>
      </Modal>

      {/* ISO Cert Modal */}
      <Modal open={certModal} onClose={() => setCertModal(false)} title="📋 Upload Sertifikat ISO 14064">
        <div className="ll-form">
          <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.5 }}>
            Upload sertifikat ISO 14064 dari lembaga verifikasi resmi. Diperlukan agar kredit karbon kamu dapat ditawarkan di market.
          </p>
          <label className={`ll-upload ${certOk ? "ll-upload-ok" : certError ? "ll-upload-err" : ""}`}>
            <span style={{ fontSize:28 }}>{certOk ? "📄" : "⬆️"}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#374151" }}>
                {isoCert ? isoCert.name : "Upload Sertifikat ISO 14064"}
              </div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>PDF / JPG / PNG · maks 10MB</div>
            </div>
            {certOk && <span style={{ color:"#16a34a", fontWeight:700, fontSize:13 }}>✓</span>}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={handleCertUpload} />
          </label>
          {certError && <p style={{ fontSize:11, color:"#ef4444" }}>{certError}</p>}
          {certOk && (
            <div style={{ background:"#dcfce7", border:"1px solid #86efac", borderRadius:10, padding:"10px 12px" }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#166534" }}>✅ {isoCert?.name}</p>
              <p style={{ fontSize:11, color:"#16a34a", marginTop:2 }}>Sertifikat valid — kredit siap ditawarkan</p>
            </div>
          )}
          <button onClick={() => setCertModal(false)} disabled={!certOk}
            style={{ padding:"12px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#166534,#0f766e)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity: certOk ? 1 : .5 }}>
            {certOk ? "Simpan & Tutup" : "Upload file terlebih dahulu"}
          </button>
        </div>
      </Modal>
    </div>
  );
}