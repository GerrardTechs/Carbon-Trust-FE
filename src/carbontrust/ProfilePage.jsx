/**
 * CarbonTrust — ProfilePage.jsx
 * Company profile: kuesioner emisi, ESG score, blockchain wallet,
 * virtual tree, exit modal.
 *
 * Props baru:
 *   qStatus       — { isComplete, lastUpdated, resetCount, answers }
 *   updateQStatus — fn(newStatus) untuk update state kuesioner di App.jsx
 */

import { useState } from "react";
import { API, apiFetch, MOCK_PROJECTS, Modal, Ic } from "./shared.jsx";

// ─── Data kuesioner inline (atau ganti dengan: import qData from "./quisioner.json") ───
const Q_DATA = {
  sections: [
    {
      section: "🏭 Emisi Langsung (Scope 1)",
      questions: [
        { label: "Konsumsi Bahan Bakar Diesel (liter/tahun)", type: "number", key: "diesel" },
        { label: "Konsumsi Bahan Bakar Bensin (liter/tahun)", type: "number", key: "petrol" },
        { label: "Konsumsi LPG (kg/tahun)", type: "number", key: "lpg" },
        { label: "Konsumsi Gas Alam (m³/tahun)", type: "number", key: "naturalGas" },
        { label: "Konsumsi Batu Bara (kg/tahun)", type: "number", key: "coal" },
        { label: "Refrigeran / AC (kg/tahun)", type: "number", key: "refrigerant" },
      ],
    },
    {
      section: "⚡ Emisi Tidak Langsung (Scope 2)",
      questions: [
        { label: "Konsumsi Listrik PLN (kWh/tahun)", type: "number", key: "electricity" },
        { label: "Pembelian Panas / Steam (kWh/tahun)", type: "number", key: "heatSteam" },
      ],
    },
    {
      section: "🔗 Emisi Rantai Nilai (Scope 3)",
      questions: [
        { label: "Perjalanan Dinas (km/tahun)", type: "number", key: "bizTravel" },
        { label: "Komuting Karyawan (km/tahun)", type: "number", key: "commuting" },
        { label: "Pengiriman Barang (ton·km/tahun)", type: "number", key: "transport" },
        { label: "Limbah Operasional (kg/tahun)", type: "number", key: "waste" },
        {
          label: "Sektor Utama Perusahaan",
          type: "dropdown",
          key: "sector",
          options: ["Manufacturing", "Plantation", "Mining", "Energy", "Transportation", "Construction", "Finance", "Technology", "Healthcare", "Other"],
        },
      ],
    },
  ],
};

export function ProfilePage({ company, setCompany, t, lang, onLogout, onExit, qStatus, updateQStatus, companyId }) {
  console.log("ProfilePage t:", t);
  console.log("ProfilePage onExit:", onExit);
  // ── Modal states ──────────────────────────────────────────────────────────
  const [settingsModal, setSettingsModal] = useState(false);
  const [esgModal,      setEsgModal]      = useState(false);
  const [walletModal,   setWalletModal]   = useState(false);
  const [exitModal,     setExitModal]     = useState(false);

  // ── ESG Assessment ────────────────────────────────────────────────────────
  const [esgStep,       setEsgStep]       = useState(0);
  const [esgAnswers,    setEsgAnswers]    = useState([]);
  const [esgSubmitting, setEsgSubmitting] = useState(false);

  // ── Settings form ─────────────────────────────────────────────────────────
  const [form,  setForm]  = useState({ ...company });
  const [saved, setSaved] = useState(false);

  // ── Virtual tree ──────────────────────────────────────────────────────────
  const [txCount, setTxCount] = useState(company?.totalTransactions || 14);
  const [glowing, setGlowing] = useState(false);

  // ── Questionnaire local answers ───────────────────────────────────────────
  const [qAnswers, setQAnswers] = useState(qStatus?.answers || {});

  // ── Multi-asset: Lahan & Perusahaan ───────────────────────────────────────
  const [assetTab,      setAssetTab]      = useState("company"); // "company" | "land"
  const [assetModal,    setAssetModal]    = useState(false);
  const [assetEditItem, setAssetEditItem] = useState(null);
  const [myCompanies,   setMyCompanies]   = useState([
    { id: "c1", name: company?.name || "PT. Anda", type: company?.entity || "PT", bizType: company?.bizType || "Manufacturing", location: company?.location || "-", isMain: true },
  ]);
  const [myLands,  setMyLands]  = useState([]);
  const [assetForm, setAssetForm] = useState({});

  function openAddAsset() { setAssetEditItem(null); setAssetForm({}); setAssetModal(true); }
  function openEditAsset(item) { setAssetEditItem(item); setAssetForm({ ...item }); setAssetModal(true); }

  function saveAsset() {
    if (!assetForm.name) return;
    if (assetTab === "company") {
      if (assetEditItem) {
        setMyCompanies(prev => prev.map(comp => comp.id === assetEditItem.id ? { ...comp, ...assetForm } : comp));
      } else {
        setMyCompanies(prev => [...prev, { ...assetForm, id: "comp" + Date.now(), isMain: false }]);
      }
    } else {
      if (assetEditItem) {
        setMyLands(prev => prev.map(landItem => landItem.id === assetEditItem.id ? { ...landItem, ...assetForm } : l));
      } else {
        setMyLands(prev => [...prev, { ...assetForm, id: "l" + Date.now() }]);
      }
    }
    setAssetModal(false);
  }

  function deleteAsset(id) {
    if (assetTab === "company") setMyCompanies(prev => prev.filter(comp => comp.id !== id || comp.isMain));
    else setMyLands(prev => prev.filter(land => land.id !== id));
  }

  // ─── Cooldown logic: 3 bulan (90 hari), reset gratis 1x ──────────────────
  const getCooldown = () => {
    if (!qStatus?.isComplete)       return { canEdit: true };
    if ((qStatus?.resetCount || 0) <= 1) return { canEdit: true };
    const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;
    const remaining = new Date(qStatus.lastUpdated).getTime() + THREE_MONTHS - Date.now();
    return {
      canEdit:  remaining <= 0,
      daysLeft: Math.ceil(remaining / (1000 * 60 * 60 * 24)),
    };
  };
  const cd = getCooldown();

  // ---- tambah state ------------
  const [isoCert, setIsoCert]     = useState(null);
  const [certError, setCertError] = useState("");
  const [isoVerified, setIsoVerified] = useState(false);
  const [isoUploading, setIsoUploading] = useState(false);

function handleIsoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    setCertError("File ditolak — harus PDF atau JPG/PNG");
    setIsoCert(null);
    return;
  }
  setIsoCert(file);
  setCertError("");
}

async function submitIso() {
  if (!isoCert || !companyId) return;
  try {
    setIsoUploading(true);
    const session = JSON.parse(localStorage.getItem("carbon_session") || "{}");
    const fd = new FormData();
    fd.append("isoCert", isoCert);
    const res = await fetch(`${API}/company/${companyId}/upload-iso`, {
      method: "POST",
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      body: fd,
    });
    const data = await res.json();
    if (data?.success) {
      setIsoVerified(true);
      setCompany(comp => ({ ...comp, isoCertVerified: false }));
      setCertError("");
    } else {
      setCertError(data?.message || "Gagal upload sertifikat");
    }
  } catch {
    setCertError("Gagal upload sertifikat");
  } finally {
    setIsoUploading(false);
  }
}

  // ─── ESG questions ────────────────────────────────────────────────────────
  const ESG_QUESTIONS = [
    { id:1, category:"🌿 Environment", q:"Does your company have ans formal GHG reduction target?",   options:["Yes, science-based (SBTi)","Yes, internal target","In development","No target"] },
    { id:2, category:"🌿 Environment", q:"% renewable energy in total energy consumption?",          options:["> 50%","25 – 50%","10 – 25%","< 10%"] },
    { id:3, category:"👥 Social",      q:"Does your company publish ans sustainability report?",       options:["Annual, third-party verified","Annual, unverified","Occasionally","Never"] },
    { id:4, category:"👥 Social",      q:"Employee HSE & sustainability training coverage?",         options:["> 90%","70 – 90%","50 – 70%","< 50%"] },
    { id:5, category:"🏛 Governance",  q:"Is there ans dedicated ESG committee at board level?",       options:["Yes, independent board committee","Yes, internal committee","Planned","No"] },
    { id:6, category:"🏛 Governance",  q:"Carbon accounting audit frequency?",                       options:["Quarterly by 3rd party","Annually by 3rd party","Every 2 years","Never audited"] },
    { id:7, category:"🌿 Carbon",    q:"Total carbon absorption from your land parcels (tCO₂/month)?",  options:["Above 100 t",  "50 – 100 t", "10 – 50 t", "Below 10 t"] },
{ id:8, category:"🌿 Carbon",    q:"Net carbon credit balance (absorption minus emissions)?",         options:["Positive (surplus)", "Break-even", "Slight deficit", "High deficit"] },
{ id:9, category:"🌿 Carbon",    q:"Has your carbon data been verified by ans 3rd party?",             options:["Yes, ISO 14064 verified", "Yes, internal audit", "In progress", "Not verified"] },
  ];

  // ─── API helpers ──────────────────────────────────────────────────────────
  async function saveProfile() {
    await apiFetch(`/company/${companyId}`, { method:"PUT", body:JSON.stringify(form) });
    setCompany(comp => ({ ...comp, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSettingsModal(false);
  }

  async function generateWallet() {
    if (company?.walletGenerated) return;
    const walletId = `0x${Math.random().toString(16).slice(2, 18)}${Date.now().toString(16).slice(-8)}`.slice(0, 34);
    setCompany(comp => ({ ...comp, walletId, walletGenerated:true }));
  }

  async function submitESG() {
    setEsgSubmitting(true);
    const baseScore = Math.round(
      esgAnswers.reduce((sum, ans) => sum + (4 - ans) * (100 / (ESG_QUESTIONS.length * 3)), 0)
    );
    // Carbon bonus: serapan > emisi = +5, iso verified = +5
    const carbonBonus = (company?.esgStatus === "verified" ? 5 : 0) + (isoVerified ? 5 : 0);
    const score = Math.min(100, baseScore + carbonBonus);
    setCompany(comp => ({ ...comp, esgScore:score, esgStatus:"verified" }));
    setEsgSubmitting(false);
    setEsgModal(false);
  }

  // ─── Virtual tree stages ──────────────────────────────────────────────────
  const STAGES = [
    { l:"Seedling 🌱",   mn:0,  mx:1,        nxt:2  },
    { l:"Sprout 🌿",     mn:2,  mx:4,        nxt:5  },
    { l:"Young Tree 🌳", mn:5,  mx:8,        nxt:9  },
    { l:"Mature Tree 🌲",mn:9,  mx:14,       nxt:15 },
    { l:"Giant Tree 🌴", mn:15, mx:Infinity, nxt:null },
  ];
  const si   = STAGES.findIndex(sum => txCount >= sum.mn && txCount <= sum.mx);
  const cs   = STAGES[si] || STAGES[STAGES.length - 1];
  const prog = cs.nxt ? Math.min(((txCount - cs.mn) / (cs.nxt - cs.mn)) * 100, 100) : 100;
  const esgColor = company?.esgScore >= 70 ? "text-green-700" : company?.esgScore >= 50 ? "text-amber-600" : "text-red-600";

  // ─── Helper: answer change ────────────────────────────────────────────────
  const handleQAnswer = (key, val) => setQAnswers(prev => ({ ...prev, [key]: val }));

  // ─── Submit questionnaire ─────────────────────────────────────────────────
  const submitQuestionnaire = () => {
    updateQStatus?.({
      isComplete:   true,
      lastUpdated:  new Date().toISOString(),
      resetCount:   (qStatus?.resetCount || 0) + 1,
      answers:      qAnswers,
    });
  };

  // ─── Reset questionnaire ──────────────────────────────────────────────────
  const resetQuestionnaire = () => {
    updateQStatus?.({ ...qStatus, isComplete: false });
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-24 fade-up">
      <style>{`@keyframes sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}`}</style>

      {/* ── 1. COMPANY CARD ─────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar initials */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-md flex-shrink-0"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {company?.name?.split(" ").map(word => word[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-gray-800 text-lg leading-tight">{company?.name}</h2>
            <p className="text-green-600 text-sm font-semibold">{company?.entity}</p>
            <p className="text-gray-400 text-xs truncate">{company?.location}</p>
          </div>
          {/* Exit + Settings buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => setExitModal(true)}
              className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0"
              title={t.exit?.btn || "Exit"}>
              <Ic.Exit />
            </button>
            <button onClick={() => setSettingsModal(true)}
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 flex-shrink-0">
              <Ic.Settings />
            </button>
          </div>
        </div>
        {/* Company info grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-gray-400">{t.profile?.bizTypeLabel || "Business Type"}</p>
            <p className="font-bold text-gray-700">{company?.bizType}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-gray-400">{t.profile?.txCount || "Transactions"}</p>
            <p className="font-bold text-gray-700">{txCount}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 col-span-2">
            <p className="text-gray-400">{t.profile?.removalProjectLabel || "Removal Project"}</p>
            <p className="font-bold text-gray-700">{company?.removalProject}</p>
          </div>
        </div>
      </div>

      {/* ── 2. ASET SAYA (Multi-asset: Perusahaan + Lahan) ─────────────── */}
      <div className="card overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b border-gray-100">
          {[
            { id: "company", icon: "🏢", label: `Perusahaan (${myCompanies.length})` },
            { id: "land",    icon: "🌿", label: `Lahan (${myLands.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAssetTab(tab.id)}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                assetTab === tab.id
                  ? "border-green-600 text-green-700 bg-green-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Asset list */}
        <div className="p-3 flex flex-col gap-2">
          {assetTab === "company" && (
            <>
              {myCompanies.map(comp => (
                <div key={comp.id} className={`rounded-xl p-3 border flex items-center gap-3 ${comp.isMain ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${comp.isMain ? "bg-green-200" : "bg-gray-200"}`}>
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-800 truncate">{comp.name}</p>
                      {comp.isMain && <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold">Utama</span>}
                    </div>
                    <p className="text-xs text-gray-500">{comp.type} · {comp.bizType}</p>
                    <p className="text-xs text-gray-400 truncate">{comp.location}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditAsset(comp)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-xs flex items-center justify-center">✏️</button>
                    {!comp.isMain && (
                      <button onClick={() => deleteAsset(comp.id)} className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-xs flex items-center justify-center">🗑️</button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {assetTab === "land" && (
            <>
              {myLands.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada lahan terdaftar</p>
              )}
              {myLands.map(land => (
                <div key={land.id} className="rounded-xl p-3 border bg-gray-50 border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg flex-shrink-0">
                    {land.landType === "forest" ? "🌲" : land.landType === "peatland" ? "🌾" : land.landType === "mangrove" ? "🌴" : "🌿"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{land.name}</p>
                    <p className="text-xs text-gray-500">{land.landType} · {land.area ? `${land.area} ha` : "-"}</p>
                    <p className="text-xs text-gray-400 truncate">{land.location || "-"}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditAsset(land)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-xs flex items-center justify-center">✏️</button>
                    <button onClick={() => deleteAsset(land.id)} className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-xs flex items-center justify-center">🗑️</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Tombol tambah */}
          <button
            onClick={openAddAsset}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-green-300 text-green-700 bg-green-50 text-xs font-bold active:scale-95 transition-all"
          >
            + Tambah {assetTab === "company" ? "Perusahaan" : "Lahan"}
          </button>
        </div>
      </div>

      {/* ── 3. KUESIONER EMISI ──────────────────────────────────────────── */}
      <div className={`rounded-3xl p-5 border transition-all duration-500 shadow-sm
        ${qStatus?.isComplete ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}>

        {/* Header kuesioner */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner
              ${qStatus?.isComplete ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>
              {qStatus?.isComplete ? "✓" : "📊"}
            </div>
            <div>
              <h3 className={`font-bold text-sm ${qStatus?.isComplete ? "text-green-800" : "text-gray-800"}`}>
                {qStatus?.isComplete
                  ? (lang === "id" ? "Profil Emisi Terverifikasi" : "Emission Profile Verified")
                  : (lang === "id" ? "Lengkapi Profil Emisi" : "Complete Emission Profile")}
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                {lang === "id" ? "Data Isian CarbonTrust" : "CarbonTrust Data Form"}
              </p>
            </div>
          </div>

          {/* Tombol ubah / terkunci */}
          {qStatus?.isComplete && (
            <button
              disabled={!cd.canEdit}
              onClick={resetQuestionnaire}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all
                ${cd.canEdit
                  ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 active:scale-95"
                  : "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"}`}>
              {cd.canEdit
                ? (lang === "id" ? "UBAH DATA" : "EDIT DATA")
                : `🔒 ${cd.daysLeft}d`}
            </button>
          )}
        </div>

        {/* Body: form isian atau badge verified */}
        {!qStatus?.isComplete ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              {lang === "id"
                ? "Lengkapi data inventaris emisi perusahaan untuk kalkulasi skor ESG yang akurat."
                : "Complete your company'sum emission inventory for an accurate ESG score calculation."}
            </p>

            {/* Scrollable form sections */}
            <div className="max-h-64 overflow-y-auto pr-1 space-y-4"
              style={{ scrollbarWidth:"thin", scrollbarColor:"#d1d5db transparent" }}>
              {Q_DATA.sections.map((sec, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-green-700 mb-3 uppercase tracking-widest">{sec.section}</p>
                  <div className="grid gap-3">
                    {sec.questions.map((qItem) => (
                      <div key={qItem.key} className="flex flex-col gap-1">
                        <label className="text-[11px] text-gray-500 font-medium">{qItem.label}</label>
                        {qItem.type === "dropdown" ? (
                          <select
                            value={qAnswers[qItem.key] || ""}
                            onChange={ent=> handleQAnswer(qItem.key, ent.target.value)}
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100">
                            <option value="">— {lang === "id" ? "Pilih" : "Select"} —</option>
                            {qItem.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={qAnswers[qItem.key] || ""}
                              onChange={ent=> handleQAnswer(qItem.key, ent.target.value)}
                              className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            {(() => {
              const total   = Q_DATA.sections.reduce((sum, sec) => sum + sec.questions.length, 0);
              const filled  = Object.values(qAnswers).filter(val => val !== "" && val !== undefined).length;
              const pct     = Math.round((filled / total) * 100);
              return (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>{filled}/{total} {lang === "id" ? "terisi" : "filled"}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width:`${pct}%` }} />
                  </div>
                </div>
              );
            })()}

            {/* Submit button */}
            <button
              onClick={submitQuestionnaire}
              className="w-full py-3 bg-green-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 active:scale-95 transition-all">
              {lang === "id" ? "Simpan & Verifikasi Profil" : "Save & Verify Profile"}
            </button>
          </div>
        ) : (
          /* Verified badge */
          <div className="flex items-start gap-2 bg-green-100/60 p-3 rounded-xl border border-green-200">
            <span className="text-sm flex-shrink-0">🛡️</span>
            <p className="text-[10px] font-bold text-green-700 leading-relaxed">
              {lang === "id"
                ? "Data ini telah tercatat dalam sistem audit CarbonTrust dan digunakan sebagai basis perhitungan emisi."
                : "This data is recorded in the CarbonTrust audit system and used as the basis for emission calculations."}
            </p>
          </div>
        )}
      </div>

      {/* ── 3. BLOCKCHAIN WALLET ─────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-gray-800 text-sm">{t.profile?.wallet || "Blockchain Wallet ID"}</p>
          {!company?.walletGenerated && (
            <button onClick={() => setWalletModal(true)}
              className="text-xs text-white px-3 py-1.5 rounded-xl font-bold"
              style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
              {t.profile?.generate || "Generate Wallet"}
            </button>
          )}
        </div>
        {company?.walletGenerated ? (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
            <p className="font-mono text-xs text-teal-700 break-all">{company?.walletId}</p>
            <p className="text-xs text-teal-600 mt-1">{t.profile?.walletStored || "✓ Permanently stored"}</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400">{t.profile?.walletNote}</p>
        )}
      </div>

      {/* ISO Certificate section — #32 */}
<div className="card p-4 flex flex-col gap-3">
  <div className="flex items-center justify-between">
    <p className="text-sm font-bold text-gray-800">📋 Sertifikat ISO 14064</p>
    {isoVerified
      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✅ Terverifikasi</span>
      : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⏳ Belum Upload</span>
    }
  </div>

  <p className="text-xs text-gray-500">
    Wajib untuk menawarkan kredit karbon di Market. Upload sertifikat dari lembaga verifikasi ISO.
  </p>

  <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-colors
    ${isoCert ? "border-green-400 bg-green-50" : certError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
    <span className="text-2xl">{isoCert ? "📄" : "⬆️"}</span>
    <div className="flex-1">
      <p className="text-xs font-bold text-gray-700">
        {isoCert ? isoCert.name : "Upload Sertifikat ISO 14064"}
      </p>
      <p className="text-xs text-gray-400">PDF / JPG / PNG · maks 10MB</p>
    </div>
    {isoCert && <span className="text-green-600 font-bold text-xs">✓</span>}
    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleIsoUpload} />
  </label>

  {certError && <p className="text-xs text-red-600">{certError}</p>}

  {isoCert && !isoVerified && (
    <button onClick={submitIso} disabled={isoUploading}
      className="w-full py-2.5 rounded-xl font-bold text-white text-sm active:scale-95 transition-all"
      style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
      {isoUploading ? "Uploading..." : "Submit untuk Verifikasi"}
    </button>
  )}

  {isoVerified && (
    <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
      <p className="text-xs font-bold text-green-700">✅ {isoCert?.name}</p>
      <p className="text-xs text-green-600 mt-0.5">Kredit karbon kamu sudah bisa ditawarkan di Market</p>
    </div>
  )}
</div>

      {/* ── 4. ESG SCORE ─────────────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-gray-800 text-sm">{t.profile?.esg || "ESG Score"}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold
            ${company?.esgStatus === "verified" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {t.profile?.esgStatus?.[company?.esgStatus || "not_started"] || company?.esgStatus}
          </span>
        </div>
        {company?.esgScore !== null ? (
  <div className="flex flex-col gap-4">
    
    {/* Skor Utama */}
    <div className="flex items-center gap-3">
      <p className={`text-4xl font-black ${esgColor}`}>{company?.esgScore}</p>
      <div className="flex-1">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500
            ${company?.esgScore >= 70 ? "bg-green-500" : company?.esgScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width:`${company?.esgScore}%` }} />
        </div>
        
        {/* TOOLTIP SECTION - AI Verified */}
        <div className="relative group inline-flex items-center gap-1 mt-1.5 cursor-help">
          <span className="text-xs font-semibold text-blue-600 border-b border-dashed border-blue-400">
            {t.profile?.esgVerified || "✓ AI-Verified"}
          </span>
          <span className="text-xs text-gray-400">· Scale 0–100</span>
          
          {/* Popover Box (Muncul saat di-hover) */}
          <div className="absolute bottom-full left-0 mb-2 hidden w-64 p-3 bg-gray-800 text-white text-[11px] leading-relaxed rounded-lg shadow-xl group-hover:block z-50 animate-fade-in-up">
            Skor ESG ini telah divalidasi secara otomatis oleh AI berdasarkan dokumen bukti yang diunggah. Verifikasi manual dari pihak ketiga (Sertifikasi ISO) mungkin diperlukan sebelum Anda dapat menawarkan kredit di Market.
            {/* Segitiga kecil (Arrow) penunjuk ke teks */}
            <div className="absolute top-full left-6 -mt-1 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>

      </div>
    </div>

    {/* Carbon metrics contribution — #33 */}
    <div className="mt-1 flex flex-col gap-1.5 pt-3 border-t border-gray-100">
      <p className="text-xs font-bold text-gray-500 uppercase">Komponen Score</p>
      {[
        { l:"Environment & Governance", v: Math.round((company.esgScore || 0) * 0.7), max:70, comp:"bg-green-500" },
        { l:"Serapan Karbon",           v: Math.round((company.esgScore || 0) * 0.15), max:15, comp:"bg-teal-500" },
        { l:"Kredit & Verifikasi ISO",  v: Math.round((company.esgScore || 0) * 0.15), max:15, comp:"bg-blue-500" },
      ].map((row, i) => (
        <div key={i}>
          <div className="flex justify-between mb-0.5">
            <p className="text-xs text-gray-500">{row.l}</p>
            <p className="text-xs font-bold text-gray-600">{row.v}/{row.max}</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${row.comp}`}
              style={{ width:`${(row.v/row.max)*100}%` }} />
          </div>
        </div>
      ))}
    </div>

  </div>
) : (
  <div>
    <p className="text-xs text-gray-500 mb-3">{t.profile?.esgDesc}</p>
    <button onClick={() => { setEsgStep(0); setEsgAnswers([]); setEsgModal(true); }}
      className="w-full text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
      style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
      {t.profile?.esgStart || "Start ESG Assessment"}
    </button>
  </div>
        )}
      </div>

      {/* ── 5. VIRTUAL TREE ──────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800">{t.profile?.tree || "Virtual Tree 🌳"}</p>
            <p className="text-xs text-gray-400">{t.profile?.treeDesc || "Grows with every completed transaction"}</p>
          </div>
          <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">{cs.l}</span>
        </div>
        <div className="flex flex-col items-center py-4">
          <div style={{ transition:"transform .4s cubic-bezier(.34,1.56,.64,1),filter .3s", filter:glowing?"drop-shadow(0 0 16px rgba(34,197,94,.7))":"none", transform:glowing?"scale(1.07)":"scale(1)" }}>
            <svg width="180" height="200" viewBox="0 0 180 200">
              <ellipse cx="90" cy="175" rx="50" ry="7" fill="#d1fae5" opacity=".7" />
              {si > 0 && <rect x={90-[3,4,5,6,7][Math.min(si,4)]} y={175-[10,45,75,105,125][Math.min(si,4)]} width={[6,8,10,12,14][Math.min(si,4)]} height={[10,45,75,105,125][Math.min(si,4)]} rx="3" fill="#92400e" />}
              {si >= 1 && [["#86efac",85,140,12,9,0],["#4ade80",98,138,10,8,.3]].map(([comp,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={comp} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
              {si >= 2 && [["#4ade80",76,128,16,12,0],["#22c55e",104,123,14,11,.2],["#16a34a",90,108,18,14,.4]].map(([comp,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={comp} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
              {si >= 3 && [["#16a34a",90,88,28,23,0],["#15803d",67,103,23,18,.15],["#166534",114,98,23,18,.3],["#22c55e",90,73,20,16,.45]].map(([comp,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={comp} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
              {si >= 4 && [["#15803d",90,68,38,32,0],["#16a34a",57,88,30,26,.1],["#166534",126,83,30,26,.2]].map(([comp,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={comp} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
              {si === 0 && <><ellipse cx="90" cy="168" rx="7" ry="4" fill="#86efac" /><line x1="90" y1="164" x2="90" y2="158" stroke="#22c55e" strokeWidth="2" /></>}
            </svg>
          </div>
          <div className="w-full px-6 mt-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{txCount} transactions</span>
              {cs.nxt && <span>→ {cs.nxt} to level up</span>}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500" style={{ width:`${prog}%` }} />
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <button onClick={() => { setTxCount(prev => prev+1); setGlowing(true); setTimeout(() => setGlowing(false), 600); }}
            className="w-full text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ background:"linear-gradient(135deg,#16a34a,#0f766e)" }}>
            <Ic.Leaf className="w-4 h-4" />{t.profile?.simulateTx || "Simulate New Transaction (+1 🌱)"}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════ */}

      {/* Settings Modal */}
      <Modal open={settingsModal} onClose={() => setSettingsModal(false)} title={`⚙️ ${t.profile?.settings || "Profile Settings"}`}>
        <div className="flex flex-col gap-3">
          {[
            { l: t.profile?.companyName || "Company Name",              k:"name",          type:"text"  },
            { l: t.profile?.emailLabel  || "Institutional Email",       k:"email",         type:"email" },
            { l: t.profile?.removalProjectLabel || "Carbon Removal Project", k:"removalProject", type:"text" },
          ].map(fieldItem => (
            <div key={fieldItem.k}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{fieldItem.l}</label>
              <input type={fieldItem.type} value={form[fieldItem.k] || ""} onChange={e => setForm(prev => ({ ...prev, [fieldItem.k]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">{t.profile?.entityTypeLabel || "Entity / Company Type"}</label>
            <select value={form.entity || ""} onChange={e => setForm(prev => ({ ...prev, entity: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              {["PT (Perseroan Terbatas)","PT Tbk (Terbuka)","BUMN","Koperasi","CV","Yayasan","NGO","Other"].map(entity => <option key={entity}>{entity}</option>)}
            </select>
            <div className="flex flex-col gap-2">
  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">📍 Lokasi</p>
  <div>
    <label className="text-xs font-bold text-gray-600 block mb-1">🏢 Alamat Kantor</label>
    <input type="text" placeholder="e.g. Jl. Sudirman No. 1, Jakarta Selatan"
      value={form.location || ""}
      onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
  </div>
  <div>
    <label className="text-xs font-bold text-gray-600 block mb-1">🌿 Alamat Site / Lahan</label>
    <input type="text" placeholder="e.g. Kec. Kuala Kapuas, Kalimantan Tengah"
      value={form.siteAddress || ""}
      onChange={e => setForm(prev => ({ ...prev, siteAddress: e.target.value }))}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
  </div>
</div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">{t.profile?.bizTypeLabel || "Business Activity Type"}</label>
            <select value={form.bizType || ""} onChange={e => setForm(prev => ({ ...prev, bizType: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              {["Manufacturing","Plantation","Mining","Energy","Transportation","Construction","Finance","Technology","Healthcare","Other"].map(biz => <option key={biz}>{biz}</option>)}
            </select>
          </div>
          <button onClick={saveProfile}
            className={`w-full py-3 rounded-xl font-bold transition-all ${saved ? "bg-green-100 text-green-700" : "text-white"}`}
            style={!saved ? { background:"linear-gradient(135deg,#166534,#0f766e)" } : {}}>
            {saved ? (t.profile?.saved || "✅ Saved!") : (t.profile?.save || "Save Profile")}
          </button>
        </div>
      </Modal>

      {/* ESG Modal */}
      <Modal open={esgModal} onClose={() => setEsgModal(false)} title="📊 ESG Assessment">
        {esgStep < ESG_QUESTIONS.length ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{ESG_QUESTIONS[esgStep].category}</span>
              <span>Question {esgStep + 1} / {ESG_QUESTIONS.length}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width:`${(esgStep/ESG_QUESTIONS.length)*100}%` }} />
            </div>
            <p className="font-bold text-gray-800 text-sm">{ESG_QUESTIONS[esgStep].q}</p>
            <div className="flex flex-col gap-2">
              {ESG_QUESTIONS[esgStep].options.map((opt, i) => (
                <button key={i}
                  onClick={() => { const ans=[...esgAnswers]; ans[esgStep]=i; setEsgAnswers(ans); setEsgStep(sum=>sum+1); }}
                  className="text-left p-3 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-sm font-medium text-gray-700">
                  {String.fromCharCode(65+i)}. {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-4xl">📋</p>
            <p className="font-bold text-gray-800">
              {lang==="id"?"Semua pertanyaan terjawab!":lang==="zh"?"所有问题已回答！":lang==="ko"?"모든 질문에 답했습니다!":lang==="ja"?"すべての質問に回答しました！":"All questions answered!"}
            </p>
            <p className="text-xs text-gray-500">
              {lang==="id"?"Kirim untuk analisis AI guna mendapatkan skor ESG Anda":lang==="zh"?"提交进行AI分析以获得ESG评分":lang==="ko"?"AI 분석을 위해 제출하면 ESG 점수를 받습니다":lang==="ja"?"AIによる分析のために提出してESGスコアを取得":"Submit for AI analysis to receive your ESG score"}
            </p>
            <button onClick={submitESG} disabled={esgSubmitting}
              className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
              {esgSubmitting ? <Spinner /> : null}
              {esgSubmitting
                ? (lang==="id"?"Menghitung...":lang==="zh"?"计算中...":lang==="ko"?"계산 중...":lang==="ja"?"計算中...":"Calculating...")
                : (lang==="id"?"Buat Skor ESG →":lang==="zh"?"生成ESG评分 →":lang==="ko"?"ESG 점수 생성 →":lang==="ja"?"ESGスコアを生成 →":"Generate ESG Score →")}
            </button>
          </div>
        )}
      </Modal>

      {/* Wallet Modal */}
      <Modal open={walletModal} onClose={() => setWalletModal(false)} title="🔐 Generate Blockchain Wallet">
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm font-bold text-amber-700">⚠️ {lang==="id"?"Penting":lang==="zh"?"重要":lang==="ko"?"중요":lang==="ja"?"重要":"Important"}</p>
            <p className="text-xs text-amber-600 mt-1">{t.profile?.walletNote}</p>
          </div>
          <p className="text-sm text-gray-600">
            {lang==="id"?"Wallet ID blockchain unik Anda akan dibuat dan disimpan permanen di database kami. Ini tidak dapat diubah nantinya.":lang==="zh"?"您唯一的区块链钱包ID将被生成并永久存储在我们的数据库中。":lang==="ko"?"귀하의 고유한 블록체인 지갑 ID가 생성되어 데이터베이스에 영구 저장됩니다.":lang==="ja"?"ウォレットIDが生成されデータベースに永久保存されます。":"Your unique blockchain wallet ID will be generated and permanently stored. This cannot be changed later."}
          </p>
          <button onClick={() => { generateWallet(); setWalletModal(false); }}
            className="w-full text-white py-3 rounded-xl font-bold"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {lang==="id"?"✅ Buat Wallet ID Saya":lang==="zh"?"✅ 生成我的钱包ID":lang==="ko"?"✅ 내 지갑 ID 생성":lang==="ja"?"✅ ウォレットIDを生成":"✅ Generate My Wallet ID"}
          </button>
        </div>
      </Modal>

      {/* Exit Modal */}
      <Modal open={exitModal} onClose={() => setExitModal(false)} title={`🚪 ${t.exit?.title || "Exit Application"}`}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 text-center">{t.exit?.desc || "What would you like to do?"}</p>
          
          {/* Exit only — tutup app, tetap login */}
          <button
            onClick={() => { 
              setExitModal(false); 
              if (typeof onExit === "function") onExit(); // <--- Tambahkan onExit di sini
            }}
            className="w-full py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
            {t.exit?.exitOnly || "Exit App"}
          </button>

          {/* Exit & Logout — kembali ke AuthFlow */}
          <button
            onClick={() => { setExitModal(false); if (typeof onLogout === "function") onLogout(); }}
            className="w-full py-3 rounded-xl font-bold text-white flex flex-col items-center gap-0.5 active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#dc2626,#b91c1c)" }}>
            <span>{t.exit?.logout || "Exit & Log Out"}</span>
            <span className="text-xs font-normal opacity-80">{t.exit?.logoutDesc || "You will return to the registration screen."}</span>
          </button>

          <button onClick={() => setExitModal(false)}
            className="text-sm text-gray-400 hover:text-gray-600 text-center py-1 font-medium">
            {t.exit?.cancelBtn || "Cancel"}
          </button>
        </div>
      </Modal>
      {/* Asset Modal — Tambah / Edit Perusahaan atau Lahan */}
      <Modal open={assetModal} onClose={() => setAssetModal(false)}
        title={`${assetEditItem ? "Edit" : "Tambah"} ${assetTab === "company" ? "🏢 Perusahaan" : "🌿 Lahan"}`}>
        <div className="flex flex-col gap-3">
          {assetTab === "company" ? (
            <>
              {[
                { label: "Nama Perusahaan", key: "name", type: "text", ph: "e.g. PT Hijau Lestari" },
                { label: "Lokasi / Alamat", key: "location", type: "text", ph: "e.g. Jakarta Selatan" },
              ].map(fieldItem => (
                <div key={fieldItem.key}>
                  <label className="text-xs font-bold text-gray-600 block mb-1">{fieldItem.label}</label>
                  <input type={fieldItem.type} placeholder={fieldItem.ph}
                    value={assetForm[fieldItem.key] || ""}
                    onChange={e => setAssetForm(prev => ({ ...prev, [fieldItem.key]: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Jenis Entitas</label>
                <select value={assetForm.type || "PT"}
                  onChange={e => setAssetForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                  {["PT", "PT Tbk", "CV", "BUMN", "Koperasi", "Yayasan", "NGO", "Other"].map(entity => <option key={entity}>{entity}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Jenis Usaha</label>
                <select value={assetForm.bizType || "Manufacturing"}
                  onChange={e => setAssetForm(prev => ({ ...prev, bizType: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                  {["Manufacturing","Plantation","Mining","Energy","Transportation","Construction","Finance","Technology","Healthcare","Other"].map(biz => <option key={biz}>{biz}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              {[
                { label: "Nama Lahan", key: "name", type: "text", ph: "e.g. Lahan Gambut Riau A" },
                { label: "Lokasi", key: "location", type: "text", ph: "e.g. Kab. Siak, Riau" },
                { label: "Luas (ha)", key: "area", type: "number", ph: "e.g. 250" },
              ].map(fieldItem => (
                <div key={fieldItem.key}>
                  <label className="text-xs font-bold text-gray-600 block mb-1">{fieldItem.label}</label>
                  <input type={fieldItem.type} placeholder={fieldItem.ph}
                    value={assetForm[fieldItem.key] || ""}
                    onChange={e => setAssetForm(prev => ({ ...prev, [fieldItem.key]: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Jenis Lahan</label>
                <select value={assetForm.landType || "forest"}
                  onChange={e => setAssetForm(prev => ({ ...prev, landType: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                  {[["forest","🌲 Hutan"],["peatland","🌾 Gambut"],["mangrove","🌴 Mangrove"],["agricultural","🌱 Pertanian"],["industrial","🏭 Industri"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </>
          )}

          <button onClick={saveAsset} disabled={!assetForm.name}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
            {assetEditItem ? "Simpan Perubahan" : `Tambah ${assetTab === "company" ? "Perusahaan" : "Lahan"}`}
          </button>
        </div>
      </Modal>

    </div>
  );
}

export default ProfilePage;