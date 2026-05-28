/**
 * CarbonTrust — App.jsx
 * FIXED:
 *   - Hapus /alerts?companyId= (tidak ada di BE)
 *   - Hapus /transactions?companyId= (tidak ada di BE)
 *   - Alert sepenuhnya di-derive dari status parcel (sudah ada useEffect-nya)
 *   - companyId dari userData session, bukan hardcode
 */
import { useState, useEffect } from "react";
import {
  COMPANY_ID, apiFetch, GCSS,
  MOCK_PARCELS, MOCK_ALERTS, MOCK_COMPANY, MOCK_PROJECTS,
  TR, Header, BottomNav,
} from "./shared.jsx";

import {Dashboard}        from "./Dashboard.jsx";
import {LandPage}         from "./LandPage.jsx";
import {CalcPage}         from "./CalcPage.jsx";
import {MarketPage}       from "./MarketPage.jsx";
import {TxPage}           from "./TxPage.jsx";
import {VerifyPage}       from "./VerifyPage.jsx";
import {ProfilePage}      from "./ProfilePage.jsx";
import {CertificatePage}  from "./CertificatePage.jsx";

export default function App({ onLogout, onExit, initialLang = "en", userData }) {
  const [page,     setPage]     = useState("home");
  const [lang,     setLang]     = useState(initialLang);
  const [parcels,  setParcels]  = useState(MOCK_PARCELS);
  const [alerts,   setAlerts]   = useState(MOCK_ALERTS);
  const [company,  setCompany]  = useState(userData || MOCK_COMPANY);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [activeTx, setActiveTx] = useState(null);

  const t = TR[lang] ?? TR["en"];

  // qStatus dideklarasikan SEBELUM renderPage
  const [qStatus, setQStatus] = useState(() => {
    try {
      const saved = localStorage.getItem("carbon_q_status");
      return saved ? JSON.parse(saved) : { isComplete: false, lastUpdated: null, resetCount: 0, answers: {} };
    } catch { return { isComplete: false, lastUpdated: null, resetCount: 0, answers: {} }; }
  });

  const updateQStatus = (newData) => {
    const updated = { ...qStatus, ...newData };
    setQStatus(updated);
    localStorage.setItem("carbon_q_status", JSON.stringify(updated));
  };

  // companyId dari session user, fallback ke COMPANY_ID
  const companyId = userData?.id || userData?._id || userData?.companyId || COMPANY_ID;

  // Load data dari BE
  // FIX: hapus /alerts dan /transactions — endpoint tidak ada di BE
  useEffect(() => {
    apiFetch(`/parcels?companyId=${companyId}`).then(fetchedData => {
      if (Array.isArray(fetchedData) && fetchedData.length) setParcels(fetchedData);
    });
    apiFetch(`/company/${companyId}`).then(fetchedData => {
      if (fetchedData?.id || fetchedData?._id) setCompany(fetchedData);
    });
  }, [companyId]);

  // Derive alerts dari status parcel (tidak perlu endpoint BE terpisah)
  useEffect(() => {
    const dynamic = [
      ...parcels.filter(pc => pc.status === "flooded").map(pc => ({
        id: `fl-${pc.id}`, parcelId: pc.id, type: "critical",
        message: `MNDWI > 0.42 — Flood confirmed · ${pc.name}`, time: new Date().toISOString(),
      })),
      ...parcels.filter(pc => pc.status === "degraded" && pc.type === "peatland").map(pc => ({
        id: `pd-${pc.id}`, parcelId: pc.id, type: "warning",
        message: `${pc.name}: Peat degrading, NDVI=${pc.ndvi}, becoming emitter`, time: new Date().toISOString(),
      })),
      ...parcels.filter(pc => pc.status === "burned").map(pc => ({
        id: `br-${pc.id}`, parcelId: pc.id, type: "critical",
        message: `FIRE detected at ${pc.name} — Credits suspended`, time: new Date().toISOString(),
      })),
      ...parcels.filter(pc => pc.status === "drying").map(pc => ({
        id: `dr-${pc.id}`, parcelId: pc.id, type: "warning",
        message: `${pc.name}: Peatland drying detected, humidity check required`, time: new Date().toISOString(),
      })),
      ...parcels.filter(pc => pc.status === "healthy").map(pc => ({
        id: `ok-${pc.id}`, parcelId: pc.id, type: "info",
        message: `${pc.name}: All sensors normal, NDVI stable ${pc.ndvi}`, time: new Date().toISOString(),
      })),
    ];
    setAlerts(dynamic.length ? dynamic : MOCK_ALERTS);
  }, [parcels]);

  // Dismiss alert: hanya update local state (tidak ada DELETE /alerts di BE)
  function handleDismiss(alertId) {
    setAlerts(prev => prev.filter(alertItem => alertItem.id !== alertId));
  }

  const renderPage = () => {
    switch (page) {
      case "home":        return <Dashboard    parcels={parcels} alerts={alerts} company={company} setPage={setPage} t={t} activeTx={activeTx} qStatus={qStatus} />;
      case "land":        return <LandPage     parcels={parcels} setParcels={setParcels} t={t} lang={lang} setPage={setPage} companyId={companyId} />;
      case "calc":        return <CalcPage     t={t} setPage={setPage} companyId={companyId} />;
      case "tx":          return <TxPage       tx={activeTx} setTx={setActiveTx} t={t} lang={lang} setPage={setPage} />;
      case "market":      return <MarketPage   t={t} company={company} parcels={parcels} projects={projects} setProjects={setProjects} />;
      case "certificate": return <CertificatePage t={t} parcels={parcels} company={company} companyId={companyId} />;
      case "verify":      return <VerifyPage   t={t} parcels={parcels} lang={lang} setPage={setPage} companyId={companyId} />;
      case "profile":     return <ProfilePage  company={company} setCompany={setCompany} t={t} lang={lang} onLogout={() => onLogout?.(lang)} onExit={onExit ?? (() => {})} setPage={setPage} qStatus={qStatus} updateQStatus={updateQStatus} companyId={companyId} />;
      default:            return <Dashboard    parcels={parcels} alerts={alerts} company={company} setPage={setPage} t={t} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f1" }}>
      <style>{GCSS}</style>
      <div className="max-w-md mx-auto relative min-h-screen flex flex-col bg-gray-50 shadow-2xl">
        <Header alerts={alerts} onDismiss={handleDismiss} lang={lang} setLang={setLang} t={t} />
        <main className="flex-1 overflow-y-auto pb-20">{renderPage()}</main>
        <BottomNav page={page} setPage={setPage} t={t} />
      </div>
    </div>
  );
}
