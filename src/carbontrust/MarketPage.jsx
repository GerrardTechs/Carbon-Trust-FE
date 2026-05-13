import { useState, useEffect } from "react";
import { apiFetch, MOCK_PROJECTS, Modal, Ic } from "./shared.jsx";

const projIcon = t =>
  t?.includes("Reforest") || t?.includes("Reforestasi") ? "🌲" :
  t?.includes("Solar") || t?.includes("Renewable") ? "☀️" :
  t?.includes("Blue") ? "🌊" :
  t?.includes("Peat") || t?.includes("Gambut") ? "🌾" : "🌿";

export function MarketPage({ t, company, projects, setProjects }) {
  const [search, setSearch]       = useState("");
  const [detail, setDetail]       = useState(null);
  const [bids, setBids]           = useState({});   // { projId: [{bidder,price,time}] }
  const [bidPrice, setBidPrice]   = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [offerModal, setOffer]    = useState(false); // user tawarkan kredit sendiri
  const [myOffer, setMyOffer]     = useState(null);
  const [offerForm, setOfferForm] = useState({ credits:"", price:"", note:"" });

  useEffect(() => {
    apiFetch(`/projects?search=${encodeURIComponent(search)}`).then(d => {
      if (d && Array.isArray(d)) setProjects(d);
    });
  }, [search]);

  const sorted = [...projects].sort((a, b) => {
    const sa = (a.verified ? 2 : 0) + a.rating + (a.ndvi || 0);
    const sb = (b.verified ? 2 : 0) + b.rating + (b.ndvi || 0);
    return sb - sa;
  });

  function submitBid(proj) {
    const price = parseFloat(bidPrice);
    if (!price || price <= 0) return;
    const newBid = {
      bidder: company?.name || "PT. Anda",
      price,
      time: new Date().toLocaleString("id-ID"),
    };
    setBids(prev => ({
      ...prev,
      [proj.id]: [...(prev[proj.id] || []), newBid].sort((a, b) => b.price - a.price),
    }));
    setBidPrice("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  function publishOffer() {
    if (!offerForm.credits || !offerForm.price) return;
    setMyOffer({
      company: company?.name || "PT. Anda",
      credits: parseInt(offerForm.credits),
      price:   parseFloat(offerForm.price),
      note:    offerForm.note,
      time:    new Date().toLocaleDateString("id-ID"),
    });
    setOffer(false);
  }

  return (
    <div className="flex flex-col pb-4 fade-up">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2 mb-3 flex items-start gap-2">
          <span className="text-base">🏷️</span>
          <div>
            <p className="text-xs font-bold text-green-800">Carbon Credit Marketplace</p>
            <p className="text-xs text-green-600">
              Lihat profil penjual & kredit yang ditawarkan. Ajukan bid untuk membeli.
            </p>
          </div>
        </div>
        <input
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400"
          placeholder={`🔍 ${t.market?.search || "Cari project..."}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">{sorted.length} project tersedia · klik untuk bid</p>
      </div>

      {/* My offer banner — jika sudah publish */}
      {myOffer && (
        <div className="mx-4 mt-3 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
          <p className="text-xs font-bold text-teal-700 mb-1">📢 Penawaran Kamu Aktif</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-black text-teal-800">{myOffer.credits.toLocaleString()} tCO₂e</p>
              <p className="text-xs text-teal-600">@ ${myOffer.price}/ton · {myOffer.time}</p>
              {myOffer.note && <p className="text-xs text-teal-500 mt-0.5">{myOffer.note}</p>}
            </div>
            <button onClick={() => setMyOffer(null)}
              className="text-xs text-red-400 font-bold hover:underline">
              Tarik
            </button>
          </div>
        </div>
      )}

      {/* Project cards */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        {sorted.map((proj, idx) => (
          <div key={proj.id}
            className={`card p-4 transition-all ${idx === 0 ? "border-2 border-green-300 bg-green-50/30" : ""}`}>

            {idx === 0 && (
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                ⭐ Top Rated
              </span>
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
                  <div className="mt-2 bg-white border border-green-100 rounded-xl p-2 grid grid-cols-2 gap-1 text-xs">
                    <p className="text-green-700"><span className="font-bold">NDVI:</span> {proj.ndvi}</p>
                    <p className="text-green-700"><span className="font-bold">Abs:</span> {proj.absRate} t/ha/yr</p>
                    <p className="text-gray-500"><span className="font-bold">Stok:</span> {proj.available?.toLocaleString()} t</p>
                    <p className="text-amber-500">⭐ {proj.rating}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  {proj.verified
                    ? <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold">✅ ISO 14064</span>
                    : <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">⏳ Pending ISO</span>
                  }
                  {bids[proj.id]?.length > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      {bids[proj.id].length} bid
                    </span>
                  )}
                  <button onClick={() => { setDetail(proj); setSubmitted(false); setBidPrice(""); }}
                    className="ml-auto text-xs px-3 py-1.5 rounded-xl font-bold text-white active:scale-95 transition-all"
                    style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                    Lihat & Bid →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol tawarkan kredit sendiri */}
      <div className="px-4 mt-4">
        <button onClick={() => setOffer(true)}
          className="w-full py-3 rounded-xl font-bold border-2 border-dashed border-green-400 text-green-700 bg-green-50 active:scale-95 transition-all text-sm">
          + Tawarkan Kredit Karbon Kamu
        </button>
        <p className="text-xs text-gray-400 text-center mt-1">
          Wajib upload sertifikat ISO di halaman Verify terlebih dahulu
        </p>
      </div>

      {/* Detail + Bid Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`🌿 ${detail?.company}`}>
        {detail && (
          <div className="flex flex-col gap-4 p-1">

            {/* Profil penjual */}
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Profil Penjual</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l:"Negara",    v:`${detail.flag} ${detail.country}` },
                  { l:"Tipe",      v:detail.type },
                  { l:"Harga ask", v:`$${detail.price}/tCO₂` },
                  { l:"Stok",      v:`${detail.available?.toLocaleString()} t` },
                  ...(detail.ndvi ? [
                    { l:"NDVI",    v:detail.ndvi },
                    { l:"Serapan", v:`${detail.absRate} t/ha/yr` },
                  ] : []),
                  { l:"Rating",    v:`⭐ ${detail.rating}` },
                  { l:"Status",    v:detail.verified ? "✅ ISO 14064" : "⏳ Pending" },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-lg p-2.5">
                    <p className="text-xs text-gray-400">{item.l}</p>
                    <p className="font-bold text-sm text-gray-800">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Info sertifikat karbon */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-1">📜 Kredit Karbon Ditawarkan</p>
              <p className="text-xs text-green-600">
                Total serapan lahan dikurangi emisi operasional →{" "}
                <strong>{detail.available?.toLocaleString()} tCO₂e</strong> tersertifikasi
              </p>
              {detail.verified
                ? <span className="inline-block mt-1.5 text-xs bg-green-700 text-white px-2 py-0.5 rounded-full font-bold">✅ Dapat dibid</span>
                : <span className="inline-block mt-1.5 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⏳ Belum ISO — tidak bisa dibid</span>
              }
            </div>

            {/* Form bid */}
            {detail.verified ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-700">Ajukan Harga Bid (USD/tCO₂)</p>
                <p className="text-xs text-gray-400">Harga ask: <strong>${detail.price}</strong> — bid di bawah bisa ditolak penjual</p>
                <div className="flex gap-2">
                  <input type="number" min="0" step="0.1"
                    placeholder={`Min. $${detail.price}`}
                    value={bidPrice}
                    onChange={e => setBidPrice(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                  <button
                    onClick={() => submitBid(detail)}
                    disabled={!bidPrice || submitted}
                    className="px-4 py-2 rounded-xl font-bold text-white text-sm disabled:opacity-50 active:scale-95 transition-all"
                    style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                    {submitted ? "✓ Terkirim" : "Bid"}
                  </button>
                </div>
                {bidPrice && parseFloat(bidPrice) < detail.price && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
                    ⚠️ Bid di bawah harga ask — penjual bisa menolak
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-bold text-center">
                Penjual belum upload sertifikat ISO. Tidak dapat dibid saat ini.
              </div>
            )}

            {/* Daftar bid */}
            {bids[detail.id]?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">
                  Bid Masuk ({bids[detail.id].length}) — tertinggi dulu
                </p>
                <div className="flex flex-col gap-1.5">
                  {bids[detail.id].map((b, i) => (
                    <div key={i}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl
                        ${i === 0 ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
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

      {/* Modal tawarkan kredit sendiri (#35) */}
      <Modal open={offerModal} onClose={() => setOffer(false)} title="📢 Tawarkan Kredit Karbon">
        <div className="flex flex-col gap-3 p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            Pastikan kamu sudah upload sertifikat ISO di halaman <strong>Verify</strong> sebelum menawarkan kredit.
          </div>
          {[
            { label:"Jumlah Kredit (tCO₂e)", key:"credits", type:"number", ph:"e.g. 1200" },
            { label:"Harga yang Ditawarkan (USD/t)", key:"price", type:"number", ph:"e.g. 18.5" },
            { label:"Catatan (opsional)", key:"note", type:"text", ph:"e.g. Lahan gambut terverifikasi Sentinel-2" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.ph}
                value={offerForm[f.key]}
                onChange={e => setOfferForm(o => ({ ...o, [f.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          ))}
          {offerForm.credits && offerForm.price && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-600">
                Total nilai penawaran:{" "}
                <strong>${(parseFloat(offerForm.credits) * parseFloat(offerForm.price)).toLocaleString()} USD</strong>
              </p>
            </div>
          )}
          <button onClick={publishOffer}
            disabled={!offerForm.credits || !offerForm.price}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            Publish Penawaran
          </button>
        </div>
      </Modal>
    </div>
  );
}