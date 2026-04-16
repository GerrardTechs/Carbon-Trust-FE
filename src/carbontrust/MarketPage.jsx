import { useState, useEffect } from "react";
import { COMPANY_ID, apiFetch, MOCK_PROJECTS, Modal, Spinner, Ic } from "./shared.jsx";

export function MarketPage({ t, setPage, setActiveTx, projects, setProjects }) {
  const [search, setSearch]           = useState("");
  const [detailProject, setDetail]    = useState(null);
  const [matchModal, setMatchModal]   = useState(false);
  const [matching, setMatching]       = useState(false);
  const [matchResult, setMatchResult] = useState(null);

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

  async function runMatch() {
    setMatchModal(true); setMatching(true); setMatchResult(null);
    const res = await apiFetch("/match", { method:"POST", body: JSON.stringify({ companyId: COMPANY_ID, volumeNeeded: 500 }) });
    setTimeout(() => { setMatching(false); setMatchResult(res?.best || sorted[0]); }, 2200);
  }

  // Kunci proyek di state lokal agar langsung berubah di UI
  function lockProject(projId) {
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, isLocked: true } : p));
    // Juga update detailProject jika sedang terbuka
    setDetail(prev => prev && prev.id === projId ? { ...prev, isLocked: true } : prev);
  }

  async function startTransaction(proj) {
    // 1. Kunci proyek di UI agar tidak dibeli 2x (Anti-Fraud)
    lockProject(proj.id);
  
    // 2. Generate Hash palsu untuk simulasi Blockchain Trace
    const blockHash = "0x" + Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)).join("");
  
    // 3. Gabungkan data proyek ke dalam object transaksi
    // Kita set status: 0 agar animasi escrow dimulai dari tahap awal
    const tx = {
      id: "TXN-" + Math.floor(Math.random() * 900000 + 100000),
      project: proj, // Simpan objek project utuh di sini agar TxPage bisa baca detailnya
      buyer: "PT. Nusantara Hijau Tbk",
      seller: proj.company,
      projectId: proj.id,
      volume: 500,
      pricePerTon: proj.price,
      totalUSD: 500 * proj.price,
      status: 0, // <--- Mulai dari Escrow
      blockHash,
      timestamp: new Date().toISOString(),
    };
  
    // 4. Set ke state global dan pindah halaman
    setActiveTx(tx);
    setPage("tx");
  }

  const projIcon = (type) =>
    type?.includes("Reforest") || type?.includes("Reforestasi") ? "🌲" :
    type?.includes("Solar") || type?.includes("Renewable") || type?.includes("Energi") ? "☀️" :
    type?.includes("Blue") ? "🌊" :
    type?.includes("Peat") || type?.includes("Gambut") ? "🌾" : "🌿";

  return (
    <div className="flex flex-col pb-4 fade-up">
      {/* Sticky search bar */}
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
                    ? <span className="flex items-center gap-0.5 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold"><Ic.Shield />ISO 14064</span>
                    : <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">⏳ Pending</span>
                  }
                  <button
                    disabled={proj.isLocked}
                    onClick={() => !proj.isLocked && setDetail(proj)}
                    className={`ml-auto text-xs px-3 py-1.5 rounded-xl font-bold transition-all
                      ${proj.isLocked
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "text-white active:scale-95"
                      }`}
                    style={proj.isLocked ? {} : { background: "linear-gradient(135deg,#166534,#0f766e)" }}
                  >
                    {proj.isLocked ? "Terkunci" : t.market.detail}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Matching FAB */}
      <div className="fixed bottom-20 right-4 z-40">
        <button onClick={runMatch}
          className="text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
          <Ic.Bot />{t.market.aiMatch}
        </button>
      </div>

      {/* Project Detail Modal */}
      <Modal open={!!detailProject} onClose={() => setDetail(null)} title={`🌿 ${detailProject?.company}`}>
        {detailProject && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { l:"Country",     v:`${detailProject.flag} ${detailProject.country}` },
                { l:"Type",        v:detailProject.type },
                { l:"Price",       v:`$${detailProject.price}/tCO₂` },
                { l:"Available",   v:`${detailProject.available?.toLocaleString()} t` },
                ...(detailProject.ndvi ? [
                  { l:"NDVI",        v:detailProject.ndvi },
                  { l:"Absorption",  v:`${detailProject.absRate} tCO₂/ha/yr` },
                ] : []),
                { l:"Rating",      v:`⭐ ${detailProject.rating}` },
                { l:"Certified",   v:detailProject.verified ? "✅ ISO 14064" : "⏳ Pending" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{item.l}</p>
                  <p className="font-bold text-sm text-gray-800">{item.v}</p>
                </div>
              ))}
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{t.market.est500}</p>
              <p className="text-2xl font-black text-green-700">${(500 * detailProject.price).toLocaleString()} USD</p>
              <p className="text-xs text-green-600">
                = 500 carbon credits ·{" "}
                {detailProject.absRate > 0
                  ? `${(500 / (detailProject.absRate || 1)).toFixed(1)} ${t.market.eqArea}`
                  : t.market.renewableProj}
              </p>
            </div>
            <button
              disabled={detailProject.isLocked}
              onClick={() => { if (!detailProject.isLocked) { startTransaction(detailProject); setDetail(null); } }}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all
                ${detailProject.isLocked ? "opacity-50 cursor-not-allowed bg-gray-400" : "active:scale-95"}`}
              style={detailProject.isLocked ? {} : { background: "linear-gradient(135deg,#166534,#0f766e)" }}
            >
              {detailProject.isLocked ? "🔒 Proyek Sedang Ditinjau" : `${t.market.transact} →`}
            </button>
          </div>
        )}
      </Modal>

      {/* AI Match Modal */}
      <Modal open={matchModal} onClose={() => setMatchModal(false)} title="🤖 AI Carbon Matching Engine">
        {matching ? (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-green-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full spin" />
            </div>
            <p className="text-gray-600 text-sm">{t.market.analyzing}</p>
            <p className="text-xs text-gray-400">Analyzing: price · volume · location · NDVI · certification</p>
          </div>
        ) : matchResult ? (
          <div className="flex flex-col gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-4xl font-black text-green-700">{matchResult.score || 97.4}%</p>
              <p className="text-xs text-gray-500">{t.market.score}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">{t.market.buyer}</p><p className="text-xs font-bold">PT. Nusantara Hijau Tbk</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">{t.market.seller}</p><p className="text-xs font-bold">{matchResult.company}</p></div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-sm">
              <p className="text-xs text-gray-400 mb-1">MRV Data</p>
              <p className="font-bold">{matchResult.company}</p>
              {matchResult.ndvi && <p className="text-xs text-green-700 mt-1">NDVI {matchResult.ndvi} · Abs. {matchResult.absRate} tCO₂/ha/yr</p>}
              <div className="flex justify-between mt-2 text-xs">
                <span>Volume: <strong>500 t</strong></span>
                <span>Price: <strong>${matchResult.price}/t</strong></span>
              </div>
              <p className="text-green-700 font-black mt-1">Total: ${(500 * matchResult.price).toLocaleString()} USD</p>
            </div>
            <button
              disabled={matchResult.isLocked}
              onClick={() => { if (!matchResult.isLocked) { startTransaction(matchResult); setMatchModal(false); } }}
              className={`w-full py-3 rounded-xl font-bold text-white
                ${matchResult.isLocked ? "opacity-50 cursor-not-allowed bg-gray-400" : ""}`}
              style={matchResult.isLocked ? {} : { background: "linear-gradient(135deg,#166634,#0f766e)" }}
            >
              {matchResult.isLocked ? "🔒 Proyek Terkunci" : t.market.proceed}
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}