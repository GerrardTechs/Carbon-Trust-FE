/**
 * AbsorbPage.jsx — Carbon Sequestration Calculator
 * Categories: Green Carbon, Solar, Biogas, Blue Carbon (marine biota)
 */
import { useState, useEffect } from "react";
import {
  Toast, ABSORB_DRAFT_KEY, dispatchCarbonDataUpdate,
  calcSolarEnergy, parseNum, roundCarbon, SOLAR_SUN_HOURS, SOLAR_EFFICIENCY,
} from "../shared.jsx";

function loadAbsorbDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(ABSORB_DRAFT_KEY) || "null");
    return d && typeof d === "object" ? d : null;
  } catch { return null; }
}

const TYPE_ICON = { green: "🌿", solar: "☀️", biogas: "♻️", blue: "🌊" };

function HitungKreditButton({ totalAbsorbKg, setPage, t }) {
  const [open, setOpen] = useState(false);
  const ab = t?.absorb || {};

  const emResult = (() => {
    try { return JSON.parse(localStorage.getItem("carbon_emission_result") || "null"); }
    catch { return null; }
  })();

  const hasEmisi = emResult && emResult.total > 0;
  const absorbKgYr = roundCarbon(totalAbsorbKg * 12, 2);
  const emisiKgYr = emResult?.netEmission ?? emResult?.total ?? 0;
  const kreditKg = roundCarbon(absorbKgYr - emisiKgYr, 2);
  const kreditTon = roundCarbon(kreditKg / 1000, 3);
  const isPositive = kreditKg >= 0;

  function handleClick() {
    if (!hasEmisi) return;
    localStorage.setItem("carbon_credit_result", JSON.stringify({
      kreditKgYr: kreditKg,
      kreditTonYr: kreditTon,
      absorbKgYr,
      emisiKgYr,
      isPositive,
      savedAt: new Date().toISOString(),
    }));
    dispatchCarbonDataUpdate();
    setOpen(true);
  }

  return (
    <>
      <button onClick={handleClick}
        disabled={!hasEmisi}
        className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 ${
          hasEmisi ? "text-white shadow-md" : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
        style={hasEmisi ? { background: "linear-gradient(135deg,#0f766e,#0369a1)" } : {}}>
        {hasEmisi ? `⚡ ${ab.calcCredit || "Calculate Carbon Credit →"}` : `⚡ ${ab.calcCreditNeedEmission || "Enter Total Emissions first"}`}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
            <p className="text-base font-black text-gray-800 text-center">⚡ {t?.dash?.carbonCreditValue || "Carbon Credit Result"}</p>
            <div className="flex flex-col gap-2">
              {[
                { l: t?.dash?.totalAbs || "Total Sequestration / year", v: `${absorbKgYr.toLocaleString()} kg CO₂e`, c: "#166534", icon: "🌿" },
                { l: t?.dash?.totalEm || "Total Emissions / year", v: `${emisiKgYr.toLocaleString()} kg CO₂e`, c: "#dc2626", icon: "🏭" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-600">{row.icon} {row.l}</span>
                  <span className="font-bold text-sm" style={{ color: row.c }}>{row.v}</span>
                </div>
              ))}
              <div className={`rounded-2xl p-4 text-center ${isPositive ? "bg-emerald-50 border-2 border-emerald-300" : "bg-red-50 border-2 border-red-300"}`}>
                <p className="font-black text-3xl" style={{ color: isPositive ? "#166534" : "#dc2626" }}>
                  {isPositive ? "+" : ""}{kreditTon.toLocaleString()} tCO₂e
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setOpen(false); setPage("certificate"); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
                {t?.common?.download || "View Certificate"} →
              </button>
              <button onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">
                {t?.common?.close || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AbsorbPage({ t, setPage }) {
  const draft = loadAbsorbDraft();
  const ab = t?.absorb || {};
  const tabs = [
    { id: "green", icon: "🌿", label: ab.tabs?.green || "Green Carbon" },
    { id: "solar", icon: "☀️", label: ab.tabs?.solar || "Solar Panel" },
    { id: "biogas", icon: "♻️", label: ab.tabs?.biogas || "Biogas" },
    { id: "blue", icon: "🌊", label: ab.tabs?.blue || "Blue Carbon" },
  ];

  const [tab, setTab] = useState(draft?.tab ?? "green");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  const [greenAbsorb, setGreenAbsorb] = useState(draft?.greenAbsorb ?? "");
  const [solarPanels, setSolarPanels] = useState(draft?.solarPanels ?? "");
  const [solarWp, setSolarWp] = useState(draft?.solarWp ?? "");
  const [biogasInputs, setBiogasInputs] = useState(draft?.biogasInputs ?? { organik: "", sapi: "", babi: "", ayam: "", pome: "" });
  const [blueProjectName, setBlueProjectName] = useState(draft?.blueProjectName ?? "");
  const [blueSequestration, setBlueSequestration] = useState(draft?.blueSequestration ?? "");

  const [emissionCertFile, setEmissionCertFile] = useState(null);
  const [sequestrationCertFile, setSequestrationCertFile] = useState(null);

  useEffect(() => {
    localStorage.setItem(ABSORB_DRAFT_KEY, JSON.stringify({
      tab, greenAbsorb, solarPanels, solarWp,
      biogasInputs, blueProjectName, blueSequestration,
    }));
  }, [tab, greenAbsorb, solarPanels, solarWp, biogasInputs, blueProjectName, blueSequestration]);

  const BIOGAS_CONV = { organik: 0.01, sapi: 0.04, babi: 0.06, ayam: 0.07, pome: 28.0 };
  const solar = calcSolarEnergy(solarPanels, solarWp);
  const solarKwhDay = solar.kwh;
  const solarOffsetKg = roundCarbon(solarKwhDay * 30 * 0.87, 2);

  const biogasM3Ch4 = Object.entries(biogasInputs).reduce((s, [k, v]) => s + parseNum(v) * (BIOGAS_CONV[k] || 0), 0) * 0.60;
  const biogasTCo2eYr = roundCarbon(biogasM3Ch4 * 0.00067 * 28 * 365, 3);
  const biogasOffsetKg = roundCarbon(biogasTCo2eYr / 12 * 1000, 2);

  const greenOffsetKg = roundCarbon(parseNum(greenAbsorb) * 1000 / 12, 2);
  const blueOffsetKg = roundCarbon(parseNum(blueSequestration) * 1000 / 12, 2);
  const totalAbsorbKg = roundCarbon(greenOffsetKg + solarOffsetKg + biogasOffsetKg + blueOffsetKg, 2);

  const certificatesUploaded = !!(emissionCertFile && sequestrationCertFile);
  const solarT = ab.solar || {};

  function buildProjects() {
    const projects = [];
    if (parseNum(greenAbsorb) > 0) {
      projects.push({
        id: "green-1", type: "green", name: "Karbon Hijau / Lahan",
        amountTonYr: parseNum(greenAbsorb), method: "FOLU verified", progress: certificatesUploaded ? 100 : 60,
      });
    }
    if (solarOffsetKg > 0) {
      projects.push({
        id: "solar-1", type: "solar", name: `Panel Surya (${solarPanels} panel)`,
        amountTonYr: roundCarbon(solarOffsetKg * 12 / 1000, 2), method: "Renewable offset", progress: certificatesUploaded ? 100 : 45,
      });
    }
    if (biogasOffsetKg > 0) {
      projects.push({
        id: "biogas-1", type: "biogas", name: "Biogas / Biogenik",
        amountTonYr: biogasTCo2eYr, method: "Biogenic CH₄ capture", progress: certificatesUploaded ? 100 : 45,
      });
    }
    if (parseNum(blueSequestration) > 0) {
      projects.push({
        id: "blue-1", type: "blue", name: blueProjectName || "Blue Carbon Project",
        amountTonYr: parseNum(blueSequestration), method: "Marine biota sequestration", progress: certificatesUploaded ? 100 : 50,
      });
    }
    return projects;
  }

  function saveAbsorb(navigateHome = false) {
    localStorage.setItem("carbon_absorb_result", JSON.stringify({
      totalAbsorbKg,
      greenOffsetKg,
      solarOffsetKg,
      biogasOffsetKg,
      blueOffsetKg,
      solarWh: solar.wh,
      solarKwh: solar.kwh,
      greenAbsorbTonYr: parseNum(greenAbsorb),
      blueProjectName,
      blueSequestrationTonYr: parseNum(blueSequestration),
      certificatesUploaded,
      emissionCertName: emissionCertFile?.name || null,
      sequestrationCertName: sequestrationCertFile?.name || null,
      projects: buildProjects(),
      savedAt: new Date().toISOString(),
    }));
    dispatchCarbonDataUpdate();
    setToastType("success");
    setToast(ab.saveSuccess || t?.profile?.saved || "✅ Saved!");
    setTimeout(() => setToast(""), 3500);
    if (navigateHome) setTimeout(() => setPage("home"), 1500);
  }

  return (
    <div className="flex flex-col pb-4 fade-up">

      <div className="px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-100" style={{ background: "var(--ct-header)" }}>
        <p className="text-lg font-black text-gray-800">{t?.nav?.absorb || "Carbon Sequestration"}</p>
        <p className="text-xs text-gray-400 mt-0.5">{ab.subtitle}</p>
      </div>

      <div className="mx-4 mt-3 card p-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-bold text-blue-800 mb-2">{t?.dash?.journeyTitle}</p>
        <div className="flex flex-col gap-1.5">
          {[t?.dash?.journeyStep1, t?.dash?.journeyStep2, t?.dash?.journeyStep3].map((step, i) => (
            <p key={i} className="text-xs text-blue-700">{step}</p>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3 flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-700">
          📋 {ab.certTitle} <span className="text-red-500">*{ab.certRequired}</span>
        </p>
        {[
          { key: "emisi", label: ab.certEmission, file: emissionCertFile, set: setEmissionCertFile, icon: "🏭" },
          { key: "serapan", label: ab.certSequestration, file: sequestrationCertFile, set: setSequestrationCertFile, icon: "🌿" },
        ].map(item => (
          <label key={item.key} className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700">{item.file ? item.file.name : item.label}</p>
              <p className="text-xs text-gray-400">{ab.certHint}</p>
            </div>
            <input type="file" accept=".pdf,image/*" className="hidden"
              onChange={e => item.set(e.target.files[0] || null)} />
          </label>
        ))}
        {certificatesUploaded && (
          <p className="text-xs text-green-700 font-bold bg-green-50 rounded-lg px-3 py-2">✅ {ab.certBothUploaded}</p>
        )}
      </div>

      {totalAbsorbKg > 0 && (
        <div className="mx-4 mt-3 rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg,#14532d,#0f766e)" }}>
          <p className="text-xs opacity-75 mb-1">{ab.totalSequestration}</p>
          <p className="font-black text-2xl">{totalAbsorbKg.toLocaleString()} kg CO₂e</p>
          <p className="text-xs opacity-75">{ab.perMonth} = {roundCarbon(totalAbsorbKg * 12 / 1000, 2)} tCO₂e/{ab.perYear}</p>
          <button onClick={() => saveAbsorb(false)}
            className="mt-3 w-full py-2 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-all">
            💾 {ab.saveSequestration}
          </button>
        </div>
      )}

      <div className="flex gap-1.5 px-4 pt-3 flex-wrap">
        {tabs.map(tabItem => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
            className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              tab === tabItem.id ? "bg-green-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"
            }`}>
            {tabItem.icon} {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "green" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-green-50 border-green-200">
            <p className="text-sm font-bold text-green-800 mb-1">🌿 {ab.green?.title}</p>
            <p className="text-xs text-green-700 leading-relaxed">{ab.green?.hint}</p>
          </div>
          <div className="card p-4">
            <label className="text-xs font-bold text-gray-700 block mb-1">Total Sequestration (tCO₂e / {ab.perYear})</label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 1250.50"
              value={greenAbsorb} onChange={e => setGreenAbsorb(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400" />
          </div>
        </div>
      )}

      {tab === "solar" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-yellow-50 border-yellow-200">
            <p className="text-sm font-bold text-yellow-800 mb-1">☀️ {solarT.title}</p>
            <p className="text-xs text-yellow-700">{solarT.desc}</p>
          </div>
          <div className="card p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">{solarT.panelCount}</label>
                <div className="relative">
                  <input type="number" min="0" value={solarPanels} onChange={e => setSolarPanels(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm pr-12" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{solarT.panelUnit}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">{solarT.capacity}</label>
                <div className="relative">
                  <input type="number" min="0" value={solarWp} onChange={e => setSolarWp(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm pr-12" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{solarT.capacityUnit}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">{solarT.sunHours}</label>
              <input type="text" readOnly value={SOLAR_SUN_HOURS}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-0.5">{solarT.sunHoursLocked}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">{solarT.efficiency}</label>
              <input type="text" readOnly value={SOLAR_EFFICIENCY}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-0.5">{solarT.efficiencyLocked}</p>
            </div>
            {(solarPanels || solarWp) && (
              <div className="bg-green-50 dark:bg-green-950 rounded-xl p-3 flex flex-col gap-2 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">{solarT.outputWh}</span>
                  <span className="text-sm font-black text-green-700">{solar.wh.toLocaleString()} Wh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">{solarT.outputKwh}</span>
                  <span className="text-sm font-black text-green-700">{solar.kwh.toLocaleString()} kWh</span>
                </div>
                {solarOffsetKg > 0 && (
                  <p className="text-xs text-green-700 font-bold border-t border-green-200 pt-2">
                    = {solarOffsetKg} kg CO₂e/{solarT.offsetMonthly}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "biogas" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-green-50 border-green-200">
            <p className="text-sm font-bold text-green-800 mb-1">♻️ {ab.biogas?.title}</p>
            <p className="text-xs text-green-700">{ab.biogas?.hint}</p>
          </div>
          <div className="card p-4 flex flex-col gap-3">
            {[
              { key: "organik", label: "Sampah Organik" },
              { key: "sapi", label: "Kotoran Sapi" },
              { key: "babi", label: "Kotoran Babi" },
              { key: "ayam", label: "Kotoran Ayam" },
              { key: "pome", label: "POME (Limbah Sawit)" },
            ].map(row => (
              <div key={row.key}>
                <label className="text-xs font-bold text-gray-700 block mb-1">{row.label} (kg/hari)</label>
                <input type="number" min="0" placeholder="0"
                  value={biogasInputs[row.key]}
                  onChange={e => setBiogasInputs(prev => ({ ...prev, [row.key]: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            ))}
            {biogasOffsetKg > 0 && (
              <p className="text-xs text-green-700 font-bold">= {biogasOffsetKg} kg CO₂e/bulan offset</p>
            )}
          </div>
        </div>
      )}

      {tab === "blue" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-cyan-50 border-cyan-200">
            <p className="text-sm font-bold text-cyan-800 mb-1">🌊 {ab.blue?.title}</p>
            <p className="text-xs text-cyan-700 leading-relaxed">{ab.blue?.hint}</p>
          </div>
          <div className="card p-4 flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">{t?.land?.name || "Project Name"}</label>
              <input type="text" placeholder="e.g. Rehabilitasi Lamun Teluk Jakarta"
                value={blueProjectName} onChange={e => setBlueProjectName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Sequestration (tCO₂e / {ab.perYear})</label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 850.00"
                value={blueSequestration} onChange={e => setBlueSequestration(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-400" />
            </div>
            {parseNum(blueSequestration) > 0 && (
              <p className="text-xs text-cyan-700 font-bold bg-cyan-50 rounded-lg px-3 py-2">
                = {roundCarbon(parseNum(blueSequestration) * 1000 / 12, 0)} kg CO₂e/bulan
              </p>
            )}
          </div>
        </div>
      )}

      {totalAbsorbKg > 0 && (
        <div className="px-4 mt-2 flex flex-col gap-2">
          <button onClick={() => saveAbsorb(false)}
            className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
            💾 {ab.saveSequestration} →
          </button>
          <button onClick={() => saveAbsorb(true)}
            className="w-full py-2.5 rounded-xl font-bold text-green-700 bg-green-50 border border-green-200 text-sm active:scale-95 transition-all">
            💾 {ab.saveSequestration} · {ab.goDashboard}
          </button>
          <HitungKreditButton totalAbsorbKg={totalAbsorbKg} setPage={setPage} t={t} />
        </div>
      )}

      <Toast message={toast} type={toastType} onClose={() => setToast("")} />
    </div>
  );
}
