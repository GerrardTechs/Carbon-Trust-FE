
import { useState, useEffect } from "react";
import { COMPANY_ID, apiFetch, MOCK_PROJECTS, Modal, Spinner, Ic } from "./shared.jsx";

export function MarketPage({ t, setPage, setActiveTx }) {
  const [search, setSearch]           = useState("");
  const [projects, setProjects]       = useState(MOCK_PROJECTS);
  const [detailProject, setDetail]    = useState(null);
  const [matchModal, setMatchModal]   = useState(false);
  const [matching, setMatching]       = useState(false);
  const [matchResult, setMatchResult] = useState(null);

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

  async function runMatch() {
    setMatchModal(true); setMatching(true); setMatchResult(null);
    const res = await apiFetch("/match", { method:"POST", body: JSON.stringify({ companyId: COMPANY_ID, volumeNeeded: 500 }) });
    setTimeout(() => { setMatching(false); setMatchResult(res?.best || sorted[0]); }, 2200);
  }

  async function startTransaction(proj) {
    const tx = await apiFetch("/transactions", {
      method: "POST",
      body: JSON.stringify({ buyerCompanyId: COMPANY_ID, sellerCompanyId: proj.companyId || "EXT", projectId: proj.id, buyer: "PT. Nusantara Hijau Tbk", seller: proj.company, volume: 500, pricePerTon: proj.price }),
    });
    setActiveTx(tx || { id:"TXN-NEW-001", buyer:"PT. Nusantara Hijau Tbk", seller: proj.company, volume:500, pricePerTon: proj.price, totalUSD:500*proj.price, escrowAmount:500*proj.price, status:0, blockHash:"0x"+"abc123".repeat(10), createdAt:new Date() });
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
          <div key={proj.id} className={`card p-4 ${idx === 0 ? "border-2 border-green-300 bg-green-50/30" : ""}`}>
            {idx === 0 && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">⭐ {t.market.recommend}</span>
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
                  {/* Single "View Details" button — opens detail modal */}
                  <button onClick={() => setDetail(proj)}
                    className="ml-auto text-xs text-white px-3 py-1.5 rounded-xl font-bold active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
                    {t.market.detail}
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
            <button onClick={() => { startTransaction(detailProject); setDetail(null); }}
              className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
              {t.market.transact} →
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
            <button onClick={() => { startTransaction(matchResult); setMatchModal(false); }}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg,#166634,#0f766e)" }}>
              {t.market.proceed}
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
