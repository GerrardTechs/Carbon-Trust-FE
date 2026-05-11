import { useState, useEffect } from "react";
import { apiFetch, MOCK_PROJECTS, Modal, Ic } from "./shared.jsx";

export function MarketPage({ t, company, parcels }) {
  const [search, setSearch]           = useState("");
  const [detailProject, setDetail]    = useState(null);
  const [bidModal, setBidModal]   = useState(null);
  const [bidPrice, setBidPrice]   = useState("");
  const [bids, setBids]           = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiFetch(`/projects?search=${encodeURIComponent(search)}`).then(d => {
      if (d && Array.isArray(d))
        setProjects(d.map(p => ({ ...p, isLocked: p.isLocked ?? false })));
    });
  }, [search]);

  const sorted = [...projects].sort((a, b) => {
    const sa = (a.verified ? 2 : 0) + a.rating + (a.ndvi || 0);
    const sb = (b.verified ? 2 : 0) + b.rating + (b.ndvi || 0);
    return sb - sa;
  });

  function lockProject(id) {
    // Sekarang ini akan mengubah state di App.jsx, jadi datanya awet
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, isLocked: true } : p
    ));
  }

  // Kunci proyek di state lokal agar langsung berubah di UI
  function lockProject(projId) {
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, isLocked: true } : p));
    // Juga update detailProject jika sedang terbuka
    setDetail(prev => prev && prev.id === projId ? { ...prev, isLocked: true } : prev);
  }

  function submitBid(proj) {
    const price = parseFloat(bidPrice);
    if (!price || price <= 0) return;
    const newBid = {
      bidder: company?.name || "PT. Anda",
      companyId: company?.id,
      price,
      time: new Date().toLocaleString("id-ID"),
    };
    setBids(prev => ({
      ...prev,
      [proj.id]: [...(prev[proj.id] || []), newBid].sort((a,b) => b.price - a.price),
    }));
    setBidPrice("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  const projIcon = (type) =>
    type?.includes("Reforest") || type?.includes("Reforestasi") ? "🌲" :
    type?.includes("Solar") || type?.includes("Renewable") || type?.includes("Energi") ? "☀️" :
    type?.includes("Blue") ? "🌊" :
    type?.includes("Peat") || type?.includes("Gambut") ? "🌾" : "🌿";

  return (
    <div className="flex flex-col pb-4 fade-up">
      // GANTI blok sticky search bar, tambah sebelum input:
<div className="px-4 pt-4 pb-2 bg-white sticky top-0 z-10 border-b border-gray-100">
  <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2 mb-3 flex items-start gap-2">
    <span className="text-base">🏷️</span>
    <div>
      <p className="text-xs font-bold text-green-800">Carbon Credit Marketplace</p>
      <p className="text-xs text-green-600">
        Lihat profil penjual & kredit yang ditawarkan. Ajukan bid harga untuk membeli.
      </p>
    </div>
  </div>
  <input
    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400"
    placeholder={`🔍 ${t.market?.search || "Cari project..."}`}
    value={search}
    onChange={e => setSearch(e.target.value)}
  />
  <p className="text-xs text-gray-400 mt-2">{sorted.length} project · klik untuk bid</p>
</div>
      <div className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <input
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400"
          placeholder={`🔍 ${t.market.search}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">{sorted.length} projects · {t.market.recommend}</p>
      </div>

      {/* Project cards */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        {sorted.map((proj, idx) => (
          <div
            key={proj.id}
            className={`card p-4 transition-all
              ${idx === 0 && !proj.isLocked ? "border-2 border-green-300 bg-green-50/30" : ""}
              ${proj.isLocked ? "opacity-50 grayscale" : ""}
            `}
          >
            {idx === 0 && !proj.isLocked && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">⭐ {t.market.recommend}</span>
              </div>
            )}

            {/* Badge In Escrow */}
            {proj.isLocked && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">🔒 In Escrow — Sedang Ditinjau</span>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-3xl flex-shrink-0">
                {projIcon(proj.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{proj.company}</p>
                    <p className="text-xs text-gray-500">{proj.flag} {proj.country} · {proj.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-green-700 text-sm">${proj.price}</p>
                    <p className="text-xs text-gray-400">/tCO₂</p>
                  </div>
                </div>

                {proj.ndvi && (
                  <div className="mt-2 bg-white border border-green-100 rounded-xl p-2">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <p className="text-green-700"><span className="font-bold">NDVI:</span> {proj.ndvi}</p>
                      <p className="text-green-700"><span className="font-bold">Abs:</span> {proj.absRate} tCO₂/ha/yr</p>
                      <p className="text-gray-500"><span className="font-bold">Avail:</span> {proj.available?.toLocaleString()} t</p>
                      <p className="text-amber-500 flex items-center gap-0.5"><Ic.Star />{proj.rating}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
  {proj.verified
    ? <span className="flex items-center gap-0.5 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold">✅ ISO 14064</span>
    : <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">⏳ Pending</span>
  }
  {/* Bid count badge */}
  {bids[proj.id]?.length > 0 && (
    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
      {bids[proj.id].length} bid
    </span>
  )}
  <button
    onClick={() => { setDetail(proj); setSubmitted(false); }}
    className="ml-auto text-xs px-3 py-1.5 rounded-xl font-bold text-white active:scale-95 transition-all"
    style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
    Lihat & Bid →
  </button>
</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <Modal open={!!detailProject} onClose={() => setDetail(null)} title={`🌿 ${detailProject?.company}`}>
  {detailProject && (
    <div className="flex flex-col gap-4">

      {/* Profil penjual */}
      <div className="bg-slate-50 rounded-xl p-3">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Profil Penjual</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l:"Negara",     v:`${detailProject.flag} ${detailProject.country}` },
            { l:"Tipe",       v:detailProject.type },
            { l:"Harga ask",  v:`$${detailProject.price}/tCO₂` },
            { l:"Stok",       v:`${detailProject.available?.toLocaleString()} t` },
            ...(detailProject.ndvi ? [
              { l:"NDVI",     v:detailProject.ndvi },
              { l:"Serapan",  v:`${detailProject.absRate} tCO₂/ha/yr` },
            ] : []),
            { l:"Rating",     v:`⭐ ${detailProject.rating}` },
            { l:"Sertifikat", v:detailProject.verified ? "✅ ISO 14064" : "⏳ Pending" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-2.5">
              <p className="text-xs text-gray-400">{item.l}</p>
              <p className="font-bold text-sm text-gray-800">{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sertifikat karbon (total 3 project - emisi) */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <p className="text-xs font-bold text-green-700 mb-1">📜 Sertifikat Kredit Karbon</p>
        <p className="text-xs text-green-600">
          Total serapan 3 lahan dikurangi emisi operasional →{" "}
          <strong>{detailProject.available?.toLocaleString()} kredit karbon</strong> tersertifikasi ISO 14064
        </p>
        {detailProject.verified && (
          <span className="inline-block mt-1.5 text-xs bg-green-700 text-white px-2 py-0.5 rounded-full font-bold">
            ✅ Terverifikasi & dapat dibid
          </span>
        )}
        {!detailProject.verified && (
          <span className="inline-block mt-1.5 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
            ⏳ Belum upload sertifikat ISO — tidak bisa dibid
          </span>
        )}
      </div>

      {/* Form bid */}
      {detailProject.verified ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-700">Ajukan Harga Bid (USD/tCO₂)</p>
          <div className="flex gap-2">
            <input
              type="number" min="0" step="0.1"
              placeholder={`Harga ask: $${detailProject.price}`}
              value={bidPrice}
              onChange={e => setBidPrice(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
            <button
              onClick={() => submitBid(detailProject)}
              disabled={!bidPrice || submitted}
              className="px-4 py-2 rounded-xl font-bold text-white text-xs disabled:opacity-50 transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
              {submitted ? "✓ Terkirim" : "Bid"}
            </button>
          </div>
          {bidPrice && parseFloat(bidPrice) < detailProject.price && (
            <p className="text-xs text-amber-600">
              Bid kamu di bawah harga ask — penjual bisa menolak
            </p>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-bold text-center">
          Penjual belum upload sertifikat ISO verifikasi. Tidak dapat dibid.
        </div>
      )}

      {/* Daftar bid masuk */}
      {bids[detailProject.id]?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">Bid Masuk (tertinggi dulu)</p>
          <div className="flex flex-col gap-1.5">
            {bids[detailProject.id].map((b, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl ${i === 0 ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                <div>
                  <p className="text-xs font-bold text-gray-800">{b.bidder}</p>
                  <p className="text-xs text-gray-400">{b.time}</p>
                </div>
                <p className={`font-black text-sm ${i === 0 ? "text-green-700" : "text-gray-600"}`}>
                  ${b.price}/t {i === 0 && "👑"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}
</Modal>
    </div>
  );
}