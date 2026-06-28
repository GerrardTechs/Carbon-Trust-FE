/**
 * CarbonTrust — carbontrust/shared.jsx
 * Exports: config, translations (TR), science constants,
 *          utility fns, hooks, shared UI components, icons.
 * Import everything from here in page components.
 */

import { useState, useEffect, useRef } from "react";
// ─── CONFIG ────────────────────────────────────────────────────────────────
export const API = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : "http://localhost:3000/api";
export const COMPANY_ID = "COMP-001";
export const CREDIT_PRICE = 18.5;

export const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  :root {
    --ct-bg: #f1f5f1;
    --ct-surface: #f9fafb;
    --ct-card: #ffffff;
    --ct-border: #e5e7eb;
    --ct-text: #1f2937;
    --ct-text-muted: #6b7280;
    --ct-header: #ffffff;
  }
  html.dark {
    --ct-bg: #0f172a;
    --ct-surface: #111827;
    --ct-card: #1e293b;
    --ct-border: #334155;
    --ct-text: #f1f5f9;
    --ct-text-muted: #94a3b8;
    --ct-header: #1e293b;
  }
  * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; box-sizing: border-box; }
  @keyframes sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  .fade-up { animation: fadeUp .35s ease forwards; }
  .card { background:var(--ct-card); border-radius:16px; border:1px solid var(--ct-border); box-shadow:0 1px 4px rgba(0,0,0,.06); color:var(--ct-text); }
  .card-green { background:#f0fdf4; border:1px solid #bbf7d0; }
  html.dark .card-green { background:#14532d33; border-color:#166534; }
  .spin { animation: spin 1s linear infinite; }
  .pulse2 { animation: pulse2 1.4s ease infinite; }
  input[type=range] { accent-color: #16a34a; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
  html.dark ::-webkit-scrollbar-thumb { background: #475569; }
  html.dark input, html.dark select, html.dark textarea { background:#0f172a; color:var(--ct-text); border-color:var(--ct-border); }
  html.dark .text-gray-800, html.dark .text-gray-700, html.dark .text-gray-600 { color: var(--ct-text) !important; }
  html.dark .text-gray-500, html.dark .text-gray-400 { color: var(--ct-text-muted) !important; }
  html.dark .bg-white { background: var(--ct-card) !important; }
  html.dark .bg-gray-50 { background: #0f172a !important; }
  html.dark .border-gray-100, html.dark .border-gray-200 { border-color: var(--ct-border) !important; }
`;

export const THEME_KEY = "carbon_theme";

export function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"; }
  catch { return "light"; }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
}

export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);
  useEffect(() => { applyTheme(theme); }, [theme]);
  const toggleTheme = () => setThemeState(prev => (prev === "dark" ? "light" : "dark"));
  return { theme, setTheme: setThemeState, toggleTheme, isDark: theme === "dark" };
}

export async function apiFetch(path, opts = {}) {
  try {
    const session = JSON.parse(localStorage.getItem("carbon_session") || "{}");
    const token = session?.token || "";
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    };
    if (!opts.isFormData) headers["Content-Type"] = "application/json";
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok && data && !data.message) {
      data.message = `HTTP ${res.status}`;
    }
    if (!res.ok && data) data._httpStatus = res.status;
    return data;
  } catch (err) {
    console.error("apiFetch error:", path, err);
    return null;
  }
}

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────
export const TR = {
  en: {
    flag:"🇺🇸", label:"English",
    nav:{ home:"Home", absorb:"Carbon Sequestration", market:"Carbon Bursa", calc:"Total Emissions", verify:"Verification", profile:"Profile", tx:"Transaction" },
    dash:{
      greeting:"Welcome back", tagline:"Welcome Back!",
      netCarbon:"Net Carbon Balance", totalEm:"Total Emissions", totalAbs:"Total Sequestration",
      credits:"Carbon Credits", creditsUSD:"Portfolio Value",
      myProjects:"Carbon Sequestration Projects", seeAll:"View all sequestration parcels →",
      units:{ t:"tCO₂e", kt:"ktCO₂e", Mt:"MtCO₂e", kg:"kg CO₂e" }, unitLabel:"Unit",
      activeProjects: "Active Carbon Projects",
      projectStatus: { active:"Active", pending:"Pending", completed:"Completed" },
      progressLabel: "Verification Progress",
      progressHelp: "Tracks how far your sequestration data has progressed through MRV: data entry → certificate upload → AI validation → credit calculation.",
      carbonCreditValue: "Carbon Credit Value",
      journeyTitle: "Your Carbon Credit Journey",
      journeyStep1: "Step 1: Enter Total Emissions (Scope 1–3) in the Emissions menu",
      journeyStep2: "Step 2: Enter offset data in Carbon Sequestration",
      journeyStep3: "Step 3: Carbon Credit = Total Emission − Total Sequestration",
      alerts: "AI Detection & Alerts",
      dismiss: "Dismiss",
      noAlerts: "No active alerts",
      dataTrust: "Data Confidence Level",
      dataTrustSub: "Used in MRV verification",
      certQuick: "Certificate",
      certQuickSub: "Carbon credits",
    },
    absorb: {
      subtitle: "Total sequestration is used to calculate Net Carbon Credit",
      tabs: { green: "Green Carbon", solar: "Solar Panel", biogas: "Biogas", blue: "Blue Carbon" },
      certTitle: "Verification Certificates",
      certRequired: "required for active projects",
      certEmission: "Emission Certificate",
      certSequestration: "Sequestration Certificate",
      certHint: "PDF or image — ISO 14064 summary",
      certBothUploaded: "Both certificates uploaded — projects will appear on Home",
      saveSequestration: "Save Sequestration",
      saveSuccess: "Sequestration saved successfully!",
      goDashboard: "Go to Dashboard →",
      calcCredit: "Calculate Carbon Credit →",
      calcCreditNeedEmission: "Enter Total Emissions first in the Emissions menu",
      solar: {
        title: "Solar Panel",
        desc: "Solar electricity reduces grid demand from the utility (Scope 2 offset).",
        panelCount: "Number of solar panels",
        panelUnit: "units",
        capacity: "Capacity per panel",
        capacityUnit: "Wp",
        sunHours: "Effective sunshine hours",
        sunHoursLocked: "3.5 h/day (Indonesia average)",
        efficiency: "Efficiency factor",
        efficiencyLocked: "0.75 (locked)",
        outputWh: "Watt Hour (Wh)",
        outputKwh: "Kilo Watt Hour (kWh)",
        offsetMonthly: "monthly CO₂e offset",
      },
      green: { title: "Green Carbon — Land / Forest", hint: "Enter verified third-party sequestration from land or forest." },
      biogas: { title: "Biogas / Biogenic", hint: "Biogas from organic waste replaces fossil fuel." },
      blue: { title: "Blue Carbon — Marine Biota", hint: "Sequestration from coastal mangrove, seagrass, coral reef, and other marine ecosystems." },
      totalSequestration: "Total Sequestration (all categories)",
      perMonth: "per month",
      perYear: "per year",
    },
    land:{
      title:"Land Ownership", addParcel:"Add Land Parcel",
      area:"Area (ha)", type:"Land Type", name:"Parcel Name",
      lat:"Latitude", lng:"Longitude", depth:"Peat Depth (m)",
      simulate:"Simulate Condition", viewAll:"All Land Parcels",
      stockFormula:"Carbon Sequestration Formula",
      types:{ forest:"Forest",peatland:"Peatland",mangrove:"Mangrove",agricultural:"Agricultural",industrial:"Industrial" },
      status:{ healthy:"Healthy",flooded:"Flooded",degraded:"Degraded",burned:"Burned",drying:"Peat Drying" },
      alerts:{
        flooded:"🌊 FLOOD — Sequestration drops sharply. Waterlogged land blocks photosynthesis & gas exchange. Carbon credits suspended.",
        degraded:"⚠️ DEGRADED — Land loses sequestration capacity. Vegetation damaged, soil structure disrupted. Rehabilitation needed.",
        peatland_degraded:"⚠️ PEAT DEGRADED — Peatland becomes an active CO₂ emitter. Organic decomposition releases large amounts of CH₄ & CO₂.",
        burned:"🔥 FIRE — Massive CO₂ & CH₄ emissions. Stored carbon released instantly. Credits cancelled for affected areas.",
        drying:"🌡️ PEAT DRYING — Humidity drops sharply. Dry peat emits CH₄ & CO₂. Fire risk increases. NDVI declining."
      },
    },
    calc:{
      title:"Emission Calculator", scope1:"Scope 1 — Direct",
      scope2:"Scope 2 — Indirect Energy", scope3:"Scope 3 — Value Chain",
      calculate:"Calculate Emissions", totalEm:"Total Emissions",
      offsetNeeded:"Carbon Credits Needed", leakage:"Estimated Leakage",
      ref:"Based on IPCC 2006 · ESDM Indonesia EF",
      breakdownTitle:"Breakdown by Source",
      method: "Calculation Method",
      methodOp: "Operational Control",
      methodEq: "Equity Share",
      equityPct: "Equity Share (%)",
      ownershipCert: "Upload Ownership Certificate",
      ownershipHint: "PDF/image of share ownership document",
      ownershipReject: "File rejected — must be PDF or image (JPG/PNG)",
      aiMethodDesc: "CarbonTrust AI reads the 1-page ISO 14064 certificate summary using NLP and computer vision. It cross-checks your manual emission inputs against verified certificate data using IPCC Tier 1–2 emission factors, mass-balance principles, and uncertainty propagation. Mismatches are flagged before you can access the Exchange. This advanced MRV technology ensures anti-fraud compliance without blockchain.",
      ui: {
        scopeTabs: "Scope 1 · 2 · 3 · Total",
        notCalculated: "Total emissions not yet calculated",
        notCalculatedHint: "Fill in Scope 1, 2, and 3 data then click Calculate Emissions to see the total.",
        startScope1: "Start from Scope 1 →",
        formulaTitle: "GHG Protocol Formula (Quantis/WBCSD)",
        formula1: "GHG_i = Activity_i × EF_i",
        formula2: "Total = Σ Scope 1 + Σ Scope 2 + Σ Scope 3",
        distribution: "Emission Distribution",
        scopeBreakdown: "Breakdown by Scope — tap for detail",
        scopeDetail: "Scope {n} — Source Breakdown",
        subtotal: "Subtotal Scope {n}",
        uncertaintyTitle: "Calculation Uncertainty",
        uncertaintyDesc: "Based on Pedigree Matrix (GHG Protocol): uncertainty varies per category. ±% shown in each source breakdown.",
        leakageNote: "Scope 1 × 5% + Scope 3 × 10% (displacement effect)",
        recalculate: "← Recalculate",
        lastResult: "Latest result",
        tapTotal: "Tap to view full Total Emissions",
        emissionSources: "{n} emission sources",
        seeDetail: "See breakdown →",
        noEmission: "No emissions recorded",
        aiMethodTitle: "Method Used — AI MRV",
        methodOpLabel: "Operational / Activity",
        methodEqLabel: "Equity Share",
        tonKmHint: "Enter total ton-kilometers (ton·km) = distance (km) × load (tons), or enter km and tons separately below.",
        tonKmLoad: "Load (tons)",
        journeyTitle: "Next Step: Carbon Sequestration",
        journeyBody: "Your emissions are calculated. Enter your offset data on the Carbon Sequestration page to compute your net carbon credit.",
        goSequestration: "Go to Carbon Sequestration →",
        stayHere: "Stay on this page",
        calculating: "Calculating...",
        scopeInfo: {
          1: { label: "Scope 1 — Direct Emissions", sub: "Stationary combustion & operational transport" },
          2: { label: "Scope 2 — Purchased Energy", sub: "Grid electricity (kWh) & purchased energy" },
          3: { label: "Scope 3 — Value Chain", sub: "Freight, logistics, travel & waste" },
        },
      },
    },
    market:{
      title:"Carbon Market", search:"Search projects, companies, countries...",
      detail:"View Details", transact:"Start Transaction",
      aiMatch:"AI Matching", analyzing:"Analyzing compatibility...",
      score:"Compatibility Score", buyer:"Buyer", seller:"Seller",
      proceed:"Proceed to Transaction →",
      recommend:"Recommended for you",
      est500:"Estimated for 500 ton purchase",
      eqArea:"ha equivalent", renewableProj:"Renewable project",
    },
    tx:{
      title:"Transaction", new:"New Transaction",
      stage0:"Agreement Created", stage1:"Funds in Escrow",
      stage2:"Carbon Verified", stage3:"Funds Released",
      confirmReceipt:"Confirm Receipt",
      escrow:"Escrow Amount", verified:"MRV Verified",
      volume:"Volume", price:"Price/ton", total:"Total",
      noTx:"No active transaction", noTxSub:"Start a transaction from the Market page",
      status:"Transaction Status", complete:"Transaction Complete — Funds Released",
      active:"● Active", completed:"✓ Completed", inProgress:"● In progress",
      advanceDemo:"▶ Advance to next stage (demo)",
      escrowNote:"B2B agreement tracked via MRV verification",
    },
    verify:{ title:"MRV & Verification", download:"Download ISO 14064 Certificate", log:"ML · Satellite Log",
      satelliteView:"Satellite View — Land Boundaries", multiSite:"Multi-Site Satellite View",
      certDownloaded:"ISO 14064 Certificate Downloaded",
      isoUploadTitle:"Upload ISO 14064 Verification Certificate",
      isoUploadHint:"Upload your ISO 14064 certificate from a verification body. Required before offering credits on the Market.",
      isoUploadLabel:"Upload ISO 14064 Certificate",
      isoUploadReject:"File rejected — must be PDF or JPG/PNG",
      submitVerify:"Submit for Verification",
      uploading:"Uploading...",
    },
    profile:{
      title:"Company Profile", settings:"Profile Settings",
      save:"Save Profile",
      saved:"✅ Saved!",
      companyName:"Company Name", emailLabel:"Institutional Email", locationLabel:"Location",
      removalProjectLabel:"Carbon Removal Project", entityTypeLabel:"Entity / Company Type", bizTypeLabel:"Business Activity Type",
      txCount:"Transactions",
    },
    exit:{
      btn:"Exit", title:"Exit Application", desc:"What would you like to do?",
      exitOnly:"Exit To Menu", logout:"Exit & Log Out",
      logoutDesc:"You will return to the registration screen.",
      cancelBtn:"Cancel", noActiveTx:"No active transaction",
    },
    common:{ save:"Save", cancel:"Cancel", back:"← Back", loading:"Processing...", confirm:"Confirm", download:"Download", close:"Close", add:"Add", submit:"Submit" },
  },
  id: {
    flag: "🇮🇩", label: "Indonesia",
    nav: { home: "Beranda", absorb: "Serapan Karbon", market: "Bursa Karbon", calc: "Total Emisi", verify: "Verifikasi", profile: "Profil", tx: "Transaksi" },
    dash: {
      greeting: "Selamat datang", tagline: "Valid · Real-Time · Bebas Fraud",
      netCarbon: "Saldo Karbon Bersih", totalEm: "Total Emisi", totalAbs: "Total Serapan",
      credits: "Kredit Karbon", creditsUSD: "Nilai Portfolio",
      myProjects: "Proyek Serapan Karbon", seeAll: "Lihat semua lahan →",
      units: { t: "tCO₂e", kt: "ktCO₂e", Mt: "MtCO₂e", kg: "kg CO₂e" }, unitLabel: "Satuan",
      activeProjects: "Proyek Karbon Aktif",
      projectStatus: { active: "Aktif", pending: "Dalam Proses", completed: "Selesai" },
      progressLabel: "Progress Verifikasi",
      progressHelp: "Melacak sejauh mana data serapan Anda melalui MRV: input data → upload sertifikat → validasi AI → perhitungan kredit.",
      carbonCreditValue: "Nilai Kredit Karbon",
      journeyTitle: "Alur Mendapatkan Kredit Karbon",
      journeyStep1: "Langkah 1: Input Total Emisi (Scope 1–3) di menu Emisi",
      journeyStep2: "Langkah 2: Input data offset di menu Serapan Karbon",
      journeyStep3: "Langkah 3: Kredit Karbon = Total Emisi − Total Serapan",
      alerts: "Deteksi AI & Peringatan",
      dismiss: "Tutup",
      dataTrust: "Tingkat Kepercayaan Data",
      dataTrustSub: "Digunakan dalam verifikasi MRV",
      certQuick: "Sertifikat",
      certQuickSub: "Kredit karbon",
    },
    absorb: {
      subtitle: "Total sequestration digunakan untuk menghitung Net Carbon Credit",
      tabs: { green: "Karbon Hijau", solar: "Panel Surya", biogas: "Biogas", blue: "Blue Carbon" },
      certTitle: "Sertifikat Verifikasi",
      certRequired: "wajib untuk proyek aktif",
      certEmission: "Sertifikat Emisi",
      certSequestration: "Sertifikat Serapan",
      certHint: "PDF atau gambar — ISO 14064 summary",
      certBothUploaded: "Kedua sertifikat diunggah — proyek akan muncul di Beranda",
      saveSequestration: "Simpan Sequestration",
      saveSuccess: "Sequestration berhasil disimpan!",
      goDashboard: "Ke Beranda →",
      calcCredit: "Hitung Kredit Karbon →",
      calcCreditNeedEmission: "Isi Total Emisi dulu di menu Emisi",
      solar: {
        title: "Panel Surya",
        desc: "Listrik panel surya mengurangi kebutuhan dari PLN (offset Scope 2).",
        panelCount: "Jumlah lembar panel surya",
        panelUnit: "buah",
        capacity: "Kapasitas",
        capacityUnit: "Wp",
        sunHours: "Jumlah jam matahari efektif",
        sunHoursLocked: "3,5 jam/hari (rata-rata Indonesia)",
        efficiency: "Faktor efisiensi",
        efficiencyLocked: "0,75 (terkunci)",
        outputWh: "Watt Hour (Wh)",
        outputKwh: "Kilo Watt Hour (kWh)",
        offsetMonthly: "offset CO₂e/bulan",
      },
      green: { title: "Karbon Hijau — Lahan / Hutan", hint: "Masukkan total sequestration dari lahan atau hutan yang sudah diverifikasi pihak ketiga." },
      biogas: { title: "Biogas / Biogenik", hint: "Biogas dari limbah organik menggantikan bahan bakar fosil." },
      blue: { title: "Blue Carbon — Biota Laut", hint: "Sequestration dari ekosistem laut: mangrove, lamun, terumbu karang, dan biota laut lainnya." },
      totalSequestration: "Total Sequestration (semua kategori)",
      perMonth: "per bulan",
      perYear: "per tahun",
    },
    land: {
      title: "Serapan Karbon Lahan", addParcel: "Tambah Lahan Serapan",
      area: "Luas (ha)", type: "Jenis Lahan", name: "Nama Lahan",
      lat: "Lintang", lng: "Bujur", depth: "Kedalaman Gambut (m)",
      simulate: "Simulasi Kondisi", viewAll: "Semua Bidang Lahan",
      stockFormula: "Formula Serapan Karbon",
      types: { forest: "Hutan", peatland: "Gambut", mangrove: "Mangrove", agricultural: "Pertanian", industrial: "Industri" },
      status: { healthy: "Sehat", flooded: "Banjir", degraded: "Terdegradasi", burned: "Terbakar", drying: "Gambut Kering" },
      alerts: {
        flooded: "🌊 BANJIR TERDETEKSI — Serapan berkurang drastis. Lahan tergenang menghambat fotosintesis. Kredit karbon ditangguhkan sementara.",
        degraded: "⚠️ TERDEGRADASI — Vegetasi rusak, struktur tanah terganggu. Kapasitas serapan menurun signifikan. Rehabilitasi diperlukan.",
        peatland_degraded: "⚠️ GAMBUT TERDEGRADASI — Gambut menjadi sumber emisi CO₂ & metana aktif. Dekomposisi bahan organik melepas gas rumah kaca dalam jumlah besar.",
        burned: "🔥 KEBAKARAN TERDETEKSI — Emisi CO₂ & CH₄ masif. Karbon tersimpan dalam biomasa dilepas seketika. Kredit dibatalkan. Gas metana berbahaya.",
        drying: "🌡️ GAMBUT MENGERING — Kelembaban kritis. Gambut kering berubah jadi emitter aktif. Risiko kebakaran & emisi CH₄ sangat tinggi."
      },
    },
    calc: {
      title: "Total Emisi", scope1: "Scope 1 — Langsung",
      scope2: "Scope 2 — Energi Tidak Langsung", scope3: "Scope 3 — Rantai Nilai",
      calculate: "Hitung Emisi", totalEm: "Total Emisi",
      offsetNeeded: "Kredit Karbon Dibutuhkan", leakage: "Estimasi Leakage",
      ref: "Berdasarkan IPCC 2006 · Faktor Emisi ESDM Indonesia",
      breakdownTitle: "Rincian per Sumber",
      method: "Metode Kalkulasi",
      methodOp: "Kendali Operasional",
      methodEq: "Equity Share",
      equityPct: "Persentase Kepemilikan Saham (%)",
      ownershipCert: "Upload Sertifikat Kepemilikan",
      ownershipHint: "PDF/foto dokumen kepemilikan saham",
      ownershipReject: "File ditolak — harus PDF atau gambar (JPG/PNG)",
      aiMethodDesc: "AI CarbonTrust membaca ringkasan 1 halaman sertifikat ISO 14064 menggunakan NLP dan computer vision. Sistem memverifikasi input emisi manual Anda terhadap data sertifikat terverifikasi dengan faktor emisi IPCC Tier 1–2, prinsip neraca massa, dan propagasi ketidakpastian. Ketidaksesuaian data akan diblokir sebelum akses Bursa. Teknologi MRV canggih ini memastikan kepatuhan anti-fraud tanpa blockchain.",
      ui: {
        scopeTabs: "Scope 1 · 2 · 3 · Total",
        notCalculated: "Total Emisi belum dihitung",
        notCalculatedHint: "Isi data di tab Scope 1, 2, dan 3 lalu klik Hitung Emisi untuk melihat total.",
        startScope1: "Mulai dari Scope 1 →",
        formulaTitle: "Formula GHG Protocol (Quantis/WBCSD)",
        formula1: "GHG_i = Aktivitas_i × EF_i",
        formula2: "Total = Σ Scope 1 + Σ Scope 2 + Σ Scope 3",
        distribution: "Distribusi Emisi",
        scopeBreakdown: "Rincian per Scope — ketuk untuk detail",
        scopeDetail: "Scope {n} — Rincian Sumber",
        subtotal: "Subtotal Scope {n}",
        uncertaintyTitle: "Ketidakpastian Kalkulasi",
        uncertaintyDesc: "Berdasarkan Pedigree Matrix (GHG Protocol): uncertainty per kategori berbeda. Nilai ±% ditampilkan di rincian breakdown tiap sumber.",
        leakageNote: "Scope 1 × 5% + Scope 3 × 10% (displacement effect)",
        recalculate: "← Hitung Ulang",
        lastResult: "Hasil terakhir",
        tapTotal: "Ketuk untuk lihat Total Emisi lengkap",
        emissionSources: "{n} sumber emisi",
        seeDetail: "Lihat rincian →",
        noEmission: "Tidak ada emisi tercatat",
        aiMethodTitle: "Metode yang Digunakan — AI MRV",
        methodOpLabel: "Kendali Operasional / Aktivitas",
        methodEqLabel: "Equity Share",
        tonKmHint: "Masukkan total ton-kilometer (ton·km) = jarak (km) × muatan (ton), atau isi km dan ton terpisah di bawah.",
        tonKmLoad: "Muatan (ton)",
        journeyTitle: "Langkah Berikutnya: Serapan Karbon",
        journeyBody: "Emisi Anda sudah dihitung. Masukkan data offset di halaman Serapan Karbon untuk menghitung kredit karbon bersih.",
        goSequestration: "Ke Serapan Karbon →",
        stayHere: "Tetap di halaman ini",
        calculating: "Menghitung...",
        scopeInfo: {
          1: { label: "Scope 1 — Emisi Langsung", sub: "Pembakaran stasioner & transportasi operasional" },
          2: { label: "Scope 2 — Energi Dibeli", sub: "Listrik PLN (kWh) & energi yang dibeli" },
          3: { label: "Scope 3 — Rantai Nilai", sub: "Pengiriman, logistik, perjalanan, limbah" },
        },
      },
    },
    market: {
      title: "Bursa Karbon", search: "Cari proyek, perusahaan, negara...",
      detail: "Lihat Detail", transact: "Mulai Transaksi",
      aiMatch: "AI Matching", analyzing: "Menganalisis kecocokan...",
      score: "Skor Kompatibilitas", buyer: "Pembeli", seller: "Penjual",
      proceed: "Lanjutkan ke Transaksi →",
      recommend: "Rekomendasi untuk Anda",
      est500: "Estimasi pembelian 500 ton",
      eqArea: "ha setara", renewableProj: "Proyek energi terbarukan",
    },
    tx: {
      title: "Transaksi", new: "Transaksi Baru",
      stage0: "Perjanjian Dibuat", stage1: "Dana di-Escrow",
      stage2: "Karbon Diverifikasi", stage3: "Dana Dilepas",
      confirmReceipt: "Konfirmasi Penerimaan",
      escrow: "Dana Escrow", verified: "Terverifikasi MRV",
      volume: "Volume", price: "Harga/ton", total: "Total",
      noTx: "Tidak ada transaksi aktif", noTxSub: "Mulai transaksi dari halaman Bursa",
      status: "Status Transaksi", complete: "Transaksi Selesai — Dana Dilepas",
      active: "● Aktif", completed: "✓ Selesai", inProgress: "● Sedang berlangsung",
      advanceDemo: "▶ Maju ke tahap berikutnya (demo)",
      escrowNote: "Perjanjian B2B dilacak melalui verifikasi MRV",
    },
    verify: { 
      title: "MRV & Verifikasi", download: "Unduh Sertifikat ISO 14064", log: "Log ML · Satelit",
      satelliteView: "Tampilan Satelit — Batas Lahan", multiSite: "Tampilan Satelit Multi-Lokasi",
      certDownloaded: "Sertifikat ISO 14064 Diunduh",
      isoUploadTitle: "Upload Sertifikat Verifikasi ISO",
      isoUploadHint: "Upload sertifikat ISO 14064 dari lembaga verifikasi. Wajib agar kredit karbon bisa ditawarkan di market.",
      isoUploadLabel: "Upload Sertifikat ISO 14064",
      isoUploadReject: "File ditolak — harus PDF atau JPG/PNG",
      submitVerify: "Submit untuk Verifikasi",
      uploading: "Mengunggah...",
    },
    profile: {
      title: "Profil Perusahaan", settings: "Pengaturan Profil",
      save: "Simpan Profil", saved: "✅ Tersimpan!",
      companyName: "Nama Perusahaan", emailLabel: "Email Institusi", locationLabel: "Lokasi",
      removalProjectLabel: "Proyek Penyerapan Karbon", entityTypeLabel: "Jenis Entitas / Perusahaan", bizTypeLabel: "Jenis Kegiatan Usaha",
      txCount: "Transaksi",
    },
    exit: {
      btn: "Keluar", title: "Keluar Aplikasi", desc: "Apa yang ingin Anda lakukan?",
      exitOnly: "Keluar Aplikasi", logout: "Keluar & Log Out",
      logoutDesc: "Anda akan kembali ke halaman pendaftaran.",
      cancelBtn: "Batal", noActiveTx: "Tidak ada transaksi aktif",
    },
    common: { save: "Simpan", cancel: "Batal", back: "← Kembali", loading: "Memproses...", confirm: "Konfirmasi", download: "Unduh", close: "Tutup", add: "Tambah", submit: "Kirim" },
  },
  tr: {
    flag: "🇹🇷", label: "Türkçe",
    nav: { home: "Ana Sayfa", absorb: "Karbon Tutulumu", market: "Karbon Borsası", calc: "Toplam Emisyon", verify: "Doğrula", profile: "Profil", tx: "İşlemler" },
    dash: {
      greeting: "Hoş geldiniz", tagline: "Geçerli · Gerçek Zamanlı · Dolandırıcılık İçermez",
      netCarbon: "Net Karbon", totalEm: "Toplam Emisyon", totalAbs: "Toplam Tutulum",
      credits: "Karbon Kredisi", creditsUSD: "Portföy Değeri",
      myProjects: "Karbon Tutulum Projeleri", seeAll: "Tüm arazileri gör →",
      units: { t: "tCO₂e", kt: "ktCO₂e", Mt: "MtCO₂e", kg: "kg CO₂e" }, unitLabel: "Birim",
      activeProjects: "Aktif Karbon Projeleri",
      projectStatus: { active: "Aktif", pending: "İşlemde", completed: "Tamamlandı" },
      progressLabel: "Doğrulama İlerlemesi",
      progressHelp: "Tutulum verilerinizin MRV sürecindeki ilerlemesini izler: veri girişi → sertifika yükleme → AI doğrulama → kredi hesaplama.",
      carbonCreditValue: "Karbon Kredi Değeri",
      journeyTitle: "Karbon Kredisi Yolculuğunuz",
      journeyStep1: "Adım 1: Emisyonlar menüsünde Toplam Emisyon (Kapsam 1–3) girin",
      journeyStep2: "Adım 2: Karbon Tutulumu menüsünde offset verilerini girin",
      journeyStep3: "Adım 3: Karbon Kredisi = Toplam Emisyon − Toplam Tutulum",
      alerts: "AI Tespiti ve Uyarılar",
      dismiss: "Kapat",
      dataTrust: "Veri Güven Düzeyi",
      dataTrustSub: "MRV doğrulamasında kullanılır",
      certQuick: "Sertifika",
      certQuickSub: "Karbon kredisi",
    },
    absorb: {
      subtitle: "Toplam tutulum, Net Karbon Kredisini hesaplamak için kullanılır",
      tabs: { green: "Yeşil Karbon", solar: "Güneş Paneli", biogas: "Biyogaz", blue: "Mavi Karbon" },
      certTitle: "Doğrulama Sertifikaları",
      certRequired: "aktif projeler için zorunlu",
      certEmission: "Emisyon Sertifikası",
      certSequestration: "Tutulum Sertifikası",
      certHint: "PDF veya görsel — ISO 14064 özeti",
      certBothUploaded: "Her iki sertifika yüklendi — projeler Ana Sayfada görünecek",
      saveSequestration: "Tutulumu Kaydet",
      saveSuccess: "Tutulum başarıyla kaydedildi!",
      goDashboard: "Ana Sayfaya Git →",
      calcCredit: "Karbon Kredisini Hesapla →",
      calcCreditNeedEmission: "Önce Emisyonlar menüsünden Toplam Emisyonu girin",
      solar: {
        title: "Güneş Paneli",
        desc: "Güneş elektriği şebeke talebini azaltır (Kapsam 2 dengelemesi).",
        panelCount: "Güneş paneli sayısı",
        panelUnit: "adet",
        capacity: "Kapasite",
        capacityUnit: "Wp",
        sunHours: "Etkin güneş saati",
        sunHoursLocked: "3,5 saat/gün (Endonezya ortalaması)",
        efficiency: "Verimlilik faktörü",
        efficiencyLocked: "0,75 (sabit)",
        outputWh: "Watt Saat (Wh)",
        outputKwh: "Kilo Watt Saat (kWh)",
        offsetMonthly: "aylık CO₂e dengelemesi",
      },
      green: { title: "Yeşil Karbon — Arazi / Orman", hint: "Üçüncü taraf doğrulanmış arazi veya orman tutulumunu girin." },
      biogas: { title: "Biyogaz / Biyojenik", hint: "Organik atıktan biyogaz fosil yakıtın yerini alır." },
      blue: { title: "Mavi Karbon — Deniz Biyotası", hint: "Kıyı mangrov, deniz çayırlığı, mercan resifi ve diğer deniz ekosistemlerinden tutulum." },
      totalSequestration: "Toplam Tutulum (tüm kategoriler)",
      perMonth: "aylık",
      perYear: "yıllık",
    },
    land: {
      title: "Karbon Emilimi — Arazi", addParcel: "Arazi Ekle",
      area: "Alan (ha)", type: "Arazi Tipi", name: "Arazi Adı",
      lat: "Enlem", lng: "Boylam", depth: "Turba Derinliği (m)",
      simulate: "Durum Simüle Et", viewAll: "Tüm Araziler",
      stockFormula: "Karbon Stok Formülü",
      types: { forest: "🌲 Orman", peatland: "🌾 Turbalık", mangrove: "🌴 Mangrov", seawater: "🌊 Deniz / Kıyı", agricultural: "🌱 Tarım", industrial: "🏭 Endüstriyel" },
      status: { healthy: "Sağlıklı", flooded: "Su Altında", degraded: "Bozulmuş", burned: "Yanmış", drying: "Kuruyan Turbalık" },
      alerts: {
        flooded: "🌊 SEL TESPİT EDİLDİ — Absorpsiyon azaldı, krediler askıya alındı.",
        degraded: "⚠️ BOZULMUŞ — Bitki örtüsü hasar gördü, rehabilitasyon gerekli.",
        peatland_degraded: "⚠️ TURBALIK BOZULDU — Aktif CO₂ & CH₄ kaynağına dönüştü.",
        burned: "🔥 YANGIN TESPİT EDİLDİ — Masif CO₂ & CH₄ emisyonu. Krediler iptal.",
        drying: "🌡️ TURBALIK KURUYOR — Kritik nem, yüksek emisyon riski."
      },
    },
    calc: {
      title: "Toplam Emisyon", scope1: "Kapsam 1 — Doğrudan",
      scope2: "Kapsam 2 — Dolaylı Enerji", scope3: "Kapsam 3 — Değer Zinciri",
      calculate: "Emisyonu Hesapla", totalEm: "Toplam Emisyon",
      offsetNeeded: "Gerekli Karbon Kredisi", leakage: "Tahmini Sızıntı",
      ref: "IPCC 2006 Temel Alınmıştır · Endonezya ESDM Emisyon Faktörü",
      breakdownTitle: "Kaynağa Göre Kırılım",
      method: "Hesaplama Yöntemi",
      methodOp: "Operasyonel Kontrol",
      methodEq: "Hisse Payı (Equity)",
      equityPct: "Hisse Payı (%)",
      ownershipCert: "Mülkiyet Sertifikası Yükle",
      ownershipHint: "PDF / JPG / PNG",
      ownershipReject: "Dosya reddedildi — PDF veya resim olmalı",
      aiMethodDesc: "CarbonTrust AI, NLP ve bilgisayarlı görü ile ISO 14064 sertifikasının 1 sayfalık özetini okur. Manuel emisyon girişlerinizi doğrulanmış sertifika verileriyle IPCC Tier 1–2 emisyon faktörleri, kütle dengesi ilkeleri ve belirsizlik yayılımı kullanarak çapraz kontrol eder. Uyuşmazlıklar Borsa erişiminden önce işaretlenir. Bu gelişmiş MRV teknolojisi blockchain olmadan dolandırıcılık önleme uyumluluğu sağlar.",
      ui: {
        scopeTabs: "Kapsam 1 · 2 · 3 · Toplam",
        notCalculated: "Toplam emisyon henüz hesaplanmadı",
        notCalculatedHint: "Kapsam 1, 2 ve 3 verilerini doldurun, ardından toplamı görmek için Emisyonu Hesapla'ya tıklayın.",
        startScope1: "Kapsam 1'den başla →",
        formulaTitle: "GHG Protocol Formülü (Quantis/WBCSD)",
        formula1: "GHG_i = Aktivite_i × EF_i",
        formula2: "Toplam = Σ Kapsam 1 + Σ Kapsam 2 + Σ Kapsam 3",
        distribution: "Emisyon Dağılımı",
        scopeBreakdown: "Kapsama göre kırılım — detay için dokunun",
        scopeDetail: "Kapsam {n} — Kaynak Kırılımı",
        subtotal: "Kapsam {n} Alt Toplamı",
        uncertaintyTitle: "Hesaplama Belirsizliği",
        uncertaintyDesc: "Pedigree Matrix (GHG Protocol) temel alınmıştır: belirsizlik kategoriye göre değişir.",
        leakageNote: "Kapsam 1 × %5 + Kapsam 3 × %10 (yer değiştirme etkisi)",
        recalculate: "← Yeniden Hesapla",
        lastResult: "Son sonuç",
        tapTotal: "Tam Toplam Emisyonu görmek için dokunun",
        emissionSources: "{n} emisyon kaynağı",
        seeDetail: "Kırılımı gör →",
        noEmission: "Kayıtlı emisyon yok",
        aiMethodTitle: "Kullanılan Yöntem — AI MRV",
        methodOpLabel: "Operasyonel / Aktivite",
        methodEqLabel: "Hisse Payı (Equity)",
        tonKmHint: "Toplam ton-kilometre (ton·km) = mesafe (km) × yük (ton) girin veya km ve tonu ayrı ayrı doldurun.",
        tonKmLoad: "Yük (ton)",
        journeyTitle: "Sonraki Adım: Karbon Tutulumu",
        journeyBody: "Emisyonlarınız hesaplandı. Net karbon kredinizi hesaplamak için Karbon Tutulumu sayfasına offset verilerinizi girin.",
        goSequestration: "Karbon Tutulumuna Git →",
        stayHere: "Bu sayfada kal",
        calculating: "Hesaplanıyor...",
        scopeInfo: {
          1: { label: "Kapsam 1 — Doğrudan Emisyonlar", sub: "Sabit yakma ve operasyonel taşımacılık" },
          2: { label: "Kapsam 2 — Satın Alınan Enerji", sub: "Şebeke elektriği (kWh) ve satın alınan enerji" },
          3: { label: "Kapsam 3 — Değer Zinciri", sub: "Nakliye, lojistik, seyahat ve atık" },
        },
      },
    },
    market: {
      title: "Karbon Piyasası", search: "Proje ara...",
      detail: "Detayları Gör", transact: "İşleme Başla",
      aiMatch: "AI Eşleştir", analyzing: "Uyumluluk analiz ediliyor...",
      score: "Uyumluluk Puanı", buyer: "Alıcı", seller: "Satıcı",
      proceed: "İşleme Devam Et →",
      recommend: "Sizin İçin Önerilenler",
      est500: "Tahmini 500 ton alım",
      eqArea: "eşdeğer hektar", renewableProj: "Yenilenebilir enerji projesi",
    },
    tx: {
      title: "İşlemler", new: "Yeni İşlem",
      stage0: "Sözleşme Oluşturuldu", stage1: "Fonlar Emanette (Escrow)",
      stage2: "Karbon Doğrulandı", stage3: "Fonlar Serbest Bırakıldı",
      confirmReceipt: "Alındığını Onayla",
      escrow: "Emanet Fonları (Escrow)", verified: "MRV Doğrulandı",
      volume: "Hacim", price: "Fiyat/ton", total: "Toplam",
      noTx: "Aktif işlem yok", noTxSub: "Market sayfasından işlem başlatın",
      status: "İşlem Durumu", complete: "İşlem Tamamlandı — Fonlar Serbest",
      active: "● Aktif", completed: "✓ Tamamlandı", inProgress: "● Devam ediyor",
      advanceDemo: "▶ Sonraki aşamaya geç (demo)",
      escrowNote: "B2B anlaşması MRV doğrulaması ile izlenir",
    },
    verify: { 
      title: "Doğrulama", download: "ISO 14064 Sertifikasını İndir", log: "ML · Uydu Günlüğü",
      satelliteView: "Uydu Görünümü — Arazi Sınırı", multiSite: "Çoklu Konum Uydu Görünümü",
      certDownloaded: "ISO 14064 Sertifikası İndirildi",
      isoUploadTitle: "ISO 14064 Doğrulama Sertifikası Yükle",
      isoUploadHint: "Doğrulama kurumundan ISO 14064 sertifikanızı yükleyin. Pazarda kredi sunmadan önce zorunludur.",
      isoUploadLabel: "ISO 14064 Sertifikası Yükle",
      isoUploadReject: "Dosya reddedildi — PDF veya JPG/PNG olmalı",
      submitVerify: "Doğrulama için Gönder",
      uploading: "Yükleniyor...",
    },
    profile: {
      title: "Şirket Profili", settings: "Ayarlar",
      save: "Profili Kaydet", saved: "✅ Kaydedildi!",
      companyName: "Şirket Adı", emailLabel: "Kurumsal E-posta", locationLabel: "Ofis Adresi",
      removalProjectLabel: "Karbon Giderme Projesi", entityTypeLabel: "Kurum / Şirket Türü", bizTypeLabel: "İş Faaliyet Türü",
      txCount: "İşlemler",
    },
    exit: {
      btn: "Çıkış", title: "Uygulamadan Çık", desc: "Ne yapmak istersiniz?",
      exitOnly: "Uygulamadan Çık", logout: "Çıkış Yap & Oturumu Kapat",
      logoutDesc: "Kayıt sayfasına döneceksiniz.",
      cancelBtn: "İptal", noActiveTx: "Aktif işlem yok",
    },
    common: { save: "Kaydet", cancel: "İptal", back: "← Geri", loading: "İşleniyor...", confirm: "Onayla", download: "İndir", close: "Kapat", add: "Ekle", submit: "Gönder" },
  },
  zh: {
    flag: "🇨🇳", label: "中文",
    nav: { home: "首页", absorb: "碳封存", market: "碳市场", calc: "总排放量", verify: "核查", profile: "企业", tx: "交易" },
    dash: {
      greeting: "欢迎回来", tagline: "有效 · 实时 · 无欺诈",
      netCarbon: "净碳余额", totalEm: "总排放量", totalAbs: "总封存量",
      credits: "碳信用", creditsUSD: "投资组合价值",
      myProjects: "碳封存项目", seeAll: "查看所有地块 →",
      units: { t: "tCO₂e", kt: "ktCO₂e", Mt: "MtCO₂e", kg: "kg CO₂e" }, unitLabel: "单位",
      activeProjects: "活跃碳项目",
      projectStatus: { active: "活跃", pending: "待处理", completed: "已完成" },
      progressLabel: "核查进度",
      progressHelp: "跟踪封存数据在MRV流程中的进度：数据录入 → 证书上传 → AI验证 → 信用计算。",
      carbonCreditValue: "碳信用价值",
      journeyTitle: "获取碳信用流程",
      journeyStep1: "步骤1：在排放菜单输入总排放量（范围1–3）",
      journeyStep2: "步骤2：在碳封存页面输入抵消数据",
      journeyStep3: "步骤3：碳信用 = 总排放量 − 总封存量",
      alerts: "AI检测与预警", dismiss: "关闭",
      dataTrust: "数据置信度", dataTrustSub: "用于MRV核查",
      certQuick: "证书", certQuickSub: "碳信用",
    },
    absorb: {
      subtitle: "总封存量用于计算净碳信用",
      tabs: { green: "绿色碳", solar: "太阳能板", biogas: "沼气", blue: "蓝碳" },
      certTitle: "核查证书", certRequired: "活跃项目必填",
      certEmission: "排放证书", certSequestration: "封存证书",
      certHint: "PDF或图片 — ISO 14064摘要",
      certBothUploaded: "两份证书已上传 — 项目将显示在首页",
      saveSequestration: "保存封存数据",
      saveSuccess: "封存数据保存成功！",
      goDashboard: "前往首页 →",
      calcCredit: "计算碳信用 →",
      calcCreditNeedEmission: "请先在排放菜单输入总排放量",
      solar: {
        title: "太阳能板", desc: "太阳能发电减少电网需求（范围2抵消）。",
        panelCount: "太阳能板数量", panelUnit: "块",
        capacity: "容量", capacityUnit: "Wp",
        sunHours: "有效日照小时数", sunHoursLocked: "3.5 小时/天（印尼平均值）",
        efficiency: "效率系数", efficiencyLocked: "0.75（固定）",
        outputWh: "瓦时 (Wh)", outputKwh: "千瓦时 (kWh)",
        offsetMonthly: "每月CO₂e抵消量",
      },
      green: { title: "绿色碳 — 土地/森林", hint: "输入经第三方核查的土地或森林封存量。" },
      biogas: { title: "沼气/生物源", hint: "有机废物沼气替代化石燃料。" },
      blue: { title: "蓝碳 — 海洋生物", hint: "来自红树林、海草、珊瑚礁等海洋生态系统的封存。" },
      totalSequestration: "总封存量（所有类别）",
      perMonth: "每月", perYear: "每年",
    },
    land: {
      title: "土地封存", addParcel: "添加地块",
      area: "面积 (ha)", type: "土地类型", name: "地块名称",
      lat: "纬度", lng: "经度", depth: "泥炭深度 (m)",
      simulate: "模拟条件", viewAll: "所有地块",
      stockFormula: "碳封存公式",
      types: { forest: "森林", peatland: "泥炭地", mangrove: "红树林", agricultural: "农业", industrial: "工业" },
      status: { healthy: "健康", flooded: "洪涝", degraded: "退化", burned: "火灾", drying: "泥炭干燥" },
      alerts: {
        flooded: "🌊 检测到洪涝 — 封存量急剧下降，碳信用暂停。",
        degraded: "⚠️ 退化 — 植被受损，需要修复。",
        peatland_degraded: "⚠️ 泥炭退化 — 成为活跃CO₂排放源。",
        burned: "🔥 检测到火灾 — 大量CO₂和CH₄排放，信用取消。",
        drying: "🌡️ 泥炭干燥 — 湿度下降，排放风险增加。",
      },
    },
    calc: {
      title: "排放计算器", scope1: "范围1 — 直接排放",
      scope2: "范围2 — 间接能源", scope3: "范围3 — 价值链",
      calculate: "计算排放量", totalEm: "总排放量",
      offsetNeeded: "所需碳信用", leakage: "泄漏估算",
      ref: "基于 IPCC 2006 · 印尼ESDM排放因子",
      breakdownTitle: "按来源明细",
      method: "计算方法", methodOp: "运营控制", methodEq: "股权份额",
      equityPct: "股权比例 (%)",
      ownershipCert: "上传所有权证书",
      ownershipHint: "股权文件 PDF/图片",
      ownershipReject: "文件被拒绝 — 必须为 PDF 或图片",
      aiMethodDesc: "CarbonTrust AI 使用 NLP 和计算机视觉读取 ISO 14064 证书摘要，并通过 IPCC 排放因子交叉验证您的手动输入。",
      ui: {
        scopeTabs: "范围 1 · 2 · 3 · 总计",
        notCalculated: "尚未计算总排放量",
        notCalculatedHint: "填写范围1、2、3数据后点击计算排放量。",
        startScope1: "从范围1开始 →",
        formulaTitle: "GHG Protocol 公式 (Quantis/WBCSD)",
        formula1: "GHG_i = 活动量_i × EF_i",
        formula2: "总计 = Σ 范围1 + Σ 范围2 + Σ 范围3",
        distribution: "排放分布",
        scopeBreakdown: "按范围明细 — 点击查看详情",
        scopeDetail: "范围 {n} — 来源明细",
        subtotal: "范围 {n} 小计",
        uncertaintyTitle: "计算不确定性",
        uncertaintyDesc: "基于 Pedigree Matrix (GHG Protocol)。",
        leakageNote: "范围1 × 5% + 范围3 × 10%",
        recalculate: "← 重新计算",
        lastResult: "最新结果",
        tapTotal: "点击查看完整总排放量",
        emissionSources: "{n} 个排放源",
        seeDetail: "查看明细 →",
        noEmission: "无排放记录",
        aiMethodTitle: "使用方法 — AI MRV",
        methodOpLabel: "运营/活动",
        methodEqLabel: "股权份额",
        tonKmHint: "输入总吨公里 (ton·km) = 距离 (km) × 载荷 (吨)。",
        tonKmLoad: "载荷 (吨)",
        journeyTitle: "下一步：碳封存",
        journeyBody: "排放量已计算。请在碳封存页面输入抵消数据以计算净碳信用。",
        goSequestration: "前往碳封存 →",
        stayHere: "留在此页",
        calculating: "计算中...",
        scopeInfo: {
          1: { label: "范围1 — 直接排放", sub: "固定燃烧与运营运输" },
          2: { label: "范围2 — 外购能源", sub: "电网电力 (kWh) 与外购能源" },
          3: { label: "范围3 — 价值链", sub: "货运、物流、差旅与废物" },
        },
      },
    },
    market: {
      title: "碳市场", search: "搜索项目、公司、国家...",
      detail: "查看详情", transact: "开始交易",
      aiMatch: "AI匹配", analyzing: "分析兼容性...",
      score: "兼容性得分", buyer: "买方", seller: "卖方",
      proceed: "继续交易 →", recommend: "为您推荐",
      est500: "500吨购买估算", eqArea: "公顷等效", renewableProj: "可再生能源项目",
    },
    tx: {
      title: "交易", new: "新交易",
      stage0: "协议已创建", stage1: "资金托管",
      stage2: "碳已验证", stage3: "资金释放",
      confirmReceipt: "确认收货",
      escrow: "托管金额", verified: "MRV已验证",
      volume: "数量", price: "价格/吨", total: "总计",
      noTx: "无活跃交易", noTxSub: "从市场页面开始交易",
      status: "交易状态", complete: "交易完成 — 资金已释放",
      active: "● 活跃", completed: "✓ 已完成", inProgress: "● 进行中",
      advanceDemo: "▶ 进入下一阶段 (演示)",
      escrowNote: "B2B协议通过MRV验证跟踪",
    },
    verify: {
      title: "MRV与验证", download: "下载 ISO 14064 证书", log: "ML · 卫星日志",
      satelliteView: "卫星视图 — 地块边界", multiSite: "多站点卫星视图",
      certDownloaded: "ISO 14064 证书已下载",
      isoUploadTitle: "上传 ISO 14064 核查证书",
      isoUploadHint: "上传核查机构的 ISO 14064 证书。在市场中出售信用额度前必填。",
      isoUploadLabel: "上传 ISO 14064 证书",
      isoUploadReject: "文件被拒绝 — 必须为 PDF 或 JPG/PNG",
      submitVerify: "提交核查",
      uploading: "上传中...",
    },
    profile: {
      title: "企业档案", settings: "档案设置",
      save: "保存档案", saved: "✅ 已保存！",
      companyName: "企业名称", emailLabel: "机构邮箱", locationLabel: "位置",
      removalProjectLabel: "碳去除项目", entityTypeLabel: "实体/企业类型", bizTypeLabel: "业务活动类型",
      txCount: "交易",
    },
    exit: {
      btn: "退出", title: "退出应用", desc: "您想做什么？",
      exitOnly: "退出应用", logout: "退出并注销",
      logoutDesc: "您将返回到注册页面。",
      cancelBtn: "取消", noActiveTx: "没有活跃交易",
    },
    common: { save: "保存", cancel: "取消", back: "← 返回", loading: "处理中...", confirm: "确认", download: "下载", close: "关闭", add: "添加", submit: "提交" },
  },
};

export const ALLOWED_LANGS = ["en", "id", "tr", "zh"];

export function readCarbonCredit() {
  try { return JSON.parse(localStorage.getItem("carbon_credit_result") || "null"); }
  catch { return null; }
}

export function readAbsorbResult() {
  try { return JSON.parse(localStorage.getItem("carbon_absorb_result") || "null"); }
  catch { return null; }
}

export function getActiveSequestrationProjects() {
  const data = readAbsorbResult();
  if (!data?.certificatesUploaded || !Array.isArray(data.projects)) return [];
  return data.projects.filter(p => p.amountTonYr > 0);
}

// ─── SCIENCE CONSTANTS ─────────────────────────────────────────────────────
export const ABS_RATES = {
  forest:       { healthy:8.5, flooded:3.2, degraded:1.5, burned:-50,  drying:0    },
  peatland:     { healthy:2.1, flooded:0.8, degraded:-15, burned:-120, drying:-25  },
  mangrove:     { healthy:11.4,flooded:4.5, degraded:2.0, burned:-30,  drying:0    },
  seawater:     { healthy: 14.0, flooded: 14.0, degraded: 5.0, burned: -20.0, drying: 0 },
  agricultural: { healthy:1.2, flooded:0.2, degraded:0.5, burned:-5,   drying:0    },
  industrial:   { healthy:0.0, flooded:0.0, degraded:0.0, burned:0,    drying:0    },
};

export function calcPeatAbsorption(area, humidity) {
  const h = parseNum(humidity) || 60;
  if (h >= 80) return roundCarbon((2.8 * parseNum(area)) / 12, 2);
  if (h >= 60) return roundCarbon((2.1 * parseNum(area)) / 12, 2);
  if (h >= 50) return roundCarbon((0.5 * parseNum(area)) / 12, 2);
  if (h >= 40) return roundCarbon((-5.0 * parseNum(area)) / 12, 2);
  if (h >= 30) return roundCarbon((-15 * parseNum(area)) / 12, 2);
  return roundCarbon((-25 * parseNum(area)) / 12, 2);
}

// Label tingkat risiko berdasarkan humidity gambut
export function peatHumidityRisk(humidity) {
  const h = parseFloat(humidity) || 60;
  if (h >= 80) return { label:"Sangat Basah",   color:"blue",   risk:"Rendah",   desc:"maksimal, risiko banjir perlu dipantau" };
  if (h >= 60) return { label:"Optimal",         color:"green",  risk:"Rendah",   desc:"Kondisi ideal, gambut menyerap CO₂ aktif" };
  if (h >= 50) return { label:"Mulai Kering",    color:"yellow", risk:"Sedang",   desc:"Serapan menurun, pantau muka air gambut" };
  if (h >= 40) return { label:"Kering",          color:"amber",  risk:"Tinggi",   desc:"Gambut mulai mengoksidasi, emit CO₂ kecil" };
  if (h >= 30) return { label:"Sangat Kering",   color:"orange", risk:"Kritis",   desc:"Emisi CO₂ & CH₄ aktif, rewetting segera" };
  return               { label:"Kritis / Kebakaran", color:"red", risk:"Ekstrem", desc:"Risiko kebakaran sangat tinggi, darurat" };
}

// Diesel density: 1 liter = 0.832 kg → EF 2.68 kg CO₂/liter (IPCC 2006)
// Solar/HSD conversion: input liter → auto convert to kg (×0.832) internally
// ─────────────────────────────────────────────────────────────────────────────
// EMISSION FACTORS (EF) — IPCC 2006 + ESDM Indonesia
// Semua nilai dalam kgCO₂e per unit yang tercantum di field "unit"
// Sumber: IPCC 2006 GL Vol.2 Energy, ESDM 2021, GHG Protocol, Defra 2023
// ─────────────────────────────────────────────────────────────────────────────
export const EF = {

  // ══════════════════════════════════════════════════════════════════════════
  // SCOPE 1 — DIRECT EMISSIONS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Stationary Combustion: BOILER ────────────────────────────────────────
  boilerCoal:        { ef:2.42,  unit:"kg",    scope:1, category:"stationary", source:"Boiler — Batubara" },
  boilerHSD:         { ef:2.68,  unit:"liter", scope:1, category:"stationary", source:"Boiler — Solar/Diesel (HSD)" },
  boilerIFO:         { ef:3.17,  unit:"liter", scope:1, category:"stationary", source:"Boiler — Fuel Oil (IFO/MFO)" },
  boilerKerosene:    { ef:2.54,  unit:"liter", scope:1, category:"stationary", source:"Boiler — Kerosene/Minyak Tanah" },
  boilerLPG:         { ef:3.00,  unit:"kg",    scope:1, category:"stationary", source:"Boiler — LPG" },
  boilerNatGas:      { ef:2.04,  unit:"m³",    scope:1, category:"stationary", source:"Boiler — Gas Alam (Natural Gas)" },
  boilerLNG:         { ef:2.75,  unit:"kg",    scope:1, category:"stationary", source:"Boiler — LNG" },
  boilerCNG:         { ef:2.69,  unit:"m³",    scope:1, category:"stationary", source:"Boiler — CNG" },

  // ── Stationary Combustion: GENSET ────────────────────────────────────────
  gensetCoal:        { ef:2.42,  unit:"kg",    scope:1, category:"stationary", source:"Genset — Batubara" },
  gensetHSD:         { ef:2.68,  unit:"liter", scope:1, category:"stationary", source:"Genset — Solar/Diesel (HSD)" },
  gensetIFO:         { ef:3.17,  unit:"liter", scope:1, category:"stationary", source:"Genset — Fuel Oil (IFO/MFO)" },
  gensetKerosene:    { ef:2.54,  unit:"liter", scope:1, category:"stationary", source:"Genset — Kerosene/Minyak Tanah" },
  gensetLPG:         { ef:3.00,  unit:"kg",    scope:1, category:"stationary", source:"Genset — LPG" },
  gensetNatGas:      { ef:2.04,  unit:"m³",    scope:1, category:"stationary", source:"Genset — Gas Alam (Natural Gas)" },
  gensetLNG:         { ef:2.75,  unit:"kg",    scope:1, category:"stationary", source:"Genset — LNG" },
  gensetCNG:         { ef:2.69,  unit:"m³",    scope:1, category:"stationary", source:"Genset — CNG" },

  // ── Stationary Combustion: FURNACE ───────────────────────────────────────
  furnaceCoal:       { ef:2.42,  unit:"kg",    scope:1, category:"stationary", source:"Furnace — Batubara" },
  furnaceHSD:        { ef:2.68,  unit:"liter", scope:1, category:"stationary", source:"Furnace — Solar/Diesel (HSD)" },
  furnaceIFO:        { ef:3.17,  unit:"liter", scope:1, category:"stationary", source:"Furnace — Fuel Oil (IFO/MFO)" },
  furnaceKerosene:   { ef:2.54,  unit:"liter", scope:1, category:"stationary", source:"Furnace — Kerosene/Minyak Tanah" },
  furnaceLPG:        { ef:3.00,  unit:"kg",    scope:1, category:"stationary", source:"Furnace — LPG" },
  furnaceNatGas:     { ef:2.04,  unit:"m³",    scope:1, category:"stationary", source:"Furnace — Gas Alam (Natural Gas)" },
  furnaceLNG:        { ef:2.75,  unit:"kg",    scope:1, category:"stationary", source:"Furnace — LNG" },
  furnaceCNG:        { ef:2.69,  unit:"m³",    scope:1, category:"stationary", source:"Furnace — CNG" },

  // ── Mobile Combustion: Kendaraan Penumpang (Light Duty) ──────────────────
  carPetrol:         { ef:0.171, unit:"km",    scope:1, category:"mobile", source:"Mobil Penumpang — Bensin (Car)" },
  carDiesel:         { ef:0.163, unit:"km",    scope:1, category:"mobile", source:"Mobil Penumpang — Diesel (Car)" },
  vanPetrol:         { ef:0.210, unit:"km",    scope:1, category:"mobile", source:"Van — Bensin" },
  vanDiesel:         { ef:0.195, unit:"km",    scope:1, category:"mobile", source:"Van — Diesel" },
  motorcycle:        { ef:0.103, unit:"km",    scope:1, category:"mobile", source:"Sepeda Motor (Motorcycle)" },

  // ── Mobile Combustion: Kendaraan Berat (Heavy Duty) ─────────────────────
  truck:             { ef:0.120, unit:"km",    scope:1, category:"mobile", source:"Truk Besar (>5 ton)" },
  trailer:           { ef:0.150, unit:"km",    scope:1, category:"mobile", source:"Trailer" },
  dumpTruck:         { ef:0.145, unit:"km",    scope:1, category:"mobile", source:"Dump Truck" },
  smallTruck:        { ef:0.085, unit:"km",    scope:1, category:"mobile", source:"Truk Kecil / Pick-up (<5 ton)" },
  busMobile:         { ef:0.089, unit:"km",    scope:1, category:"mobile", source:"Bus / Minibus" },

  // ── Mobile Combustion: Alat Berat (Off-road) ─────────────────────────────
  excavator:         { ef:2.68,  unit:"liter", scope:1, category:"offroad", source:"Excavator (Solar/HSD)" },
  bulldozer:         { ef:2.68,  unit:"liter", scope:1, category:"offroad", source:"Bulldozer (Solar/HSD)" },
  wheelLoader:       { ef:2.68,  unit:"liter", scope:1, category:"offroad", source:"Wheel Loader (Solar/HSD)" },

  // ── Mobile Combustion: Transportasi Khusus ───────────────────────────────
  aircraftOwned:     { ef:2.55,  unit:"km",    scope:1, category:"transport_special", source:"Pesawat (milik perusahaan)" },
  jetOwned:          { ef:3.10,  unit:"km",    scope:1, category:"transport_special", source:"Jet Pribadi (milik perusahaan)" },
  shipOwned:         { ef:0.015, unit:"ton·km",scope:1, category:"transport_special", source:"Kapal (milik perusahaan)" },
  locomotiveOwned:   { ef:0.030, unit:"ton·km",scope:1, category:"transport_special", source:"Lokomotif (milik perusahaan)" },

  // ── Scope 1: Fugitive Emissions ──────────────────────────────────────────
  // EF = GWP × annual leak rate (kg leaked = charge × units × leak_rate)
  // GWP bersumber IPCC AR5. Unit: kg refrigerant leaked
  fugR22:            { ef:1810,  unit:"kg",    scope:1, category:"fugitive", source:"Refrigerant R-22 (AC — GWP 1810)" },
  fugR410A:          { ef:2088,  unit:"kg",    scope:1, category:"fugitive", source:"Refrigerant R-410A (AC Split — GWP 2088)" },
  fugR134a:          { ef:1430,  unit:"kg",    scope:1, category:"fugitive", source:"Refrigerant R-134a (Kulkas — GWP 1430)" },
  fugR404A:          { ef:3922,  unit:"kg",    scope:1, category:"fugitive", source:"Refrigerant R-404A (Cold Storage — GWP 3922)" },
  fugR407C:          { ef:1774,  unit:"kg",    scope:1, category:"fugitive", source:"Refrigerant R-407C (GWP 1774)" },
  fugR32:            { ef:675,   unit:"kg",    scope:1, category:"fugitive", source:"Refrigerant R-32 (AC Inverter — GWP 675)" },
  fugSF6:            { ef:23500, unit:"kg",    scope:1, category:"fugitive", source:"SF₆ — Transformator / Switchgear (GWP 23500)" },

  // ── Scope 1: Process Emissions ───────────────────────────────────────────
  // EF = tonCO₂e per ton produk. Sumber: IPCC 2006 Vol.3 Industrial Processes
  processCement:     { ef:520,   unit:"ton",   scope:1, category:"process", source:"Produksi Semen — CO₂ (0.52 tCO₂/ton)" },
  processLime:       { ef:790,   unit:"ton",   scope:1, category:"process", source:"Produksi Kapur — CO₂ (0.79 tCO₂/ton)" },
  processSteel:      { ef:3148,  unit:"ton",   scope:1, category:"process", source:"Produksi Baja — CO₂ (3.148 tCO₂/ton)" },
  processAluminium:  { ef:2200,  unit:"ton",   scope:1, category:"process", source:"Produksi Aluminium — CO₂+CF₄+C₂F₆ (2.2 tCO₂e/ton)" },
  processAmmonia:    { ef:2000,  unit:"ton",   scope:1, category:"process", source:"Produksi Amonia — CO₂ (2.0 tCO₂/ton)" },
  processUrea:       { ef:400,   unit:"ton",   scope:1, category:"process", source:"Produksi Urea — CO₂ (0.4 tCO₂/ton)" },
  processOilGas:     { ef:2000,  unit:"ton",   scope:1, category:"process", source:"Oil & Gas Extraction — CO₂ (2.0 tCO₂/ton)" },
  processCoalMining: { ef:25000, unit:"ton",   scope:1, category:"process", source:"Penambangan Batubara — CH₄ (×25 GWP, per ton batubara)" },

  // ══════════════════════════════════════════════════════════════════════════
  // SCOPE 2 — INDIRECT ENERGY
  // ══════════════════════════════════════════════════════════════════════════

  // ── Listrik — GWP per grid/negara ────────────────────────────────────────
  elecIPCC:          { ef:0.850, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — IPCC Default (0.85 kgCO₂e/kWh)" },
  elecESdm:          { ef:0.870, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — ESDM Indonesia (0.87 kgCO₂e/kWh)" },
  elecUK:            { ef:0.207, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — UK Grid (0.207 kgCO₂e/kWh, Defra 2023)" },
  elecUS:            { ef:0.367, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — US Average Grid (0.367 kgCO₂e/kWh, EPA 2023)" },
  elecGermany:       { ef:0.380, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — Germany Grid (0.38 kgCO₂e/kWh)" },
  elecFrance:        { ef:0.052, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — France Grid (0.052 kgCO₂e/kWh)" },
  elecAustralia:     { ef:0.790, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — Australia Grid (0.79 kgCO₂e/kWh)" },
  elecJapan:         { ef:0.470, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — Japan Grid (0.47 kgCO₂e/kWh)" },
  elecChina:         { ef:0.581, unit:"kWh",   scope:2, category:"electricity", source:"Listrik — China Grid (0.581 kgCO₂e/kWh)" },

  // ── Uap / Steam ──────────────────────────────────────────────────────────
  steam:             { ef:74.14, unit:"GJ",    scope:2, category:"steam", source:"Purchased Steam (74.14 kgCO₂e/GJ, IPCC)" },
  chilledWater:      { ef:0.25,  unit:"ton",   scope:2, category:"steam", source:"Chilled Water (0.25 kgCO₂e/ton, estimasi)" },

  // ══════════════════════════════════════════════════════════════════════════
  // SCOPE 3 — VALUE CHAIN
  // ══════════════════════════════════════════════════════════════════════════

  // ── Purchased Goods & Services ───────────────────────────────────────────
  purchasedGoods:    { ef:300,   unit:"ton",   scope:3, category:"upstream_goods", source:"Purchased Goods & Services (avg 0.3 tCO₂e/ton)" },
  capitalGoods:      { ef:500,   unit:"unit",  scope:3, category:"upstream_goods", source:"Capital Goods (avg 0.5 tCO₂e/unit, estimasi)" },

  // ── Upstream Transport & Distribution ────────────────────────────────────
  freightRoad:       { ef:0.062, unit:"ton·km",scope:3, category:"freight_up", source:"Pengiriman Darat — Truk (0.062 kgCO₂e/ton·km)" },
  freightShip:       { ef:0.012, unit:"ton·km",scope:3, category:"freight_up", source:"Pengiriman Laut — Kapal (0.012 kgCO₂e/ton·km)" },
  freightRail:       { ef:0.028, unit:"ton·km",scope:3, category:"freight_up", source:"Pengiriman Kereta Api (0.028 kgCO₂e/ton·km)" },
  freightAir:        { ef:0.602, unit:"ton·km",scope:3, category:"freight_up", source:"Pengiriman Udara — Pesawat kargo (0.602 kgCO₂e/ton·km)" },
  freightRefrig:     { ef:0.110, unit:"ton·km",scope:3, category:"freight_up", source:"Pengiriman Berpendingin/Reefer (0.11 kgCO₂e/ton·km)" },

  // ── Downstream Transport & Distribution ──────────────────────────────────
  dfreightRoad:      { ef:0.062, unit:"ton·km",scope:3, category:"freight_down", source:"Distribusi Darat — Truk" },
  dfreightShip:      { ef:0.012, unit:"ton·km",scope:3, category:"freight_down", source:"Distribusi Laut — Kapal" },
  dfreightRail:      { ef:0.028, unit:"ton·km",scope:3, category:"freight_down", source:"Distribusi Kereta Api" },
  dfreightAir:       { ef:0.602, unit:"ton·km",scope:3, category:"freight_down", source:"Distribusi Udara — Pesawat" },
  dfreightRefrig:    { ef:0.110, unit:"ton·km",scope:3, category:"freight_down", source:"Distribusi Berpendingin/Reefer" },

  // ── Business Travel ──────────────────────────────────────────────────────
  bizTravelAir:      { ef:0.255, unit:"km",    scope:3, category:"travel", source:"Perjalanan Bisnis — Pesawat (avg 0.255 kgCO₂e/km)" },
  bizTravelTrain:    { ef:0.041, unit:"km",    scope:3, category:"travel", source:"Perjalanan Bisnis — Kereta Api" },
  bizTravelCarRental:{ ef:0.171, unit:"km",    scope:3, category:"travel", source:"Perjalanan Bisnis — Mobil Sewaan/Pribadi" },
  bizTravelBus:      { ef:0.089, unit:"km",    scope:3, category:"travel", source:"Perjalanan Bisnis — Bus/Transportasi Umum" },

  // ── Employee Commuting ───────────────────────────────────────────────────
  commutePrivateCar: { ef:0.171, unit:"km",    scope:3, category:"commute", source:"Komuter — Mobil Pribadi" },
  commuteMotorcycle: { ef:0.103, unit:"km",    scope:3, category:"commute", source:"Komuter — Sepeda Motor" },
  commutePublicBus:  { ef:0.089, unit:"km",    scope:3, category:"commute", source:"Komuter — Bus/Transportasi Umum" },

  // ── Waste Generated in Operations ────────────────────────────────────────
  wasteLandfill:     { ef:500,   unit:"ton",   scope:3, category:"waste", source:"Limbah — Dibuang ke TPA (Landfill)" },
  wasteIncineration: { ef:430,   unit:"ton",   scope:3, category:"waste", source:"Limbah — Insinerasi" },
  wasteRecycled:     { ef:20,    unit:"ton",   scope:3, category:"waste", source:"Limbah — Didaur Ulang" },
  wasteCompost:      { ef:10,    unit:"ton",   scope:3, category:"waste", source:"Limbah — Kompos" },

  // ── Use of Sold Products & End-of-Life ───────────────────────────────────
  useSoldProducts:   { ef:500,   unit:"unit",  scope:3, category:"downstream_use", source:"Penggunaan Produk Terjual (avg estimasi)" },
  eolSoldProducts:   { ef:300,   unit:"ton",   scope:3, category:"downstream_use", source:"End-of-Life Produk Terjual" },
};

// ─────────────────────────────────────────────────────────────────────────────
// EF_LABELS — label ringkas untuk tampilan di UI CalcPage
// ─────────────────────────────────────────────────────────────────────────────
export const EF_LABELS = {
  // Stationary
  boilerCoal:"Boiler — Batubara", boilerHSD:"Boiler — Solar/HSD", boilerIFO:"Boiler — IFO/MFO",
  boilerKerosene:"Boiler — Kerosene", boilerLPG:"Boiler — LPG", boilerNatGas:"Boiler — Gas Alam",
  boilerLNG:"Boiler — LNG", boilerCNG:"Boiler — CNG",
  gensetCoal:"Genset — Batubara", gensetHSD:"Genset — Solar/HSD", gensetIFO:"Genset — IFO/MFO",
  gensetKerosene:"Genset — Kerosene", gensetLPG:"Genset — LPG", gensetNatGas:"Genset — Gas Alam",
  gensetLNG:"Genset — LNG", gensetCNG:"Genset — CNG",
  furnaceCoal:"Furnace — Batubara", furnaceHSD:"Furnace — Solar/HSD", furnaceIFO:"Furnace — IFO/MFO",
  furnaceKerosene:"Furnace — Kerosene", furnaceLPG:"Furnace — LPG", furnaceNatGas:"Furnace — Gas Alam",
  furnaceLNG:"Furnace — LNG", furnaceCNG:"Furnace — CNG",
  // Mobile light duty
  carPetrol:"Mobil — Bensin", carDiesel:"Mobil — Diesel",
  vanPetrol:"Van — Bensin", vanDiesel:"Van — Diesel",
  motorcycle:"Sepeda Motor",
  // Mobile heavy duty
  truck:"Truk Besar (>5 ton)", trailer:"Trailer", dumpTruck:"Dump Truck",
  smallTruck:"Truk Kecil / Pick-up", busMobile:"Bus / Minibus",
  // Off-road
  excavator:"Excavator", bulldozer:"Bulldozer", wheelLoader:"Wheel Loader",
  // Special transport
  aircraftOwned:"Pesawat (milik perusahaan)", jetOwned:"Jet Pribadi",
  shipOwned:"Kapal (milik perusahaan)", locomotiveOwned:"Lokomotif",
  // Fugitive
  fugR22:"AC — R-22 (GWP 1810)", fugR410A:"AC Split — R-410A (GWP 2088)",
  fugR134a:"Kulkas — R-134a (GWP 1430)", fugR404A:"Cold Storage — R-404A (GWP 3922)",
  fugR407C:"R-407C (GWP 1774)", fugR32:"AC Inverter — R-32 (GWP 675)",
  fugSF6:"SF₆ — Trafo/Switchgear (GWP 23500)",
  // Process
  processCement:"Produksi Semen", processLime:"Produksi Kapur",
  processSteel:"Produksi Baja", processAluminium:"Produksi Aluminium",
  processAmmonia:"Produksi Amonia", processUrea:"Produksi Urea",
  processOilGas:"Oil & Gas Extraction", processCoalMining:"Penambangan Batubara (CH₄)",
  // Scope 2
  elecIPCC:"Listrik — IPCC Default", elecESdm:"Listrik — ESDM Indonesia",
  elecUK:"Listrik — UK", elecUS:"Listrik — US",
  elecGermany:"Listrik — Jerman", elecFrance:"Listrik — Prancis",
  elecAustralia:"Listrik — Australia", elecJapan:"Listrik — Jepang",
  elecChina:"Listrik — China",
  steam:"Uap/Steam Beli (GJ)", chilledWater:"Chilled Water (ton)",
  // Scope 3 goods
  purchasedGoods:"Barang & Jasa Dibeli", capitalGoods:"Barang Modal",
  // Freight upstream
  freightRoad:"Pengiriman Darat", freightShip:"Pengiriman Laut",
  freightRail:"Pengiriman Kereta", freightAir:"Pengiriman Udara",
  freightRefrig:"Pengiriman Berpendingin",
  // Freight downstream
  dfreightRoad:"Distribusi Darat", dfreightShip:"Distribusi Laut",
  dfreightRail:"Distribusi Kereta", dfreightAir:"Distribusi Udara",
  dfreightRefrig:"Distribusi Berpendingin",
  // Travel
  bizTravelAir:"Perjalanan Bisnis — Pesawat", bizTravelTrain:"Perjalanan Bisnis — Kereta",
  bizTravelCarRental:"Perjalanan Bisnis — Mobil", bizTravelBus:"Perjalanan Bisnis — Bus",
  // Commuting
  commutePrivateCar:"Komuter — Mobil Pribadi", commuteMotorcycle:"Komuter — Motor",
  commutePublicBus:"Komuter — Bus Umum",
  // Waste
  wasteLandfill:"Limbah — TPA", wasteIncineration:"Limbah — Insinerasi",
  wasteRecycled:"Limbah — Daur Ulang", wasteCompost:"Limbah — Kompos",
  // Downstream use
  useSoldProducts:"Penggunaan Produk Terjual", eolSoldProducts:"End-of-Life Produk",
  // Renewable
  renewWoodWaste:"Kayu / Wood Waste", renewBlackLiquor:"Black Liquor",
  renewSolidBiomass:"Solid Biomass", renewCharcoal:"Charcoal/Arang",
  renewBiogasoline:"Biogasoline", renewBiodiesel:"Biodiesel",
  renewLiquidBiofuel:"Liquid Biofuel lainnya", renewLandfillGas:"Landfill Gas",
  renewSludgeGas:"Sludge Gas", renewOtherBiogas:"Biogas lainnya",
  renewMuniWaste:"Municipal Waste (biomassa)", renewPeat:"Gambut/Peat",
};

// ─────────────────────────────────────────────────────────────────────────────
// EF_CATEGORIES — label grup untuk grouping di CalcPage
// ─────────────────────────────────────────────────────────────────────────────
export const EF_CATEGORIES = {
  stationary:      "Pembakaran Stasioner (Boiler / Genset / Furnace)",
  mobile:          "Kendaraan Penumpang & Berat",
  offroad:         "Alat Berat (Off-road)",
  transport_special:"Transportasi Khusus (Pesawat / Kapal / Lokomotif)",
  fugitive:        "Emisi Fugitif (Refrigeran & Gas)",
  process:         "Emisi Proses Industri",
  electricity:     "Listrik yang Dibeli",
  steam:           "Uap / Chilled Water",
  upstream_goods:  "Barang & Jasa Hulu",
  freight_up:      "Pengiriman Upstream",
  freight_down:    "Distribusi Downstream",
  travel:          "Perjalanan Bisnis",
  commute:         "Komuter Karyawan",
  waste:           "Limbah Operasional",
  downstream_use:  "Penggunaan & End-of-Life Produk",
};

export const EF_CATEGORIES_EN = {
  stationary:       "Stationary Combustion (Boiler / Genset / Furnace)",
  mobile:           "Passenger & Heavy Vehicles",
  offroad:          "Off-road Equipment",
  transport_special:"Special Transport (Aircraft / Ship / Locomotive)",
  fugitive:         "Fugitive Emissions (Refrigerants & Gas)",
  process:          "Industrial Process Emissions",
  electricity:      "Purchased Electricity",
  steam:            "Steam / Chilled Water",
  upstream_goods:   "Purchased Goods & Services",
  freight_up:       "Upstream Freight",
  freight_down:     "Downstream Distribution",
  travel:           "Business Travel",
  commute:          "Employee Commuting",
  waste:            "Operational Waste",
  downstream_use:   "Product Use & End-of-Life",
};

export function getEfCategories(lang) {
  if (lang === "en") return EF_CATEGORIES_EN;
  return EF_CATEGORIES;
}

export function getLocale(lang) {
  if (lang === "id") return "id-ID";
  if (lang === "tr") return "tr-TR";
  if (lang === "zh") return "zh-CN";
  return "en-US";
}

/** Parse numeric input — accepts comma or dot decimal separators. */
export function parseNum(val) {
  if (val == null || val === "") return 0;
  const n = parseFloat(String(val).trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Consistent rounding for carbon calculations (avoids floating-point drift). */
export function roundCarbon(n, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(n) + Number.EPSILON) * factor) / factor;
}

export const SOLAR_SUN_HOURS = 3.5;
export const SOLAR_EFFICIENCY = 0.75;

/** Solar panel energy: Wh = panels × Wp × 3.5 × 0.75; kWh = Wh / 1000 */
export function calcSolarEnergy(panelCount, capacityWp) {
  const panels = parseNum(panelCount);
  const wp = parseNum(capacityWp);
  const wh = roundCarbon(panels * wp * SOLAR_SUN_HOURS * SOLAR_EFFICIENCY, 2);
  const kwh = roundCarbon(wh / 1000, 4);
  return { wh, kwh };
}

/** Build a minimal valid PDF blob from plain text lines. */
export function buildTextPdfBlob(lines) {
  const escapePdf = (s) => String(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const textLines = Array.isArray(lines) ? lines : String(lines).split("\n");
  const streamBody = ["BT", "/F1 10 Tf", "14 TL", "50 780 Td"];
  textLines.forEach((line, i) => {
    if (i > 0) streamBody.push("T*");
    streamBody.push(`(${escapePdf(line)}) Tj`);
  });
  streamBody.push("ET");
  const stream = streamBody.join("\n");
  const streamLen = new TextEncoder().encode(stream).length;
  const objects = [
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj",
    `4 0 obj<</Length ${streamLen}>>stream\n${stream}\nendstream endobj`,
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const CARBON_DATA_EVENT = "carbon-data-update";
export const CALC_DRAFT_KEY = "carbon_calc_draft";
export const ABSORB_DRAFT_KEY = "carbon_absorb_draft";

export function dispatchCarbonDataUpdate() {
  window.dispatchEvent(new Event(CARBON_DATA_EVENT));
}

// ─── UTILS ─────────────────────────────────────────────────────────────────
export function calcAbsorption(p) {
  // Gambut dengan data humidity → pakai model matematis (#24)
  if (p.type === "peatland" && p.humidity != null && p.status === "healthy") {
    return calcPeatAbsorption(p.area, p.humidity);
  }
  const r = ABS_RATES[p.type]?.[p.status] ?? 0;
  return roundCarbon((r * parseNum(p.area)) / 12, 2);
}
export function convertUnit(val, unit) {
  const v = parseNum(val);
  if (unit === "kg") return roundCarbon(v * 1000, 0);
  if (unit === "kt") return roundCarbon(v / 1000, 3);
  if (unit === "Mt") return roundCarbon(v / 1000000, 6);
  return v;
}

// ─── HOOKS ─────────────────────────────────────────────────────────────────
export function useInterval(cb, delay) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; }, [cb]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => ref.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
export function useApi(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    apiFetch(path).then(fetchData => { setData(fetchData); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, refresh: () => apiFetch(path).then(setData) };
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
export const MOCK_PARCELS = [
  { id:"LP-001",name:"Borneo Forest Block A",  type:"forest",   area:450,status:"healthy", ndvi:0.78,lat:-1.24,lng:113.92,absorptionMonthly:318.75 },
  { id:"LP-002",name:"Riau Peatland B",         type:"peatland", area:320,status:"degraded",ndvi:0.31,lat:0.52,lng:101.45,absorptionMonthly:-400.0 },
  { id:"LP-003",name:"Sumatra Mangrove Coast",  type:"mangrove", area:85, status:"flooded", ndvi:0.55,lat:-5.38,lng:105.27,absorptionMonthly:31.88 },
];
export const MOCK_COMPANY = { id:"COMP-001",name:"PT. Nusantara Hijau Tbk",email:"contact@nusantarahijau.co.id",entity:"PT Tbk",bizType:"Manufacturing & Plantation",location:"South Jakarta, Indonesia",verified:false,totalTransactions:14,removalProject:"REDD+ Kalimantan A" };
export const MOCK_ALERTS = [];
export const MOCK_PROJECTS = [
  { id:"PRJ-001",company:"Borneo Green Alliance",country:"Indonesia",flag:"🇮🇩",price:18.5,available:3200,type:"Reforestation",verified:true,rating:4.9,ndvi:0.78,absRate:8.5, isLocked: false },
  { id:"PRJ-002",company:"Mekong Solar Co.",country:"Vietnam",flag:"🇻🇳",price:14.2,available:1800,type:"Renewable Energy",verified:true,rating:4.7,ndvi:null,absRate:0, isLocked: false },
  { id:"PRJ-003",company:"Sumatra Peat Restore",country:"Indonesia",flag:"🇮🇩",price:16.8,available:900,type:"Peat Restoration",verified:true,rating:4.6,ndvi:0.61,absRate:2.1, isLocked: false },
  { id:"PRJ-004",company:"Amazon Blue Carbon Ltd",country:"Brazil",flag:"🇧🇷",price:22.0,available:950,type:"Blue Carbon",verified:false,rating:4.8,ndvi:0.72,absRate:11.4, isLocked: false },
];

export function lockProject(id) {
  const proj = MOCK_PROJECTS.find(proj => proj.id === id);
  if (proj) proj.isLocked = true;
}
// ─── SHARED UI ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-lg" : "max-w-md"} max-h-[90vh] overflow-y-auto fade-up`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function SBadge({ status, t }) {
  const C = { healthy:"bg-emerald-100 text-emerald-700",flooded:"bg-blue-100 text-blue-700",degraded:"bg-amber-100 text-amber-700",burned:"bg-red-100 text-red-700",drying:"bg-orange-100 text-orange-700" };
  const label = t?.land?.status?.[status] || status;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${C[status]||"bg-gray-100 text-gray-600"}`}>{label}</span>;
}

export function Spinner() {
  return <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full spin" />;
}

export function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  const bg = type === "error" ? "bg-red-600" : type === "info" ? "bg-slate-800" : "bg-emerald-600";
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 pointer-events-none">
      <div className={`${bg} text-white rounded-xl px-4 py-3 shadow-lg text-sm font-semibold text-center fade-up flex items-center justify-between gap-2 pointer-events-auto`}>
        <span className="flex-1">{message}</span>
        {onClose && (
          <button onClick={onClose} className="text-white/80 hover:text-white text-xs shrink-0">✕</button>
        )}
      </div>
    </div>
  );
}

export function SparkLine({ data, color = "#22c55e", h = 36 }) {
  if (!data || data.length < 2) return null;
  const mx = Math.max(...data), mn = Math.min(...data), rng = mx - mn || 1, W = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height: h }}>
      <defs><linearGradient id={`sg${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3" /><stop offset="100%" stopColor={color} stopOpacity=".02" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${W},${h}`} fill={`url(#sg${color.slice(1)})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── LOGO ──────────────────────────────────────────────────────────────────
export function Logo({ size = 38 }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo_depan.svg" alt="Logo CarbonTrust"
        style={{ width: size, height: size }}
        className="object-contain rounded-lg dark:brightness-110" />
      <div>
        <div className="leading-none">
          <span className="font-black text-green-700 dark:text-green-400" style={{ fontSize: "1.05rem", letterSpacing: "-0.02em" }}>Carbon</span>
          <span className="font-black text-teal-600 dark:text-teal-400" style={{ fontSize: "1.05rem", letterSpacing: "-0.02em" }}>Trust</span>
        </div>
        <div className="text-green-600 dark:text-green-500 font-semibold" style={{ fontSize: "7.5px", letterSpacing: "0.14em", marginTop: "1px" }}>
          VALID · REAL-TIME · FRAUD-FREE
        </div>
      </div>
    </div>
  );
}

// ─── ICONS ─────────────────────────────────────────────────────────────────
export const Ic = {
  Home:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>,
  Market:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.8 14L5.2 5H2V3h4.3l.8 3h11.1l-2.4 8H7.8z" /></svg>,
  Calc:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3h2v2h-2V6zm0 4h2v2h-2v-2zM7 6h2v2H7V6zm0 4h2v2H7v-2zm-1 6v-2h8v2H6zm10 0h-2v-2h2v2zm0-4h-2v-2h2v2z" /></svg>,
  Land:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" /></svg>,
  Verify:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>,
  Profile:  () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  Bell:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>,
  Globe:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>,
  Bot:      () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7 9h10v7H7V9zm3.5 3c-.83 0-1.5-.67-1.5-1.5S9.67 9 10.5 9s1.5.67 1.5 1.5S11.33 12 10.5 12zm3 0c-.83 0-1.5-.67-1.5-1.5S12.67 9 13.5 9s1.5.67 1.5 1.5S14.33 12 13.5 12z" /></svg>,
  Shield:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>,
  Check:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>,
  Chain:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>,
  Dl:       () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>,
  Star:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" /></svg>,
  Leaf:     ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 5.5-11 4z" /></svg>,
  Absorb:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 5.5-11 4z"/></svg>,
  Tx:       () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" /></svg>,
  Chart:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" /></svg>,
  Map:      () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" /></svg>,
  Plus:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>,
  Info:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>,
  Exit:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
};

// ─── LANG SELECTOR ─────────────────────────────────────────────────────────
export function LangSel({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const t = TR[lang] ?? TR["en"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(isOpen => !isOpen)}
        className="flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-xl text-green-700 font-bold hover:bg-green-100">
        <Ic.Globe />{t.flag} <span className="hidden sm:inline">{t.label}</span> ▾
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-36">
          {ALLOWED_LANGS.map(langCode => (
            <button key={langCode} onClick={() => { setLang(langCode); setOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-gray-50 ${lang === langCode ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"}`}>
              <span>{TR[langCode].flag}</span><span>{TR[langCode].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HEADER ────────────────────────────────────────────────────────────────
export function Header({ alerts, onDismiss, lang, setLang, t, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const crit = alerts.filter(alertItem => alertItem.type !== "info").length;
  return (
    <header className="sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-slate-700"
      style={{ background: "var(--ct-header)" }}>
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
        <Logo size={36} />
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <LangSel lang={lang} setLang={setLang} />
          <button onClick={() => setOpen(true)}
            className="relative w-9 h-9 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">
            <Ic.Bell />
            {crit > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{crit}</span>}
          </button>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={`🔔 ${t.dash?.alerts || "Alerts"}`}>
        <div className="flex flex-col gap-3">
          {alerts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">{t.dash?.noAlerts || "No active alerts"}</p>}
          {alerts.map(alertItem => (
            <div key={alertItem.id} className={`flex items-start gap-3 p-3 rounded-xl ${alertItem.type === "critical" ? "bg-red-50" : alertItem.type === "warning" ? "bg-amber-50" : "bg-green-50"}`}>
              <span className="text-lg">{alertItem.type === "critical" ? "🚨" : alertItem.type === "warning" ? "⚠️" : "✅"}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">{alertItem.parcelId}</p>
                <p className="text-xs text-gray-600">{alertItem.message}</p>
                <p className="text-xs text-gray-400">{new Date(alertItem.time).toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => onDismiss(alertItem.id)}
                className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:bg-black/10 hover:text-gray-600 text-xs flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </header>
  );
}

// ─── BOTTOM NAV ────────────────────────────────────────────────────────────
export function BottomNav({ page, setPage, t }) {
  const items = [
    { id: "home",   ic: "Home",    l: t.nav.home },
    { id: "calc",   ic: "Calc",    l: t.nav.calc },
    { id: "absorb", ic: "Absorb",  l: t.nav.absorb || "Serapan" },
    { id: "market", ic: "Market",  l: t.nav.market },
    { id: "profile",ic: "Profile", l: t.nav.profile },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 dark:border-slate-700 shadow-lg"
      style={{ background: "var(--ct-header)" }}>
      <div className="max-w-md mx-auto flex">
        {items.map(item => {
          const active = page === item.id;
          const IC = Ic[item.ic];
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${active ? "text-green-700" : "text-gray-400 hover:text-gray-600"}`}>
              <div className={`p-1 rounded-xl transition-all ${active ? "bg-green-50 scale-110" : ""}`}><IC /></div>
              <span className="text-xs font-semibold">{item.l}</span>
              {active && <span className="w-4 h-0.5 rounded-full bg-green-600" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}