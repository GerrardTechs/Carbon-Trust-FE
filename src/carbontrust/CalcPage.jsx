/**
 * CarbonTrust — CalcPage.jsx
 * Emission calculator: Scope 1/2/3 inputs, IPCC emission factors
 */
import { useState } from "react";
import { EF, EF_LABELS, CREDIT_PRICE } from "./shared.jsx";

export function CalcPage({ t }) {
  const [inputs, setInputs] = useState(Object.fromEntries(Object.keys(EF).map(k => [k, ""])));
  const [result, setResult] = useState(null);
  const [activeScope, setActiveScope] = useState(1);

  function calculate() {
    let s1 = 0, s2 = 0, s3 = 0;
    const breakdown = [];
    Object.entries(EF).forEach(([k, ef]) => {
      const v = parseFloat(inputs[k]) || 0;
      if (v > 0) {
        const em = +(v * ef.ef).toFixed(2);
        if (ef.scope === 1) s1 += em;
        else if (ef.scope === 2) s2 += em;
        else s3 += em;
        breakdown.push({ key: k, val: v, ef: ef.ef, unit: ef.unit, emission: em, scope: ef.scope });
      }
    });
    const total = +(s1 + s2 + s3).toFixed(2);
    const leakage = +(s1 * 0.05 + s3 * 0.1).toFixed(2);
    setResult({ total, s1: +s1.toFixed(2), s2: +s2.toFixed(2), s3: +s3.toFixed(2), leakage, breakdown, creditsNeeded: Math.ceil(total / 1000) });
  }

  const scopeKeys = Object.entries(EF).filter(([, ef]) => ef.scope === activeScope).map(([k]) => k);
  const scopeLabel = { 1: t.calc.scope1, 2: t.calc.scope2, 3: t.calc.scope3 };

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4 fade-up">
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}>
        <p className="text-slate-300 text-xs uppercase tracking-widest mb-0.5">{t.calc.title}</p>
        <p className="font-black text-xl">Scope 1 · 2 · 3</p>
        <p className="text-slate-400 text-xs mt-0.5">{t.calc.ref}</p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map(s => (
          <button key={s} onClick={() => setActiveScope(s)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeScope === s ? "bg-slate-800 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600"}`}>
            Scope {s}
          </button>
        ))}
      </div>

      <div className="card p-3 bg-slate-50">
        <p className="text-xs font-bold text-slate-700">{scopeLabel[activeScope]}</p>
      </div>

      <div className="card p-4 flex flex-col gap-3">
        {scopeKeys.map(k => (
          <div key={k}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">{EF_LABELS[k]}</label>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">EF: {EF[k].ef} kg CO₂/{EF[k].unit}</span>
            </div>
            <div className="flex gap-2">
              <input type="number" min="0" placeholder="0" value={inputs[k]}
                onChange={e => setInputs(i => ({ ...i, [k]: e.target.value }))}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              <span className="bg-gray-100 rounded-xl px-3 flex items-center text-xs font-medium text-gray-500">{EF[k].unit}</span>
            </div>
          </div>
        ))}
        <button onClick={calculate}
          className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}>
          {t.calc.calculate}
        </button>
      </div>

      {result && (
        <div className="flex flex-col gap-3 fade-up">
          <div className="grid grid-cols-3 gap-2">
            {[{ l: "Scope 1", v: result.s1, c: "#ef4444" }, { l: "Scope 2", v: result.s2, c: "#f97316" }, { l: "Scope 3", v: result.s3, c: "#eab308" }].map((s, i) => (
              <div key={i} className="card p-3 text-center">
                <p className="text-xs text-gray-400">{s.l}</p>
                <p className="font-black text-sm" style={{ color: s.c }}>{s.v.toLocaleString()}</p>
                <p className="text-xs text-gray-400">kg CO₂e</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#dc2626,#b45309)" }}>
            <div className="p-4 text-white">
              <p className="text-red-200 text-xs uppercase tracking-wide">{t.calc.totalEm}</p>
              <p className="text-4xl font-black">{result.total.toLocaleString()}</p>
              <p className="text-red-200 text-sm">kg CO₂e</p>
            </div>
          </div>
          <div className="card p-3 bg-orange-50 border-orange-200 border">
            <p className="text-xs font-bold text-orange-700">{t.calc.leakage}: ~{result.leakage.toLocaleString()} kg CO₂e</p>
            <p className="text-xs text-orange-600 mt-0.5">Scope 1 ×5% + Scope 3 ×10% (displacement effect)</p>
          </div>
          <div className="card p-4 bg-green-50 border-green-200 border">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">{t.calc.offsetNeeded}</p>
            <p className="text-3xl font-black text-green-700">{result.creditsNeeded} <span className="text-base font-normal">carbon credits</span></p>
            <p className="text-xs text-green-600 mt-1">≈ ${(result.creditsNeeded * CREDIT_PRICE).toLocaleString()} USD @ ${CREDIT_PRICE}/ton</p>
          </div>
          {result.breakdown.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-3 border-b border-gray-100"><p className="font-bold text-gray-800 text-sm">{lang==="id"?"Rincian per Sumber":lang==="zh"?"按来源细分":lang==="ko"?"소스별 분류":lang==="ja"?"ソース別内訳":"Breakdown by Source"}</p></div>
              <div className="divide-y divide-gray-50">
                {result.breakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{EF_LABELS[b.key]}</p>
                      <p className="text-xs text-gray-400">Scope {b.scope} · {b.val} {b.unit} × {b.ef}</p>
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

