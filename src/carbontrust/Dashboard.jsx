/**
 * CarbonTrust — Dashboard.jsx
 * Home page: KPI cards, live IoT sensors, land parcels, AI alerts
 */
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Header from './App'; 
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import {
  COMPANY_ID, CREDIT_PRICE, apiFetch,
  calcAbsorption, convertUnit, useInterval,
  Modal, SBadge, Spinner, SparkLine, Ic,
} from "./shared.jsx";

export function Dashboard({ parcels, alerts, company, setPage, t }) {
  const [liveIoT, setLiveIoT] = useState({ temp: 24.7, hum: 68, co2: 142 });
  const [tH, setTH] = useState(Array.from({ length: 20 }, (_, i) => 23 + Math.sin(i / 3) * 2 + Math.random()));
  const [hH, setHH] = useState(Array.from({ length: 20 }, (_, i) => 65 + Math.cos(i / 2.5) * 5 + Math.random() * 2));
  const [cH, setCH] = useState(Array.from({ length: 20 }, (_, i) => 135 + i * 0.4 + Math.random() * 3));
  const [unit, setUnit] = useState("t");
  const [histModal, setHistModal] = useState(false);
  const [histParcelId, setHistParcelId] = useState("LP-001");
  const [histData, setHistData] = useState([]);
  const [lang, setLang] = useState('en'); 
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    try {
      const socket = io("https://carbon-trust-be-production.up.railway.app");
      socket.on("iot_live", ({ parcelId, data }) => {
        if (parcelId === "LP-001") {
          setLiveIoT({ temp: data.temp, hum: data.hum, co2: data.co2 });
          setTH(a => [...a.slice(-19), data.temp]);
          setHH(a => [...a.slice(-19), +data.hum]);
          setCH(a => [...a.slice(-19), data.co2]);
        }
      });
      return () => socket.disconnect();
    } catch {
      const id = setInterval(() => {
        setLiveIoT(p => {
          const temp = +(p.temp + (Math.random() - .5) * .4).toFixed(1);
          const hum  = +(p.hum  + (Math.random() - .5) * 1.2).toFixed(0);
          const co2  = +(p.co2  + (Math.random() - .48) * 2).toFixed(1);
          setTH(a => [...a.slice(-19), temp]);
          setHH(a => [...a.slice(-19), +hum]);
          setCH(a => [...a.slice(-19), co2]);
          return { temp, hum: +hum, co2 };
        });
      }, 2000);
      return () => clearInterval(id);
    }
  }, []);

async function handleDismiss(alertId) {
  await fetch(`http://localhost:3000/api/alerts/${alertId}`, { method: "DELETE" });
  setAlerts(prev => prev.filter(a => a.id !== alertId));
}

<Header alerts={alerts} onDismiss={handleDismiss} lang={lang} setLang={setLang} t={t} />

  async function openHistory(parcelId) {
    setHistParcelId(parcelId);
    const data = await apiFetch(`/iot/${parcelId}/history?hours=72`);
    if (data && Array.isArray(data)) {
      setHistData(data.filter((_, i) => i % 6 === 0).map(d => ({
        time: new Date(d.ts).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
        temp: d.temp, hum: d.hum, co2: d.co2,
      })));
    } else {
      setHistData(Array.from({ length: 36 }, (_, i) => ({
        time: `${Math.floor(i * 2)}:00`,
        temp: +(24 + Math.sin(i / 5) * 2).toFixed(1),
        hum:  +(67 + Math.cos(i / 4) * 5).toFixed(0),
        co2:  +(135 + i * 0.3).toFixed(1),
      })));
    }
    setHistModal(true);
  }

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));
  const totalAbs  = parseFloat(parcels.reduce((s, p) => s + Math.max(0,  calcAbsorption(p)), 0).toFixed(2));
  const totalEm   = parseFloat(parcels.reduce((s, p) => s + Math.max(0, -calcAbsorption(p)), 0).toFixed(2));
  const netBal    = parseFloat((totalAbs - totalEm).toFixed(2));
  const credits   = Math.max(0, Math.floor(netBal * 12));
  const creditsUSD = (credits * CREDIT_PRICE).toLocaleString();
  const cv = v => convertUnit(v, unit);
  const uSuffix = t.dash.units[unit];

  return (
    <div className="flex flex-col gap-3 pb-4 fade-up">
      {/* Hero */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#14532d 0%,#0f766e 100%)" }}>
        <div className="p-4">
          <p className="text-green-200 text-xs font-bold uppercase tracking-widest">{company.name}</p>
          <p className="text-white/80 text-xs mt-0.5">{t.dash.tagline}</p>
          <div className="flex gap-1 mt-3">
            {["t","kt","Mt","kg"].map(u => (
              <button key={u} onClick={() => setUnit(u)}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${unit === u ? "bg-white text-green-800" : "bg-white/20 text-white/80 hover:bg-white/30"}`}>
                {t.dash.units[u]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="px-4 grid grid-cols-3 gap-2">
        {[
          { l: t.dash.totalAbs,  v: cv(totalAbs), color: "emerald", icon: "🌿" },
          { l: t.dash.totalEm,   v: cv(totalEm),  color: "red",     icon: "🏭" },
          { l: t.dash.netCarbon, v: cv(netBal),   color: netBal >= 0 ? "teal" : "red", icon: netBal >= 0 ? "⚖️" : "⚠️" },
        ].map((k, i) => (
          <div key={i} className="card p-3 text-center">
            <p className="text-xl mb-0.5">{k.icon}</p>
            <p className={`font-black text-sm ${k.color === "emerald" ? "text-emerald-700" : k.color === "red" ? "text-red-600" : "text-teal-700"}`}>{k.v}</p>
            <p className="text-xs text-gray-400 leading-tight">{uSuffix}</p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>

      {/* Credits */}
      <div className="px-4 grid grid-cols-2 gap-2">
        <div className="card p-3 bg-green-50 border-green-200">
          <p className="text-xs text-green-600 font-semibold">{t.dash.credits}</p>
          <p className="font-black text-green-700 text-xl">{credits.toLocaleString()}</p>
          <p className="text-xs text-green-600">{uSuffix}/year</p>
        </div>
        <div className="card p-3 bg-teal-50 border-teal-200">
          <p className="text-xs text-teal-600 font-semibold">{t.dash.creditsUSD}</p>
          <p className="font-black text-teal-700 text-xl">${creditsUSD}</p>
          <p className="text-xs text-teal-600">@ ${CREDIT_PRICE}/t</p>
        </div>
      </div>

      {/* IoT Sensors */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-800">{t.dash.liveIoT}</p>
          <button onClick={() => openHistory("LP-001")}
            className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-bold hover:bg-gray-200">
            <Ic.Chart />{t.dash.history}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Temperature", v: `${liveIoT.temp}°C`, c: "#ef4444", d: tH },
            { l: "Humidity",    v: `${liveIoT.hum}%`,  c: "#3b82f6", d: hH },
            { l: "CO₂ Abs.",   v: `${liveIoT.co2}t`,  c: "#10b981", d: cH },
          ].map((s, i) => (
            <div key={i} className="card p-3">
              <p className="text-xs text-gray-400">{s.l}</p>
              <p className="font-black text-gray-800 text-base">{s.v}</p>
              <SparkLine data={s.d} color={s.c} h={24} />
            </div>
          ))}
        </div>
      </div>

      {/* Land parcels */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-800">{t.dash.myProjects}</p>
          <button onClick={() => setPage("land")} className="text-xs text-green-600 font-bold hover:underline">{t.dash.seeAll}</button>
        </div>
        <div className="flex flex-col gap-2">
          {parcels.map(p => {
            const abs = calcAbsorption(p);
            const isEm = abs < 0;
            return (
              <div key={p.id} className={`card flex items-center gap-3 p-3 border-l-4 ${p.status==="flooded"?"border-l-blue-500":p.status==="degraded"?"border-l-amber-500":p.status==="burned"?"border-l-red-500":"border-l-emerald-500"}`}>
                <span className="text-2xl">{p.type==="forest"?"🌲":p.type==="peatland"?"🌾":p.type==="mangrove"?"🌴":"🏞️"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.area} ha · NDVI {p.ndvi}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${isEm?"text-red-600":"text-emerald-700"}`}>{isEm?"▼":"▲"}{Math.abs(cv(abs))}{uSuffix}</p>
                  <SBadge status={p.status} t={t} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Alerts */}
      {visibleAlerts.length > 0 && (
        <div className="px-4">
          <p className="text-sm font-bold text-gray-800 mb-2">{t.dash.alerts}</p>
          <div className="flex flex-col gap-2">
            {visibleAlerts.map(a => (
              <div key={a.id} className={`card flex items-start gap-3 p-3 border-l-4 ${a.type==="critical"?"border-l-red-500 bg-red-50":a.type==="warning"?"border-l-amber-500 bg-amber-50":"border-l-emerald-500 bg-emerald-50"}`}>
                <span className="text-base flex-shrink-0 mt-0.5">{a.type==="critical"?"🚨":a.type==="warning"?"⚠️":"✅"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700">{a.parcelId}</p>
                  <p className="text-xs text-gray-600">{a.message}</p>
                </div>
                <button onClick={() => setDismissedAlerts(d => [...d, a.id])}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 text-sm flex items-center justify-center font-bold shadow-sm transition-all" title={t.dash.dismiss}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IoT History Modal */}
      <Modal open={histModal} onClose={() => setHistModal(false)} title={`📈 IoT History — ${histParcelId} (72h)`} wide>
        <div className="mb-3 flex gap-2 flex-wrap">
          {parcels.map(p => (
            <button key={p.id} onClick={() => openHistory(p.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${histParcelId===p.id?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {p.id}
            </button>
          ))}
        </div>
        {histData.length > 0 ? (
          <>
            <p className="text-xs text-gray-500 mb-2">Temperature (°C) · Last 72 hours</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={histData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={6} />
                <YAxis tick={{ fontSize: 9 }} width={30} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="temp" stroke="#ef4444" dot={false} strokeWidth={1.5} name="Temp °C" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mb-2 mt-3">Humidity (%) & CO₂ Absorption (t)</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={histData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={6} />
                <YAxis tick={{ fontSize: 9 }} width={30} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="hum" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="Hum %" />
                <Line type="monotone" dataKey="co2" stroke="#10b981" dot={false} strokeWidth={1.5} name="CO₂ t" />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : <div className="flex justify-center py-8"><Spinner /></div>}
      </Modal>
    </div>
  );
}
