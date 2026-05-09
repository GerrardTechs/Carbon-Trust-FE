import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client"; 
import "./index.css"
import AuthFlow from "./auth/AuthFlow";
import CarbonTrust from "./carbontrust/App";

function RootApp() {
  // 1. Ambil data dari localStorage saat pertama kali aplikasi dibuka
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem("carbon_session");
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // 2. Status untuk mengecek apakah user sedang membuka dashboard atau di luar aplikasi
  const [isAppActive, setIsAppActive] = useState(false);

  // Fungsi saat login/register berhasil
  const handleLogin = (role, user, lang, token) => {
    const userData = { role, user, lang, token };
    setSession(userData);
    localStorage.setItem("carbon_session", JSON.stringify(userData));
    setIsAppActive(true); // Langsung masuk ke app setelah login baru
  };

  // Fungsi untuk "Exit & Logout" (Hapus semua data)
  const handleLogout = () => {
    setSession(null);
    setIsAppActive(false);
    localStorage.removeItem("carbon_session");
  };

  // Fungsi untuk "Exit App" (Hanya tutup dashboard, data aman)
  const handleExitApp = () => {
    setIsAppActive(false);
  };

  // KONDISI 1: Belum login sama sekali
  if (!session) {
    return <AuthFlow onComplete={handleLogin} />;
  }

  // KONDISI 2: Sudah login, tapi sedang di luar aplikasi (Welcome Back Screen)
  if (session && !isAppActive) {
    const wbCss = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      .wb-shell {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        background: #f1f5f9;
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .wb-card {
        width: 100%;
        max-width: 430px;
        min-height: 100dvh;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes popIn {
        from { transform: scale(0); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }
      .wb-top {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 28px 40px;
        text-align: center;
        animation: fadeUp .35s ease forwards;
      }
      .wb-logo-ring {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        transform: scale(1.8);
        overflow: hidden;
        background: white;
        border: 1.5px solid #dcfce7;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 70px;
      }
      .wb-logo-ring img {
        width: 170%;
        height: 170%;
        object-fit: contain;
      }
      .wb-tag {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: #16a34a;
        background: #dcfce7;
        padding: 5px 14px;
        border-radius: 999px;
        margin-bottom: 18px;
        display: inline-block;
        animation: popIn .5s cubic-bezier(.34,1.56,.64,1) .1s both;
      }
      .wb-headline {
        font-size: 28px;
        font-weight: 900;
        color: #1e293b;
        line-height: 1.2;
        letter-spacing: -.03em;
        margin-bottom: 10px;
      }
      .wb-name {
        font-size: 16px;
        font-weight: 700;
        color: #15803d;
        margin-bottom: 8px;
      }
      .wb-sub {
        font-size: 14px;
        color: #475569;
        line-height: 1.55;
        max-width: 280px;
      }
      .wb-pills {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
      }
      .wb-pill {
        font-size: 11px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 999px;
        letter-spacing: .03em;
      }
      .wb-pill-green { background: #dcfce7; color: #166534; }
      .wb-pill-teal  { background: #ccfbf1; color: #0f766e; }
      .wb-wave { position: relative; height: 72px; overflow: hidden; flex-shrink: 0; }
      .wb-bottom {
        padding: 28px 28px 48px;
        background: #f0fdf4;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .wb-btn-primary {
        width: 100%;
        padding: 15px 0;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, #166534, #0f766e);
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity .15s, transform .1s;
        letter-spacing: -.01em;
        font-family: inherit;
      }
      .wb-btn-primary:hover  { opacity: .92; }
      .wb-btn-primary:active { transform: scale(.98); }
      .wb-logout {
        background: none;
        border: none;
        font-size: 13px;
        font-weight: 700;
        color: #94a3b8;
        cursor: pointer;
        text-align: center;
        font-family: inherit;
        text-decoration: underline;
        transition: color .15s;
        padding: 4px 0;
      }
      .wb-logout:hover { color: #dc2626; }
    `;

    const isId = session.lang === "id";
    const displayName = session.user?.name || "PT. Nusantara Hijau";

    return (
      <div className="wb-shell">
        <style>{wbCss}</style>
        <div className="wb-card">
          <div className="wb-top">
            <div className="wb-logo-ring">
              <img src="/logo_depan.svg" alt="CarbonTrust Logo" />
            </div>
            <span className="wb-tag">
              {isId ? "Sesi Tersimpan" : "Session Saved"}
            </span>
            <h2 className="wb-headline">
              {isId ? "Selamat Datang\nKembali!" : "Welcome\nBack!"}
            </h2>
            <p className="wb-name">{displayName}</p>
            <p className="wb-sub">
              {isId
                ? "Akun Anda masih aktif. Lanjutkan aktivitas karbon Anda."
                : "Your account is still active. Continue your carbon activities."}
            </p>
            <div className="wb-pills">
              <span className="wb-pill wb-pill-green">
                {isId ? "✓ Terverifikasi" : "✓ Verified"}
              </span>
              <span className="wb-pill wb-pill-teal">ISO 14064</span>
              <span className="wb-pill wb-pill-green">
                {isId ? "Blockchain Siap" : "Blockchain Ready"}
              </span>
            </div>
          </div>

          {/* decorative wave — sama persis dengan AuthFlow */}
          <div className="wb-wave">
            <svg viewBox="0 0 430 72" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}>
              <path d="M0,48 C80,72 180,8 280,48 C360,80 400,24 430,36 L430,72 L0,72 Z" fill="#f0fdf4" />
              <path d="M0,56 C100,36 200,72 300,52 C370,40 410,60 430,56 L430,72 L0,72 Z" fill="#dcfce7" opacity=".6"/>
            </svg>
            <div style={{ position: "absolute", bottom: 0, width: "100%", height: 40, background: "#dcfce7" }} />
          </div>

          <div className="wb-bottom">
            <button className="wb-btn-primary" onClick={() => setIsAppActive(true)}>
              {isId ? "Masuk ke Dashboard →" : "Enter Dashboard →"}
            </button>
            <button className="wb-logout" onClick={handleLogout}>
              {isId ? "Ganti Akun / Logout" : "Switch Account / Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // KONDISI 3: Masuk ke dalam Aplikasi CarbonTrust
  return (
    <CarbonTrust
      initialLang={session.lang}
      userData={session.user}
      onLogout={handleLogout}   // Mengirim fungsi hapus memori
      onExit={handleExitApp}    // Mengirim fungsi tutup dashboard
    />
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);