/**
 * CarbonTrust — VerifyPage.jsx
 * MRV & Verification: satellite view, IoT log, ISO 14064 download
 */
import { useState } from "react";
import { API, useInterval, Spinner, Ic } from "../shared.jsx";


export function VerifyPage({ t, parcels, companyId }) {
  const [isoCert, setIsoCert]     = useState(null);
  const [certError, setCertError] = useState("");
  const [verified, setVerified]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dl, setDl] = useState(false);
  const [done, setDone] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  useInterval(() => setScanLine(prev => (prev + 1) % 100), 30);

  function handleIsoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setCertError("File ditolak — harus PDF atau JPG/PNG");
      setIsoCert(null);
      return;
    }
    setIsoCert(file);
    setCertError("");
    setVerified(false);
  }

  async function submitIsoVerification() {
    if (!isoCert || !companyId) return;
    try {
      setUploading(true);
      const session = JSON.parse(localStorage.getItem("carbon_session") || "{}");
      const fd = new FormData();
      fd.append("isoCert", isoCert);
      const res = await fetch(`${API}/company/${companyId}/upload-iso`, {
        method: "POST",
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data?.success) {
        setVerified(true);
        setCertError("");
      } else {
        setCertError(data?.message || "Upload sertifikat gagal");
      }
    } catch {
      setCertError("Gagal upload sertifikat");
    } finally {
      setUploading(false);
    }
  }

  const geoLog = [
    { date: "2024-06-12 08:14", type: "IoT", msg: "Sensor C-12: CO₂ flux = 2.14 tCO₂/ha/day ✓", st: "ok" },
    { date: "2024-06-12 07:03", type: "Sat", msg: "LP-003: MNDWI > 0.42 — Flood confirmed Sentinel-2", st: "warn" },
    { date: "2024-06-11 20:07", type: "ML", msg: "LP-002: NDVI 0.31 (↓0.52) — Peat drying detected", st: "warn" },
    { date: "2024-06-11 14:33", type: "Sat", msg: "LP-001: 0 deforestation detected ✓", st: "ok" },
    { date: "2024-06-10 09:52", type: "IoT", msg: "⚠ Sensor B-04: Humidity 89% — Logged", st: "warn" },
    { date: "2024-06-09 16:18", type: "ML", msg: "LP-001 Carbon Model: 3,825 tCO₂/yr estimated ✓", st: "ok" },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4 fade-up">
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#0f766e,#166534)" }}>
        <p className="text-teal-200 text-xs uppercase tracking-widest mb-1">{t.verify.title}</p>
        <p className="font-black text-xl">MRV Report · ISO 14064:2018</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {["ISO 14064:2018", "VCS Verra", "Gold Standard", "IPCC 2006"].map(badgeLabel => (
            <span key={badgeLabel} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{badgeLabel}</span>
          ))}
        </div>
      </div>

      {/* Multi-parcel satellite view */}
      <div className="card overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><Ic.Map /><p className="font-bold text-gray-800 text-sm">Multi-Site Satellite View</p></div>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Sentinel-2 Live</span>
        </div>
        <div className="relative bg-green-950 overflow-hidden" style={{ height: 200 }}>
          <svg width="100%" height="100%" viewBox="0 0 400 200">
            <defs><pattern id="ter5" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#14532d" /><circle cx="20" cy="20" r="16" fill="#166534" opacity=".7" /></pattern></defs>
            <rect width="400" height="200" fill="url(#ter5)" opacity=".7" />
            <path d="M0,90 Q100,65 200,95 Q300,125 400,100" fill="none" stroke="#0ea5e9" strokeWidth="4" opacity=".5" />
            {parcels.map((parcel, idx) => {
              const positions = [[80, 40], [220, 30], [60, 120], [250, 120], [350, 60]];
              const [bx, by] = positions[idx] || [200, 100];
              const sc = { healthy: "#22c55e", flooded: "#60a5fa", degraded: "#f59e0b", burned: "#ef4444", drying: "#fb923c" }[parcel.status] || "#22c55e";
              return (
                <g key={parcel.id}>
                  <rect x={bx} y={by} width={90} height={60}
                    fill={{ forest: "#166534", peatland: "#92400e", mangrove: "#0e7490", agricultural: "#a16207", industrial: "#475569" }[parcel.type]} opacity=".45"
                    stroke={sc} strokeWidth="2" strokeDasharray={parcel.status !== "healthy" ? "6,3" : "none"} rx="4" />
                  {[[bx + 20, by + 20], [bx + 50, by + 15], [bx + 70, by + 35]].map(([sx, sy], j) => (
                    <g key={j}>
                      <circle cx={sx} cy={sy} r="4" fill={sc} opacity=".9" />
                      <circle cx={sx} cy={sy} r="9" fill="none" stroke={sc} strokeWidth="1" opacity=".4">
                        <animate attributeName="r" values="4;12;4" dur="2.5s" repeatCount="indefinite" begin={`${j * 0.5}s`} />
                        <animate attributeName="opacity" values=".5;0;.5" dur="2.5s" repeatCount="indefinite" begin={`${j * 0.5}s`} />
                      </circle>
                    </g>
                  ))}
                  <text x={bx + 4} y={by + 12} fill="white" fontSize="8" fontWeight="bold" opacity=".9">{parcel.id}</text>
                </g>
              );
            })}
          </svg>
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"
            style={{ top: `${scanLine}%`, transition: "top 30ms linear" }} />
        </div>
      </div>

      {/* Log */}
      <div className="card">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <p className="font-bold text-gray-800 text-sm">{t.verify.log}</p>
          <span className="text-xs text-gray-400">{geoLog.length} entries</span>
        </div>
        <div className="divide-y divide-gray-50">
          {geoLog.map((e, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-mono mt-0.5 ${e.type === "IoT" ? "bg-blue-50 text-blue-600" : e.type === "ML" ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600"}`}>{e.type}</span>
              <div>
                <p className={`text-xs ${e.st === "warn" ? "text-amber-700" : "text-gray-600"}`}>{e.msg}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{e.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ISO Cert Upload */}
<div className="card p-4 flex flex-col gap-3">
  <div className="flex items-center justify-between">
    <p className="text-sm font-bold text-gray-800">📋 Upload Sertifikat Verifikasi ISO</p>
    {verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✅ Verified</span>}
  </div>
  <p className="text-xs text-gray-500">
    Upload sertifikat ISO 14064 dari lembaga verifikasi. Wajib agar kredit karbon bisa ditawarkan di market.
  </p>

  <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-colors
    ${isoCert ? "border-green-400 bg-green-50" : certError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
    <span className="text-2xl">{isoCert ? "📄" : "⬆️"}</span>
    <div className="flex-1">
      <p className="text-xs font-bold text-gray-700">
        {isoCert ? isoCert.name : "Upload Sertifikat ISO 14064"}
      </p>
      <p className="text-xs text-gray-400">PDF / JPG / PNG · maks 10MB</p>
    </div>
    {isoCert && <span className="text-green-600 font-bold text-xs">✓</span>}
    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleIsoUpload} />
  </label>

  {certError && <p className="text-xs text-red-600">{certError}</p>}

  {isoCert && !verified && (
    <button
      onClick={submitIsoVerification}
      disabled={uploading}
      className="w-full py-2.5 rounded-xl font-bold text-white text-sm active:scale-95 transition-all"
      style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
      {uploading ? "Uploading..." : "Submit untuk Verifikasi"}
    </button>
  )}
</div>

      <button onClick={() => { setDl(true); setTimeout(() => { setDl(false); setDone(true); }, 2500); }} disabled={dl}
        className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold transition-all ${done ? "bg-green-50 text-green-700 border border-green-200" : "text-white active:scale-95"} disabled:opacity-60`}
        style={!done ? { background: "linear-gradient(135deg,#166534,#0f766e)" } : {}}>
        {dl ? <><Spinner />Processing...</> : done ? <>✅ ISO 14064 Certificate Downloaded</> : <><Ic.Dl />{t.verify.download}</>}
      </button>
    </div>
  );
}

