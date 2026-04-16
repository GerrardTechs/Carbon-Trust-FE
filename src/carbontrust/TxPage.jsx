import { useState, useEffect } from "react";
import { Ic } from "./shared.jsx"; // Menyimpan import ikon jika nanti dibutuhkan

const ESCROW_STEPS = [
  { key: "escrow",   label: "Dana dalam escrow",             desc: "Token ditahan sistem, belum diteruskan ke penjual." },
  { key: "verify",   label: "Verifikasi data satelit & IoT", desc: "Sistem mengecek NDVI, koordinat, dan sensor CO₂." },
  { key: "complete", label: "Selesai — sertifikat terbit",   desc: "Kredit karbon sah dan tercatat di blockchain." },
];

export function TxPage({ tx, setTx, t, lang, setPage }) {
  const [step, setStep] = useState(0);
  const [blockModal, setBlockModal] = useState(false);
  const [hashes, setHashes] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 👇 TAMBAHKAN KODE INI UNTUK ANIMASI ESCROW 👇
  useEffect(() => {
    // Kalau tidak ada transaksi, atau status sudah 2 (Selesai), hentikan timer
    if (!tx || tx.status >= 2) return; 

    const timer = setTimeout(() => {
      // Majukan status transaksi +1 setiap 3 detik
      setTx(prevTx => ({ ...prevTx, status: prevTx.status + 1 }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [tx, setTx]);
  // 👆 SAMPAI SINI 👆

  const STAGES = [t.tx.stage0, t.tx.stage1, t.tx.stage2, t.tx.stage3];
  const ICONS = ["📝", "🔒", "✅", "💸"];

  // Efek untuk menjalankan animasi escrow (maju 1 step setiap 3 detik)
  useEffect(() => {
    if (!tx || step >= 2) return;
    const timer = setTimeout(() => setStep(s => s + 1), 3000);
    return () => clearTimeout(timer);
  }, [step, tx]);

  // Jika tidak ada transaksi aktif
  if (!tx) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 fade-up">
      <p className="text-4xl">📋</p>
      <p className="text-gray-500 text-sm">{t.exit?.noActiveTransaction || "Tidak ada transaksi aktif"}</p>
      <button 
        onClick={() => setPage("market")} 
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full text-sm font-bold shadow hover:bg-green-700 transition"
      >
        Pergi ke Bursa Karbon
      </button>
    </div>
  );

  // Ambil data dari state transaksi
  const project = tx.project || tx;
  const txId = tx.txId || "TX-" + Math.floor(Math.random() * 900000 + 100000);
  const blockHash = tx.blockHash || "0x" + Array.from({length:32},()=>"0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
  const timestamp = tx.timestamp || new Date().toISOString();

  return (
    <div className="flex flex-col gap-4 fade-up mb-20">
      
      {/* Header Info Singkat */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Detail Transaksi</h2>
          <p className="text-sm text-gray-500">{project.name || "Proyek Karbon"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total Nilai</p>
          <p className="text-xl font-black text-green-700">${project.price || "0"}</p>
        </div>
      </div>

      {/* Timeline escrow */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Status Escrow Berjalan</p>
        {ESCROW_STEPS.map((s, i) => {
          const isDone   = i < step;
          const isActive = i === step;
          return (
            <div key={s.key} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-500
                  ${isDone ? "bg-green-100 text-green-700" : isActive ? "bg-green-700 text-white scale-110" : "bg-gray-100 text-gray-400"}`}>
                  {isDone ? "✓" : i + 1}
                </div>
                {i < 2 && <div className={`w-0.5 h-10 my-1 transition-all duration-500 ${isDone ? "bg-green-500" : "bg-gray-200"}`} />}
              </div>
              <div className="pt-1 pb-4">
                <p className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-600"}`}>{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                {isActive && i < 2 && (
                  <p className="text-xs font-bold text-green-600 mt-2 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span> Sedang diproses...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Struk digital — muncul setelah step 2 (Selesai) */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-md fade-up bg-green-50/30">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <span className="text-xl">📜</span>
            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Sertifikat & Jejak Blockchain</p>
          </div>
          
          <div className="space-y-3">
            {[
              ["ID Transaksi",      txId],
              ["Hash Blockchain", blockHash],
              ["Pembeli",       "COMP-001 · PT. Nusantara Hijau Tbk"],
              ["Penjual (Proyek)", `${project.id || "PRJ"} · ${project.company || project.name}`],
              ["Koordinat IoT",   `${project.lat ?? "-2.21"}, ${project.lng ?? "113.91"}`],
              ["Harga",         `$${project.price}/tCO₂`],
              ["Waktu",         new Date(timestamp).toLocaleString("id-ID")],
              ["Status",        "✅ Verified & Certified"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{l}</span>
                <span className={`text-xs font-bold text-right max-w-[60%] break-all
                  ${l === "Hash Blockchain" ? "font-mono text-gray-400 font-normal" : "text-gray-800"}
                  ${l === "Status" ? "text-green-600" : ""}`}>{v}</span>
              </div>
            ))}
          </div>

          <button onClick={() => { setTx(null); setPage("market"); }} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow hover:bg-black transition">
            Tutup & Kembali ke Bursa
          </button>
        </div>
      )}
    </div>
  );
}