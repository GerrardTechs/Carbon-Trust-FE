/**
 * CarbonTrust — App.jsx
 * Root component: state management, routing, global style injection.
 *
 * Page routing:
 *   home    → Dashboard.jsx
 *   land    → LandPage.jsx
 *   calc    → CalcPage.jsx
 *   market  → MarketPage.jsx
 *   tx      → TxPage.jsx
 *   verify  → VerifyPage.jsx
 *   profile → ProfilePage.jsx
 *
 * Props:
 *   onLogout(lang)   — called when user chooses "Exit & Log Out"
 *   initialLang      — language code from AuthFlow (default: "en")
 */
import { useState, useEffect } from "react";
import {
  COMPANY_ID, apiFetch, GCSS,
  MOCK_PARCELS, MOCK_ALERTS, MOCK_COMPANY, MOCK_PROJECTS,
  TR, Header, BottomNav,
} from "./shared.jsx";

import {Dashboard}  from "./Dashboard.jsx";
import {LandPage}   from "./LandPage.jsx";
import {CalcPage}   from "./CalcPage.jsx";
import {MarketPage} from "./MarketPage.jsx";
import {TxPage}     from "./TxPage.jsx";
import {VerifyPage} from "./VerifyPage.jsx";
import {ProfilePage} from "./ProfilePage.jsx";
import { CertificatePage }    from "./CertificatePage.jsx";


export default function App({ onLogout, onExit, initialLang = "en", userData }) {
  const [page,     setPage]     = useState("home");
  const [lang,     setLang]     = useState(initialLang);
  const [parcels,  setParcels]  = useState(MOCK_PARCELS);
  const [alerts,   setAlerts]   = useState(MOCK_ALERTS);
  const [company, setCompany] = useState(userData || MOCK_COMPANY); 
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [activeTx, setActiveTx] = useState(null);

  const t = TR[lang] ?? TR["en"];

  const companyId = userData?.id || userData?._id || COMPANY_ID;
  // Load real data from backend (fallback: mock data stays)
  useEffect(() => {
    apiFetch(`/parcels?companyId=${companyId}`).then(fetchedData => {
      if (fetchedData?.length) setParcels(fetchedData);
    });
    apiFetch(`/alerts?companyId=${companyId}`).then(fetchedData => {
      if (Array.isArray(fetchedData)) setAlerts(fetchedData);
    });
    apiFetch(`/company/${companyId}`).then(fetchedData => {
      if (fetchedData?.id || fetchedData?._id) setCompany(fetchedData);
    });
    apiFetch(`/transactions?companyId=${companyId}`).then(fetchedData => {
      if (fetchedData?.length) setActiveTx(fetchedData[fetchedData.length - 1]);
    });
  }, []);

  // Derive alerts from parcel status changes
  useEffect(() => {
    const dynamic = [
      ...parcels.filter(pc => pc.status === "flooded").map(pc => ({ id:`fl-${pc.id}`, parcelId:pc.id, type:"critical", message:`MNDWI > 0.42 — Flood confirmed · ${pc.name}`, time:new Date().toISOString() })),
      ...parcels.filter(pc => pc.status === "degraded" && pc.type === "peatland").map(pc => ({ id:`pd-${p.id}`, parcelId:p.id, type:"warning", message:`${pc.name}: Peat degrading, NDVI=${pc.ndvi}, becoming emitter`, time:new Date().toISOString() })),
      ...parcels.filter(pc => pc.status === "burned").map(pc => ({ id:`br-${pc.id}`, parcelId:pc.id, type:"critical", message:`FIRE detected at ${pc.name} — Credits suspended`, time:new Date().toISOString() })),
      ...parcels.filter(pc => pc.status === "healthy").map(pc => ({ id:`ok-${pc.id}`, parcelId:pc.id, type:"info", message:`${pc.name}: All sensors normal, NDVI stable ${pc.ndvi}`, time:new Date().toISOString() })),
    ];
    setAlerts(dynamic.length ? dynamic : MOCK_ALERTS);
  }, [parcels]);

  const renderPage = () => {
    switch (page) {
      case "home":    return <Dashboard   parcels={parcels} alerts={alerts} company={company} setPage={setPage} t={t} activeTx={activeTx} qStatus={qStatus}/>;
      case "land":    return <LandPage    parcels={parcels} setParcels={setParcels} t={t} lang={lang} setPage={setPage} />;
      case "calc":    return <CalcPage    t={t} setPage={setPage} />;
      case "tx":      return <TxPage      tx={activeTx} setTx={setActiveTx} t={t} lang={lang} setPage={setPage} />;
      case "market":  return <MarketPage t={t} company={company} parcels={parcels} projects={projects} setProjects={setProjects} />;      
      case "certificate": return <CertificatePage t={t} parcels={parcels} company={company} />;
      /// case "projects":    return <ActiveProjectPage t={t} company={company} />;
      case "verify":  return <VerifyPage  t={t} parcels={parcels} lang={lang} setPage={setPage} />;
      case "profile": return <ProfilePage company={company} setCompany={setCompany} t={t} lang={lang} onLogout={() => onLogout?.(lang)} onExit={onExit ?? (() => {})} setPage={setPage} qStatus={qStatus} updateQStatus={updateQStatus}
      />;
      default:        return <Dashboard   parcels={parcels} alerts={alerts} company={company} setPage={setPage} t={t} />;
    }
  };

  const [qStatus, setQStatus] = useState(() => {
    const saved = localStorage.getItem("carbon_q_status");
    return saved ? JSON.parse(saved) : {
      isComplete: false,
      lastUpdated: null,
      resetCount: 0,
      answers: {}
    };
  });
  
  // Fungsi untuk menyimpan status kuisioner
  const updateQStatus = (newData) => {
    const updated = { ...qStatus, ...newData };
    setQStatus(updated);
    localStorage.setItem("carbon_q_status", JSON.stringify(updated));
  };

  async function handleDismiss(alertId) {
    await fetch(`https://carbon-trust-be.onrender.com/api/alerts/${alertId}`, { method: "DELETE" });
    setAlerts(prev => prev.filter(alertItem => alertItem.id !== alertId));
  }

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