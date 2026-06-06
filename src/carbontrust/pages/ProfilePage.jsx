/**
 * ProfilePage.jsx
 * Company profile: ESG score, blockchain wallet, ISO cert, multi-asset mgmt, exit modal.
 * FIXED: removed virtual tree, retained all other functionality.
 */
import { useState } from "react";
import { apiFetch, Modal, Spinner, COMPANY_ID } from "../shared.jsx";

// ─── ESG Questionnaire (5 pertanyaan) ───────────────────────────────────────
const ESG_QUESTIONS = [
  { id:1, category:"🌱 Environmental", q:"How does your company manage Scope 1 direct emissions?",
    options:["Active reduction program + verified data","Partial tracking, no formal program","Only measured, no reduction","Not tracked at all"] },
  { id:2, category:"🌱 Environmental", q:"What is your primary energy source?",
    options:[">50% renewable","25–50% renewable","<25% renewable","100% fossil fuels"] },
  { id:3, category:"👥 Social", q:"Do you have a formal employee safety & welfare program?",
    options:["Comprehensive certified program","Basic program, no certification","Informal guidelines only","None"] },
  { id:4, category:"👥 Social", q:"Community engagement level?",
    options:["Active investment & reporting","Occasional engagement","Minimal","None"] },
  { id:5, category:"🏛 Governance", q:"Is there a dedicated ESG committee at board level?",
    options:["Yes, independent board committee","Yes, internal committee","Planned","No"] },
];

export function ProfilePage({
  company, setCompany, t, lang, onLogout, onExit, setPage,
  qStatus, updateQStatus, companyId
}) {
  console.log("ProfilePage t:", t);
  console.log("ProfilePage onExit:", onExit);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [settingsModal, setSettingsModal] = useState(false);
  const [esgModal,      setEsgModal]      = useState(false);
  const [walletModal,   setWalletModal]   = useState(false);
  const [exitModal,     setExitModal]     = useState(false);

  // ── ESG state ─────────────────────────────────────────────────────────────
  const [esgStep,       setEsgStep]       = useState(0);
  const [esgAnswers,    setEsgAnswers]    = useState([]);
  const [esgSubmitting, setEsgSubmitting] = useState(false);

  // ── Settings form ─────────────────────────────────────────────────────────
  const [form,  setForm]  = useState({ ...company });
  const [saved, setSaved] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(company?.profilePhoto || null);

  // ── Wallet ────────────────────────────────────────────────────────────────
  const [glowing, setGlowing] = useState(false);

  // ── ISO cert ─────────────────────────────────────────────────────────────
  const [isoCert,      setIsoCert]      = useState(null);
  const [certError,    setCertError]    = useState("");
  const [isoVerified,  setIsoVerified]  = useState(company?.verified || false);
  const [isoUploading, setIsoUploading] = useState(false);

  // ── Multi-asset ───────────────────────────────────────────────────────────
  const [assetTab,      setAssetTab]      = useState("company");
  const [assetModal,    setAssetModal]    = useState(false);
  const [assetEditItem, setAssetEditItem] = useState(null);
  const [myCompanies,   setMyCompanies]   = useState([
    { id:"main", name: company?.name || "PT. Anda", type: company?.entity || "PT",
      bizType: company?.bizType || "Manufacturing", location: company?.location || "-", isMain: true },
  ]);
  const [myLands,   setMyLands]   = useState([]);
  const [assetForm, setAssetForm] = useState({});

  // ── Helpers ───────────────────────────────────────────────────────────────
  const cid = companyId || company?.id || company?._id || COMPANY_ID;
  const esgColor = company?.esgScore >= 70 ? "text-green-700"
                 : company?.esgScore >= 50 ? "text-amber-600" : "text-red-600";

  async function saveProfile() {
    const body = { ...form };
    if (avatarFile) {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      Object.entries(body).forEach(([k,v]) => v && fd.append(k, v));
      await apiFetch(`/company/${cid}`, { method:"PUT", body: fd, isFormData: true });
    } else {
      await apiFetch(`/company/${cid}`, { method:"PUT", body: JSON.stringify(body) });
    }
    setCompany(prev => ({ ...prev, ...body, profilePhoto: avatarPreview }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSettingsModal(false);
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function saveAsset() {
    if (!assetForm.name) return;
    if (assetEditItem) {
      if (assetTab === "company") setMyCompanies(prev => prev.map(comp => comp.id === assetEditItem.id ? { ...comp, ...assetForm } : comp));
      else setMyLands(prev => prev.map(landItem => landItem.id === assetEditItem.id ? { ...landItem, ...assetForm } : landItem));
    } else {
      const newItem = { id: `item-${Date.now()}`, ...assetForm };
      if (assetTab === "company") setMyCompanies(prev => [...prev, newItem]);
      else setMyLands(prev => [...prev, newItem]);
    }
    setAssetModal(false);
    setAssetForm({});
    setAssetEditItem(null);
  }

  function deleteAsset(id) {
    if (assetTab === "company") setMyCompanies(prev => prev.filter(comp => comp.id !== id || comp.isMain));
    else setMyLands(prev => prev.filter(land => land.id !== id));
  }

  async function generateWallet() {
    setGlowing(true);
    const res = await apiFetch(`/company/${cid}/generate-wallet`, { method:"POST" });
    if (res?.walletId) setCompany(prev => ({ ...prev, walletId: res.walletId }));
    setTimeout(() => setGlowing(false), 2000);
  }

  async function submitISO() {
    if (!isoCert) return;
    setCertError("");
    setIsoUploading(true);
    const fd = new FormData();
    fd.append("iso", isoCert);
    const res = await apiFetch(`/company/${cid}/upload-iso`, { method:"POST", body: fd, isFormData: true });
    if (res?.ok) {
      setIsoVerified(true);
      setCompany(prev => ({ ...prev, verified: true }));
    } else {
      setCertError("Upload gagal, coba lagi.");
    }
    setIsoUploading(false);
  }

  async function submitESG() {
    setEsgSubmitting(true);
    const env  = esgAnswers.slice(0,2).reduce((s,a) => s + (4-a), 0);
    const soc  = esgAnswers.slice(2,4).reduce((s,a) => s + (4-a), 0);
    const gov  = esgAnswers[4] !== undefined ? (4 - esgAnswers[4]) : 0;
    const carbonBonus = (company?.esgStatus === "verified" ? 5 : 0) + (isoVerified ? 5 : 0);
    const raw  = (env/8)*50 + (soc/8)*30 + (gov/4)*20 + carbonBonus;
    const score = Math.min(100, Math.round(raw));
    await apiFetch(`/admin/company/${cid}/esg`, { method:"PATCH", body: JSON.stringify({ score, status:"verified" }) });
    setCompany(prev => ({ ...prev, esgScore: score, esgStatus:"verified" }));
    setEsgSubmitting(false);
    setEsgModal(false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-24 fade-up">

      {/* ── ESG Modal ───────────────────────────────────────────────────────── */}
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
                  onClick={() => { const ans=[...esgAnswers]; ans[esgStep]=i; setEsgAnswers(ans); setEsgStep(s=>s+1); }}
                  className="text-left p-3 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-sm font-medium text-gray-700">
                  {String.fromCharCode(65+i)}. {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-4xl">📋</p>
            <p className="font-bold text-gray-800">All questions answered!</p>
            <p className="text-xs text-gray-500">Submit for AI analysis to receive your ESG score</p>
            <button onClick={submitESG} disabled={esgSubmitting}
              className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
              {esgSubmitting ? <Spinner /> : null}
              {esgSubmitting ? "Calculating..." : "Generate ESG Score →"}
            </button>
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5">
              <p className="text-xs font-bold text-blue-700 mb-0.5">📊 Indicative Score Only</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                This ESG score is <strong>self-assessed and unverified</strong>. Based on your inputs (E 50% + S 30% + G 20%). Not audited by third party.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Wallet Modal ─────────────────────────────────────────────────────── */}
      <Modal open={walletModal} onClose={() => setWalletModal(false)} title="🔐 Blockchain Wallet">
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm font-bold text-amber-700">⚠️ Important</p>
            <p className="text-xs text-amber-600 mt-1">
              Your unique blockchain wallet ID will be generated and permanently stored. This cannot be changed later.
            </p>
          </div>
          <button onClick={() => { generateWallet(); setWalletModal(false); }}
            className="w-full text-white py-3 rounded-xl font-bold"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            ✅ Generate My Wallet ID
          </button>
        </div>
      </Modal>

      {/* ── Exit Modal ───────────────────────────────────────────────────────── */}
      <Modal open={exitModal} onClose={() => setExitModal(false)} title={`🚪 ${t.exit?.title || "Exit Application"}`}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 text-center">{t.exit?.desc || "What would you like to do?"}</p>
          <button onClick={() => { setExitModal(false); typeof onExit === "function" && onExit(); }}
            className="w-full py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
            {t.exit?.exitOnly || "Exit App"}
          </button>
          <button onClick={() => { setExitModal(false); typeof onLogout === "function" && onLogout(); }}
            className="w-full py-3 rounded-xl font-bold text-white flex flex-col items-center gap-0.5 active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#991b1b,#b45309)" }}>
            <span>{t.exit?.logout || "Exit & Logout"}</span>
            <span className="text-xs font-normal opacity-75">{t.exit?.logoutDesc || "You will be redirected to login."}</span>
          </button>
          <button onClick={() => setExitModal(false)}
            className="text-xs text-gray-400 text-center font-bold hover:underline">
            {t.exit?.cancelBtn || "Cancel"}
          </button>
        </div>
      </Modal>

      {/* ── Settings Modal ───────────────────────────────────────────────────── */}
      <Modal open={settingsModal} onClose={() => setSettingsModal(false)} title={`⚙️ ${t.profile?.settings || "Profile Settings"}`}>
        <div className="flex flex-col gap-3">

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl">🏢</span>}
            </div>
            <label className="text-xs text-green-600 font-bold cursor-pointer hover:underline">
              Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Form fields */}
          {[
            { label: t.profile?.companyName    || "Company Name",       key:"name",            type:"text",  ph:"PT. Nusantara Hijau" },
            { label: t.profile?.emailLabel     || "Institutional Email",key:"email",           type:"email", ph:"esg@company.com" },
            { label: t.profile?.locationLabel  || "Location",           key:"location",        type:"text",  ph:"e.g. Jakarta Selatan" },
          ].map(fieldItem => (
            <div key={fieldItem.key}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{fieldItem.label}</label>
              <input type={fieldItem.type} placeholder={fieldItem.ph}
                value={form[fieldItem.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [fieldItem.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          ))}

          {/* Entity type */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">{t.profile?.entityTypeLabel || "Entity Type"}</label>
            <select value={form.entity || ""} onChange={e => setForm(prev => ({ ...prev, entity: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              {["PT","PT Tbk","CV","BUMN","Koperasi","Yayasan","NGO","Other"].map(ent => <option key={ent}>{ent}</option>)}
            </select>
          </div>

          {/* Biz type */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">{t.profile?.bizTypeLabel || "Business Activity"}</label>
            <select value={form.bizType || ""} onChange={e => setForm(prev => ({ ...prev, bizType: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              {["Manufacturing","Plantation","Mining","Energy","Transportation","Construction","Finance","Technology","Healthcare","Other"].map(biz => <option key={biz}>{biz}</option>)}
            </select>
          </div>

          <button onClick={saveProfile}
            className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {saved ? "✅ Saved!" : t.profile?.save || "Save Profile"}
          </button>
        </div>
      </Modal>

      {/* ── Asset Modal ──────────────────────────────────────────────────────── */}
      <Modal open={assetModal} onClose={() => { setAssetModal(false); setAssetForm({}); setAssetEditItem(null); }}
        title={assetTab === "company" ? "🏢 Add Company" : "🌿 Add Land"}>
        <div className="flex flex-col gap-3">
          {assetTab === "company" ? (
            <>
              {[
                { label:"Company Name",     key:"name",     type:"text",   ph:"PT. Anak Perusahaan" },
                { label:"Entity Type",      key:"type",     type:"select", options:["PT","CV","LLC","Other"] },
                { label:"Business Type",    key:"bizType",  type:"select", options:["Manufacturing","Plantation","Mining","Energy","Other"] },
                { label:"Location",         key:"location", type:"text",   ph:"e.g. Kab. Siak, Riau" },
              ].map(fieldItem => (
                <div key={fieldItem.key}>
                  <label className="text-xs font-bold text-gray-600 block mb-1">{fieldItem.label}</label>
                  {fieldItem.type === "select"
                    ? <select value={assetForm[fieldItem.key] || ""} onChange={e => setAssetForm(prev => ({ ...prev, [fieldItem.key]: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                        {fieldItem.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    : <input type={fieldItem.type} placeholder={fieldItem.ph}
                        value={assetForm[fieldItem.key] || ""}
                        onChange={e => setAssetForm(prev => ({ ...prev, [fieldItem.key]: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                  }
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { label:"Parcel Name",  key:"name",  type:"text",   ph:"e.g. Lahan Gambut Riau" },
                { label:"Area (ha)",    key:"area",  type:"number", ph:"e.g. 250" },
                { label:"Latitude",     key:"lat",   type:"number", ph:"e.g. -0.789275" },
                { label:"Longitude",    key:"lng",   type:"number", ph:"e.g. 113.921327" },
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
                <label className="text-xs font-bold text-gray-600 block mb-1">Land Type</label>
                <select value={assetForm.type || "forest"} onChange={e => setAssetForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                  {[["forest","🌲 Forest"],["peatland","🌾 Peatland"],["mangrove","🌴 Mangrove"],["agricultural","🌱 Agricultural"],["industrial","🏭 Industrial"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </>
          )}
          <button onClick={saveAsset} disabled={!assetForm.name}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {assetEditItem ? "Save Changes" : `Add ${assetTab === "company" ? "Company" : "Land"}`}
          </button>
        </div>
      </Modal>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}

      {/* Company hero card */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"linear-gradient(135deg,#14532d,#0f766e)" }}>
        <div className="p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {avatarPreview
              ? <img src={avatarPreview} alt="logo" className="w-full h-full object-cover" />
              : <span className="text-3xl">🏢</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-base truncate">{company?.name || "PT. Nusantara Hijau"}</p>
            <p className="text-green-200 text-xs">{company?.entity || "PT"} · {company?.bizType || "Manufacturing"}</p>
            <p className="text-green-300 text-xs truncate">{company?.location || "—"}</p>
          </div>
          <button onClick={() => setSettingsModal(true)}
            className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 flex-shrink-0">
            ⚙️
          </button>
        </div>
        {company?.walletId && (
          <div className="px-5 pb-4">
            <p className="text-xs text-green-300 font-mono truncate">🔗 {company.walletId}</p>
          </div>
        )}
      </div>

      {/* ESG Score card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">{t.profile?.esg || "ESG Score"}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            company?.esgStatus === "verified" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {company?.esgStatus === "verified" ? "✅ Verified" : "⏳ Not assessed"}
          </span>
        </div>
        {company?.esgScore ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl"
              style={{ background: company.esgScore >= 70 ? "#dcfce7" : company.esgScore >= 50 ? "#fef3c7" : "#fee2e2",
                       color:      company.esgScore >= 70 ? "#166534" : company.esgScore >= 50 ? "#92400e" : "#991b1b" }}>
              {company.esgScore}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                <div className="h-2 rounded-full transition-all"
                  style={{ width:`${company.esgScore}%`, background:"linear-gradient(90deg,#16a34a,#0d9488)" }} />
              </div>
              <p className={`text-xs font-bold ${esgColor}`}>
                {company.esgScore >= 70 ? "Good — Low Risk" : company.esgScore >= 50 ? "Average — Medium Risk" : "Poor — High Risk"}
              </p>
              <p className="text-xs text-gray-400">Indicative · Unverified by 3rd party</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">{t.profile?.esgDesc || "Complete the ESG assessment to get your score."}</p>
            <button onClick={() => { setEsgStep(0); setEsgAnswers([]); setEsgModal(true); }}
              className="py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
              {t.profile?.esgStart || "Start ESG Assessment →"}
            </button>
          </div>
        )}
        {company?.esgScore && (
          <button onClick={() => { setEsgStep(0); setEsgAnswers([]); setEsgModal(true); }}
            className="mt-3 w-full py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-500">
            Re-assess ESG
          </button>
        )}
      </div>

      {/* Blockchain Wallet card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-800">{t.profile?.wallet || "Blockchain Wallet"}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            company?.walletId ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {company?.walletId ? "✅ Active" : "Not generated"}
          </span>
        </div>
        {company?.walletId ? (
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Wallet ID</p>
            <p className="font-mono text-xs text-gray-700 break-all">{company.walletId}</p>
          </div>
        ) : (
          <button onClick={() => setWalletModal(true)}
            className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all ${glowing ? "scale-105 shadow-lg" : ""}`}
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {t.profile?.generate || "Generate Wallet"}
          </button>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {t.profile?.walletNote || "Wallet ID can only be generated once and is permanently stored."}
        </p>
      </div>

      {/* ISO Certificate card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-gray-800">ISO 14064 Certificate</p>
            <p className="text-xs text-gray-400">Required to offer carbon credits on the Bursa</p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isoVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {isoVerified ? "✅ Verified" : "⏳ Pending"}
          </span>
        </div>
        {!isoVerified && (
          <>
            <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-50 hover:border-green-400 transition-all">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">
                  {isoCert ? isoCert.name : "Upload ISO 14064 Certificate"}
                </p>
                <p className="text-xs text-gray-400">PDF or image file</p>
              </div>
              <input type="file" accept=".pdf,image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files[0];
                  if (!f) return;
                  const ok = f.type.startsWith("image/") || f.type === "application/pdf";
                  if (!ok) { setCertError("Rejected — must be PDF or image."); return; }
                  setCertError(""); setIsoCert(f);
                }} />
            </label>
            {certError && <p className="text-xs text-red-500 mt-1">{certError}</p>}
            {isoCert && (
              <button onClick={submitISO} disabled={isoUploading}
                className="mt-2 w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                {isoUploading ? "Uploading..." : "Submit for Verification →"}
              </button>
            )}
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <p className="text-xs text-amber-700">
                <strong>Opsi B (Flexible):</strong> You can list land on the Bursa without ISO, but it will show as "Unverified". ISO-verified credits command higher prices.
              </p>
            </div>
          </>
        )}
        {isoVerified && (
          <div className="bg-green-50 rounded-xl px-3 py-2">
            <p className="text-xs text-green-700 font-bold">✅ ISO 14064 verified — your credits are eligible for Certified Credit badge on the Bursa.</p>
          </div>
        )}
      </div>

      {/* Multi-asset panel */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[["company","🏢 Companies"],["land","🌿 Land Parcels"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setAssetTab(tab)}
              className={`flex-1 py-3 text-xs font-bold transition-all ${
                assetTab === tab ? "text-green-700 border-b-2 border-green-600 bg-green-50" : "text-gray-500"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-2">
            {(assetTab === "company" ? myCompanies : myLands).map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-xl flex-shrink-0">{assetTab === "company" ? "🏢" : "🌿"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    {assetTab === "company"
                      ? `${item.type || ""} · ${item.bizType || ""}`.trim()
                      : `${item.area || "—"} ha · ${item.type || ""}`}
                  </p>
                </div>
                {item.isMain
                  ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Main</span>
                  : <button onClick={() => deleteAsset(item.id)} className="text-xs text-red-400 font-bold hover:underline">Delete</button>}
              </div>
            ))}
          </div>
          <button onClick={() => { setAssetForm({}); setAssetEditItem(null); setAssetModal(true); }}
            className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold border-2 border-dashed border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-all">
            + {assetTab === "company" ? "Add Subsidiary" : "Add Land Parcel"}
          </button>
        </div>
      </div>

      {/* Exit button */}
      <button onClick={() => setExitModal(true)}
        className="w-full py-3 rounded-xl font-bold border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-all">
        🚪 {t.exit?.btn || "Exit App"}
      </button>

    </div>
  );
}

export default ProfilePage;