/**
 * CarbonTrust — CalcPage.jsx  (Revised: tambah tab "Total Emisi")
 *
 * Tab layout:
 *   Scope 1 | Scope 2 | Scope 3 | Total ← NEW
 *
 * "Total Emisi" tab:
 *   - Menampilkan ringkasan Scope 1 + Scope 2 + Scope 3
 *   - Formula mengacu GHG Protocol Uncertainty Calculation Tool (Quantis/WBCSD):
 *       GHG_i = Activity_i × EF_i
 *       Total = Σ(Scope1) + Σ(Scope2) + Σ(Scope3)
 *   - Hanya aktif setelah user klik "Hitung Emisi" minimal sekali
 *   - Breakdown per scope + per sumber
 *   - Uncertainty indicator (dari pedigree matrix Excel)
 */
import { useState, useMemo } from "react";
import { EF, EF_LABELS, EF_CATEGORIES, CREDIT_PRICE, TR, apiFetch } from "../shared.jsx";

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

const SCOPE_INFO = {
  1: { label: "Scope 1 — Direct Emissions",  sub: "Pembakaran stasioner & transportasi operasional", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  2: { label: "Scope 2 — Purchased Energy",  sub: "Listrik PLN (kWh) & energi yang dibeli",          color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  3: { label: "Scope 3 — Value Chain",        sub: "Pengiriman, logistik, perjalanan, limbah",        color: "#ca8a04", bg: "#fefce8", border: "#fde68a" },
};

// ─── SCOPE SUMMARY CARD (dipakai di tab Total) ───────────────────────────────
function ScopeSummaryCard({ scope, value, breakdown, onClick }) {
  const si = SCOPE_INFO[scope];
  const count = breakdown.filter(bdItem => bdItem.scope === scope).length;
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 border-2 transition-all hover:shadow-md active:scale-95"
      style={{ borderColor: si.border, background: si.bg }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: si.color }}>
            Scope {scope}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{si.sub}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-xl" style={{ color: si.color }}>
            {value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
          </p>
          <p className="text-xs text-gray-400">kg CO₂e</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{count} sumber emisi</span>
        <span className="text-xs font-semibold" style={{ color: si.color }}>
          Lihat rincian →
        </span>
      </div>
    </button>
  );
}

// ─── BREAKDOWN TABLE (dipakai di tab Total untuk detail per source) ──────────
function BreakdownTable({ items, scopeColor }) {
  if (!items.length) return (
    <p className="text-xs text-gray-400 text-center py-3">Tidak ada emisi tercatat</p>
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
                {breakdownItem.emission.toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg
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
export function CalcPage({ t = TR.en, companyId }) {
  const [inputs, setInputs]     = useState(Object.fromEntries(Object.keys(EF).map(efKey => [efKey, ""])));
  const [result, setResult]     = useState(null);
  const [activeScope, setScope] = useState(1);   // 1 | 2 | 3 | "total"
  const [expanded, setExpanded] = useState({});
  const [method, setMethod]     = useState("operational");
  const [equityPct, setEquityPct] = useState("");
  const [certFile, setCertFile] = useState(null);
  const [certError, setCertError] = useState("");
  const [certOk, setCertOk]     = useState(false);
  const [freightTons, setFreightTons] = useState({ freightRoad: "", freightShip: "" });

  // ── Renewable Offset ──────────────────────────────────────────────────────
  const [solarPanels,   setSolarPanels]   = useState("");
  const [solarWp,       setSolarWp]       = useState("");
  const [solarSunHours, setSolarSunHours] = useState("3.5");
  const [biogasInputs,  setBiogasInputs]  = useState({ organik:"", sapi:"", babi:"", ayam:"", pome:"" });
  const [solarProofs,   setSolarProofs]   = useState([]);
  const [biogasProofs,  setBiogasProofs]  = useState([]);

  // ── Derived solar ─────────────────────────────────────────────────────────
  const solarKwhDay   = +(((parseFloat(solarPanels)||0) * (parseFloat(solarWp)||0) * (parseFloat(solarSunHours)||3.5) * 0.75) / 1000).toFixed(3);
  const solarKwhMonth = +(solarKwhDay * 30).toFixed(2);
  const solarOffsetKg = +(solarKwhMonth * 0.87).toFixed(2);

  // ── Derived biogas ────────────────────────────────────────────────────────
  const BIOGAS_CONV = { organik:0.01, sapi:0.04, babi:0.06, ayam:0.07, pome:28.0 };
  const biogasM3Ch4    = Object.entries(biogasInputs).reduce((s,[k,v]) => s + (parseFloat(v)||0) * (BIOGAS_CONV[k]||0), 0) * 0.60;
  const biogasTonCh4   = +(biogasM3Ch4 * 0.00067).toFixed(6);
  const biogasTCo2eDay = +(biogasTonCh4 * 28).toFixed(4);
  const biogasTCo2eYr  = +(biogasTCo2eDay * 365).toFixed(3);
  const biogasOffsetKg = +(biogasTCo2eYr / 12 * 1000).toFixed(2);

  // Tab "Total" — tampilkan rincian scope mana yang dipilih (collapse/expand)
  const [totalDetailScope, setTotalDetailScope] = useState(null);

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
    const eqFactor = method === "equity" ? (parseFloat(equityPct) || 100) / 100 : 1;
    let s1 = 0, s2 = 0, s3 = 0;
    const breakdown = [];
    const apiInputs = {};

    Object.entries(EF).forEach(([efKey, ef]) => {
      const raw = parseFloat(inputs[efKey]) || 0;
      if (raw <= 0) return;

      const isTkm = (efKey === "freightRoad" || efKey === "freightShip");
      const tons  = isTkm ? (parseFloat(freightTons[efKey]) || 0) : 1;
      if (isTkm && tons <= 0) return;

      // GHG_i = Activity × EF × equityFactor
      const effectiveVal = isTkm ? raw * tons : raw;
      const em = +(effectiveVal * ef.ef * eqFactor).toFixed(3);

      apiInputs[efKey] = raw;
      if (isTkm) apiInputs[`${efKey}Tons`] = tons;

      if (ef.scope === 1) s1 += em;
      else if (ef.scope === 2) s2 += em;
      else s3 += em;

      breakdown.push({
        key: efKey, val: raw, ef: ef.ef,
        unit: isTkm ? `km × ${tons} ton = ${+(raw * tons).toFixed(1)} tkm` : ef.unit,
        emission: em, scope: ef.scope, category: ef.category,
        source: ef.source || EF_LABELS[efKey],
      });
    });

    const total   = +(s1 + s2 + s3).toFixed(2);
    const totalOffset = +(solarOffsetKg + biogasOffsetKg).toFixed(2);
    const netEmission = +Math.max(0, total - totalOffset).toFixed(2);
    const leakage = +(s1 * 0.05 + s3 * 0.10).toFixed(2);

    const nextResult = {
      total, s1: +s1.toFixed(2), s2: +s2.toFixed(2), s3: +s3.toFixed(2),
      totalOffset, netEmission, solarOffset: solarOffsetKg, biogasOffset: biogasOffsetKg,
      leakage, breakdown,
      creditsNeeded: Math.ceil(total / 1000),
    };
    setResult(nextResult);

    if (companyId) {
      const saved = await apiFetch("/emissions/calculate-v2", {
        method: "POST",
        body: JSON.stringify({
          companyId,
          method,
          equityPct: method === "equity" ? parseFloat(equityPct) || 100 : 100,
          inputs: apiInputs,
        }),
      });
      if (saved?.success) {
        setResult(prev => ({
          ...prev,
          total: saved.total ?? prev.total,
          s1: saved.scope1 ?? prev.s1,
          s2: saved.scope2 ?? prev.s2,
          s3: saved.scope3 ?? prev.s3,
          leakage: saved.leakage ?? prev.leakage,
          creditsNeeded: saved.creditsNeeded ?? prev.creditsNeeded,
        }));
      }
    }

    setScope("total");
    setTotalDetailScope(null);
  }

  const scopeGroups = useMemo(
    () => (activeScope !== "total" && activeScope !== "offset") ? groupByCategory(SCOPE_KEYS[activeScope]) : {},    [activeScope]
  );

  const si = activeScope !== "total" ? SCOPE_INFO[activeScope] : null;

  // ─── SCOPE INPUT PANEL ─────────────────────────────────────────────────────
  function renderOffsetPanel() {
    return (
      <div className="flex flex-col gap-4">
        {result && (
          <div className="card p-4 bg-teal-50 border-teal-200">
            <p className="text-xs font-bold text-teal-700 mb-2">Net Carbon: Total Emisi - Total Offset</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l:"Total Emisi",  v:result.total.toLocaleString()+" kg", c:"#dc2626" },
                { l:"Total Offset", v:(result.totalOffset||0).toLocaleString()+" kg", c:"#0d9488" },
                { l:"Net Emisi",    v:(result.netEmission||result.total).toLocaleString()+" kg", c:"#166534" },
              ].map((item,i) => (
                <div key={i} className="bg-white rounded-xl p-2.5 text-center">
                  <p className="font-black text-xs" style={{ color:item.c }}>{item.v}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.l}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-teal-600 mt-2">Hitung emisi di Scope 1-3 dulu, lalu input offset.</p>
          </div>
        )}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <div>
              <p className="text-xs font-bold text-yellow-800">Solar Panel — Offset Scope 2</p>
              <p className="text-xs text-yellow-600">Listrik sendiri mengurangi pembelian PLN</p>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Panel (buah)</label>
                <input type="number" min="0" placeholder="e.g. 20"
                  value={solarPanels} onChange={e => setSolarPanels(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Kapasitas/Panel (Wp)</label>
                <input type="number" min="0" placeholder="e.g. 400"
                  value={solarWp} onChange={e => setSolarWp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Jam Matahari Efektif (jam/hari)</label>
                <input type="number" min="0" step="0.1" placeholder="e.g. 3.5"
                  value={solarSunHours} onChange={e => setSolarSunHours(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                <p className="text-xs text-gray-400 mt-1">Jam sinar efektif per hari di lokasi Anda</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Faktor Efisiensi Sistem</label>
                <div className="bg-gray-100 rounded-xl px-3 py-2 border border-gray-200">
                  <p className="font-bold text-sm text-gray-600">0.75 (tetap)</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Persentase daya setelah rugi-rugi kabel, inverter, panas. Standar industri 75%.</p>
              </div>
            </div>
            {solarPanels && solarWp && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2.5">
                <div className="grid grid-cols-3 gap-1 mb-1">
                  {[
                    { l:"Energi/hari",  v:solarKwhDay+" kWh" },
                    { l:"Energi/bulan", v:solarKwhMonth+" kWh" },
                    { l:"Offset",       v:solarOffsetKg+" kg/bln" },
                  ].map((row,i) => (
                    <div key={i} className="bg-white rounded-lg p-2 text-center">
                      <p className="font-black text-xs text-yellow-700">{row.v}</p>
                      <p className="text-xs text-gray-400">{row.l}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-green-700">Offset: {solarOffsetKg} kg CO2e/bulan dari Scope 2</p>
              </div>
            )}
            <label className="flex items-center gap-3 border-2 border-dashed border-yellow-300 rounded-xl p-3 cursor-pointer hover:bg-yellow-50">
              <span className="text-2xl">📷</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">
                  {solarProofs.length > 0 ? solarProofs.length+" file" : "Upload bukti (foto panel / inverter)"}
                </p>
                <p className="text-xs text-gray-400">JPG / PNG / PDF</p>
              </div>
              <input type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => setSolarProofs(Array.from(e.target.files).slice(0,3))} />
            </label>
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
            <span className="text-xl">♻️</span>
            <div>
              <p className="text-xs font-bold text-green-800">Biogas — Offset Scope 1</p>
              <p className="text-xs text-green-600">Limbah organik menggantikan bahan bakar fosil</p>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { key:"organik", label:"Sampah Organik",      conv:0.01  },
              { key:"sapi",    label:"Kotoran Sapi",        conv:0.04  },
              { key:"babi",    label:"Kotoran Babi",        conv:0.06  },
              { key:"ayam",    label:"Kotoran Ayam",        conv:0.07  },
              { key:"pome",    label:"POME (Limbah Sawit)", conv:28.00 },
            ].map(row => {
              const mass = parseFloat(biogasInputs[row.key]) || 0;
              const vol  = +(mass * row.conv).toFixed(4);
              return (
                <div key={row.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">{row.label}</label>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">x {row.conv} m3/kg</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" min="0" placeholder="0"
                      value={biogasInputs[row.key]}
                      onChange={e => setBiogasInputs(prev => ({ ...prev, [row.key]: e.target.value }))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                    <span className="bg-gray-100 rounded-xl px-3 flex items-center text-xs text-gray-500">kg</span>
                  </div>
                  {mass > 0 && (
                    <p className="text-xs text-green-600 mt-1">{mass} x {row.conv} = <strong>{vol} m3 CH4</strong></p>
                  )}
                </div>
              );
            })}
            {Object.values(biogasInputs).some(v => parseFloat(v) > 0) && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-xs text-green-700">
                <div className="flex justify-between"><span>Total CH4 (x60%)</span><strong>{biogasM3Ch4.toFixed(4)} m3</strong></div>
                <div className="flex justify-between"><span>Massa CH4</span><strong>{biogasTonCh4} ton</strong></div>
                <div className="flex justify-between"><span>Serapan harian (xGWP28)</span><strong>{biogasTCo2eDay} tCO2e/hari</strong></div>
                <div className="flex justify-between font-bold mt-1 pt-1 border-t border-green-200">
                  <span>Serapan tahunan</span><span>{biogasTCo2eYr} tCO2e/thn</span>
                </div>
                <p className="font-bold text-green-800 mt-1">Offset: {biogasOffsetKg} kg CO2e/bulan dari Scope 1</p>
              </div>
            )}
            <label className="flex items-center gap-3 border-2 border-dashed border-green-300 rounded-xl p-3 cursor-pointer hover:bg-green-50">
              <span className="text-2xl">📷</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">
                  {biogasProofs.length > 0 ? biogasProofs.length+" file" : "Upload bukti (foto reaktor / meter gas)"}
                </p>
                <p className="text-xs text-gray-400">JPG / PNG / PDF</p>
              </div>
              <input type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => setBiogasProofs(Array.from(e.target.files))} />
            </label>
          </div>
        </div>
      </div>
    );
  }

  function renderScopeInput() {
    if (activeScope === "offset") return renderOffsetPanel();
    return (
      <>
        {/* Scope description */}
        <div className="rounded-xl px-4 py-3 border" style={{ borderColor: si.border, background: si.bg }}>
          <p className="text-xs font-bold" style={{ color: si.color }}>{si.label}</p>
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
                <p className="text-xs font-bold text-gray-800">{EF_CATEGORIES[cat] || cat}</p>
                <p className="text-xs text-gray-400">{keys.length} sumber emisi</p>
              </div>
              <span className="text-gray-400 text-sm">{expanded[cat] === false ? "▸" : "▾"}</span>
            </button>

            {expanded[cat] !== false && (
              <div className="p-3 flex flex-col gap-3">
                {keys.map(efKey => {
                  const ef     = EF[efKey];
                  const raw    = parseFloat(inputs[efKey]) || 0;
                  const emPrev = raw > 0 ? +(raw * ef.ef).toFixed(2) : null;

                  return (
                    <div key={efKey}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gray-700">{EF_LABELS[efKey]}</label>
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
                      {!ef.unit.includes("liter") && ef.unit !== "kWh" && emPrev && (
                        <p className="text-xs text-slate-500 mt-1">
                          → <strong>{emPrev} kg CO₂e</strong>
                        </p>
                      )}

                      {/* Freight ton input */}
                      {(efKey === "freightRoad" || efKey === "freightShip") && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-gray-700">Berat Muatan</label>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">ton</span>
                          </div>
                          <input
                            type="number" min="0" placeholder="e.g. 5"
                            value={freightTons[efKey]}
                            onChange={e => setFreightTons(freightState => ({ ...freightState, [efKey]: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                          />
                          {inputs[efKey] && freightTons[efKey] && (
                            <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 rounded-lg px-2 py-1">
                              {inputs[efKey]} km × {freightTons[efKey]} ton = <strong>{+(parseFloat(inputs[efKey]) * parseFloat(freightTons[efKey])).toFixed(1)} tkm</strong>
                              {" × EF "}{ef.ef} = <strong>{+(parseFloat(inputs[efKey]) * parseFloat(freightTons[efKey]) * ef.ef).toFixed(2)} kg CO₂e</strong>
                            </p>
                          )}
                        </div>
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
          <p className="font-bold text-gray-700 text-center">Total Emisi belum dihitung</p>
          <p className="text-xs text-gray-400 text-center px-4">
            Isi data di tab Scope 1, 2, dan 3 lalu klik <strong>Hitung Emisi</strong> untuk melihat total.
          </p>
          <button
            onClick={() => setScope(1)}
            className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl"
          >
            Mulai dari Scope 1 →
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
          <p className="text-xs font-bold text-slate-600 mb-0.5">📐 Formula GHG Protocol (Quantis/WBCSD)</p>
          <p className="text-xs text-slate-500 font-mono">
            GHG_i = Aktivitas_i × EF_i
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Total = Σ Scope 1 + Σ Scope 2 + Σ Scope 3
          </p>
        </div>

        {/* ── Donut + total angka ── */}
        <div className="card p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Distribusi Emisi</p>
          <ScopeDonut s1={s1} s2={s2} s3={s3} />
        </div>

        {/* ── Total besar ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1e293b,#374151)" }}>
          <div className="p-5 text-white">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
              {t.calc?.totalEm || "Total Emisi"}
            </p>
            <p className="font-black" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
              {total.toLocaleString("id-ID")}
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
          Rincian per Scope — ketuk untuk detail
        </p>
        {[1, 2, 3].map(segItem => (
          <ScopeSummaryCard
            key={segItem}
            scope={segItem}
            value={segItem === 1 ? s1 : segItem === 2 ? s2 : s3}
            breakdown={breakdown}
            onClick={() => setTotalDetailScope(totalDetailScope === segItem ? null : segItem)}
          />
        ))}

        {/* ── Inline breakdown accordion ── */}
        {totalDetailScope && (
          <div className="card overflow-hidden">
            <div
              className="px-4 py-3 border-breakdownItem border-gray-100 flex items-center justify-between"
              style={{ background: SCOPE_INFO[totalDetailScope].bg }}
            >
              <p className="text-xs font-bold" style={{ color: SCOPE_INFO[totalDetailScope].color }}>
                Scope {totalDetailScope} — Rincian Sumber
              </p>
              <button
                onClick={() => setTotalDetailScope(null)}
                className="text-gray-400 text-sm hover:text-gray-600"
              >✕</button>
            </div>
            <BreakdownTable
              items={breakdown.filter(bdItem => bdItem.scope === totalDetailScope)}
              scopeColor={SCOPE_INFO[totalDetailScope].color}
            />
            {/* Subtotal */}
            <div
              className="px-4 py-3 border-t flex items-center justify-between"
              style={{ background: SCOPE_INFO[totalDetailScope].bg }}
            >
              <p className="text-xs font-bold text-gray-600">Subtotal Scope {totalDetailScope}</p>
              <p className="font-black text-sm" style={{ color: SCOPE_INFO[totalDetailScope].color }}>
                {(totalDetailScope === 1 ? s1 : totalDetailScope === 2 ? s2 : s3).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg CO₂e
              </p>
            </div>
          </div>
        )}

        {/* ── Uncertainty note ── */}
        <div className="rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-200">
          <p className="text-xs font-bold text-amber-700 mb-1">📊 Ketidakpastian Kalkulasi</p>
          <p className="text-xs text-amber-600">
            Berdasarkan Pedigree Matrix (GHG Protocol): uncertainty per kategori berbeda.
            Nilai ±% ditampilkan di rincian breakdown tiap sumber.
          </p>
        </div>

        {/* ── Leakage ── */}
        <div className="card p-3 bg-orange-50 border-orange-200 border">
          <p className="text-xs font-bold text-orange-700">
            Estimasi Leakage: ~{leakage.toLocaleString("id-ID")} kg CO₂e
          </p>
          <p className="text-xs text-orange-600 mt-0.5">Scope 1 × 5% + Scope 3 × 10% (displacement effect)</p>
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
          onClick={() => { setScope(1); setResult(null); setTotalDetailScope(null); }}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 active:scale-95 transition-all"
        >
          ← Hitung Ulang
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
        <p className="font-black text-xl">Scope 1 · 2 · 3 · Total</p>
        <p className="text-slate-400 text-xs mt-0.5">IPCC 2006 · ESDM Indonesia · GHG Protocol</p>
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
            style={activeScope === segItem ? { background: SCOPE_INFO[segItem].color } : {}}
          >
            Scope {segItem}
          </button>
        ))}
        <button
          onClick={() => setScope("offset")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeScope === "offset"
              ? "text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
          style={activeScope === "offset" ? { background: "#0d9488" } : {}}
        >
          Offset
        </button>
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
              { val: "operational", label: "Operational / Activity" },
              { val: "equity",      label: "Equity Share" },
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
                  Upload Your Ownership Certificate
                </label>
                <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-colors ${
                  certOk ? "border-green-400 bg-green-50" : certError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
                }`}>
                  <span className="text-2xl">{certOk ? "📄" : "⬆️"}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-700">
                      {certFile ? certFile.name : "Upload Your Ownership Certificate"}
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
          disabled={method === "equity" && !certOk}
          className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}
        >
          {t.calc?.calculate || "Hitung Emisi"} →
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
              <p className="text-xs text-gray-500">Hasil terakhir</p>
              <p className="font-black text-slate-800">
                {result.total.toLocaleString("id-ID")} kg CO₂e
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-right">
                <p className="text-xs text-red-500">S1: {result.s1.toLocaleString()}</p>
                <p className="text-xs text-orange-500">S2: {result.s2.toLocaleString()}</p>
                <p className="text-xs text-yellow-600">S3: {result.s3.toLocaleString()}</p>
              </div>
              <span className="text-slate-400 text-lg">→</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Ketuk untuk lihat Total Emisi lengkap</p>
        </button>
      )}
    </div>
  );
}