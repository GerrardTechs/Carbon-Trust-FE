import { G } from "../constants/tokens.js";
import { LANGS } from "../i18n/langs.js";
import { Icons } from "../utils/icons.jsx";
import { ProgressDots } from "../components/ProgressDots.jsx";
import { LangSwitcher } from "../components/LangSwitcher.jsx";

export function WelcomePage({ onContinue, lang, setLang }) {
  const t = LANGS[lang].welcome;
  return (
    <div className="shell">
      <div style={{ padding: "20px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="welcome" />
      </div>

      <div className="welcome-top">
        <div className="globe-ring">
          {Icons.logo()}
        </div>
        <h1 className="welcome-headline">{t.headline}</h1>
        <p className="welcome-sub">{t.sub}</p>
        <div className="pill-row">
          <span className="pill pill-green">MRV Certified</span>
          <span className="pill pill-teal">ISO 14064</span>
          <span className="pill pill-green">AI Certificate Validated</span>
        </div>
      </div>

      {/* decorative wave */}
      <div style={{ position: "relative", height: 72, overflow: "hidden", flexShrink: 0 }}>
        <svg viewBox="0 0 430 72" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}>
          <path d="M0,48 C80,72 180,8 280,48 C360,80 400,24 430,36 L430,72 L0,72 Z" fill={G.green50} />
          <path d="M0,56 C100,36 200,72 300,52 C370,40 410,60 430,56 L430,72 L0,72 Z" fill={G.green100} opacity=".6"/>
        </svg>
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: 40, background: G.green100 }} />
      </div>

      <div className="welcome-bottom" style={{ background: G.green50, paddingTop: 28 }}>
        <button className="btn-primary" onClick={onContinue}
          style={{ background: `linear-gradient(135deg, ${G.green800}, ${G.teal700})` }}>
          {t.continue}
        </button>
        <LangSwitcher lang={lang} setLang={setLang} />
        <p className="terms-note">
          {t.terms}{" "}
          <a href="/terms">{t.termsLink}</a> {t.and} <a href="/privacy">{t.privacyLink}</a>
        </p>
      </div>
    </div>
  );
}