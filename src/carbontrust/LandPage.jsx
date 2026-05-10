/**
 * CarbonTrust — LandPage.jsx
 * Land ownership: satellite view, parcel list, simulate conditions, add parcel
 */
import { useState } from "react";
import {
  COMPANY_ID, apiFetch, ABS_RATES,
  calcAbsorption, useInterval,
  Modal, SBadge, Ic,
} from "./shared.jsx";

export function LandPage({ parcels, setParcels, t, lang }) {
  const [addModal, setAddModal] = useState(false);
  const [simModal, setSimModal] = useState(false);
  const [selParcel, setSelParcel] = useState(null);
  const [form, setForm] = useState({ name: "", type: "forest", area: "", lat: "", lng: "", depth: "" });
  const [saving, setSaving] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  useInterval(() => setScanLine(l => (l + 1) % 100), 25);

  async function addParcel() {
    setSaving(true);
    const res = await apiFetch("/parcels", {
      method: "POST",
      body: JSON.stringify({ ...form, companyId: COMPANY_ID }),
    });
    const newP = res || {
      id: "LP-" + String(parcels.length + 1).padStart(3, "0"),
      ...form, area: parseFloat(form.area), lat: parseFloat(form.lat), lng: parseFloat(form.lng),
      status: "healthy", ndvi: 0.70, depth: form.depth ? parseFloat(form.depth) : null,
      absorptionMonthly: parseFloat(((ABS_RATES[form.type]?.healthy || 0) * parseFloat(form.area || 0) / 12).toFixed(2)),
    };
    setParcels(prev => [...prev, newP]);
    setSaving(false);
    setAddModal(false);
    setForm({ name: "", type: "forest", area: "", lat: "", lng: "", depth: "" });
  }

  async function changeStatus(id, status) {
    await apiFetch(`/parcels/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    const ndviMap = { healthy: 0.75, flooded: 0.45, degraded: 0.28, burned: 0.10, drying: 0.32 };
    setParcels(prev => prev.map(p => p.id === id ? { ...p, status, ndvi: ndviMap[status] } : p));
    setSimModal(false);
  }

  const LF = { forest: "#166534", peatland: "#92400e", mangrove: "#0e7490", agricultural: "#a16207", industrial: "#475569" };
  const SS = { healthy: "#22c55e", flooded: "#60a5fa", degraded: "#f59e0b", burned: "#ef4444", drying: "#fb923c" };
  const displayParcels = viewAll ? parcels : parcels.slice(0, 3);

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4 fade-up">
      {/* Header */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#0f766e,#166534)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-teal-200 text-xs uppercase tracking-widest mb-0.5">{t.land.title}</p>
            <p className="font-black text-xl">{parcels.length} {lang==="id"?"Bidang Terdaftar":lang==="zh"?"已注册地块":lang==="ko"?"등록된 필지":lang==="ja"?"登録済み区画":"Registered Parcels"}</p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-colors">
            <Ic.Plus />{t.land.addParcel}
          </button>
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <div><p className="text-teal-300 text-xs">{t.land.area||"Area"}</p><p className="font-bold">{parcels.reduce((s, p) => s + p.area, 0).toLocaleString()} ha</p></div>
          <div className="border-l border-white/20 pl-4"><p className="text-teal-300 text-xs">{t.dash.totalAbs||"Absorption"}</p><p className="font-bold text-green-300">+{parcels.reduce((s, p) => s + Math.max(0, calcAbsorption(p)), 0).toFixed(1)} t/mo</p></div>
          <div className="border-l border-white/20 pl-4"><p className="text-teal-300 text-xs">{t.dash.totalEm||"Emission"}</p><p className="font-bold text-red-300">{parcels.reduce((s, p) => s + Math.max(0, -calcAbsorption(p)), 0).toFixed(1)} t/mo</p></div>
        </div>
      </div>

      {/* Satellite map with ownership polygons */}
      <div className="card overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><Ic.Map /><p className="font-bold text-gray-800 text-sm">Satellite View — Land Boundaries</p></div>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Sentinel-2</span>
        </div>
        {/* Google Maps iframe — shows all parcel locations */}
        <div className="relative" style={{ height: 240 }}>
          <iframe
            title="Land Map"
            width="100%"
            height="240"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyB-PLACEHOLDER_KEY&center=${parcels[0]?.lat || -1.24},${parcels[0]?.lng || 113.92}&zoom=8&maptype=satellite`}
          />
          {/* Overlay with sensor pings when map can't load */}
          <div className="absolute inset-0 bg-green-950 flex items-center justify-center" style={{ display: "none" }}>
            <p className="text-green-400 text-xs">Add Google Maps API key to enable satellite view</p>
          </div>
          {/* Fallback SVG map */}
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 400 240" style={{ background: "rgba(0,0,0,0)" }}>
              {parcels.map((p, idx) => {
                const positions = [[80, 60], [220, 40], [60, 140], [240, 140], [340, 100]];
                const [bx, by] = positions[idx] || [200, 120];
                const sc = SS[p.status] || "#22c55e";
                return (
                  <g key={p.id} onClick={() => setSelParcel(p)} style={{ cursor: "pointer" }}>
                    <rect x={bx} y={by} width={100} height={70} fill={LF[p.type]} opacity={selParcel?.id === p.id ? .7 : .4}
                      stroke={sc} strokeWidth={selParcel?.id === p.id ? 3 : 2}
                      strokeDasharray={p.status !== "healthy" ? "6,3" : "none"} rx="4" />
                    {p.status !== "healthy" && (
                      <circle cx={bx + 50} cy={by + 35} r="8" fill={sc} opacity=".7">
                        <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values=".7;0;.7" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={bx + 50} cy={by + 35} r="5" fill={sc} />
                    <text x={bx + 5} y={by + 14} fill="white" fontSize="9" fontWeight="bold" opacity=".9">{p.id}</text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-2 left-2 bg-black/60 rounded-lg px-2 py-1.5 flex flex-col gap-0.5">
              {Object.entries(SS).map(([s, c]) => (
                <span key={s} className="flex items-center gap-1 text-white/70 text-xs">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: c }} />{t.land.status[s]}
                </span>
              ))}
            </div>
          </div>
          {/* Scan line */}
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent pointer-events-none"
            style={{ top: `${scanLine}%`, transition: "top 25ms linear" }} />
        </div>

        {/* Google Maps link */}
        <div className="p-2 border-t border-gray-100 flex gap-2">
          {parcels.map(p => (
            <a key={p.id}
              href={`https://www.google.com/maps?q=${p.lat},${p.lng}&z=13&t=k`}
              target="_blank" rel="noreferrer"
              className="text-xs text-blue-600 hover:underline font-medium">{p.id}</a>
          ))}
        </div>
      </div>

      {/* Selected parcel detail */}
      {selParcel && (() => {
        const abs = calcAbsorption(selParcel);
        const isEm = abs < 0;
        const alertKey = selParcel.status === "flooded" ? "flooded" : selParcel.status === "degraded" && selParcel.type === "peatland" ? "peatland_degraded" : selParcel.status === "burned" ? "burned" : selParcel.status === "drying" ? "drying" : null;
        return (
          <div className={`card p-4 border-2 fade-up ${isEm ? "border-red-200" : "border-green-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-800">{selParcel.name}</p>
              <div className="flex items-center gap-2">
                <SBadge status={selParcel.status} t={t} />
                <button onClick={() => setSelParcel(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { l: "Area", v: `${selParcel.area} ha` },
                { l: "NDVI", v: selParcel.ndvi, c: selParcel.ndvi > 0.5 ? "text-green-700" : selParcel.ndvi > 0.3 ? "text-amber-600" : "text-red-600" },
                { l: "CO₂/mo", v: `${abs}t`, c: isEm ? "text-red-600" : "text-green-700" },
                { l: "Lat", v: selParcel.lat },
                { l: "Lng", v: selParcel.lng },
                ...(selParcel.depth ? [{ l: "Depth", v: `${selParcel.depth}m` }] : []),
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-xs text-gray-400">{item.l}</p>
                  <p className={`font-bold text-sm ${item.c || "text-gray-800"}`}>{item.v}</p>
                </div>
              ))}
            </div>
            {/* Risk description card — #26 */}
            {selParcel.status !== "healthy" && (() => {
              const riskInfo = {
                flooded:  { color:"blue",   icon:"🌊", gasInfo:"Oksigen terlarut berkurang → dekomposisi anaerobik melepas CH₄ & N₂O", action:"Cek drainase & sistem pompa segera" },
                degraded: { color:"amber",  icon:"⚠️", gasInfo:"Struktur tanah rusak → dekomposisi karbon organik melepas CO₂ tambahan", action:"Rehabilitasi vegetasi & perbaiki struktur lahan" },
                burned:   { color:"red",    icon:"🔥", gasInfo:"Pembakaran langsung melepas CO₂, CH₄, N₂O & partikel berbahaya", action:"Hentikan aktivitas di area terdampak, laporkan ke otoritas" },
                drying:   { color:"orange", icon:"🌡️", gasInfo:"Gambut kering kehilangan kelembaban → oksidasi melepas CO₂ & CH₄ dalam volume besar", action:"Rewetting segera: buka kanal, naikkan muka air gambut" },
              };
              const r = riskInfo[selParcel.status];
              if (!r) return null;
              const colorMap = {
                blue:   { bg:"bg-blue-50",   border:"border-blue-200",   text:"text-blue-800",   sub:"text-blue-600"   },
                amber:  { bg:"bg-amber-50",  border:"border-amber-200",  text:"text-amber-800",  sub:"text-amber-600"  },
                red:    { bg:"bg-red-50",     border:"border-red-200",    text:"text-red-800",    sub:"text-red-600"    },
                orange: { bg:"bg-orange-50", border:"border-orange-200", text:"text-orange-800", sub:"text-orange-600" },
              };
              const c = colorMap[r.color];
              return (
                <div className={`rounded-xl border px-3 py-2.5 mb-3 ${c.bg} ${c.border}`}>
                  <p className={`text-xs font-bold mb-1 ${c.text}`}>{r.icon} {t.land.alerts?.[selParcel.status] || selParcel.status.toUpperCase()}</p>
                  <p className={`text-xs mb-1.5 ${c.sub}`}>💨 <strong>Gas dilepas:</strong> {r.gasInfo}</p>
                  <p className={`text-xs font-bold ${c.text}`}>⚡ Tindakan: {r.action}</p>
                </div>
              );
            })()}
            <div className="flex gap-2">
              <button onClick={() => { setSelParcel(selParcel); setSimModal(true); }}
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-100">
                🔄 {t.land.simulate}
              </button>
              <a href={`https://www.google.com/maps?q=${selParcel.lat},${selParcel.lng}&z=14&t=k`}
                target="_blank" rel="noreferrer"
                className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 text-center">
                🗺 Google Maps
              </a>
            </div>
          </div>
        );
      })()}

      {/* Parcel list */}
      <div className="flex flex-col gap-2">
        {displayParcels.map(p => {
          const abs = calcAbsorption(p);
          return (
            <button key={p.id} onClick={() => setSelParcel(selParcel?.id === p.id ? null : p)}
              className={`card flex items-center gap-3 p-3 text-left transition-all ${selParcel?.id === p.id ? "border-2 border-green-400 shadow-md" : ""}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: LF[p.type] + "22" }}>
                {p.type === "forest" ? "🌲" : p.type === "peatland" ? "🌾" : p.type === "mangrove" ? "🌴" : "🏞️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                <p className="text-xs text-gray-500">{t.land.types[p.type]} · {p.area} ha · {p.lat?.toFixed(2)}, {p.lng?.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className={`font-black text-sm ${abs < 0 ? "text-red-600" : "text-green-700"}`}>{abs < 0 ? "▼" : "▲"}{Math.abs(abs)}t</p>
                <SBadge status={p.status} t={t} />
              </div>
            </button>
          );
        })}
        {parcels.length > 3 && (
          <button onClick={() => setViewAll(v => !v)}
            className="text-sm text-green-600 font-bold text-center py-2 hover:underline">
            {viewAll ? "Show less ↑" : `See all ${parcels.length} parcels →`}
          </button>
        )}
      </div>

      {/* Simulate Modal */}
      <Modal open={simModal} onClose={() => setSimModal(false)} title={`🔄 ${t.land.simulate}: ${selParcel?.name}`}>
        {selParcel && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">Select new condition — absorption/emission updates live across the app:</p>
            {Object.keys(ABS_RATES[selParcel.type] || {}).map(s => {
              const rate = ABS_RATES[selParcel.type][s];
              const monthly = +((rate * selParcel.area) / 12).toFixed(1);
              const active = selParcel.status === s;
              return (
                <button key={s} onClick={() => changeStatus(selParcel.id, s)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${active ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{t.land.status[s]}</p>
                    <p className="text-xs text-gray-500">IPCC rate: {rate} tCO₂/ha/yr</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm ${monthly < 0 ? "text-red-600" : "text-green-700"}`}>{monthly < 0 ? "▼" : "▲"}{Math.abs(monthly)} t/mo</p>
                    {active && <span className="text-xs text-green-600 font-bold">✓ Active</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Add Parcel Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={`➕ ${t.land.addParcel}`}>
        <div className="flex flex-col gap-3">
          {[
            { l: t.land.name, k: "name", ph: "e.g. Borneo Forest Block C" },
            { l: t.land.area, k: "area", ph: "450", type: "number" },
            { l: t.land.lat, k: "lat", ph: "-1.2412", type: "number" },
            { l: t.land.lng, k: "lng", ph: "113.9213", type: "number" },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{f.l}</label>
              <input type={f.type || "text"} placeholder={f.ph} value={form[f.k]}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">{t.land.type}</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              {Object.entries(t.land.types).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {form.type === "peatland" && (
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t.land.depth}</label>
              <input type="number" placeholder="4.5" value={form.depth}
                onChange={e => setForm(p => ({ ...p, depth: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          )}
          {/* GMaps preview link */}
          {form.lat && form.lng && (
            <a href={`https://www.google.com/maps?q=${form.lat},${form.lng}&t=k`} target="_blank" rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Ic.Map />Preview on Google Maps →
            </a>
          )}
          <button onClick={addParcel} disabled={saving || !form.name || !form.area || !form.lat || !form.lng}
            className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#166534,#0f766e)" }}>
            {saving ? <Spinner /> : null}{t.common.add}
          </button>
        </div>
      </Modal>
    </div>
  );
}