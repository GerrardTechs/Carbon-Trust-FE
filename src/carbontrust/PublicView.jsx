import { useState, useEffect } from "react";

const API = "https://carbon-trust-be.onrender.com/api";
const TYPE_ICON = { forest:"🌲", peatland:"🌾", mangrove:"🌴", seawater:"🌊", agricultural:"🌱", industrial:"🏭", "Reforestation":"🌲", "Renewable Energy":"☀️", "Blue Carbon":"🌊", "Peat Restoration":"🌾" };

export default function PublicView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [detail, setDetail]     = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    fetch(`${API}/public/projects`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setProjects(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function loadDetail(proj) {
    const res = await fetch(`${API}/public/company/${proj.companyId}`).then(r => r.json());
    setDetail({ ...proj, companyDetail: res });
  }

  const types = ["all", ...new Set(projects.map(p => p.type))];
  const filtered = projects.filter(p => {
    const matchSearch = p.company.toLowerCase().includes(search.toLowerCase()) ||
                        p.country.toLowerCase().includes(search.toLowerCase()) ||
                        p.type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .card { background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
        .fade-up { animation: fadeUp .3s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:50; display:flex; align-items:flex-end; }
        .sheet { background:#fff; border-radius:20px 20px 0 0; width:100%; max-height:85vh; overflow-y:auto; padding:24px; }
      `}</style>

      <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-black text-lg text-gray-800">
                  <span style={{ color:"#166534" }}>Carbon</span>
                  <span style={{ color:"#0f766e" }}>Trust</span>
                </p>
                <p className="text-xs text-gray-400">Carbon Credit Marketplace — Public View</p>
              </div>
              <a href="/"
                className="text-xs font-bold text-white px-3 py-1.5 rounded-xl"
                style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                Login →
              </a>
            </div>

            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400"
              placeholder="🔍 Cari project, negara, tipe..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                  ${filter === t
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t === "all" ? "Semua" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats banner */}
        <div className="mx-4 mt-4 rounded-2xl p-4 text-white mb-4"
          style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
          <p className="text-xs text-green-200 uppercase tracking-wide mb-1">Platform Overview</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l:"Project",  v:projects.length },
              { l:"Verified", v:projects.filter(p=>p.verified).length },
              { l:"Negara",   v:new Set(projects.map(p=>p.country)).size },
            ].map((s,i) => (
              <div key={i}>
                <p className="font-black text-xl">{s.v}</p>
                <p className="text-xs text-green-300">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project list */}
        <div className="px-4 flex flex-col gap-3 pb-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">Memuat project...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm text-gray-500">Tidak ada project ditemukan</p>
            </div>
          ) : filtered.map(proj => (
            <div key={proj.id} className="card p-4 cursor-pointer hover:shadow-md transition-shadow fade-up"
              onClick={() => loadDetail(proj)}>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0">
                  {TYPE_ICON[proj.type] || "🌿"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{proj.company}</p>
                      <p className="text-xs text-gray-400">{proj.flag} {proj.country} · {proj.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-green-700 text-sm">${proj.price}</p>
                      <p className="text-xs text-gray-400">/tCO₂</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {[
                      { l:"Stok",     v:`${proj.available?.toLocaleString()} t` },
                      { l:"Serapan",  v:proj.ndvi ? `${proj.absRate} t/ha` : "—" },
                      { l:"Rating",   v:`⭐ ${proj.rating}` },
                    ].map((s,i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-1.5 text-center">
                        <p className="text-xs font-bold text-gray-700">{s.v}</p>
                        <p className="text-xs text-gray-400">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {proj.verified
                      ? <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold">✅ ISO 14064</span>
                      : <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">⏳ Pending</span>
                    }
                    {proj.isoVerified && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">🔒 Verified</span>
                    )}
                    <span className="ml-auto text-xs text-gray-400">Lihat detail →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            CarbonTrust · ISO 14064:2018 · Paris Agreement Article 6
          </p>
          <a href="/"
            className="inline-block mt-2 text-xs font-bold text-green-700 hover:underline">
            Daftar / Login untuk bid →
          </a>
        </div>

      </div>

      {/* Detail bottom sheet */}
      {detail && (
        <div className="overlay" onClick={() => setDetail(null)}>
          <div className="sheet fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-gray-800">{detail.company}</p>
              <button onClick={() => setDetail(null)} className="text-gray-400 text-xl">✕</button>
            </div>

            {/* Company info */}
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Profil Perusahaan</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l:"Negara",       v:`${detail.flag} ${detail.country}` },
                  { l:"Tipe Project", v:detail.type },
                  { l:"Total Lahan",  v:`${detail.companyDetail?.parcels?.length || 0} lahan` },
                  { l:"Total Area",   v:`${detail.companyDetail?.totalAbsorption || 0} t/bln` },
                  { l:"ESG Score",    v:detail.companyESG ?? "—" },
                  { l:"ISO Status",   v:detail.isoVerified ? "✅ Verified" : "⏳ Pending" },
                ].map((item,i) => (
                  <div key={i} className="bg-white rounded-lg p-2.5">
                    <p className="text-xs text-gray-400">{item.l}</p>
                    <p className="font-bold text-sm text-gray-800">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Parcel list */}
            {detail.companyDetail?.parcels?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Lahan & Serapan</p>
                <div className="flex flex-col gap-1.5">
                  {detail.companyDetail.parcels.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span>{TYPE_ICON[p.type] || "🌿"}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-700">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.area} ha · {p.status}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-black ${p.absorptionMonthly >= 0 ? "text-green-700" : "text-red-500"}`}>
                        {p.absorptionMonthly >= 0 ? "▲" : "▼"}{Math.abs(p.absorptionMonthly)} t/bln
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Carbon summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-green-700 mb-2">📜 Kredit Karbon Tersedia</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-black text-green-700">
                    {detail.available?.toLocaleString()} t
                  </p>
                  <p className="text-xs text-green-600">tCO₂e tersertifikasi</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-green-700">${detail.price}/ton</p>
                  <p className="text-xs text-green-600">
                    ≈ ${(detail.available * detail.price).toLocaleString()} total
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a href="/"
              className="block w-full text-center py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
              style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
              Login untuk Bid →
            </a>
            <p className="text-xs text-gray-400 text-center mt-2">
              Butuh akun untuk mengajukan bid harga
            </p>
          </div>
        </div>
      )}
    </div>
  );
}