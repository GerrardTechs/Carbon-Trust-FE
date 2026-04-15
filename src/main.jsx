import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client"; 
import "./index.css"
import AuthFlow from "./auth/AuthFlow";
import CarbonTrust from "./carbontrust/App";

function RootApp() {
  // 1. Ambil data dari localStorage saat pertama kali aplikasi dibuka
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem("carbon_session");
    // Jika ada data di localStorage, gunakan data itu. Jika tidak, null.
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // 2. Fungsi untuk menyimpan session ke state dan localStorage
  const handleLogin = (role, user, lang, token) => {
    const userData = { role, user, lang, token };
    setSession(userData);
    localStorage.setItem("carbon_session", JSON.stringify(userData));
  };

  // 3. Fungsi untuk menghapus session dari state dan localStorage saat logout
  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("carbon_session");
  };

  // Jika belum ada session (belum login), tampilkan halaman AuthFlow
  if (!session) {
    return (
      <AuthFlow
        onComplete={handleLogin} // ← Memanggil handleLogin saat berhasil memilih role
      />
    );
  }

  // Jika sudah login, tampilkan aplikasi utama CarbonTrust
  return (
    <CarbonTrust
      initialLang={session.lang}
      onLogout={handleLogout}   // ← Memanggil handleLogout untuk keluar
      userData={session.user}   // (Opsional) Mengirim info user agar bisa dipakai di dalam App
    />
  );
}

// Perintah untuk mencari <div id="root"> di file index.html 
// dan merender aplikasi ke dalamnya.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);