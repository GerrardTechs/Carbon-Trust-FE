/**
 * CarbonTrust — CalcPage.jsx  (Revised: tambah tab "Total Emisi")
 *
 * Tab layout:
 * Scope 1 | Scope 2 | Scope 3 | Total ← NEW
 *
 * "Total Emisi" tab:
 * - Menampilkan ringkasan Scope 1 + Scope 2 + Scope 3
 * - Formula mengacu GHG Protocol Uncertainty Calculation Tool (Quantis/WBCSD):
 * GHG_i = Activity_i × EF_i
 * Total = Σ(Scope1) + Σ(Scope2) + Σ(Scope3)
 * - Hanya aktif setelah user klik "Hitung Emisi" minimal sekali
 * - Breakdown per scope + per sumber
 * - Uncertainty indicator (dari pedigree matrix Excel)
 */
import { useState, useMemo, useEffect } from "react";
import {
  EF, EF_LABELS, CREDIT_PRICE, TR, apiFetch,
  Modal, Spinner, getEfCategories, getLocale,
  CALC_DRAFT_KEY, dispatchCarbonDataUpdate, parseNum, roundCarbon,
} from "../shared.jsx";

// Group EF keys by scope
const SCOPE_KEYS = { 1: [], 2: [], 3: [] };
const CAT_MAP    = {};
Object.entries(EF).forEach(([efKey, efVal]) => {
  SCOPE_KEYS[efVal.scope].push(efKey);
  CAT_MAP[efKey] = efVal.category;
});

function groupByCategory(keys) {
  const groups = {};
  keys.forEach(efKey => {
    const cat = CAT_MAP[efKey] || "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(efKey);
  });
  return groups;
}

// ─── UNCERTAINTY LEVELS (mengacu pedigree matrix dari Excel GHG Protocol) ───
// Sumber: Quantis/WBCSD Uncertainty Calculation Tool
// Basic Uncertainty Factor per technology type (dari sheet "Info" di Excel):
//   Electricity: 1.05 | Industrial Products: 1.05 | Transport: 2 | Agricultural: 2
// Untuk tampilan ringkas kita kategorikan ke 3 level:
const UNCERTAINTY = {
  stationary:  { label: "±5%",  color: "#16a34a", desc: "Rendah — data pembakaran stasioner akurat" },
  mobile:      { label: "±8%",  color: "#ca8a04", desc: "Sedang — variasi konsumsi kendaraan" },
  fugitive:    { label: "±15%", color: "#dc2626", desc: "Tinggi — emisi fugitif sulit diukur langsung" },
  electricity: { label: "±5%",  color: "#16a34a", desc: "Rendah — grid PLN, EF terstandar ESDM" },
  steam:       { label: "±8%",  color: "#ca8a04", desc: "Sedang — data heat/steam bervariasi" },
  travel:      { label: "±10%", color: "#ca8a04", desc: "Sedang — estimasi jarak perjalanan" },
  freight:     { label: "±15%", color: "#dc2626", desc: "Tinggi — faktor muatan bervariasi" },
  waste:       { label: "±20%", color: "#dc2626", desc: "Tinggi — komposisi limbah tidak homogen" },
};

const SCOPE_INFO_FALLBACK = {
  1: { label: "Scope 1 — Direct Emissions",  sub: "Stationary combustion & operational transport", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  2: { label: "Scope 2 — Purchased Energy",  sub: "Grid electricity (kWh) & purchased energy",       color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  3: { label: "Scope 3 — Value Chain",        sub: "Freight, logistics, travel & waste",            color: "#ca8a04", bg: "#fefce8", border: "#fde68a" },
};

function getScopeInfo(t) {
  const info = t.calc?.ui?.scopeInfo || {};
  return {
    1: { ...SCOPE_INFO_FALLBACK[1], ...info[1] },
    2: { ...SCOPE_INFO_FALLBACK[2], ...info[2] },
    3: { ...SCOPE_INFO_FALLBACK[3], ...info[3] },
  };
}

function loadCalcDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(CALC_DRAFT_KEY) || "null");
    return d && typeof d === "object" ? d : null;
  } catch { return null; }
}

// ─── SCOPE SUMMARY CARD (dipakai di tab Total) ───────────────────────────────
function ScopeSummaryCard({ scope, value, breakdown, onClick, ui, locale, scopeInfo }) {
  const si = { ...SCOPE_INFO_FALLBACK[scope], ...scopeInfo[scope] };
  const count = breakdown.filter(bdItem => bdItem.scope === scope).length;
  const sourcesLabel = (ui?.emissionSources || "{n} emission sources").replace("{n}", count);
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 border-2 transition-all hover:shadow-md active:scale-95"
      style={{ borderColor: SCOPE_INFO_FALLBACK[scope].border, background: SCOPE_INFO_FALLBACK[scope].bg }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: SCOPE_INFO_FALLBACK[scope].color }}>
            Scope {scope}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{si.sub}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-xl" style={{ color: SCOPE_INFO_FALLBACK[scope].color }}>
            {value.toLocaleString(locale, { maximumFractionDigits: 1 })}
          </p>
          <p className="text-xs text-gray-400">kg CO₂e</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{sourcesLabel}</span>
        <span className="text-xs font-semibold" style={{ color: SCOPE_INFO_FALLBACK[scope].color }}>
          {ui?.seeDetail || "See breakdown →"}
        </span>
      </div>
    </button>
  );
}

// ─── BREAKDOWN TABLE (dipakai di tab Total untuk detail per source) ──────────
function BreakdownTable({ items, scopeColor, ui, locale }) {
  if (!items.length) return (
    <p className="text-xs text-gray-400 text-center py-3">{ui?.noEmission || "No emissions recorded"}</p>
  );
  return (
    <div className="divide-y divide-gray-50">
      {items.map((breakdownItem, i) => {
        const unc = UNCERTAINTY[breakdownItem.category] || { label: "±10%", color: "#6b7280" };
        return (
          <div key={i} className="flex items-center justify-between px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{breakdownItem.source}</p>
              <p className="text-xs text-gray-400">
                {breakdownItem.val} {breakdownItem.unit} × EF {breakdownItem.ef}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-lg"
                style={{ color: unc.color, background: unc.color + "18" }}
              >
                {unc.label}
              </span>
              <p className="font-bold text-sm" style={{ color: scopeColor }}>
                {breakdownItem.emission.toLocaleString(locale, { maximumFractionDigits: 2 })} kg
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DONUT CHART (SVG mini untuk distribusi scope) ───────────────────────────
function ScopeDonut({ s1, s2, s3 }) {
  const total = s1 + s2 + s3;
  if (total === 0) return null;

  const pct1 = s1 / total, pct2 = s2 / total, pct3 = s3 / total;
  const R = 40, cx = 50, cy = 50, strokeW = 16;
  const circ = 2 * Math.PI * R;

  // Build stroke-dasharray segments
  const seg = [
    { pct: pct1, color: "#dc2626", label: "S1" },
    { pct: pct2, color: "#ea580c", label: "S2" },
    { pct: pct3, color: "#ca8a04", label: "S3" },
  ];
  let offset = 0;
  const paths = seg.map((segItem, i) => {
    const dash = segItem.pct * circ;
    const gap  = circ - dash;
    const rot  = offset * 360;
    offset += segItem.pct;
    return (
      <circle
        key={i}
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={segItem.color}
        strokeWidth={strokeW}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={circ * 0.25} // start from top
        style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px` }}
      />
    );
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
        {paths}
        <text x={cx} y={cy - 4}  textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1f2937">
          {(total / 1000).toFixed(1)}
        </text>
        <text x={cx} y={cy + 8}  textAnchor="middle" fontSize="7"  fill="#6b7280">tCO₂e</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {seg.map((segItem, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: segItem.color }} />
            <span className="text-xs text-gray-600">
              {segItem.label}: <strong style={{ color: segItem.color }}>{(segItem.pct * 100).toFixed(1)}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function CalcPage({ t = TR.en, companyId, setPage, lang = "en" }) {
  const draft = loadCalcDraft();
  const defaultInputs = Object.fromEntries(Object.keys(EF).map(efKey => [efKey, ""]));
  const ui = t.calc?.ui || TR.en.calc.ui;
  const locale = getLocale(lang);
  const scopeInfo = getScopeInfo(t);
  const categories = getEfCategories(lang);

  const [inputs, setInputs]     = useState(draft?.inputs ?? defaultInputs);
  const [freightTons, setFreightTons] = useState(draft?.freightTons ?? {});
  const [result, setResult]     = useState(draft?.result ?? null);
  const [activeScope, setScope] = useState(draft?.activeScope ?? 1);
  const [expanded, setExpanded] = useState(draft?.expanded ?? {});
  const [method, setMethod]     = useState(draft?.method ?? "operational");
  const [equityPct, setEquityPct] = useState(draft?.equityPct ?? "");
  const [certFile, setCertFile] = useState(null);
  const [certError, setCertError] = useState("");
  const [certOk, setCertOk]     = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  const [totalDetailScope, setTotalDetailScope] = useState(null);

  useEffect(() => {
    localStorage.setItem(CALC_DRAFT_KEY, JSON.stringify({
      inputs, freightTons, result, method, equityPct, activeScope, expanded,
    }));
  }, [inputs, freightTons, result, method, equityPct, activeScope, expanded]);

  function handleCertUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setCertFile(null); setCertOk(false);
      setCertError(t.calc?.ownershipReject || "File ditolak — harus PDF atau gambar");
      return;
    }
    setCertFile(file); setCertOk(true); setCertError("");
  }

  function toggleCat(cat) {
    setExpanded(e => ({ ...e, [cat]: !e[cat] }));
  }

  // ─── KALKULASI ─────────────────────────────────────────────────────────────
  // Formula: GHG_i = Activity_i × EF_i  (GHG Protocol, sesuai Excel Quantis/WBCSD)
  // Total = Σ Scope1_i + Σ Scope2_i + Σ Scope3_i
  async function calculate() {
    setCalculating(true);
    const eqFactor = method === "equity" ? (parseNum(equityPct) || 100) / 100 : 1;
    let s1 = 0, s2 = 0, s3 = 0;
    const breakdown = [];
    const apiInputs = {};

    Object.entries(EF).forEach(([efKey, ef]) => {
      const raw = parseNum(inputs[efKey]);
      if (raw <= 0) return;

      const isTkm = ef.unit === "ton·km";
      const tons = parseNum(freightTons[efKey]);
      const effectiveVal = isTkm ? (tons > 0 ? raw * tons : raw) : raw;
      const em = roundCarbon(effectiveVal * ef.ef * eqFactor, 3);

      apiInputs[efKey] = isTkm && tons > 0 ? effectiveVal : raw;
      if (isTkm && tons > 0) apiInputs[`${efKey}_km`] = raw;
      if (isTkm && tons > 0) apiInputs[`${efKey}_tons`] = tons;

      if (ef.scope === 1) s1 += em;
      else if (ef.scope === 2) s2 += em;
      else s3 += em;

      breakdown.push({
        key: efKey, val: effectiveVal, ef: ef.ef,
        unit: isTkm ? `${effectiveVal} ton·km` : ef.unit,
        emission: em, scope: ef.scope, category: ef.category,
        source: lang === "en" ? (ef.source || EF_LABELS[efKey]) : (EF_LABELS[efKey] || ef.source),
      });
    });

    const total   = roundCarbon(s1 + s2 + s3, 2);
    const leakage = roundCarbon(s1 * 0.05 + s3 * 0.10, 2);

    const nextResult = {
      total, s1: roundCarbon(s1, 2), s2: roundCarbon(s2, 2), s3: roundCarbon(s3, 2),
      leakage, breakdown,
      creditsNeeded: Math.ceil(total / 1000),
    };
    setResult(nextResult);

    localStorage.setItem("carbon_emission_result", JSON.stringify({
      total: nextResult.total,
      s1: nextResult.s1, s2: nextResult.s2, s3: nextResult.s3,
      netEmission: nextResult.total,
      leakage: nextResult.leakage,
      savedAt: new Date().toISOString(),
    }));
    dispatchCarbonDataUpdate();

    if (companyId) {
      apiFetch("/emissions/calculate-v2", {
        method: "POST",
        body: JSON.stringify({
          companyId,
          method,
          equityPct: method === "equity" ? parseNum(equityPct) || 100 : 100,
          inputs: apiInputs,
        }),
      }).catch(() => {});
    }

    setCalculating(false);
    setScope("total");
    setTotalDetailScope(null);
    setShowJourneyModal(true);
  }

  const scopeGroups = useMemo(
    () => (activeScope !== "total") ? groupByCategory(SCOPE_KEYS[activeScope]) : {},
    [activeScope]
  );

  const si = activeScope !== "total" ? scopeInfo[activeScope] : null;
  const siStyle = activeScope !== "total" ? SCOPE_INFO_FALLBACK[activeScope] : null;

  // ─── SCOPE INPUT PANEL ─────────────────────────────────────────────────────
  function renderScopeInput() {
    return (
      <>
        {/* Scope description */}
        <div className="rounded-xl px-4 py-3 border" style={{ borderColor: siStyle.border, background: siStyle.bg }}>
          <p className="text-xs font-bold" style={{ color: siStyle.color }}>{si.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{si.sub}</p>
        </div>

        {/* Input groups by category */}
        {Object.entries(scopeGroups).map(([cat, keys]) => (
          <div key={cat} className="card overflow-hidden">
            <button
              onClick={() => toggleCat(cat)}
              className="w-full flex items-center justify-between px-4 py-3 border-breakdownItem border-gray-100 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-gray-800">{categories[cat] || cat}</p>
                <p className="text-xs text-gray-400">{(ui.emissionSources || "{n} sources").replace("{n}", keys.length)}</p>
              </div>
              <span className="text-gray-400 text-sm">{expanded[cat] === false ? "▸" : "▾"}</span>
            </button>

            {expanded[cat] !== false && (
              <div className="p-3 flex flex-col gap-3">
                {keys.map(efKey => {
                  const ef     = EF[efKey];
                  const raw    = parseFloat(inputs[efKey]) || 0;
                  const tons   = parseFloat(freightTons[efKey]) || 0;
                  const effectiveRaw = ef.unit === "ton·km" ? (tons > 0 ? raw * tons : raw) : raw;
                  const emPrev = effectiveRaw > 0 ? +(effectiveRaw * ef.ef).toFixed(2) : null;

                  return (
                    <div key={efKey}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gray-700">
                          {lang === "en" ? (ef.source || EF_LABELS[efKey]) : (EF_LABELS[efKey] || ef.source)}
                        </label>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          EF: {ef.ef} kg CO₂/{ef.unit}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number" min="0" placeholder="0"
                          value={inputs[efKey]}
                          onChange={e => setInputs(prev => ({ ...prev, [efKey]: e.target.value }))}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                        />
                        <span className="bg-gray-100 rounded-xl px-3 flex items-center text-xs font-medium text-gray-500 min-w-fit">
                          {ef.unit}
                        </span>
                      </div>

                      {/* Live preview */}
                      {ef.unit === "liter" && emPrev && (
                        <p className="text-xs text-amber-600 mt-1 bg-amber-50 rounded-lg px-2 py-1">
                          {raw} liter × EF {ef.ef} = <strong>{emPrev} kg CO₂e</strong>
                        </p>
                      )}
                      {ef.unit === "kWh" && emPrev && (
                        <p className="text-xs text-blue-600 mt-1 bg-blue-50 rounded-lg px-2 py-1">
                          {raw} kWh × EF 0.87 = <strong>{emPrev} kg CO₂e</strong>
                          <span className="text-blue-400"> · Grid PLN Indonesia (ESDM 2023)</span>
                        </p>
                      )}
                      {ef.unit === "ton·km" && (
                        <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 rounded-lg px-2 py-1">
                          {ui.tonKmHint}
                        </p>
                      )}
                      {ef.unit === "ton·km" && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="number" min="0" placeholder="0"
                            value={freightTons[efKey] || ""}
                            onChange={e => setFreightTons(prev => ({ ...prev, [efKey]: e.target.value }))}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                          />
                          <span className="bg-gray-100 rounded-xl px-3 flex items-center text-xs font-medium text-gray-500 min-w-fit">
                            {ui.tonKmLoad || "tons"}
                          </span>
                        </div>
                      )}
                      {!ef.unit.includes("liter") && ef.unit !== "kWh" && ef.unit !== "ton·km" && emPrev && (
                        <p className="text-xs text-slate-500 mt-1">
                          → <strong>{emPrev} kg CO₂e</strong>
                        </p>
                      )}
                      {ef.unit === "ton·km" && emPrev && (
                        <p className="text-xs text-slate-500 mt-1">
                          {effectiveRaw} ton·km × EF {ef.ef} = <strong>{emPrev} kg CO₂e</strong>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </>
    );
  }

  // ─── TOTAL EMISI PANEL ─────────────────────────────────────────────────────
  function renderTotalPanel() {
    // Sebelum dihitung
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="text-5xl">🧮</div>
          <p className="font-bold text-gray-700 text-center">{ui.notCalculated}</p>
          <p className="text-xs text-gray-400 text-center px-4">{ui.notCalculatedHint}</p>
          <button
            onClick={() => setScope(1)}
            className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl"
          >
            {ui.startScope1}
          </button>
        </div>
      );
    }

    const { s1, s2, s3, total, leakage, creditsNeeded, breakdown } = result;

    // Kontribusi persen
    const pct = (val) => total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";

    return (
      <div className="flex flex-col gap-3">

        {/* ── Formula Reference ── */}
        <div className="rounded-xl px-3 py-2 bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-0.5">📐 {ui.formulaTitle}</p>
          <p className="text-xs text-slate-500 font-mono">{ui.formula1}</p>
          <p className="text-xs text-slate-500 font-mono">{ui.formula2}</p>
        </div>

        <div className="card p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{ui.distribution}</p>
          <ScopeDonut s1={s1} s2={s2} s3={s3} />
        </div>

        {/* ── Total besar ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1e293b,#374151)" }}>
          <div className="p-5 text-white">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
              {t.calc?.totalEm || "Total Emisi"}
            </p>
            <p className="font-black" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
              {total.toLocaleString(locale)}
            </p>
            <p className="text-slate-400 text-sm mt-1">kg CO₂e</p>
            <p className="text-slate-500 text-xs mt-2">
              = {(total / 1000).toFixed(3)} tCO₂e
            </p>
          </div>
          {/* Progress bar distribusi scope */}
          <div className="flex h-2">
            <div style={{ width: pct(s1) + "%", background: "#dc2626" }} />
            <div style={{ width: pct(s2) + "%", background: "#ea580c" }} />
            <div style={{ width: pct(s3) + "%", background: "#ca8a04" }} />
          </div>
        </div>

        {/* ── 3 scope cards — tap untuk lihat breakdown ── */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">
          {ui.scopeBreakdown}
        </p>
        {[1, 2, 3].map(segItem => (
          <ScopeSummaryCard
            key={segItem}
            scope={segItem}
            value={segItem === 1 ? s1 : segItem === 2 ? s2 : s3}
            breakdown={breakdown}
            onClick={() => setTotalDetailScope(totalDetailScope === segItem ? null : segItem)}
            ui={ui}
            locale={locale}
            scopeInfo={scopeInfo}
          />
        ))}

        {/* ── Inline breakdown accordion ── */}
        {totalDetailScope && (
          <div className="card overflow-hidden">
            <div
              className="px-4 py-3 border-breakdownItem border-gray-100 flex items-center justify-between"
              style={{ background: SCOPE_INFO_FALLBACK[totalDetailScope].bg }}
            >
              <p className="text-xs font-bold" style={{ color: SCOPE_INFO_FALLBACK[totalDetailScope].color }}>
                {(ui.scopeDetail || "Scope {n}").replace("{n}", totalDetailScope)}
              </p>
              <button
                onClick={() => setTotalDetailScope(null)}
                className="text-gray-400 text-sm hover:text-gray-600"
              >✕</button>
            </div>
            <BreakdownTable
              items={breakdown.filter(bdItem => bdItem.scope === totalDetailScope)}
              scopeColor={SCOPE_INFO_FALLBACK[totalDetailScope].color}
              ui={ui}
              locale={locale}
            />
            <div
              className="px-4 py-3 border-t flex items-center justify-between"
              style={{ background: SCOPE_INFO_FALLBACK[totalDetailScope].bg }}
            >
              <p className="text-xs font-bold text-gray-600">
                {(ui.subtotal || "Subtotal Scope {n}").replace("{n}", totalDetailScope)}
              </p>
              <p className="font-black text-sm" style={{ color: SCOPE_INFO_FALLBACK[totalDetailScope].color }}>
                {(totalDetailScope === 1 ? s1 : totalDetailScope === 2 ? s2 : s3).toLocaleString(locale, { maximumFractionDigits: 2 })} kg CO₂e
              </p>
            </div>
          </div>
        )}

        {/* ── Uncertainty note ── */}
        <div className="rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-200">
          <p className="text-xs font-bold text-amber-700 mb-1">📊 {ui.uncertaintyTitle}</p>
          <p className="text-xs text-amber-600">{ui.uncertaintyDesc}</p>
        </div>

        <div className="card p-3 bg-orange-50 border-orange-200 border">
          <p className="text-xs font-bold text-orange-700">
            {t.calc?.leakage || "Estimated Leakage"}: ~{leakage.toLocaleString(locale)} kg CO₂e
          </p>
          <p className="text-xs text-orange-600 mt-0.5">{ui.leakageNote}</p>
        </div>

        {/* ── Carbon credits needed ── */}
        <div className="card p-4 bg-green-50 border-green-200 border">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
            {t.calc?.offsetNeeded || "Offset Dibutuhkan"}
          </p>
          <p className="font-black text-green-700" style={{ fontSize: "2rem" }}>
            {creditsNeeded}{" "}
            <span className="text-base font-normal">carbon credits</span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            ≈ ${(creditsNeeded * CREDIT_PRICE).toLocaleString()} USD @ ${CREDIT_PRICE}/ton
          </p>
        </div>

        {/* ── Hitung ulang ── */}
        <button
          onClick={() => { setScope(1); setTotalDetailScope(null); }}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 active:scale-95 transition-all"
        >
          {ui.recalculate}
        </button>
      </div>
    );
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4 fade-up">

      {/* Header */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}>
        <p className="text-slate-300 text-xs uppercase tracking-widest mb-0.5">
          {t.calc?.title || "Emission Calculator"}
        </p>
        <p className="font-black text-xl">{ui.scopeTabs}</p>
        <p className="text-slate-400 text-xs mt-0.5">{t.calc?.ref || "IPCC 2006 · GHG Protocol"}</p>
      </div>

      {/* ── Scope tabs (1 | 2 | 3 | Total) ── */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map(segItem => (
          <button
            key={segItem}
            onClick={() => setScope(segItem)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeScope === segItem
                ? "text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
            style={activeScope === segItem ? { background: SCOPE_INFO_FALLBACK[segItem].color } : {}}
          >
            Scope {segItem}
          </button>
        ))}
        {/* Tab Total */}
        <button
          onClick={() => setScope("total")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
            activeScope === "total"
              ? "bg-slate-800 text-white border-slate-800 shadow-md"
              : result
              ? "bg-slate-50 border-slate-300 text-slate-700"
              : "bg-white border-gray-200 text-gray-400"
          }`}
        >
          {result ? "✓ Total" : "Total"}
        </button>
      </div>

      {/* ── Method selector (hanya tampil saat scope input, bukan total) ── */}
      {activeScope !== "total" && (
        <div className="card p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-700">
            {t.calc?.method || "Calculation Method"}
          </p>
          <div className="flex gap-2">
            {[
              { val: "operational", label: ui.methodOpLabel || t.calc?.methodOp },
              { val: "equity",      label: ui.methodEqLabel || t.calc?.methodEq },
            ].map(methodOpt => (
              <button
                key={methodOpt.val} type="button" onClick={() => setMethod(methodOpt.val)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  method === methodOpt.val
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                {methodOpt.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl px-3 py-2.5 bg-indigo-50 border border-indigo-200">
            <p className="text-xs font-bold text-indigo-800 mb-1">🤖 {ui.aiMethodTitle}</p>
            <p className="text-xs text-indigo-700 leading-relaxed">
              {t.calc?.aiMethodDesc || "CarbonTrust AI validates your manual inputs against ISO 14064 certificate data using IPCC emission factors and mass-balance principles."}
            </p>
          </div>

          {method === "equity" && (
            <div className="flex flex-col gap-3 pt-1">
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

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  {t.calc?.ownershipCert || "Upload Ownership Certificate"}
                </label>
                <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-colors ${
                  certOk ? "border-green-400 bg-green-50" : certError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
                }`}>
                  <span className="text-2xl">{certOk ? "📄" : "⬆️"}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-700">
                      {certFile ? certFile.name : (t.calc?.ownershipCert || "Upload Ownership Certificate")}
                    </p>
                    <p className="text-xs text-gray-400">PDF / JPG / PNG</p>
                  </div>
                  {certOk && <span className="text-green-600 text-xs font-bold">✓ Valid</span>}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleCertUpload} />
                </label>
                {certError && <p className="text-xs text-red-600 mt-1 font-bold">{certError}</p>}
              </div>

              {!certOk && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1.5">
                  ⚠️ Ownership certificate required for Equity Share method
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Content area ── */}
      {activeScope !== "total" ? renderScopeInput() : renderTotalPanel()}

      {/* ── Hitung Emisi button (hanya di scope input, bukan total) ── */}
      {activeScope !== "total" && (
        <button
          onClick={calculate}
          disabled={(method === "equity" && !certOk) || calculating}
          className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}
        >
          {calculating ? <><Spinner /> {ui.calculating}</> : <>{t.calc?.calculate} →</>}
        </button>
      )}

      {/* ── Quick result bar (muncul di bawah tombol hitung jika sudah ada result, di scope 1/2/3) ── */}
      {result && activeScope !== "total" && (
        <button
          onClick={() => setScope("total")}
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-left active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{ui.lastResult}</p>
              <p className="font-black text-slate-800">
                {result.total.toLocaleString(locale)} kg CO₂e
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-right">
                <p className="text-xs text-red-500">S1: {result.s1.toLocaleString(locale)}</p>
                <p className="text-xs text-orange-500">S2: {result.s2.toLocaleString(locale)}</p>
                <p className="text-xs text-yellow-600">S3: {result.s3.toLocaleString(locale)}</p>
              </div>
              <span className="text-slate-400 text-lg">→</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{ui.tapTotal}</p>
        </button>
      )}

      <Modal open={showJourneyModal} onClose={() => setShowJourneyModal(false)} title={ui.journeyTitle}>
        <p className="text-sm text-gray-600 mb-4">{ui.journeyBody}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setShowJourneyModal(false); setPage?.("absorb"); }}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}
          >
            {ui.goSequestration}
          </button>
          <button
            onClick={() => setShowJourneyModal(false)}
            className="w-full py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600"
          >
            {ui.stayHere}
          </button>
        </div>
      </Modal>
    </div>
  );
}