/**
 * TxPage.jsx — Halaman Transaksi Kredit Karbon
 * Alur efektif antara Perusahaan (Buyer) dan Pemilik Kredit (Seller)
 *
 * Tab:
 *  1. Posisi Kredit Saya      — ringkasan emisi vs serapan + posisi kredit
 *  2. Transaksi Aktif         — escrow berjalan
 *  3. Riwayat Transaksi       — log semua deal selesai
 */
import { useState, useEffect } from "react";
import { apiFetch, CREDIT_PRICE, calcAbsorption } from "../shared.jsx";

const STEPS = [
  { key:"created",  icon:"📝", label:"Penawaran Diajukan",       desc:"Bid dikirim ke seller, menunggu konfirmasi." },
  { key:"escrow",   icon:"🔒", label:"Dana Masuk Escrow",        desc:"Dana terkunci di sistem — tidak bisa ditarik sepihak." },
  { key:"verified", icon:"🛰️", label:"Kredit Diverifikasi",      desc:"Satelit & IoT mengkonfirmasi serapan lahan seller." },
  { key:"released", icon:"💸", label:"Selesai — Dana Dilepas",   desc:"Kredit berpindah, dana diteruskan ke seller. Tercatat di sistem MRV." },
];

const MOCK_HISTORY = [
  { id:"TX-001", seller:"PT Borneo Green", vol:500,  price:18.5, total:9250,  date:"12 Mei 2025", status:"completed", hash:"0x7af2...c90e" },
  { id:"TX-002", seller:"CV Mangrove Nusa", vol:200, price:16.0, total:3200,  date:"3 Apr 2025",  status:"completed", hash:"0x3bc9...f12a" },
];

export function TxPage({ tx, setTx, t, lang, setPage, parcels = [], company }) {
  const [tab, setTab]           = useState("position");
  const [step, setStep]         = useState(0);
  const [history, setHistory]   = useState(MOCK_HISTORY);
  const [confirm, setConfirm]   = useState(false);

  // Hitung posisi kredit dari props
  const totalAbs = parcels.reduce((s, p) => s + Math.max(0, calcAbsorption(p)), 0);
  const totalEm  = parcels.reduce((s, p) => s + Math.max(0, -calcAbsorption(p)), 0);
  const netCredit = Math.floor((totalAbs - totalEm) * 12);
  const isPositive = netCredit >= 0;

  // Auto-advance escrow demo
  useEffect(() => {
    if (tab !== "active" || !tx || step >= 3) return;
    const t = setTimeout(() => setStep(s => s + 1), 3000);
    return () => clearTimeout(t);
  }, [tab, tx, step]);

  // Load history dari BE
  useEffect(() => {
    if (!company?.id) return;
    apiFetch(`/transactions?companyId=${company.id}`).then(data => {
      if (Array.isArray(data) && data.length) setHistory(data);
    });
  }, [company?.id]);

  const TAB_ITEMS = [
    { id:"position", label:"Posisi Kredit", icon:"📊" },
    { id:"active",   label:"Aktif",         icon:"🔄" },
    { id:"history",  label:"Riwayat",       icon:"📋" },
  ];

  return (
    <div className="flex flex-col pb-4 fade-up">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <p className="text-lg font-black text-gray-800">Transaksi Kredit Karbon</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Emisi dikurangi serapan = posisi kredit karbon Anda
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {TAB_ITEMS.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === item.id
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Posisi Kredit ─────────────────────────────────────────── */}
      {tab === "position" && (
        <div className="px-4 pt-4 flex flex-col gap-3">

          {/* Ringkasan besar */}
          <div className={`rounded-2xl p-5 text-white ${isPositive
            ? "bg-gradient-to-br from-emerald-700 to-teal-600"
            : "bg-gradient-to-br from-red-700 to-rose-600"}`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-75 mb-1">
              Posisi Kredit Karbon Bersih
            </p>
            <p className="text-4xl font-black mb-1">
              {isPositive ? "+" : ""}{netCredit.toLocaleString()}
            </p>
            <p className="text-sm opacity-80 mb-4">tCO₂e / tahun</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-xs opacity-70 mb-0.5">Total Serapan / thn</p>
                <p className="font-black text-lg">+{(totalAbs * 12).toFixed(0)}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-xs opacity-70 mb-0.5">Total Emisi / thn</p>
                <p className="font-black text-lg">−{(totalEm * 12).toFixed(0)}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
              <div>
                <p className="text-xs opacity-70">Estimasi Nilai Kredit</p>
                <p className="font-black">
                  {isPositive
                    ? `$${(netCredit * CREDIT_PRICE).toLocaleString()} USD`
                    : `Defisit ${Math.abs(netCredit).toLocaleString()} tCO₂e`}
                </p>
              </div>
              <span className={`text-sm font-black px-3 py-1.5 rounded-full ${
                isPositive ? "bg-white/20" : "bg-white/20"}`}>
                {isPositive ? "✅ Surplus" : "⚠️ Defisit"}
              </span>
            </div>
          </div>

          {/* Panduan aksi */}
          {isPositive ? (
            <div className="card p-4 bg-emerald-50 border-emerald-200">
              <p className="text-sm font-bold text-emerald-800 mb-1">💡 Anda punya surplus kredit</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Kredit karbon Anda bisa ditawarkan ke perusahaan lain yang defisit.
                Pergi ke <strong>Bursa Karbon</strong> untuk melihat permintaan dan mengajukan penawaran.
              </p>
              <button onClick={() => setPage("market")}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                Tawarkan Kredit di Bursa →
              </button>
            </div>
          ) : (
            <div className="card p-4 bg-amber-50 border-amber-200">
              <p className="text-sm font-bold text-amber-800 mb-1">💡 Anda membutuhkan kredit</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Emisi Anda melebihi serapan sebesar <strong>{Math.abs(netCredit).toLocaleString()} tCO₂e/thn</strong>.
                Pergi ke Bursa untuk membeli kredit dari perusahaan/lahan yang surplus.
              </p>
              <button onClick={() => setPage("market")}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background:"linear-gradient(135deg,#92400e,#b45309)" }}>
                Beli Kredit di Bursa →
              </button>
            </div>
          )}

          {/* Syarat tampil di Bursa */}
          <div className="card p-4">
            <p className="text-xs font-bold text-gray-700 mb-3">
              🔐 Syarat Tampil di Bursa Karbon
            </p>
            {[
              { label:"Total emisi sudah dihitung",        done: totalEm > 0, link:"calc"    },
              { label:"Lahan serapan sudah didaftarkan",   done: parcels.length > 0, link:"land" },
              { label:"Sertifikat ISO sudah diunggah",     done: company?.verified, link:"verify" },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    req.done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                    {req.done ? "✓" : "○"}
                  </span>
                  <p className={`text-xs ${req.done ? "text-gray-700" : "text-gray-400"}`}>{req.label}</p>
                </div>
                {!req.done && (
                  <button onClick={() => setPage(req.link)}
                    className="text-xs text-green-600 font-bold hover:underline">
                    Lengkapi →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: Transaksi Aktif ───────────────────────────────────────── */}
      {tab === "active" && (
        <div className="px-4 pt-4 flex flex-col gap-3">
          {!tx ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-5xl">📋</p>
              <p className="font-bold text-gray-600">Tidak ada transaksi aktif</p>
              <p className="text-xs text-gray-400 text-center px-8">
                Mulai transaksi dari halaman Bursa Karbon
              </p>
              <button onClick={() => setPage("market")}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                Pergi ke Bursa Karbon
              </button>
            </div>
          ) : (
            <>
              {/* Info transaksi */}
              <div className="card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-400">ID Transaksi</p>
                    <p className="font-black text-gray-800">{tx.txId || `TX-${Date.now()}`}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">
                    ● Aktif
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l:"Seller",     v: tx.seller || tx.project?.company || "—" },
                    { l:"Volume",     v: `${tx.volume || tx.project?.available || "—"} tCO₂e` },
                    { l:"Harga/ton",  v: `$${tx.price || tx.project?.price || "—"}` },
                    { l:"Total",      v: `$${tx.total || ((tx.volume || 0) * (tx.price || 0)).toLocaleString()}` },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400">{item.l}</p>
                      <p className="font-bold text-sm text-gray-800">{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline escrow */}
              <div className="card p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Alur Escrow MRV
                </p>
                {STEPS.map((s, i) => {
                  const isDone   = i < step;
                  const isActive = i === step;
                  return (
                    <div key={s.key} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all duration-500 ${
                          isDone   ? "bg-emerald-100 text-emerald-700" :
                          isActive ? "bg-green-600 text-white scale-110 shadow-md" :
                                     "bg-gray-100 text-gray-300"}`}>
                          {isDone ? "✓" : s.icon}
                        </div>
                        {i < 3 && <div className={`w-0.5 h-8 my-1 transition-all duration-500 ${
                          isDone ? "bg-emerald-400" : "bg-gray-100"}`} />}
                      </div>
                      <div className="pt-1 pb-3">
                        <p className={`text-sm font-bold ${isActive ? "text-gray-900" : isDone ? "text-emerald-700" : "text-gray-400"}`}>
                          {s.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                        {isActive && step < 3 && (
                          <p className="text-xs font-bold text-green-600 mt-1 animate-pulse">
                            ● Sedang diproses...
                          </p>
                        )}
                        {isDone && i === 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Ref: <span className="font-mono">{tx.refId || tx.id || "MRV-001"}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Konfirmasi penerimaan */}
              {step >= 2 && step < 3 && (
                <div className="card p-4 bg-green-50 border-green-200">
                  <p className="text-sm font-bold text-green-800 mb-1">
                    ✅ Kredit sudah terverifikasi
                  </p>
                  <p className="text-xs text-green-700 mb-3">
                    Konfirmasi penerimaan kredit untuk melepas dana ke seller.
                  </p>
                  <button
                    onClick={() => { setConfirm(true); setStep(3); }}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                    ✅ Konfirmasi Penerimaan Kredit
                  </button>
                </div>
              )}

              {step >= 3 && (
                <div className="card p-4 bg-emerald-50 border-emerald-300">
                  <p className="text-sm font-bold text-emerald-800 mb-1">🎉 Transaksi Selesai!</p>
                  <p className="text-xs text-emerald-700">
                    Kredit karbon sudah berpindah ke akun Anda dan tercatat secara permanen melalui verifikasi MRV.
                  </p>
                  <div className="mt-3 p-2 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Referensi MRV</p>
                    <p className="font-mono text-xs text-gray-700 break-all">
                      {tx.refId || tx.id || "MRV-2025-001"}
                    </p>
                  </div>
                  <button onClick={() => { setTx?.(null); setStep(0); setTab("history"); }}
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-700 text-white">
                    Lihat Riwayat Transaksi
                  </button>
                </div>
              )}

              {/* Tombol batalkan (hanya sebelum escrow) */}
              {step === 0 && (
                <button
                  onClick={() => { setTx?.(null); setStep(0); }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-500 bg-white">
                  Batalkan Transaksi
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: Riwayat ──────────────────────────────────────────────── */}
      {tab === "history" && (
        <div className="px-4 pt-4 flex flex-col gap-3">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-bold text-gray-500">Belum ada riwayat transaksi</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l:"Total Transaksi", v: history.length },
                  { l:"Volume tCO₂e",   v: history.reduce((s,h) => s + (h.vol||0), 0).toLocaleString() },
                  { l:"Total Nilai",     v: `$${history.reduce((s,h) => s + (h.total||0), 0).toLocaleString()}` },
                ].map((item, i) => (
                  <div key={i} className="card p-3 text-center">
                    <p className="font-black text-sm text-gray-800">{item.v}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.l}</p>
                  </div>
                ))}
              </div>

              {/* List */}
              {history.map((h, i) => (
                <div key={h.id || i} className="card p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{h.seller || h.buyerName || "—"}</p>
                      <p className="text-xs text-gray-400">{h.date} · {h.id}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      ✓ Selesai
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { l:"Volume",   v:`${h.vol} t` },
                      { l:"Harga",    v:`$${h.price}/t` },
                      { l:"Total",    v:`$${(h.total||0).toLocaleString()}` },
                    ].map((item, j) => (
                      <div key={j} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="font-bold text-xs text-gray-800">{item.v}</p>
                        <p className="text-xs text-gray-400">{item.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400">Block:</span>
                    <span className="font-mono text-xs text-gray-600 truncate">{h.hash}</span>
                    <a href={`https://sepolia.etherscan.io/tx/${h.hash}`}
                      target="_blank" rel="noreferrer"
                      className="ml-auto text-xs text-green-600 font-bold hover:underline flex-shrink-0">
                      Lihat ↗
                    </a>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

    </div>
  );
}