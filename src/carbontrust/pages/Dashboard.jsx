/**
 * CarbonTrust — Dashboard.jsx
 * Home page: KPI cards, land parcels, AI alerts
 */
import { useState, useEffect } from "react";
import {
  CREDIT_PRICE,
  calcAbsorption, convertUnit,
  SBadge,
  readCarbonCredit, getActiveSequestrationProjects,
  CARBON_DATA_EVENT,
} from "../shared.jsx";

const TYPE_ICON = { green: "🌿", solar: "☀️", biogas: "♻️", blue: "🌊", peatland: "🌾", forest: "🌲", mangrove: "🌴" };

export function Dashboard({ parcels, company, setPage, t }) {
  const [unit, setUnit] = useState("t");
  const [prevKpi, setPrevKpi] = useState(null);
  const [kpiDelta, setKpiDelta] = useState({ abs: 0, em: 0, net: 0 });

  const [carbonCredit, setCarbonCredit] = useState(readCarbonCredit);

  useEffect(() => {
    const refresh = () => setCarbonCredit(readCarbonCredit());
    window.addEventListener(CARBON_DATA_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CARBON_DATA_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const activeProjects = getActiveSequestrationProjects();
  const totalAbs  = parseFloat(parcels.reduce((sum, p) => sum + Math.max(0,  calcAbsorption(p)), 0).toFixed(2));
  const totalEm   = parseFloat(parcels.reduce((sum, p) => sum + Math.max(0, -calcAbsorption(p)), 0).toFixed(2));
  const netBal    = parseFloat((totalAbs - totalEm).toFixed(2));

  useEffect(() => {
    if (prevKpi) {
      const pct = (cur, prev) => prev === 0 ? 0 : +((cur - prev) / Math.abs(prev) * 100).toFixed(1);
      setKpiDelta({ abs: pct(totalAbs, prevKpi.abs), em: pct(totalEm, prevKpi.em), net: pct(netBal, prevKpi.net) });
    }
    setPrevKpi({ abs: totalAbs, em: totalEm, net: netBal });
  }, [parcels]);

  const credits    = Math.max(0, Math.floor(netBal * 12));
  const creditsUSD = (credits * CREDIT_PRICE).toLocaleString();
  const cv         = val => convertUnit(val, unit);
  const uSuffix    = t.dash.units[unit];

  const typeIcon  = { peatland: "🌾", forest: "🌲", mangrove: "🌴" };
  const statusBorder = s => s === "flooded" ? "border-l-blue-500" : s === "degraded" ? "border-l-amber-500" : s === "burned" ? "border-l-red-500" : "border-l-emerald-500";

  return (
    <div className="flex flex-col gap-3 pb-4 fade-up">

      {/* Hero */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#14532d 0%,#0f766e 100%)" }}>
        <div className="p-4">
          <p className="text-green-200 text-xs font-bold uppercase tracking-widest">{company?.name}</p>
          {carbonCredit && (
            <div className="mt-2 bg-white/15 rounded-xl px-3 py-2">
              <p className="text-green-200 text-xs">{t.dash?.carbonCreditValue || "Nilai Kredit Karbon"}</p>
              <p className={`font-black text-lg ${carbonCredit.isPositive ? "text-white" : "text-red-200"}`}>
                {carbonCredit.isPositive ? "+" : ""}{carbonCredit.kreditTonYr?.toLocaleString()} tCO₂e/thn
              </p>
            </div>
          )}
          <p className="text-white/80 text-xs mt-2">{t.dash.tagline}</p>
          <div className="flex gap-1 mt-3">
            {["t","kt","Mt","kg"].map(unitOpt => (
              <button key={unitOpt} onClick={() => setUnit(unitOpt)}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${unit === unitOpt ? "bg-white text-green-800" : "bg-white/20 text-white/80 hover:bg-white/30"}`}>
                {t.dash.units[unitOpt]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="px-4 grid grid-cols-3 gap-2">
        {[
          { l: t.dash.totalAbs,  v: cv(totalAbs), color: "emerald", icon: "🌿", delta: kpiDelta.abs },
          { l: t.dash.totalEm,   v: cv(totalEm),  color: "red",     icon: "🏭", delta: kpiDelta.em  },
          { l: t.dash.netCarbon, v: cv(netBal),   color: netBal >= 0 ? "teal" : "red", icon: netBal >= 0 ? "⚖️" : "⚠️", delta: kpiDelta.net },
        ].map((kpi, i) => (
          <div key={i} className="card p-3 text-center">
            <p className="text-xl mb-0.5">{kpi.icon}</p>
            <p className={`font-black text-sm ${kpi.color === "emerald" ? "text-emerald-700" : kpi.color === "red" ? "text-red-600" : "text-teal-700"}`}>
              {kpi.v}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{uSuffix}</p>
            {kpi.delta !== 0 && (
              <p className={`text-xs font-bold mt-0.5 ${kpi.delta > 0 ? "text-emerald-600" : "text-red-500"}`}>
                ({kpi.delta > 0 ? "▲" : "▼"}{Math.abs(kpi.delta)}%)
              </p>
            )}
            <p className="text-xs text-gray-300 mt-0.5">±{i === 0 ? "5" : i === 1 ? "8" : "6"}% DQ</p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">{kpi.l}</p>
          </div>
        ))}
      </div>

      {/* User journey guidance */}
      <div className="px-4">
        <div className="card p-4 bg-blue-50 border-blue-200">
          <p className="text-xs font-bold text-blue-800 mb-2">{t.dash?.journeyTitle || "Alur Kredit Karbon"}</p>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-blue-700">{t.dash?.journeyStep1}</p>
            <p className="text-xs text-blue-700">{t.dash?.journeyStep2}</p>
            <p className="text-xs text-blue-700 font-bold">{t.dash?.journeyStep3}</p>
          </div>
        </div>
      </div>

      {/* Data Quality card */}
      <div className="px-4">
        <div className="card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <div>
              <p className="text-xs font-bold text-gray-700">{t.dash?.dataTrust || "Data Confidence Level"}</p>
              <p className="text-xs text-gray-400">{t.dash?.dataTrustSub || "Used in MRV verification"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-sm text-green-700">
              {parcels.every(p => p.status === "healthy") ? "Tinggi" : parcels.some(p => p.status === "burned" || p.status === "degraded") ? "Rendah" : "Sedang"}
            </p>
            <p className="text-xs text-gray-400">
              {parcels.every(p => p.status === "healthy") ? "±5%" : parcels.some(p => p.status === "burned" || p.status === "degraded") ? "±15%" : "±10%"} margin
            </p>
          </div>
        </div>
      </div>

      {/* Quick link: Sertifikat */}
      <div className="px-4 grid grid-cols-2 gap-2">
        <button onClick={() => setPage("certificate")} className="card p-3 flex items-center gap-2 active:scale-95 transition-all">
          <span className="text-xl">📜</span>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-700">{t.dash?.certQuick || "Certificate"}</p>
            <p className="text-xs text-gray-400">{t.dash?.certQuickSub || "Carbon credits"}</p>
          </div>
        </button>
      </div>

      {/* Credits */}
      <div className="px-4 grid grid-cols-2 gap-2">
        <div className="card p-3 bg-green-50 border-green-200">
          <p className="text-xs text-green-600 font-semibold">{t.dash.credits}</p>
          <p className="font-black text-green-700 text-xl">{credits.toLocaleString()}</p>
          <p className="text-xs text-green-600">{uSuffix}/year</p>
        </div>
        <div className="card p-3 bg-teal-50 border-teal-200">
          <p className="text-xs text-teal-600 font-semibold">{t.dash.creditsUSD}</p>
          <p className="font-black text-teal-700 text-xl">${creditsUSD}</p>
          <p className="text-xs text-teal-600">@ ${CREDIT_PRICE}/t</p>
        </div>
      </div>

      {/* Active Carbon Projects — from Carbon Sequestration after cert upload */}
      {activeProjects.length > 0 && (
        <div className="px-4">
          <p className="text-sm font-bold text-gray-800 mb-2">{t.dash?.activeProjects || "Proyek Karbon Aktif"}</p>
          <div className="flex flex-col gap-2">
            {activeProjects.map(proj => (
              <div key={proj.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{TYPE_ICON[proj.type] || "🏞️"}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{proj.name}</p>
                      <p className="text-xs text-gray-400">{proj.method}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {t.dash?.projectStatus?.active || "Aktif"}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-gray-500">{t.dash?.progressLabel || "Progress Verifikasi"}</p>
                    <p className="text-xs font-bold text-gray-600">{proj.progress}%</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${proj.progress}%`, background: "linear-gradient(90deg,#16a34a,#0d9488)" }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t.dash?.progressHelp}</p>
                </div>
                <p className={`text-xs font-black text-emerald-700`}>
                  ▲ {proj.amountTonYr} tCO₂e/tahun
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Land Parcels */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-800">{t.dash.myProjects}</p>
          <button onClick={() => setPage("land")} className="text-xs text-green-600 font-bold hover:underline">{t.dash.seeAll}</button>
        </div>
        <div className="flex flex-col gap-2">
          {parcels.map(parcel => {
            const abs = calcAbsorption(parcel);
            const isEm = abs < 0;
            return (
              <div key={parcel.id} className={`card flex items-center gap-3 p-3 border-l-4 ${statusBorder(parcel.status)}`}>
                <span className="text-2xl">{typeIcon[parcel.type] || "🏞️"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{parcel.name}</p>
                  <p className="text-xs text-gray-500">{parcel.area} ha · NDVI {parcel.ndvi}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${isEm ? "text-red-600" : "text-emerald-700"}`}>
                    {isEm ? "▼" : "▲"}{Math.abs(cv(abs))}{uSuffix}
                  </p>
                  <SBadge status={parcel.status} t={t} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
