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
import { API, apiFetch, MOCK_PROJECTS, Modal, Ic } from "../shared.jsx";

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
        setMyLands(prev => prev.map(landItem => landItem.id === assetEditItem.id ? { ...landItem, ...assetForm } : landItem));
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
    if (company?.walletGenerated && company?.walletId) return;
    const data = await apiFetch(`/company/${companyId}/wallet`, { method: "POST" });
    if (data?.walletId) {
      setCompany(comp => ({
        ...comp,
        walletId: data.walletId,
        walletGenerated: true,
      }));
    }
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
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5 mt-1">
              <p className="text-xs font-bold text-blue-700 mb-0.5">📊 Indicative Score Only</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                This ESG score is <strong>self-assessed and unverified</strong>. It is based on your inputs only (Environmental 50%, Social 30%, Governance 20%) and has not been audited by a third party. Do not use for regulatory reporting.
              </p>
            </div>
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