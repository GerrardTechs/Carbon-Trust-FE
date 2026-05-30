import { useState, useRef, useEffect } from "react";
import { API } from "../../carbontrust/shared.jsx";
import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";


export function OperationalPage({ onSubmit, onBack, lang }) {
  const [form, setForm] = useState({
    emissionObject: "", companyType: "", officeAddress: "", siteAddress: "",
  });
  const [loading, setLoading] = useState(false);

  const t = LANGS[lang].operational;

  function setField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const needsSite = form.emissionObject === t.emissionObjects[1] || form.emissionObject === t.emissionObjects[2];
  const needsOffice = form.emissionObject === t.emissionObjects[0] || form.emissionObject === t.emissionObjects[2];

  async function handleNext() {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    onSubmit(form);
  }

  const isValid = form.emissionObject && form.companyType &&
    (!needsOffice || form.officeAddress) &&
    (!needsSite   || form.siteAddress);

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="operational" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{t.title}</h2>
        <p className="auth-sub">{t.sub}</p>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

          {/* Emission Object */}
          <div className="field-group">
            <label className="label">{t.emissionObjectLabel}</label>
            <select
              className={`select-field ${!form.emissionObject ? "placeholder" : ""}`}
              value={form.emissionObject}
              onChange={e => setField("emissionObject", e.target.value)}
            >
              <option value="">{t.emissionObjectPlaceholder}</option>
              {t.emissionObjects.map((emObj, i) => <option key={i} value={emObj}>{emObj}</option>)}
            </select>
          </div>

          {/* Company Type */}
          <div className="field-group">
            <label className="label">{t.companyTypeLabel}</label>
            <select
              className={`select-field ${!form.companyType ? "placeholder" : ""}`}
              value={form.companyType}
              onChange={e => setField("companyType", e.target.value)}
            >
              <option value="">{t.companyTypePlaceholder}</option>
              {t.companyTypes.map((cType, i) => <option key={i} value={cType}>{cType}</option>)}
            </select>
          </div>

          {/* Office Address — shown when Office or both */}
          {(!form.emissionObject || needsOffice) && (
            <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
              <label className="label">{t.officeAddressLabel}</label>
              <select
                className={`select-field ${!form.officeAddress ? "placeholder" : ""}`}
                value={form.officeAddress}
                onChange={e => setField("officeAddress", e.target.value)}
                disabled={!needsOffice}
                style={{ opacity: !form.emissionObject ? .5 : 1 }}
              >
                <option value="">{t.officeAddressPlaceholder}</option>
                {t.addressOptions.map((addrOpt, i) => <option key={i} value={addrOpt}>{addrOpt}</option>)}
              </select>
            </div>
          )}

          {/* Site Address — shown when Site or both */}
          {(!form.emissionObject || needsSite) && (
            <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
              <label className="label">{t.siteAddressLabel}</label>
              <select
                className={`select-field ${!form.siteAddress ? "placeholder" : ""}`}
                value={form.siteAddress}
                onChange={e => setField("siteAddress", e.target.value)}
                disabled={!needsSite}
                style={{ opacity: !form.emissionObject ? .5 : 1 }}
              >
                <option value="">{t.siteAddressPlaceholder}</option>
                {t.addressOptions.map((addrOpt, i) => <option key={i} value={addrOpt}>{addrOpt}</option>)}
              </select>
            </div>
          )}

        </div>

        <button className="btn-primary" onClick={handleNext} disabled={!isValid || loading}>
          {loading ? <span className="spinner" /> : t.nextBtn}
        </button>
      </div>
    </div>
  );
}