/**
 * CarbonTrust — TxPage.jsx
 * Transaction tracker: escrow stages, blockchain ledger view
 */
import { useState } from "react";
import { apiFetch, Modal, Spinner, Ic } from "./shared.jsx";

export function TxPage({ tx, setTx, t, lang }) {
  const [blockModal, setBlockModal] = useState(false);
  const [hashes, setHashes] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const STAGES = [t.tx.stage0, t.tx.stage1, t.tx.stage2, t.tx.stage3];
  const ICONS = ["📝", "🔒", "✅", "💸"];

  if (!tx) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 fade-up">
      <p className="text-4xl">📋</p>
      <p className="text-gray-500 text-sm">{t.exit?.noActiveTransaction||"No active transaction"}</p>
      <p className="text-xs text-gray-400">{lang==="id"?"Mulai transaksi dari halaman Bursa":lang==="zh"?"从市场页面开始交易":lang==="ko"?"시장 페이지에서 거래를 시작하세요":lang==="ja"?"市場ページから取引を開始してください":"Start a transaction from the Market page"}</p>
    </div>
  );

  function viewBlockchain() {
    const c = "0123456789abcdef";
    setHashes(Array.from({ length: 5 }, (_, i) => ({
      block: 19847320 + i,
      hash: "0x" + Array.from({ length: 64 }, () => c[Math.floor(Math.random() * 16)]).join(""),
      time: `${i * 2 + 1} min ago`,
    })));
    setBlockModal(true);
  }

  async function confirm() {
    setConfirming(true);
    await apiFetch(`/transactions/${tx.id}/status`, { method: "PATCH", body: JSON.stringify({ status: 3 }) });
    setTimeout(() => { setTx(x => ({ ...x, status: 3 })); setConfirming(false); setConfirmed(true); }, 1800);
  }

  function advanceStage() {
    if (tx.status < 2) {
      setTx(x => ({ ...x, status: x.status + 1 }));
      apiFetch(`/transactions/${tx.id}/status`, { method: "PATCH", body: JSON.stringify({ status: tx.status + 1 }) });
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4 fade-up">
      {/* Header card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Transaction ID</p>
            <p className="font-black text-gray-800 text-lg">{tx.id}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${tx.status === 3 ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {tx.status === 3 ? "✓ Completed" : "● Active"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400 text-xs">{t.market.buyer}</p><p className="font-bold text-xs">{tx.buyer}</p></div>
          <div><p className="text-gray-400 text-xs">{t.market.seller}</p><p className="font-bold text-xs">{tx.seller}</p></div>
          <div><p className="text-gray-400 text-xs">{t.tx.volume}</p><p className="font-bold">{tx.volume} tCO₂e</p></div>
          <div><p className="text-gray-400 text-xs">{t.tx.price}</p><p className="font-bold">${tx.pricePerTon}/t</p></div>
        </div>
      </div>

      {/* Escrow */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}>
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{t.tx.escrow}</p>
        <p className="text-3xl font-black">${tx.escrowAmount?.toLocaleString()}</p>
        <p className="text-slate-400 text-xs mt-1">USD · {t.tx.total}: ${tx.totalUSD?.toLocaleString()}</p>
        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${((tx.status + 1) / 4) * 100}%` }} />
        </div>
        <p className="text-slate-400 text-xs mt-1">Stage {tx.status + 1}/4</p>
      </div>

      {/* Timeline */}
      <div className="card p-4">
        <p className="font-bold text-gray-800 mb-4">{t.tx.title} Status</p>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
          <div className="absolute left-5 top-5 w-0.5 bg-emerald-500 transition-all duration-700"
            style={{ height: `${(tx.status / 3) * 85}%` }} />
          <div className="flex flex-col gap-5">
            {STAGES.map((stage, i) => {
              const done = i <= tx.status;
              const active = i === tx.status;
              return (
                <div key={i} className="flex items-start gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg transition-all ${done ? "bg-emerald-100 ring-2 ring-emerald-400" : "bg-gray-100"} ${active ? "ring-4 ring-emerald-200 scale-110" : ""}`}>
                    {ICONS[i]}
                  </div>
                  <div className="pt-1">
                    <p className={`font-bold text-sm ${done ? "text-gray-800" : "text-gray-400"}`}>{stage}</p>
                    {active && <p className="text-xs text-emerald-600 pulse2">● In progress</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advance stage (demo) */}
      {tx.status < 2 && (
        <button onClick={advanceStage}
          className="card p-3 text-center text-xs text-gray-500 hover:bg-gray-50 border-dashed">
          ▶ Advance to next stage (demo)
        </button>
      )}

      <button onClick={viewBlockchain}
        className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 py-3 rounded-xl font-bold hover:bg-green-50">
        <Ic.Chain />{t.tx.blockchain}
      </button>

      {!confirmed && tx.status === 2 ? (
        <button onClick={confirm} disabled={confirming}
          className="flex items-center justify-center gap-2 w-full text-white py-3 rounded-xl font-bold disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
          {confirming ? <Spinner /> : <Ic.Check />}
          {t.tx.confirmReceipt}
        </button>
      ) : (confirmed || tx.status === 3) ? (
        <div className="flex items-center justify-center gap-2 w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold border border-emerald-200">
          ✅ Transaction Complete — Funds Released
        </div>
      ) : null}

      <Modal open={blockModal} onClose={() => setBlockModal(false)} title="⛓ Blockchain Ledger">
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">Immutable record on Ethereum Testnet (Sepolia)</p>
          {hashes.map((e, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-mono">Block #{e.block}</span>
                <span className="text-gray-400">{e.time}</span>
              </div>
              <p className="font-mono text-xs text-green-700 break-all">{e.hash}</p>
            </div>
          ))}
          <p className="text-xs text-center text-gray-400">{t.tx.immutable}</p>
        </div>
      </Modal>
    </div>
  );
}

