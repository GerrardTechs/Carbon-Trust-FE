import { useState, useRef, useEffect } from "react";
import { API } from "../../carbontrust/shared.jsx";
import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";


export function CalcMethodPage({ onSubmit, onBack, lang }) {
  const [form, setForm] = useState({
    calcMethod: "", equityShare: "", ghgInventory: null, carbonRemoval: null,
  });
  const [loading, setLoading] = useState(false);
  const ghgRef = useRef();
  const crRef  = useRef();

  const t = LANGS[lang].calcMethod;

  function setField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleFinish() {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    onSubmit(form);
  }

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="calcmethod" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{t.title}</h2>
        <p className="auth-sub">{t.sub}</p>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

          {/* Calculation Method */}
          <div className="field-group">
            <label className="label">{t.calcMethodLabel}</label>
            <select
              className={`select-field ${!form.calcMethod ? "placeholder" : ""}`}
              value={form.calcMethod}
              onChange={e => setField("calcMethod", e.target.value)}
            >
              <option value="">{t.calcMethodPlaceholder}</option>
              {t.calcMethods.map((calcMethod, i) => <option key={i} value={calcMethod}>{calcMethod}</option>)}
            </select>
          </div>

          {/* Equity Share (shown for GHG Protocol) */}
          {form.calcMethod === t.calcMethods[0] && (
            <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
              <label className="label">{t.equityShareLabel}</label>
              <input
                className="input-field"
                type="number"
                min="0"
                max="100"
                placeholder={t.equitySharePlaceholder}
                value={form.equityShare}
                onChange={e => setField("equityShare", e.target.value)}
              />
            </div>
          )}

          {/* GHG Inventory upload */}
          <div className="field-group">
            <label className="label">{t.ghgInventoryLabel}</label>
            <input
              type="file"
              accept=".xlsx,.csv,.xls,.pdf"
              ref={ghgRef}
              style={{ display: "none" }}
              onChange={e => setField("ghgInventory", e.target.files[0]?.name || null)}
            />
            <div
              className={`upload-field ${form.ghgInventory ? "has-file" : ""}`}
              onClick={() => ghgRef.current?.click()}
            >
              {form.ghgInventory
                ? `📄 ${form.ghgInventory}`
                : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{Icons.upload} {t.ghgInventoryPlaceholder}</span>
              }
            </div>
          </div>

          {/* Carbon Removal upload */}
          <div className="field-group">
            <label className="label">{t.carbonRemovalLabel}</label>
            <input
              type="file"
              accept=".xlsx,.csv,.xls,.pdf"
              ref={crRef}
              style={{ display: "none" }}
              onChange={e => setField("carbonRemoval", e.target.files[0]?.name || null)}
            />
            <div
              className={`upload-field ${form.carbonRemoval ? "has-file" : ""}`}
              onClick={() => crRef.current?.click()}
            >
              {form.carbonRemoval
                ? `📄 ${form.carbonRemoval}`
                : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{Icons.upload} {t.carbonRemovalPlaceholder}</span>
              }
            </div>
          </div>

        </div>

        <button className="btn-primary" onClick={handleFinish} disabled={loading}>
          {loading ? <span className="spinner" /> : t.finishBtn}
        </button>
      </div>
    </div>
  );
}