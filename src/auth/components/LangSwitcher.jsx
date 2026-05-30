import { LANGS } from "../i18n/langs.js";

export function LangSwitcher({ lang, setLang }) {
  return (
    <div className="lang-switcher" style={{ marginTop: 2 }}>
      {Object.keys(LANGS).map(langCode => (
        <button
          key={langCode}
          className={`lang-btn ${lang === langCode ? "active" : ""}`}
          onClick={() => setLang(langCode)}
        >
          {LANGS[langCode].flag} {LANGS[langCode].label}
        </button>
      ))}
    </div>
  );
}