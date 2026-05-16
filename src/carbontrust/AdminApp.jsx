import { useState, useEffect } from "react";
import { apiFetch, GCSS, Header } from "./shared.jsx";

function StatCard({ icon, label, value, sub, color = "green" }) {
  const colors = {
    green:  { bg:"bg-green-50",  text:"text-green-700",  border:"border-green-200"  },
    red:    { bg:"bg-red-50",    text:"text-red-600",    border:"border-red-200"    },
    blue:   { bg:"bg-blue-50",   text:"text-blue-700",   border:"border-blue-200"   },
    amber:  { bg:"bg-amber-50",  text:"text-amber-700",  border:"border-amber-200"  },
    slate:  { bg:"bg-slate-50",  text:"text-slate-700",  border:"border-slate-200"  },
  };
  const c = colors[color];
  return (
    <div className={`card p-3 text-center border ${c.border} ${c.bg}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`font-black text-lg ${c.text}`}>{value}</p>
      <p className="text-xs text-gray-500 leading-tight">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminApp({ onLogout, user }) {
  const [overview, setOverview]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("overview"); // overview | companies | alerts
  const [search, setSearch]       = useState("");

  useEffect(() => {
    apiFetch("/admin/overview").then(d => {
      if (d) setOverview(d);
      setLoading(false);
    });
  }, []);

  const filtered = overview?.companies?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen" style={{ background:"#f1f5f1" }}>
      <style>{GCSS}</style>
      <div className="max-w-md mx-auto relative min-h-screen flex flex-col bg-gray-50 shadow-2xl">

        {/* Admin Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="text-sm font-black text-gray-800">Admin Dashboard</p>
                <p className="text-xs text-gray-400">CarbonTrust Platform</p>
              </div>
            </div>
            <button onClick={onLogout}
              className="text-xs text-red-500 font-bold hover:underline">
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100">
            {[
              { key:"overview",   label:"Overview"    },
              { key:"companies",  label:"Perusahaan"  },
              { key:"alerts",     label:"Alerts"      },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors
                  ${tab === t.key
                    ? "border-b-2 border-green-600 text-green-700"
                    : "text-gray-400 hover:text-gray-600"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-gray-400">Memuat data platform...</p>
            </div>
          ) : !overview ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-red-500">Gagal memuat data. Cek koneksi BE.</p>
            </div>
          ) : (
            <>
              {/* ── OVERVIEW TAB ── */}
              {tab === "overview" && (
                <div className="flex flex-col gap-4 px-4 pt-4">

                  {/* Platform KPI */}
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard icon="🏢" label="Total Perusahaan"    value={overview.totalCompanies}  color="slate" />
                    <StatCard icon="🌿" label="Total Lahan"         value={overview.totalParcels}    color="green" />
                    <StatCard icon="📊" label="Total Serapan/bln"   value={`${overview.totalAbsorption} t`} color="green" sub="tCO₂e" />
                    <StatCard icon="🏭" label="Total Emisi/bln"     value={`${overview.totalEmission} t`}   color="red"   sub="tCO₂e" />
                    <StatCard icon="🎫" label="Total Kredit Karbon" value={overview.totalCredits?.toLocaleString()} color="blue" sub="tCO₂e/yr" />
                    <StatCard icon="✅" label="Terverifikasi ISO"   value={overview.verifiedCount}   color="amber" />
                  </div>

                  {/* Net platform balance */}
                  <div className="rounded-2xl p-4 text-white"
                    style={{ background: overview.totalAbsorption >= overview.totalEmission
                      ? "linear-gradient(135deg,#166534,#0f766e)"
                      : "linear-gradient(135deg,#dc2626,#b45309)" }}>
                    <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Net Platform Balance</p>
                    <p className="text-4xl font-black">
                      {overview.totalAbsorption >= overview.totalEmission ? "+" : ""}
                      {(overview.totalAbsorption - overview.totalEmission).toFixed(2)}
                    </p>
                    <p className="text-sm opacity-80">tCO₂e / bulan · seluruh platform</p>
                  </div>

                  {/* Active alerts summary */}
                  {overview.alertsCount > 0 && (
                    <div className="card p-3 border border-red-200 bg-red-50 flex items-center gap-3">
                      <span className="text-2xl">🚨</span>
                      <div>
                        <p className="text-sm font-bold text-red-700">
                          {overview.alertsCount} Critical Alert Aktif
                        </p>
                        <p className="text-xs text-red-500">
                          Cek tab Alerts untuk detail
                        </p>
                      </div>
                      <button onClick={() => setTab("alerts")}
                        className="ml-auto text-xs text-red-600 font-bold hover:underline">
                        Lihat →
                      </button>
                    </div>
                  )}

                  {/* Top companies by credits */}
                  <div className="card overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">Top Perusahaan — Kredit Karbon</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {[...overview.companies]
                        .sort((a,b) => b.netCredits - a.netCredits)
                        .slice(0, 5)
                        .map((c, i) => (
                          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                            <span className="text-lg font-black text-gray-300">#{i+1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{c.name}</p>
                              <p className="text-xs text-gray-400">{c.parcelsCount} lahan · {c.totalArea?.toLocaleString()} ha</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-green-700">{c.netCredits?.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">kredit</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── COMPANIES TAB ── */}
              {tab === "companies" && (
                <div className="flex flex-col gap-3 px-4 pt-4">
                  <input
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400"
                    placeholder="🔍 Cari perusahaan..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">{filtered.length} perusahaan</p>

                  {filtered.map(c => (
                    <div key={c.id} className="card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{c.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{c.id}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${
                          c.isoCertVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"}`}>
                          {c.isoCertVerified ? "✅ ISO" : "⏳ Pending"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {[
                          { l:"Lahan",    v:c.parcelsCount },
                          { l:"Serapan",  v:`${c.totalAbsorption}t` },
                          { l:"Kredit",   v:c.netCredits?.toLocaleString() },
                        ].map((s,i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs font-black text-gray-700">{s.v}</p>
                            <p className="text-xs text-gray-400">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{c.email}</p>
                        <p className="text-xs text-gray-400">
                          ESG: <span className={`font-bold ${c.esgScore >= 70 ? "text-green-600" : c.esgScore ? "text-amber-600" : "text-gray-400"}`}>
                            {c.esgScore ?? "—"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── ALERTS TAB ── */}
              {tab === "alerts" && (
                <div className="flex flex-col gap-3 px-4 pt-4">
                  <p className="text-xs text-gray-400">Alert aktif di seluruh platform</p>
                  {overview.companies.flatMap(c => {
                    // Tampilkan alerts dari semua company berdasarkan parcel status
                    const criticalParcels = overview.companies
                      .flatMap(comp => [])
                    return [];
                  })}

                  {/* Static alert cards dari overview */}
                  {overview.alertsCount === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-3xl mb-3">✅</p>
                      <p className="text-sm font-bold text-gray-600">Tidak ada critical alert</p>
                      <p className="text-xs text-gray-400">Semua lahan dalam kondisi normal</p>
                    </div>
                  ) : (
                    <div className="card p-4 border border-red-200 bg-red-50">
                      <p className="text-sm font-bold text-red-700 mb-1">
                        🚨 {overview.alertsCount} Critical Alert
                      </p>
                      <p className="text-xs text-red-600">
                        Lihat detail di masing-masing halaman perusahaan.
                        Akan ditampilkan langsung setelah BE alerts endpoint diupdate.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}