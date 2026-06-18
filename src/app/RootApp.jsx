import React, { useState } from "react";
import AuthFlow from "../auth/AuthFlow.jsx";
import CarbonTrust from "../carbontrust/apps/App.jsx";
import AdminApp from "../carbontrust/apps/AdminApp.jsx";
import LandlordApp from "../carbontrust/apps/LandlordApp.jsx";
import PublicView from "../carbontrust/apps/PublicView.jsx";
import PrivacyPage from "../auth/pages/PrivacyPage.jsx";
import TermsPage   from "../auth/pages/TermsPage.jsx";

export default function RootApp() {
  const isPrivacy = window.location.pathname.startsWith("/privacy");
  const isTerms   = window.location.pathname.startsWith("/terms");
  const isPublic = window.location.pathname.startsWith("/public") ||
                   new URLSearchParams(window.location.search).get("view") === "public";

  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem("carbon_session");
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const [isAppActive, setIsAppActive] = useState(() => {
    return !!localStorage.getItem("carbon_session");
  });

  if (isPrivacy) return <PrivacyPage />;
  if (isTerms)   return <TermsPage />;

  const handleLogin = (role, user, lang, token) => {
    const userData = { role: user?.role || role, user, lang, token };
    setSession(userData);
    localStorage.setItem("carbon_session", JSON.stringify(userData));
    setIsAppActive(true);
  };

  const handleLogout = () => {
    setSession(null);
    setIsAppActive(false);
    localStorage.removeItem("carbon_session");
  };

  const handleExitApp = () => {
    setIsAppActive(false);
  };

  if (isPublic) return <PublicView />;

  if (!session) return <AuthFlow onComplete={handleLogin} />;

  if (session && !isAppActive) {
    const wbCss = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      .wb-shell { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f1f5f9; min-height: 100dvh; display: flex; align-items: center; justify-content: center; }
      .wb-card { width: 100%; max-width: 430px; min-height: 100dvh; background: #ffffff; display: flex; flex-direction: column; overflow: hidden; position: relative; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .wb-top { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 28px 40px; text-align: center; animation: fadeUp .35s ease forwards; }
      .wb-logo-ring { width: 120px; height: 120px; border-radius: 50%; transform: scale(1.8); overflow: hidden; background: transparent; border: 1.5px solid #dcfce7; display: flex; align-items: center; justify-content: center; margin-bottom: 70px; }
      .wb-logo-ring img { width: 170%; height: 170%; object-fit: contain; }
      .wb-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #16a34a; background: #dcfce7; padding: 5px 14px; border-radius: 999px; margin-bottom: 18px; display: inline-block; animation: popIn .5s cubic-bezier(.34,1.56,.64,1) .1s both; }
      .wb-headline { font-size: 28px; font-weight: 900; color: #1e293b; line-height: 1.2; letter-spacing: -.03em; margin-bottom: 10px; }
      .wb-name { font-size: 16px; font-weight: 700; color: #15803d; margin-bottom: 8px; }
      .wb-sub { font-size: 14px; color: #475569; line-height: 1.55; max-width: 280px; }
      .wb-pills { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }
      .wb-pill { font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 999px; letter-spacing: .03em; }
      .wb-pill-green { background: #dcfce7; color: #166534; }
      .wb-pill-teal  { background: #ccfbf1; color: #0f766e; }
      .wb-wave { position: relative; height: 72px; overflow: hidden; flex-shrink: 0; }
      .wb-bottom { padding: 28px 28px 48px; background: #f0fdf4; display: flex; flex-direction: column; gap: 12px; }
      .wb-btn-primary { width: 100%; padding: 15px 0; border-radius: 14px; border: none; background: linear-gradient(135deg, #166534, #0f766e); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity .15s, transform .1s; letter-spacing: -.01em; font-family: inherit; }
      .wb-btn-primary:hover  { opacity: .92; }
      .wb-btn-primary:active { transform: scale(.98); }
      .wb-logout { background: none; border: none; font-size: 13px; font-weight: 700; color: #94a3b8; cursor: pointer; text-align: center; font-family: inherit; text-decoration: underline; transition: color .15s; padding: 4px 0; }
      .wb-logout:hover { color: #dc2626; }
    `;
    const L = session.lang || "en";
    const WB_T = {
      en: { tag:"Session Saved",      headline:"Welcome\nBack!",               sub:"Your account is still active. Continue your carbon activities.",    verified:"✓ Verified",      aiValidated:"AI Certificate Validated", enter:"Enter Dashboard →",    switch_:"Switch Account / Logout" },
      id: { tag:"Sesi Tersimpan",     headline:"Selamat Datang\nKembali!",     sub:"Akun Anda masih aktif. Lanjutkan aktivitas karbon Anda.",          verified:"✓ Terverifikasi", aiValidated:"Sertifikat Tervalidasi AI", enter:"Masuk ke Dashboard →", switch_:"Ganti Akun / Logout" },
      tr: { tag:"Oturum Kaydedildi", headline:"Tekrar\nHoş Geldiniz!",        sub:"Hesabınız hâlâ aktif. Karbon faaliyetlerinize devam edin.",         verified:"✓ Doğrulandı",   aiValidated:"AI Sertifika Doğrulandı", enter:"Panele Gir →",         switch_:"Hesabı Değiştir / Çıkış" },
      zh: { tag:"会话已保存", headline:"欢迎\n回来！", sub:"您的账户仍然有效。继续您的碳活动。", verified:"✓ 已验证", aiValidated:"AI证书已验证", enter:"进入仪表板 →", switch_:"切换账户 / 退出" },
    };
    const wb = WB_T[L] || WB_T.en;
    const displayName = session.user?.name || "PT. Nusantara Hijau";
    return (
      <div className="wb-shell">
        <style>{wbCss}</style>
        <div className="wb-card">
          <div className="wb-top">
            <div className="wb-logo-ring">
              <img src="/logo_depan.svg" alt="CarbonTrust Logo" />
            </div>
            <span className="wb-tag">{wb.tag}</span>
            <h2 className="wb-headline">{wb.headline}</h2>
            <p className="wb-name">{displayName}</p>
            <p className="wb-sub">{wb.sub}</p>
            <div className="wb-pills">
              <span className="wb-pill wb-pill-green">{wb.verified}</span>
              <span className="wb-pill wb-pill-teal">ISO 14064</span>
              <span className="wb-pill wb-pill-green">{wb.aiValidated}</span>
            </div>
          </div>
          <div className="wb-wave">
            <svg viewBox="0 0 430 72" preserveAspectRatio="none" style={{ position:"absolute", bottom:0, width:"100%", height:"100%" }}>
              <path d="M0,48 C80,72 180,8 280,48 C360,80 400,24 430,36 L430,72 L0,72 Z" fill="#f0fdf4" />
              <path d="M0,56 C100,36 200,72 300,52 C370,40 410,60 430,56 L430,72 L0,72 Z" fill="#dcfce7" opacity=".6"/>
            </svg>
            <div style={{ position:"absolute", bottom:0, width:"100%", height:40, background:"#dcfce7" }} />
          </div>
          <div className="wb-bottom">
            <button className="wb-btn-primary" onClick={() => setIsAppActive(true)}>
              {wb.enter}
            </button>
            <button className="wb-logout" onClick={handleLogout}>
              {wb.switch_}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session?.role === "admin") {
    return <AdminApp onLogout={handleLogout} user={session.user} lang={session.lang} />;
  }

  if (session?.role === "landlord") {
    return <LandlordApp onLogout={handleLogout} onExit={handleExitApp} user={session.user} lang={session.lang} />;
  }

  return (
    <CarbonTrust
      initialLang={session.lang}
      userData={session.user}
      onLogout={handleLogout}
      onExit={handleExitApp}
    />
  );
}