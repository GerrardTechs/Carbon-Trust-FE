/**
 * AbsorbPage.jsx — Carbon Sequestration Calculator
 * Categories: Green Carbon, Solar, Biogas, Blue Carbon (marine biota)
 * Only two certificate uploads: Sertifikat Emisi & Sertifikat Serapan
 */
import { useState, useEffect } from "react";
import { Toast, ABSORB_DRAFT_KEY, dispatchCarbonDataUpdate } from "../shared.jsx";

function loadAbsorbDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(ABSORB_DRAFT_KEY) || "null");
    return d && typeof d === "object" ? d : null;
  } catch { return null; }
}

const TABS = [
  { id: "green",  icon: "🌿", label: "Karbon Hijau" },
  { id: "solar",  icon: "☀️", label: "Panel Surya" },
  { id: "biogas", icon: "♻️", label: "Biogas" },
  { id: "blue",   icon: "🌊", label: "Blue Carbon" },
];

const TYPE_ICON = { green: "🌿", solar: "☀️", biogas: "♻️", blue: "🌊" };

function HitungKreditButton({ totalAbsorbKg, setPage }) {
  const [open, setOpen] = useState(false);

  const emResult = (() => {
    try { return JSON.parse(localStorage.getItem("carbon_emission_result") || "null"); }
    catch { return null; }
  })();

  const hasEmisi = emResult && emResult.total > 0;
  const absorbKgYr = +(totalAbsorbKg * 12).toFixed(2);
  const emisiKgYr = emResult?.netEmission ?? emResult?.total ?? 0;
  const kreditKg = +(absorbKgYr - emisiKgYr).toFixed(2);
  const kreditTon = +(kreditKg / 1000).toFixed(3);
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
        {hasEmisi ? "⚡ Hitung Kredit Karbon →" : "⚡ Isi Total Emisi dulu di menu Emisi"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
            <p className="text-base font-black text-gray-800 text-center">⚡ Hasil Kredit Karbon</p>
            <div className="flex flex-col gap-2">
              {[
                { l: "Total Sequestration / tahun", v: `${absorbKgYr.toLocaleString()} kg CO₂e`, c: "#166534", icon: "🌿" },
                { l: "Total Emisi / tahun", v: `${emisiKgYr.toLocaleString()} kg CO₂e`, c: "#dc2626", icon: "🏭" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-600">{row.icon} {row.l}</span>
                  <span className="font-bold text-sm" style={{ color: row.c }}>{row.v}</span>
                </div>
              ))}
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-bold">Sequestration − Emisi</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className={`rounded-2xl p-4 text-center ${isPositive ? "bg-emerald-50 border-2 border-emerald-300" : "bg-red-50 border-2 border-red-300"}`}>
                <p className="text-xs font-bold mb-1" style={{ color: isPositive ? "#166534" : "#dc2626" }}>
                  {isPositive ? "✅ Surplus Kredit Karbon" : "⚠️ Defisit Kredit Karbon"}
                </p>
                <p className="font-black text-3xl" style={{ color: isPositive ? "#166534" : "#dc2626" }}>
                  {isPositive ? "+" : ""}{kreditTon.toLocaleString()} tCO₂e
                </p>
                <p className="text-xs mt-1" style={{ color: isPositive ? "#166534" : "#dc2626" }}>
                  per tahun ({isPositive ? "dapat dijual di Bursa" : "perlu dibeli dari Bursa"})
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setOpen(false); setPage("certificate"); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
                Lihat Sertifikat →
              </button>
              <button onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">
                Tutup
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
  const [tab, setTab] = useState(draft?.tab ?? "green");
  const [toast, setToast] = useState("");

  const [greenAbsorb, setGreenAbsorb] = useState(draft?.greenAbsorb ?? "");
  const [solarPanels, setSolarPanels] = useState(draft?.solarPanels ?? "");
  const [solarWp, setSolarWp] = useState(draft?.solarWp ?? "");
  const [solarSunHours, setSolarSunHours] = useState(draft?.solarSunHours ?? "3.5");
  const [biogasInputs, setBiogasInputs] = useState(draft?.biogasInputs ?? { organik: "", sapi: "", babi: "", ayam: "", pome: "" });
  const [blueProjectName, setBlueProjectName] = useState(draft?.blueProjectName ?? "");
  const [blueSequestration, setBlueSequestration] = useState(draft?.blueSequestration ?? "");

  const [emissionCertFile, setEmissionCertFile] = useState(null);
  const [sequestrationCertFile, setSequestrationCertFile] = useState(null);

  useEffect(() => {
    localStorage.setItem(ABSORB_DRAFT_KEY, JSON.stringify({
      tab, greenAbsorb, solarPanels, solarWp, solarSunHours,
      biogasInputs, blueProjectName, blueSequestration,
    }));
  }, [tab, greenAbsorb, solarPanels, solarWp, solarSunHours, biogasInputs, blueProjectName, blueSequestration]);

  const BIOGAS_CONV = { organik: 0.01, sapi: 0.04, babi: 0.06, ayam: 0.07, pome: 28.0 };

  const solarKwhDay = +(((parseFloat(solarPanels) || 0) * (parseFloat(solarWp) || 0) * (parseFloat(solarSunHours) || 3.5) * 0.75) / 1000).toFixed(3);
  const solarOffsetKg = +(solarKwhDay * 30 * 0.87).toFixed(2);

  const biogasM3Ch4 = Object.entries(biogasInputs).reduce((s, [k, v]) => s + (parseFloat(v) || 0) * (BIOGAS_CONV[k] || 0), 0) * 0.60;
  const biogasTCo2eYr = +(biogasM3Ch4 * 0.00067 * 28 * 365).toFixed(3);
  const biogasOffsetKg = +(biogasTCo2eYr / 12 * 1000).toFixed(2);

  const greenOffsetKg = +((parseFloat(greenAbsorb) || 0) * 1000 / 12).toFixed(2);
  const blueOffsetKg = +((parseFloat(blueSequestration) || 0) * 1000 / 12).toFixed(2);
  const totalAbsorbKg = +(greenOffsetKg + solarOffsetKg + biogasOffsetKg + blueOffsetKg).toFixed(2);

  const certificatesUploaded = !!(emissionCertFile && sequestrationCertFile);

  function buildProjects() {
    const projects = [];
    if (parseFloat(greenAbsorb) > 0) {
      projects.push({
        id: "green-1", type: "green", name: "Karbon Hijau / Lahan",
        amountTonYr: parseFloat(greenAbsorb), method: "FOLU verified", progress: certificatesUploaded ? 100 : 60,
      });
    }
    if (solarOffsetKg > 0) {
      projects.push({
        id: "solar-1", type: "solar", name: `Panel Surya (${solarPanels} panel)`,
        amountTonYr: +(solarOffsetKg * 12 / 1000).toFixed(2), method: "Renewable offset", progress: certificatesUploaded ? 100 : 45,
      });
    }
    if (biogasOffsetKg > 0) {
      projects.push({
        id: "biogas-1", type: "biogas", name: "Biogas / Biogenik",
        amountTonYr: biogasTCo2eYr, method: "Biogenic CH₄ capture", progress: certificatesUploaded ? 100 : 45,
      });
    }
    if (parseFloat(blueSequestration) > 0) {
      projects.push({
        id: "blue-1", type: "blue", name: blueProjectName || "Blue Carbon Project",
        amountTonYr: parseFloat(blueSequestration), method: "Marine biota sequestration", progress: certificatesUploaded ? 100 : 50,
      });
    }
    return projects;
  }

  function saveAbsorb() {
    localStorage.setItem("carbon_absorb_result", JSON.stringify({
      totalAbsorbKg,
      greenOffsetKg,
      solarOffsetKg,
      biogasOffsetKg,
      blueOffsetKg,
      greenAbsorbTonYr: parseFloat(greenAbsorb) || 0,
      blueProjectName,
      blueSequestrationTonYr: parseFloat(blueSequestration) || 0,
      certificatesUploaded,
      emissionCertName: emissionCertFile?.name || null,
      sequestrationCertName: sequestrationCertFile?.name || null,
      projects: buildProjects(),
      savedAt: new Date().toISOString(),
    }));
    dispatchCarbonDataUpdate();
    setToast(t?.profile?.saved || "✅ Saved!");
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="flex flex-col pb-4 fade-up">

      <div className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <p className="text-lg font-black text-gray-800">{t?.nav?.absorb || "Carbon Sequestration"}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Total sequestration digunakan untuk menghitung Net Carbon Credit
        </p>
      </div>

      {/* User journey guidance */}
      <div className="mx-4 mt-3 card p-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-bold text-blue-800 mb-2">{t?.dash?.journeyTitle || "Alur Mendapatkan Kredit Karbon"}</p>
        <div className="flex flex-col gap-1.5">
          {[t?.dash?.journeyStep1, t?.dash?.journeyStep2, t?.dash?.journeyStep3].map((step, i) => (
            <p key={i} className="text-xs text-blue-700">{step}</p>
          ))}
        </div>
      </div>

      {/* Certificate uploads — only two allowed */}
      <div className="mx-4 mt-3 flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-700">📋 Sertifikat Verifikasi <span className="text-red-500">*wajib untuk proyek aktif</span></p>
        {[
          { key: "emisi", label: "Sertifikat Emisi", file: emissionCertFile, set: setEmissionCertFile, icon: "🏭" },
          { key: "serapan", label: "Sertifikat Serapan", file: sequestrationCertFile, set: setSequestrationCertFile, icon: "🌿" },
        ].map(item => (
          <label key={item.key} className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700">
                {item.file ? item.file.name : item.label}
              </p>
              <p className="text-xs text-gray-400">PDF atau gambar — ISO 14064 summary</p>
            </div>
            <input type="file" accept=".pdf,image/*" className="hidden"
              onChange={e => item.set(e.target.files[0] || null)} />
          </label>
        ))}
        {certificatesUploaded && (
          <p className="text-xs text-green-700 font-bold bg-green-50 rounded-lg px-3 py-2">✅ Kedua sertifikat diunggah — proyek akan muncul di Beranda</p>
        )}
      </div>

      {totalAbsorbKg > 0 && (
        <div className="mx-4 mt-3 rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg,#14532d,#0f766e)" }}>
          <p className="text-xs opacity-75 mb-1">Total Sequestration (semua kategori)</p>
          <p className="font-black text-2xl">{totalAbsorbKg.toLocaleString()} kg CO₂e</p>
          <p className="text-xs opacity-75">per bulan = {(totalAbsorbKg * 12 / 1000).toFixed(2)} tCO₂e/tahun</p>
          <button onClick={saveAbsorb}
            className="mt-3 w-full py-2 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-all">
            💾 {t?.common?.save || "Save"} Sequestration
          </button>
        </div>
      )}

      <div className="flex gap-1.5 px-4 pt-3 flex-wrap">
        {TABS.map(tabItem => (
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
            <p className="text-sm font-bold text-green-800 mb-1">🌿 Green Carbon — Lahan / Hutan</p>
            <p className="text-xs text-green-700 leading-relaxed">
              Masukkan total sequestration dari lahan atau hutan yang sudah diverifikasi pihak ketiga.
            </p>
          </div>
          <div className="card p-4">
            <label className="text-xs font-bold text-gray-700 block mb-1">Total Sequestration (tCO₂e / tahun)</label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 1250.50"
              value={greenAbsorb} onChange={e => setGreenAbsorb(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400" />
          </div>
        </div>
      )}

      {tab === "solar" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-yellow-50 border-yellow-200">
            <p className="text-sm font-bold text-yellow-800 mb-1">☀️ Panel Surya</p>
            <p className="text-xs text-yellow-700">Listrik panel surya mengurangi kebutuhan dari PLN (offset Scope 2).</p>
          </div>
          <div className="card p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Panel</label>
                <input type="number" min="0" value={solarPanels} onChange={e => setSolarPanels(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Kapasitas/Panel (Wp)</label>
                <input type="number" min="0" value={solarWp} onChange={e => setSolarWp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Jam Matahari Efektif (jam/hari)</label>
              <input type="number" min="0" step="0.1" value={solarSunHours} onChange={e => setSolarSunHours(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            {solarPanels && solarWp && (
              <p className="text-xs text-green-700 font-bold">= {solarOffsetKg} kg CO₂e/bulan offset</p>
            )}
          </div>
        </div>
      )}

      {tab === "biogas" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-green-50 border-green-200">
            <p className="text-sm font-bold text-green-800 mb-1">♻️ Biogas / Biogenik</p>
            <p className="text-xs text-green-700">Biogas dari limbah organik menggantikan bahan bakar fosil.</p>
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
            <p className="text-sm font-bold text-cyan-800 mb-1">🌊 Blue Carbon — Biota Laut</p>
            <p className="text-xs text-cyan-700 leading-relaxed">
              Sequestration dari ekosistem laut: mangrove pesisir, lamun, terumbu karang, dan biota laut lainnya.
              Upload sertifikat melalui formulir di atas (Sertifikat Serapan).
            </p>
          </div>
          <div className="card p-4 flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Nama Proyek</label>
              <input type="text" placeholder="e.g. Rehabilitasi Lamun Teluk Jakarta"
                value={blueProjectName} onChange={e => setBlueProjectName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Sequestration (tCO₂e / tahun)</label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 850.00"
                value={blueSequestration} onChange={e => setBlueSequestration(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-400" />
            </div>
            {blueSequestration && parseFloat(blueSequestration) > 0 && (
              <p className="text-xs text-cyan-700 font-bold bg-cyan-50 rounded-lg px-3 py-2">
                = {(parseFloat(blueSequestration) * 1000 / 12).toFixed(0)} kg CO₂e/bulan
              </p>
            )}
          </div>
        </div>
      )}

      {totalAbsorbKg > 0 && (
        <div className="px-4 mt-2">
          <button onClick={saveAbsorb}
            className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
            💾 {t?.common?.save || "Save"} Sequestration →
          </button>
          <HitungKreditButton totalAbsorbKg={totalAbsorbKg} setPage={setPage} />
        </div>
      )}

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
