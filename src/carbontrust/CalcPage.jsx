/**
 * CarbonTrust — CalcPage.jsx  (Sprint 1 revision)
 * Scope 1: stationary combustion (liter solar → kg → tCO₂) + transport breakdown
 * Scope 2: kWh konsumsi listrik PLN
 * Scope 3: jarak pengiriman bahan bakar (km) + freight
 */
import { useState, useMemo } from "react";
import { EF, EF_LABELS, EF_CATEGORIES, CREDIT_PRICE, TR } from "./shared.jsx";

// ─── liter solar → kg CO₂ conversion helper ─────────────────
// Solar (HSD) density ≈ 0.832 kg/liter (Pertamina standard)
// EF solar = 2.68 kg CO₂/liter  →  already per-liter, no extra conversion needed
// We show the intermediate kg mass to the user for transparency
function literToKg(liters, density = 0.832) {
  return +(liters * density).toFixed(2);
}

// Group EF keys by scope then category
const SCOPE_KEYS = { 1: [], 2: [], 3: [] };
const CAT_MAP = {};   // key → category
Object.entries(EF).forEach(([k, v]) => {
  SCOPE_KEYS[v.scope].push(k);
  CAT_MAP[k] = v.category;
});

function groupByCategory(keys) {
  const groups = {};
  keys.forEach(k => {
    const cat = CAT_MAP[k] || "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(k);
  });
  return groups;
}

export function CalcPage({ t = TR.en}) {
  const [inputs, setInputs]       = useState(Object.fromEntries(Object.keys(EF).map(k => [k, ""])));
  const [result, setResult]       = useState(null);
  const [activeScope, setScope]   = useState(1);
  const [expanded, setExpanded]   = useState({});
  const [method, setMethod]         = useState("operational"); // "operational" | "equity"
  const [equityPct, setEquityPct]   = useState("");
  const [certFile, setCertFile]     = useState(null);
  const [certError, setCertError]   = useState("");
  const [certOk, setCertOk]       = useState(false);

function handleCertUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const allowed = ["application/pdf","image/jpeg","image/png","image/jpg"];
  if (!allowed.includes(file.type)) {
    setCertFile(null);
    setCertOk(false);
    setCertError(t.calc?.ownershipReject || "File ditolak — harus PDF atau gambar");
    return;
  }
  setCertFile(file);
  setCertOk(true);
  setCertError("");
}

  function toggleCat(cat) {
    setExpanded(e => ({ ...e, [cat]: !e[cat] }));
  }

  function calculate() {
    const eqFactor = method === "equity" ? (parseFloat(equityPct) || 100) / 100 : 1;
    let s1 = 0, s2 = 0, s3 = 0;
    const breakdown = [];

    Object.entries(EF).forEach(([k, ef]) => {
      const raw = parseFloat(inputs[k]) || 0;
      if (raw <= 0) return;

      // For stationary/mobile diesel (liter input), show kg intermediate
      const kgMass = ef.litToKg ? literToKg(raw, ef.litToKg) : null;
      const em = +(raw * ef.ef * eqFactor).toFixed(3);


      if (ef.scope === 1) s1 += em;
      else if (ef.scope === 2) s2 += em;
      else s3 += em;

      breakdown.push({
        key: k, val: raw, ef: ef.ef, unit: ef.unit,
        emission: em, scope: ef.scope,
        category: ef.category,
        kgMass,
        source: ef.source || EF_LABELS[k],
      });
    });

    const total   = +(s1 + s2 + s3).toFixed(2);
    const leakage = +(s1 * 0.05 + s3 * 0.10).toFixed(2);
    setResult({
      total, s1: +s1.toFixed(2), s2: +s2.toFixed(2), s3: +s3.toFixed(2),
      leakage, breakdown,
      creditsNeeded: Math.ceil(total / 1000),
    });
  }

  const scopeGroups = useMemo(() => groupByCategory(SCOPE_KEYS[activeScope]), [activeScope]);

  const SCOPE_INFO = {
    1: { label: "Scope 1 — Direct Emissions", sub: "Pembakaran stasioner (genset, boiler, furnace) & transportasi operasional", color: "#dc2626" },
    2: { label: "Scope 2 — Purchased Energy",  sub: "Listrik PLN (kWh) & energi yang dibeli", color: "#ea580c" },
    3: { label: "Scope 3 — Value Chain",        sub: "Pengiriman bahan bakar, logistik, perjalanan bisnis, limbah", color: "#ca8a04" },
  };

  const si = SCOPE_INFO[activeScope];

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4 fade-up">

      {/* Header */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}>
        <p className="text-slate-300 text-xs uppercase tracking-widest mb-0.5">{t.calc?.title || "Emission Calculator"}</p>
        <p className="font-black text-xl">Scope 1 · 2 · 3</p>
        <p className="text-slate-400 text-xs mt-0.5">IPCC 2006 · ESDM Indonesia · Pertamina HSD EF</p>
      </div>

      {/* Scope tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map(s => (
          <button key={s} onClick={() => setScope(s)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeScope === s ? "bg-slate-800 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600"}`}>
            Scope {s}
          </button>
        ))}
      </div>

{/* Method selector — Operational vs Equity */}
<div className="card p-4 flex flex-col gap-3">
  <p className="text-xs font-bold text-gray-700">
    {t.calc?.method || "Calculation Method"}
  </p>
  <div className="flex gap-2">
    {[
      { val:"operational", label:"Operational / Activity" },
      { val:"equity",      label:"Equity Share" },
    ].map(m => (
      <button key={m.val} type="button" onClick={() => setMethod(m.val)}
        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all
          ${method === m.val
            ? "bg-slate-800 text-white border-slate-800"
            : "bg-white border-gray-200 text-gray-600"}`}>
        {m.label}
      </button>
    ))}
  </div>

  {/* Equity method — muncul hanya jika pilih equity */}
  {method === "equity" && (
    <div className="flex flex-col gap-3 pt-1">

      {/* % kepemilikan */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1">
          {t.calc?.equityPct || "Equity Share (%)"}
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number" min="0" max="100" placeholder="e.g. 40"
            value={equityPct}
            onChange={e => setEquityPct(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">%</span>
        </div>
        {equityPct && (
          <p className="text-xs text-blue-600 mt-1.5 bg-blue-50 rounded-lg px-2 py-1">
            Emisi dikalikan <strong>{equityPct}%</strong> dari total operasional
          </p>
        )}
      </div>

      {/* Upload sertifikat kepemilikan */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1">
          Upload Your Ownership Certificate
        </label>
        <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-colors
          ${certOk
            ? "border-green-400 bg-green-50"
            : certError
            ? "border-red-400 bg-red-50"
            : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}>
          <span className="text-2xl">{certOk ? "📄" : "⬆️"}</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-700">
              {certFile ? certFile.name : "Upload Your Ownership Certificate"}
            </p>
            <p className="text-xs text-gray-400">PDF / JPG / PNG</p>
          </div>
          {certOk && <span className="text-green-600 text-xs font-bold">✓ Valid</span>}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleCertUpload}
          />
        </label>
        {certError && (
          <p className="text-xs text-red-600 mt-1 font-bold">{certError}</p>
        )}
      </div>

      {/* Warning jika equity dipilih tapi belum upload */}
      {!certOk && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1.5">
          ⚠️ Ownership certificate required for Equity Share method
        </p>
      )}
    </div>
  )}
</div>

      {/* Scope description */}
      <div className="rounded-xl px-4 py-3 border" style={{ borderColor: si.color + "44", background: si.color + "0d" }}>
        <p className="text-xs font-bold" style={{ color: si.color }}>{si.label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{si.sub}</p>
      </div>

      {/* Input groups by category */}
      {Object.entries(scopeGroups).map(([cat, keys]) => (
        <div key={cat} className="card overflow-hidden">
          <button
            onClick={() => toggleCat(cat)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-xs font-bold text-gray-800">{EF_CATEGORIES[cat] || cat}</p>
              <p className="text-xs text-gray-400">{keys.length} sumber emisi</p>
            </div>
            <span className="text-gray-400 text-sm">{expanded[cat] === false ? "▸" : "▾"}</span>
          </button>

          {expanded[cat] !== false && (
            <div className="p-3 flex flex-col gap-3">
              {keys.map(k => {
                const ef = EF[k];
                const raw = parseFloat(inputs[k]) || 0;
                const kgPreview = ef.litToKg && raw > 0 ? literToKg(raw, ef.litToKg) : null;
                const emPreview = raw > 0 ? +(raw * ef.ef).toFixed(2) : null;

                return (
                  <div key={k}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">{EF_LABELS[k]}</label>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        EF: {ef.ef} kg CO₂/{ef.unit}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number" min="0" placeholder="0"
                        value={inputs[k]}
                        onChange={e => setInputs(i => ({ ...i, [k]: e.target.value }))}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                      />
                      <span className="bg-gray-100 rounded-xl px-3 flex items-center text-xs font-medium text-gray-500 min-w-fit">
                        {ef.unit}
                      </span>
                    </div>

                    {/* Live conversion preview: liter → kg bahan bakar → kg CO₂ */}
                    {kgPreview && (
                      <p className="text-xs text-amber-600 mt-1 bg-amber-50 rounded-lg px-2 py-1">
                        {raw} liter × 0.832 = <strong>{kgPreview} kg</strong> solar →{" "}
                        <strong>{emPreview} kg CO₂</strong>
                      </p>
                    )}
                    {/* Live emission preview for non-liter inputs */}
                    {!kgPreview && emPreview && (
                      <p className="text-xs text-slate-500 mt-1">
                        → <strong>{emPreview} kg CO₂e</strong>
                      </p>
                    )}

                    {/* Scope 2 helper */}
                    {cat === "electricity" && raw > 0 && (
                      <p className="text-xs text-blue-600 mt-1 bg-blue-50 rounded-lg px-2 py-1">
                        {raw} kWh × EF PLN 0.87 = <strong>{emPreview} kg CO₂e</strong>{" "}
                        <span className="text-blue-400">(grid Indonesia)</span>
                      </p>
                    )}

                    {/* Scope 3 freight/delivery helper */}
                    {(k === "fuelDelivery") && raw > 0 && (
                      <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 rounded-lg px-2 py-1">
                        Jarak {raw} km × EF 0.062 = <strong>{emPreview} kg CO₂e</strong>{" "}
                        <span className="text-yellow-500">(ongkir BB darat)</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <button onClick={calculate} disabled={method === "equity" && !certOk}
        className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"
        style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}>
        {t.calc?.calculate || "Hitung Emisi"}
      </button>

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-3 fade-up">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l:"Scope 1", v:result.s1, c:"#ef4444", sub:"Langsung" },
              { l:"Scope 2", v:result.s2, c:"#f97316", sub:"Energi" },
              { l:"Scope 3", v:result.s3, c:"#eab308", sub:"Rantai nilai" },
            ].map((s, i) => (
              <div key={i} className="card p-3 text-center">
                <p className="text-xs text-gray-400">{s.l}</p>
                <p className="font-black text-sm" style={{ color: s.c }}>{s.v.toLocaleString()}</p>
                <p className="text-xs text-gray-400">kg CO₂e</p>
                <p className="text-xs" style={{ color: s.c + "99" }}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#dc2626,#b45309)" }}>
            <div className="p-4 text-white">
              <p className="text-red-200 text-xs uppercase tracking-wide">{t.calc?.totalEm || "Total Emisi"}</p>
              <p className="text-4xl font-black">{result.total.toLocaleString()}</p>
              <p className="text-red-200 text-sm">kg CO₂e</p>
            </div>
          </div>

          <div className="card p-3 bg-orange-50 border-orange-200 border">
            <p className="text-xs font-bold text-orange-700">
              Estimasi Leakage: ~{result.leakage.toLocaleString()} kg CO₂e
            </p>
            <p className="text-xs text-orange-600 mt-0.5">Scope 1 × 5% + Scope 3 × 10% (displacement effect)</p>
          </div>

          <div className="card p-4 bg-green-50 border-green-200 border">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
              {t.calc?.offsetNeeded || "Offset Dibutuhkan"}
            </p>
            <p className="text-3xl font-black text-green-700">
              {result.creditsNeeded}{" "}
              <span className="text-base font-normal">carbon credits</span>
            </p>
            <p className="text-xs text-green-600 mt-1">
              ≈ ${(result.creditsNeeded * CREDIT_PRICE).toLocaleString()} USD @ ${CREDIT_PRICE}/ton
            </p>
          </div>

          {/* Breakdown */}
          {result.breakdown.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <p className="font-bold text-gray-800 text-sm">Rincian per Sumber</p>
              </div>
              <div className="divide-y divide-gray-50">
                {result.breakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{b.source}</p>
                      <p className="text-xs text-gray-400">
                        Scope {b.scope} · {b.val} {b.unit}
                        {b.kgMass ? ` → ${b.kgMass} kg bahan bakar` : ""}
                        {" × EF "}{b.ef}
                      </p>
                    </div>
                    <p className="font-bold text-red-600 text-sm">{b.emission.toLocaleString()} kg</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}