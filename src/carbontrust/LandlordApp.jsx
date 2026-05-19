import { useState, useEffect } from "react";
import { apiFetch, GCSS, Modal, calcAbsorption, ABS_RATES } from "./shared.jsx";

const TYPE_ICON  = { forest:"🌲", peatland:"🌾", mangrove:"🌴", seawater:"🌊", agricultural:"🌱", industrial:"🏭" };
const TYPE_COLOR = { forest:"green", peatland:"amber", mangrove:"teal", seawater:"blue", agricultural:"lime", industrial:"gray" };
const STATUS_COLOR = {
  healthy:  "bg-emerald-100 text-emerald-700",
  flooded:  "bg-blue-100 text-blue-700",
  degraded: "bg-amber-100 text-amber-700",
  burned:   "bg-red-100 text-red-700",
  drying:   "bg-orange-100 text-orange-700",
};

export default function LandlordApp({ onLogout, onExit, user, lang }) {
  const [tab, setTab]           = useState("dashboard");
  const [parcels, setParcels]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [selParcel, setSel]     = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [certModal, setCert]    = useState(false);
  const [isoCert, setIsoCert]   = useState(null);
  const [certOk, setCertOk]     = useState(false);
  const [certError, setCertError] = useState("");
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    name:"", type:"forest", area:"", lat:"", lng:"",
    depth:"", humidity:"", locType:"site",
  });

  const userId = user?.id || "LANDLORD-001";

  useEffect(() => {
    apiFetch(`/landlord/${userId}/parcels`).then(d => { if (d?.length) setParcels(d); });
    apiFetch(`/landlord/${userId}/summary`).then(d => { if (d) setSummary(d); });
  }, []);

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function addParcel() {
    if (!form.name || !form.area || !form.lat || !form.lng) return;
    setSaving(true);
    const body = {
      ...form, companyId: userId,
      area: parseFloat(form.area),
      lat:  parseFloat(form.lat),
      lng:  parseFloat(form.lng),
      depth:    form.depth    ? parseFloat(form.depth)    : null,
      humidity: form.humidity ? parseFloat(form.humidity) : null,
    };
    const res = await apiFetch("/parcels", { method:"POST", body: JSON.stringify(body) });
    if (res?.id) {
      setParcels(p => [...p, res]);
      setAddModal(false);
      setForm({ name:"", type:"forest", area:"", lat:"", lng:"", depth:"", humidity:"", locType:"site" });
    }
    setSaving(false);
  }

  function handleCertUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf","image/jpeg","image/png"];
    if (!allowed.includes(file.type)) {
      setCertError("File ditolak — harus PDF atau JPG/PNG");
      setCertOk(false);
      return;
    }
    setIsoCert(file);
    setCertOk(true);
    setCertError("");
  }

  const totalAbs = parcels.reduce((s,p) => s + Math.max(0, calcAbsorption(p)), 0).toFixed(2);
  const totalEm  = parcels.reduce((s,p) => s + Math.max(0,-calcAbsorption(p)), 0).toFixed(2);
  const net      = (totalAbs - totalEm).toFixed(2);
  const credits  = Math.max(0, Math.floor(net * 12));

  return (
    <div className="min-h-screen" style={{ background:"#f1f5f1" }}>
      <style>{GCSS}</style>
      <div className="max-w-md mx-auto relative min-h-screen flex flex-col bg-gray-50 shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <div>
                <p className="text-sm font-black text-gray-800">Landlord Portal</p>
                <p className="text-xs text-gray-400 truncate max-w-40">{user?.name || "Pemilik Lahan"}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={() => setCert(true)}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${certOk ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {certOk ? "✅ ISO" : "⏳ Upload ISO"}
              </button>
              <button onClick={onExit || onLogout}
                className="text-xs text-red-500 font-bold hover:underline">
                Keluar
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100">
            {[
              { key:"dashboard", label:"Dashboard" },
              { key:"parcels",   label:"Lahan Saya" },
              { key:"market",    label:"Tawarkan" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors
                  ${tab === t.key
                    ? "border-b-2 border-green-600 text-green-700"
                    : "text-gray-400 hover:text-gray-600"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-6">

          {/* ── DASHBOARD TAB ── */}
          {tab === "dashboard" && (
            <div className="flex flex-col gap-4 px-4 pt-4">

              {/* Greeting */}
              <div className="rounded-2xl p-4 text-white"
                style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                <p className="text-green-200 text-xs uppercase tracking-widest mb-1">Landlord Portal</p>
                <p className="font-black text-xl">Halo, {user?.name?.split(" ")[0] || "Pemilik Lahan"} 👋</p>
                <p className="text-green-300 text-xs mt-1">{parcels.length} lahan terdaftar</p>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon:"🌿", l:"Total Serapan",  v:`${totalAbs} t/bln`,  c:"text-green-700"  },
                  { icon:"🏭", l:"Total Emisi",     v:`${totalEm} t/bln`,   c:"text-red-600"    },
                  { icon:"⚖️", l:"Net Karbon",      v:`${net} t/bln`,       c: net >= 0 ? "text-teal-700" : "text-red-600" },
                  { icon:"🎫", l:"Kredit Karbon",   v:credits.toLocaleString(), c:"text-blue-700" },
                ].map((k,i) => (
                  <div key={i} className="card p-3 text-center">
                    <p className="text-xl mb-0.5">{k.icon}</p>
                    <p className={`font-black text-sm ${k.c}`}>{k.v}</p>
                    <p className="text-xs text-gray-400">{k.l}</p>
                  </div>
                ))}
              </div>

              {/* ISO cert status */}
              <div className={`card p-4 border ${certOk ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${certOk ? "text-green-700" : "text-amber-700"}`}>
                      {certOk ? "✅ Sertifikat ISO Terverifikasi" : "⏳ Belum Upload Sertifikat ISO"}
                    </p>
                    <p className={`text-xs mt-0.5 ${certOk ? "text-green-600" : "text-amber-600"}`}>
                      {certOk
                        ? "Kredit karbon kamu dapat ditawarkan di Market"
                        : "Upload ISO 14064 agar kredit bisa ditawarkan"}
                    </p>
                  </div>
                  {!certOk && (
                    <button onClick={() => setCert(true)}
                      className="text-xs text-amber-700 font-bold bg-amber-100 px-3 py-1.5 rounded-xl hover:bg-amber-200 transition-colors">
                      Upload
                    </button>
                  )}
                </div>
              </div>

              {/* Parcel summary */}
              {parcels.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-800">Lahan Saya</p>
                    <button onClick={() => setTab("parcels")}
                      className="text-xs text-green-600 font-bold hover:underline">
                      Lihat semua →
                    </button>
                  </div>
                  {parcels.slice(0,3).map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                      <span className="text-xl">{TYPE_ICON[p.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.area} ha · {p.type}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PARCELS TAB ── */}
          {tab === "parcels" && (
            <div className="flex flex-col gap-3 px-4 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">{parcels.length} Lahan Terdaftar</p>
                <button onClick={() => setAddModal(true)}
                  className="text-xs font-bold text-white px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                  style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                  + Tambah Lahan
                </button>
              </div>

              {parcels.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🌿</p>
                  <p className="text-sm font-bold text-gray-600">Belum ada lahan</p>
                  <p className="text-xs text-gray-400 mt-1">Tambah lahan pertamamu</p>
                  <button onClick={() => setAddModal(true)}
                    className="mt-4 text-xs font-bold text-white px-4 py-2 rounded-xl"
                    style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                    + Tambah Lahan
                  </button>
                </div>
              ) : parcels.map(p => (
                <div key={p.id} className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSel(p)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{TYPE_ICON[p.type]}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.type} · {p.area} ha</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { l:"NDVI",     v:p.ndvi },
                      { l:"Serapan",  v:`${Math.max(0, calcAbsorption(p))} t/bln` },
                      { l:"Humidity", v:p.humidity ? `${p.humidity}%` : "—" },
                    ].map((s,i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-1.5 text-center">
                        <p className="text-xs font-bold text-gray-700">{s.v}</p>
                        <p className="text-xs text-gray-400">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  {/* GPS link */}
                  {p.lat && p.lng && (
                    <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}&t=k`}
                      target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-green-600 font-bold mt-2 block hover:underline">
                      🛰️ Lihat di Google Maps
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── MARKET / TAWARKAN TAB ── */}
          {tab === "market" && (
            <div className="flex flex-col gap-4 px-4 pt-4">
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-xs font-bold text-blue-800 mb-1">📢 Tawarkan Kredit Karbon</p>
                <p className="text-xs text-blue-600">
                  Kredit kamu berasal dari selisih serapan lahan dikurangi emisi.
                  Upload sertifikat ISO 14064 terlebih dahulu agar penawaran aktif.
                </p>
              </div>

              {/* Credit summary */}
              <div className="card p-4 border-2 border-green-200 bg-green-50">
                <p className="text-xs font-bold text-green-700 mb-1">Net Kredit Karbon Kamu</p>
                <p className="text-4xl font-black text-green-700">{credits.toLocaleString()}</p>
                <p className="text-sm text-green-600">tCO₂e / tahun</p>
                <p className="text-xs text-green-500 mt-1">
                  ≈ ${(credits * 18.5).toLocaleString()} USD @ $18.5/ton
                </p>
              </div>

              {!certOk ? (
                <div className="card p-4 border border-amber-200 bg-amber-50">
                  <p className="text-sm font-bold text-amber-700 mb-1">⚠️ Sertifikat ISO Diperlukan</p>
                  <p className="text-xs text-amber-600 mb-3">
                    Upload sertifikat ISO 14064 dari lembaga verifikasi untuk mengaktifkan penawaran.
                  </p>
                  <button onClick={() => setCert(true)}
                    className="w-full py-2.5 rounded-xl font-bold text-white text-sm active:scale-95"
                    style={{ background:"linear-gradient(135deg,#d97706,#b45309)" }}>
                    Upload Sertifikat ISO →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="card p-3 border border-green-200 bg-green-50 flex items-center gap-2">
                    <span>✅</span>
                    <p className="text-xs font-bold text-green-700">ISO Terverifikasi — penawaran aktif</p>
                  </div>

                  {[
                    { l:"Jumlah Kredit Ditawarkan", ph:"e.g. 500", k:"offerCredits" },
                    { l:"Harga per Ton (USD)",      ph:"e.g. 18.5", k:"offerPrice" },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="text-xs font-bold text-gray-600 block mb-1">{f.l}</label>
                      <input type="number" placeholder={f.ph}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                    </div>
                  ))}

                  <button className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
                    style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                    Publish ke Market →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Add Parcel Modal */}
        <Modal open={addModal} onClose={() => setAddModal(false)} title="➕ Tambah Lahan">
          <div className="flex flex-col gap-3 p-4">

            {[
              { l:"Nama Lahan", k:"name", ph:"e.g. Kebun Karet Jambi", type:"text" },
              { l:"Luas (ha)",  k:"area", ph:"120", type:"number" },
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs font-bold text-gray-600 block mb-1">{f.l}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.k]}
                  onChange={e => setF(f.k, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
            ))}

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Tipe Lahan</label>
              <select value={form.type} onChange={e => setF("type", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                {Object.entries(TYPE_ICON).map(([k,v]) => (
                  <option key={k} value={k}>{v} {k}</option>
                ))}
              </select>
            </div>

            {/* Kedalaman */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                Kedalaman (m) {form.type === "peatland" && <span className="text-amber-500">— wajib untuk gambut</span>}
              </label>
              <input type="number" placeholder={form.type === "peatland" ? "e.g. 4.5" : "opsional"}
                value={form.depth} onChange={e => setF("depth", e.target.value)}
                className={`w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400
                  ${form.type === "peatland" ? "border-amber-300" : "border-gray-200"}`} />
            </div>

            {/* Humidity */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Humidity Sensor (%)</label>
              <input type="number" min="0" max="100" placeholder="e.g. 65"
                value={form.humidity} onChange={e => setF("humidity", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>

            {/* GPS */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { l:"Latitude",  k:"lat", ph:"-1.2412"  },
                { l:"Longitude", k:"lng", ph:"103.6100" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs font-bold text-gray-600 block mb-1">{f.l}</label>
                  <input type="number" placeholder={f.ph} value={form[f.k]}
                    onChange={e => setF(f.k, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                </div>
              ))}
            </div>

            {form.lat && form.lng && (
              <a href={`https://www.google.com/maps?q=${form.lat},${form.lng}&t=k`}
                target="_blank" rel="noreferrer"
                className="text-xs text-green-600 font-bold hover:underline">
                🛰️ Preview di Google Maps Satellite
              </a>
            )}

            <button onClick={addParcel} disabled={saving || !form.name || !form.area || !form.lat || !form.lng}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 active:scale-95 transition-all"
              style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
              {saving ? "Menyimpan..." : "Simpan Lahan"}
            </button>
          </div>
        </Modal>

        {/* ISO Cert Modal */}
        <Modal open={certModal} onClose={() => setCert(false)} title="📋 Upload Sertifikat ISO 14064">
          <div className="flex flex-col gap-3 p-4">
            <p className="text-xs text-gray-500">
              Upload sertifikat ISO 14064 dari lembaga verifikasi. Diperlukan untuk menawarkan kredit karbon di Market.
            </p>

            <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors
              ${certOk ? "border-green-400 bg-green-50" : certError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
              <span className="text-3xl">{certOk ? "📄" : "⬆️"}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">
                  {isoCert ? isoCert.name : "Upload Sertifikat ISO 14064"}
                </p>
                <p className="text-xs text-gray-400">PDF / JPG / PNG · maks 10MB</p>
              </div>
              {certOk && <span className="text-green-600 font-bold">✓</span>}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleCertUpload} />
            </label>

            {certError && <p className="text-xs text-red-600">{certError}</p>}

            {certOk && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs font-bold text-green-700">✅ {isoCert?.name}</p>
                <p className="text-xs text-green-600 mt-0.5">Sertifikat valid — kredit karbon siap ditawarkan</p>
              </div>
            )}

            <button onClick={() => setCert(false)} disabled={!certOk}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 active:scale-95"
              style={{ background:"linear-gradient(135deg,#166634,#0f766e)" }}>
              {certOk ? "Simpan & Tutup" : "Upload file terlebih dahulu"}
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
}