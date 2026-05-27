import { useState } from "react";
import { Spinner, Ic } from "./shared.jsx";

function calcAbsorption(parcel) {
  const BASE = {
    forest:       { healthy:8.5,  flooded:3.2,  degraded:1.5,  burned:-50,  drying:0    },
    peatland:     { healthy:2.1,  flooded:0.8,  degraded:-15,  burned:-120, drying:-25  },
    mangrove:     { healthy:11.4, flooded:4.5,  degraded:2.0,  burned:-30,  drying:0    },
    agricultural: { healthy:1.2,  flooded:0.2,  degraded:0.5,  burned:-5,   drying:0    },
    seawater:     { healthy:14.0, flooded:14.0, degraded:5.0,  burned:-20,  drying:0    },
    industrial:   { healthy:0,    flooded:0,    degraded:0,    burned:0,    drying:0    },
  };
  const rate = BASE[parcel.type]?.[parcel.status] ?? 0;
  return parseFloat(((rate * parcel.area) / 12).toFixed(2));
}

export function CertificatePage({ t, parcels, company }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded]   = useState(false);

  // Hitung net kredit = total serapan - total emisi dari semua lahan
  const totalAbs = parseFloat(
    parcels.reduce((sum, pc) => sum + Math.max(0, calcAbsorption(pc)), 0).toFixed(2)
  );
  const totalEm = parseFloat(
    parcels.reduce((sum, pc) => sum + Math.max(0, -calcAbsorption(pc)), 0).toFixed(2)
  );
  const netMonthly  = parseFloat((totalAbs - totalEm).toFixed(2));
  const netAnnual   = parseFloat((netMonthly * 12).toFixed(2));
  const netCredits  = Math.max(0, Math.floor(netAnnual));

  // Nomor sertifikat deterministik dari companyId
  const certNo = `CT-CERT-${(company?.id || "COMP-001").replace(/[^A-Z0-9]/g,"")}-${new Date().getFullYear()}`;
  const issuedAt = new Date().toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });

  function handleDownload() {
    setDownloading(true);
    setTimeout(() => {
      // Generate teks sertifikat sederhana untuk di-download
      const content = [
        "═══════════════════════════════════════════",
        "       CARBON CREDIT CERTIFICATE",
        "         CarbonTrust Platform",
        "       ISO 14064:2018 Compliant",
        "═══════════════════════════════════════════",
        "",
        `Certificate No : ${certNo}`,
        `Issued To      : ${company?.name || "PT. Nusantara Hijau Tbk"}`,
        `Company ID     : ${company?.id || "COMP-001"}`,
        `Issued Date    : ${issuedAt}`,
        `Valid Until    : 31 Desember ${new Date().getFullYear() + 1}`,
        "",
        "─── CARBON ABSORPTION ─────────────────────",
        ...parcels.map(parcelItem => `  ${p.name} (${p.type}, ${p.area} ha): ${Math.max(0, calcAbsorption(p))} t/month`),
        `  Total Absorption  : ${totalAbs} tCO₂/month`,
        `  Total Emission    : ${totalEm} tCO₂/month`,
        `  Net Monthly       : ${netMonthly} tCO₂/month`,
        `  Net Annual        : ${netAnnual} tCO₂/year`,
        "",
        "─── CARBON CREDITS ────────────────────────",
        `  Verified Credits  : ${netCredits.toLocaleString()} tCO₂e`,
        `  Est. Market Value : $${(netCredits * 18.5).toLocaleString()} USD`,
        "",
        "─── VERIFICATION ──────────────────────────",
        "  Standard   : ISO 14064:2018",
        "  Method     : Satellite (Sentinel-2) + IoT",
        "  NDVI       : Monitored monthly",
        "  Blockchain : Registered",
        "",
        "═══════════════════════════════════════════",
        "  This certificate is digitally verified",
        "  by the CarbonTrust platform.",
        "═══════════════════════════════════════════",
      ].join("\n");

      const blob = new Blob([content], { type: "text/plain" });
      const url  = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href     = url;
      anchor.download = `${certNo}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
      setDownloaded(true);
    }, 2000);
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-6 fade-up">

      {/* Header */}
      <div className="rounded-2xl p-4 text-white" style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
        <p className="text-green-200 text-xs uppercase tracking-widest mb-1">Carbon Credit</p>
        <p className="font-black text-xl">Sertifikat Kredit Karbon</p>
        <p className="text-green-300 text-xs mt-1">ISO 14064:2018 · Verified by CarbonTrust</p>
      </div>

      {/* Certificate card */}
      <div className="card overflow-hidden border-2 border-green-200">
        {/* Top strip */}
        <div className="h-2 w-full" style={{ background:"linear-gradient(90deg,#166534,#0f766e,#166534)" }} />

        <div className="p-4 flex flex-col gap-4">
          {/* Header cert */}
          <div className="text-center border-b border-dashed border-green-200 pb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Certificate of Carbon Credits</p>
            <p className="font-black text-gray-800 text-lg mt-1">{company?.name || "PT. Nusantara Hijau Tbk"}</p>
            <p className="text-xs text-gray-400 font-mono">{certNo}</p>
          </div>

          {/* Net credits — angka utama */}
          <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-200">
            <p className="text-xs text-green-600 uppercase tracking-wide font-bold mb-1">Net Verified Carbon Credits</p>
            <p className="text-5xl font-black text-green-700">{netCredits.toLocaleString()}</p>
            <p className="text-sm text-green-600">tCO₂e / tahun</p>
            <p className="text-xs text-green-500 mt-1">
              ≈ ${(netCredits * 18.5).toLocaleString()} USD @ $18.5/ton
            </p>
          </div>

          {/* Breakdown parcels */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sumber Serapan ({parcels.length} lahan)</p>
            <div className="flex flex-col gap-2">
              {parcels.map(pc => {
                const abs = calcAbsorption(pc);
                const isEmit = abs < 0;
                return (
                  <div key={pc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs font-bold text-gray-700">{pc.name}</p>
                      <p className="text-xs text-gray-400">{pc.type} · {pc.area} ha · {pc.status}</p>
                    </div>
                    <p className={`text-xs font-black ${isEmit ? "text-red-500" : "text-green-700"}`}>
                      {isEmit ? "▼" : "▲"}{Math.abs(abs)} t/bln
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary math */}
          <div className="border-t border-dashed border-gray-200 pt-3 flex flex-col gap-1.5">
            {[
              { l:"Total Serapan / bulan",   v:`+ ${totalAbs} tCO₂`,  c:"text-green-700" },
              { l:"Total Emisi / bulan",      v:`- ${totalEm} tCO₂`,   c:"text-red-500"   },
              { l:"Net / bulan",              v:`= ${netMonthly} tCO₂`, c:"text-gray-800 font-black" },
              { l:"Net / tahun (×12)",        v:`${netAnnual} tCO₂`,   c:"text-gray-800 font-black" },
            ].map((row, i) => (
              <div key={i} className="flex justify-between">
                <p className="text-xs text-gray-500">{row.l}</p>
                <p className={`text-xs ${row.c}`}>{row.v}</p>
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="border-t border-dashed border-gray-200 pt-3 grid grid-cols-2 gap-2">
            {[
              { l:"Diterbitkan",    v:issuedAt },
              { l:"Berlaku s/d",    v:`31 Des ${new Date().getFullYear()+1}` },
              { l:"Standar",        v:"ISO 14064:2018" },
              { l:"Verifikasi",     v:"Sentinel-2 + IoT" },
            ].map((metaItem, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs text-gray-400">{metaItem.l}</p>
                <p className="text-xs font-bold text-gray-700">{metaItem.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="h-2 w-full" style={{ background:"linear-gradient(90deg,#166534,#0f766e,#166534)" }} />
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
        <p className="text-xs font-bold text-blue-700 mb-0.5">ℹ️ Tentang Sertifikat Ini</p>
        <p className="text-xs text-blue-600">
          Sertifikat ini merepresentasikan kredit karbon bersih dari {parcels.length} lahan setelah dikurangi emisi operasional.
          Upload sertifikat ISO dari lembaga verifikasi untuk bisa menawarkan kredit di Market.
        </p>
      </div>

      {/* Download button */}
      <button onClick={handleDownload} disabled={downloading}
        className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60
          ${downloaded ? "bg-green-50 text-green-700 border border-green-200" : "text-white"}`}
        style={!downloaded ? { background:"linear-gradient(135deg,#166534,#0f766e)" } : {}}>
        {downloading
          ? <><Spinner /> Generating Certificate...</>
          : downloaded
          ? <>✅ Certificate Downloaded</>
          : <><Ic.Dl /> Download Sertifikat (.txt)</>
        }
      </button>
    </div>
  );
}