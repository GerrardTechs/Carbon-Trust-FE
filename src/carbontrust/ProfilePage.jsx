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
import { apiFetch, MOCK_PROJECTS, Modal, Ic } from "./shared.jsx";

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

export function ProfilePage({ company, setCompany, t, lang, onLogout, onExit, qStatus, updateQStatus }) {
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

  // ─── ESG questions ────────────────────────────────────────────────────────
  const ESG_QUESTIONS = [
    { id:1, category:"🌿 Environment", q:"Does your company have a formal GHG reduction target?",   options:["Yes, science-based (SBTi)","Yes, internal target","In development","No target"] },
    { id:2, category:"🌿 Environment", q:"% renewable energy in total energy consumption?",          options:["> 50%","25 – 50%","10 – 25%","< 10%"] },
    { id:3, category:"👥 Social",      q:"Does your company publish a sustainability report?",       options:["Annual, third-party verified","Annual, unverified","Occasionally","Never"] },
    { id:4, category:"👥 Social",      q:"Employee HSE & sustainability training coverage?",         options:["> 90%","70 – 90%","50 – 70%","< 50%"] },
    { id:5, category:"🏛 Governance",  q:"Is there a dedicated ESG committee at board level?",       options:["Yes, independent board committee","Yes, internal committee","Planned","No"] },
    { id:6, category:"🏛 Governance",  q:"Carbon accounting audit frequency?",                       options:["Quarterly by 3rd party","Annually by 3rd party","Every 2 years","Never audited"] },
  ];

  // ─── API helpers ──────────────────────────────────────────────────────────
  async function saveProfile() {
    await apiFetch(`/company/${COMPANY_ID}`, { method:"PUT", body:JSON.stringify(form) });
    setCompany(c => ({ ...c, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSettingsModal(false);
  }

  async function generateWallet() {
    if (company?.walletGenerated) return;
    const res = await apiFetch(`/company/${COMPANY_ID}/generate-wallet`, { method:"POST" });
    if (res?.walletId) setCompany(c => ({ ...c, walletId:res.walletId, walletGenerated:true }));
  }

  async function submitESG() {
    setEsgSubmitting(true);
    const res = await apiFetch("/esg/submit", {
      method:"POST",
      body:JSON.stringify({ companyId:COMPANY_ID, answers:esgAnswers.map((a,i) => ({ questionId:i+1, selectedIndex:a })) }),
    });
    const score = res?.esgScore || Math.round(esgAnswers.reduce((s,a) => s + (4-a)*(100/(ESG_QUESTIONS.length*3)), 0));
    setCompany(c => ({ ...c, esgScore:score, esgStatus:"verified" }));
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
  const si   = STAGES.findIndex(s => txCount >= s.mn && txCount <= s.mx);
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
            {company?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
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

      {/* ── 2. KUESIONER EMISI ──────────────────────────────────────────── */}
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
                : "Complete your company's emission inventory for an accurate ESG score calculation."}
            </p>

            {/* Scrollable form sections */}
            <div className="max-h-64 overflow-y-auto pr-1 space-y-4"
              style={{ scrollbarWidth:"thin", scrollbarColor:"#d1d5db transparent" }}>
              {Q_DATA.sections.map((sec, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-green-700 mb-3 uppercase tracking-widest">{sec.section}</p>
                  <div className="grid gap-3">
                    {sec.questions.map((q) => (
                      <div key={q.key} className="flex flex-col gap-1">
                        <label className="text-[11px] text-gray-500 font-medium">{q.label}</label>
                        {q.type === "dropdown" ? (
                          <select
                            value={qAnswers[q.key] || ""}
                            onChange={e => handleQAnswer(q.key, e.target.value)}
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100">
                            <option value="">— {lang === "id" ? "Pilih" : "Select"} —</option>
                            {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={qAnswers[q.key] || ""}
                              onChange={e => handleQAnswer(q.key, e.target.value)}
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
              const total   = Q_DATA.sections.reduce((s, sec) => s + sec.questions.length, 0);
              const filled  = Object.values(qAnswers).filter(v => v !== "" && v !== undefined).length;
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
          <div className="flex items-center gap-3">
            <p className={`text-4xl font-black ${esgColor}`}>{company?.esgScore}</p>
            <div className="flex-1">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500
                  ${company?.esgScore >= 70 ? "bg-green-500" : company?.esgScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width:`${company?.esgScore}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{t.profile?.esgVerified || "AI-verified · Scale 0–100"}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-3">{t.profile?.esgDesc}</p>
            <button onClick={() => { setEsgStep(0); setEsgAnswers([]); setEsgModal(true); }}
              className="w-full text-white py-2.5 rounded-xl font-bold text-sm"
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
              {si >= 1 && [["#86efac",85,140,12,9,0],["#4ade80",98,138,10,8,.3]].map(([c,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
              {si >= 2 && [["#4ade80",76,128,16,12,0],["#22c55e",104,123,14,11,.2],["#16a34a",90,108,18,14,.4]].map(([c,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
              {si >= 3 && [["#16a34a",90,88,28,23,0],["#15803d",67,103,23,18,.15],["#166534",114,98,23,18,.3],["#22c55e",90,73,20,16,.45]].map(([c,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
              {si >= 4 && [["#15803d",90,68,38,32,0],["#16a34a",57,88,30,26,.1],["#166534",126,83,30,26,.2]].map(([c,cx,cy,rx,ry,d],i) => (<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} style={{ transformOrigin:`${cx}px ${cy+ry}px`, animation:"sway 3s ease-in-out infinite", animationDelay:`${d}s` }} />))}
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
          <button onClick={() => { setTxCount(n => n+1); setGlowing(true); setTimeout(() => setGlowing(false), 600); }}
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
            { l: t.profile?.locationLabel || "Location",                k:"location",      type:"text"  },
            { l: t.profile?.removalProjectLabel || "Carbon Removal Project", k:"removalProject", type:"text" },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{f.l}</label>
              <input type={f.type} value={form[f.k] || ""} onChange={e => setForm(p => ({ ...p, [f.k]:e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">{t.profile?.entityTypeLabel || "Entity / Company Type"}</label>
            <select value={form.entity || ""} onChange={e => setForm(p => ({ ...p, entity:e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              {["PT (Perseroan Terbatas)","PT Tbk (Terbuka)","BUMN","Koperasi","CV","Yayasan","NGO","Other"].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">{t.profile?.bizTypeLabel || "Business Activity Type"}</label>
            <select value={form.bizType || ""} onChange={e => setForm(p => ({ ...p, bizType:e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              {["Manufacturing","Plantation","Mining","Energy","Transportation","Construction","Finance","Technology","Healthcare","Other"].map(b => <option key={b}>{b}</option>)}
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
                  onClick={() => { const a=[...esgAnswers]; a[esgStep]=i; setEsgAnswers(a); setEsgStep(s=>s+1); }}
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
      <Modal open={exitModal} onClose={() => setExitModal(true)} title={`🚪 ${t.exit?.title || "Exit Application"}`}>
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
    </div>
  );
}

export default ProfilePage;