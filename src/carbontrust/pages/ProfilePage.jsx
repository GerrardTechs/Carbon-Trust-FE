/**
 * ProfilePage.jsx — Company profile: ISO cert, multi-asset mgmt, exit modal.
 */
import { useState } from "react";
import { apiFetch, Modal, COMPANY_ID } from "../shared.jsx";

export function ProfilePage({
  company, setCompany, t, onLogout, onExit,
  companyId
}) {
  const [settingsModal, setSettingsModal] = useState(false);
  const [exitModal,     setExitModal]     = useState(false);

  const [form,  setForm]  = useState({ ...company });
  const [saved, setSaved] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(company?.profilePhoto || null);

  const [isoCert,      setIsoCert]      = useState(null);
  const [certError,    setCertError]    = useState("");
  const [isoVerified,  setIsoVerified]  = useState(company?.verified || false);
  const [isoUploading, setIsoUploading] = useState(false);

  const [assetTab,      setAssetTab]      = useState("company");
  const [assetModal,    setAssetModal]    = useState(false);
  const [assetEditItem, setAssetEditItem] = useState(null);
  const [myCompanies,   setMyCompanies]   = useState([
    { id:"main", name: company?.name || "PT. Anda", type: company?.entity || "PT",
      bizType: company?.bizType || "Manufacturing", location: company?.location || "-", isMain: true },
  ]);
  const [myLands,   setMyLands]   = useState([]);
  const [assetForm, setAssetForm] = useState({});

  const cid = companyId || company?.id || company?._id || COMPANY_ID;

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

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-24 fade-up">

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

      <Modal open={settingsModal} onClose={() => setSettingsModal(false)} title={`⚙️ ${t.profile?.settings || "Profile Settings"}`}>
        <div className="flex flex-col gap-3">
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
          {[
            { label: t.profile?.companyName || "Company Name", key:"name", type:"text", ph:"PT. Nusantara Hijau" },
            { label: t.profile?.emailLabel || "Institutional Email", key:"email", type:"email", ph:"esg@company.com" },
            { label: t.profile?.locationLabel || "Location", key:"location", type:"text", ph:"e.g. Jakarta Selatan" },
          ].map(fieldItem => (
            <div key={fieldItem.key}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{fieldItem.label}</label>
              <input type={fieldItem.type} placeholder={fieldItem.ph}
                value={form[fieldItem.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [fieldItem.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          ))}
          <button onClick={saveProfile}
            className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {saved ? "✅ Saved!" : t.profile?.save || "Save Profile"}
          </button>
        </div>
      </Modal>

      <Modal open={assetModal} onClose={() => { setAssetModal(false); setAssetForm({}); setAssetEditItem(null); }}
        title={assetTab === "company" ? "🏢 Add Company" : "🌿 Add Land"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Name</label>
            <input type="text" placeholder="Name"
              value={assetForm.name || ""}
              onChange={e => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <button onClick={saveAsset} disabled={!assetForm.name}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {assetEditItem ? "Save Changes" : "Add"}
          </button>
        </div>
      </Modal>

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
      </div>

      {(() => {
        const cr = (() => {
          try { return JSON.parse(localStorage.getItem("carbon_credit_result") || "null"); }
          catch { return null; }
        })();
        if (!cr) return null;
        const isPos = cr.isPositive;
        return (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-800">⚡ Kredit Karbon</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPos ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                {isPos ? "Surplus" : "Defisit"}
              </span>
            </div>
            <p className={`font-black text-2xl ${isPos ? "text-emerald-700" : "text-red-600"}`}>
              {isPos ? "+" : ""}{cr.kreditTonYr?.toLocaleString()} tCO₂e
            </p>
            <p className="text-xs text-gray-400 mt-0.5">per tahun</p>
          </div>
        );
      })()}

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
          </>
        )}
        {isoVerified && (
          <div className="bg-green-50 rounded-xl px-3 py-2">
            <p className="text-xs text-green-700 font-bold">✅ ISO 14064 verified — eligible for Certified Credit badge on the Bursa.</p>
          </div>
        )}
      </div>

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

      <button onClick={() => setExitModal(true)}
        className="w-full py-3 rounded-xl font-bold border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-all">
        🚪 {t.exit?.btn || "Exit App"}
      </button>
    </div>
  );
}

export default ProfilePage;
