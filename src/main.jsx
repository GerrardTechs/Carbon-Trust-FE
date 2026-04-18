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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#f1f5f1" }}>
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center space-y-6 fade-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
            🏢
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2 font-medium">{session.user?.name || "PT. Nusantara Hijau"}</p>
          </div>
          
          <button 
            onClick={() => setIsAppActive(true)}
            className="w-full py-4 bg-green-700 hover:bg-green-800 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
            Masuk ke Dashboard
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-400 font-bold underline hover:text-red-500 transition-colors">
            Ganti Akun / Logout
          </button>
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