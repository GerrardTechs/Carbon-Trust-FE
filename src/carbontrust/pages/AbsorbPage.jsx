/**
 * AbsorbPage.jsx — Kalkulator Serapan Karbon
 * Mengelompokkan 3 kategori serapan:
 *  1. Serapan Karbon Hijau (Hutan/Lahan) — input manual + upload bukti
 *  2. Renewable Energy (Panel Surya)
 *  3. Biogenik / Biogas
 *
 * Output: totalAbsorbKg/bulan → disimpan ke localStorage "carbon_absorb_result"
 * Digunakan oleh CertificatePage untuk Net Credit
 */
import { useState } from "react";

const TABS = [
  { id:"green",  icon:"🌿", label:"Karbon Hijau" },
  { id:"solar",  icon:"☀️", label:"Panel Surya"  },
  { id:"biogas", icon:"♻️", label:"Biogas"       },
];

export function AbsorbPage({ t, setPage }) {
  const [tab, setTab] = useState("green");

  // ── Karbon Hijau ──────────────────────────────────────────────────────────
  const [greenAbsorb,   setGreenAbsorb]   = useState(""); // tCO2e/tahun (input manual)
  const [greenCertFile, setGreenCertFile] = useState(null);
  const [greenLandFile, setGreenLandFile] = useState(null);
  const [greenSaved,    setGreenSaved]    = useState(false);

  // ── Solar Panel ───────────────────────────────────────────────────────────
  const [solarPanels,   setSolarPanels]   = useState("");
  const [solarWp,       setSolarWp]       = useState("");
  const [solarSunHours, setSolarSunHours] = useState("3.5");
  const [solarProofs,   setSolarProofs]   = useState([]);

  const solarKwhDay   = +(((parseFloat(solarPanels)||0) * (parseFloat(solarWp)||0) * (parseFloat(solarSunHours)||3.5) * 0.75) / 1000).toFixed(3);
  const solarKwhMonth = +(solarKwhDay * 30).toFixed(2);
  const solarOffsetKg = +(solarKwhMonth * 0.87).toFixed(2); // EF ESDM 0.87

  // ── Biogas ────────────────────────────────────────────────────────────────
  const BIOGAS_CONV = { organik:0.01, sapi:0.04, babi:0.06, ayam:0.07, pome:28.0 };
  const [biogasInputs, setBiogasInputs] = useState({ organik:"", sapi:"", babi:"", ayam:"", pome:"" });
  const [biogasProofs, setBiogasProofs] = useState([]);

  const biogasM3Ch4    = Object.entries(biogasInputs).reduce((s,[k,v]) => s + (parseFloat(v)||0) * (BIOGAS_CONV[k]||0), 0) * 0.60;
  const biogasTonCh4   = +(biogasM3Ch4 * 0.00067).toFixed(6);
  const biogasTCo2eDay = +(biogasTonCh4 * 28).toFixed(4);
  const biogasTCo2eYr  = +(biogasTCo2eDay * 365).toFixed(3);
  const biogasOffsetKg = +(biogasTCo2eYr / 12 * 1000).toFixed(2);

  // ── Total semua serapan (kg/bulan) ────────────────────────────────────────
  const greenOffsetKg = +((parseFloat(greenAbsorb)||0) * 1000 / 12).toFixed(2); // tCO2/thn → kg/bln
  const totalAbsorbKg = +(greenOffsetKg + solarOffsetKg + biogasOffsetKg).toFixed(2);

  function saveAbsorb() {
    localStorage.setItem("carbon_absorb_result", JSON.stringify({
      totalAbsorbKg,
      greenOffsetKg,
      solarOffsetKg,
      biogasOffsetKg,
      greenAbsorbTonYr: parseFloat(greenAbsorb) || 0,
      savedAt: new Date().toISOString(),
    }));
    setGreenSaved(true);
    setTimeout(() => setGreenSaved(false), 2000);
  }

  return (
    <div className="flex flex-col pb-4 fade-up">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <p className="text-lg font-black text-gray-800">Kalkulator Serapan</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Total Serapan digunakan untuk menghitung Net Carbon Credit
        </p>
      </div>

      {/* Total summary banner */}
      {totalAbsorbKg > 0 && (
        <div className="mx-4 mt-3 rounded-xl p-4 text-white" style={{ background:"linear-gradient(135deg,#14532d,#0f766e)" }}>
          <p className="text-xs opacity-75 mb-1">Total Serapan (semua kategori)</p>
          <p className="font-black text-2xl">{totalAbsorbKg.toLocaleString()} kg CO₂e</p>
          <p className="text-xs opacity-75">per bulan = {(totalAbsorbKg * 12 / 1000).toFixed(2)} tCO₂e/tahun</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { l:"Karbon Hijau", v:greenOffsetKg+" kg/bln" },
              { l:"Solar Panel",  v:solarOffsetKg+" kg/bln" },
              { l:"Biogas",       v:biogasOffsetKg+" kg/bln" },
            ].map((item,i) => (
              <div key={i} className="bg-white/15 rounded-xl p-2 text-center">
                <p className="font-bold text-xs">{item.v}</p>
                <p className="text-xs opacity-70 mt-0.5">{item.l}</p>
              </div>
            ))}
          </div>
          <button onClick={saveAbsorb}
            className="mt-3 w-full py-2 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-all">
            {greenSaved ? "✅ Tersimpan!" : "💾 Simpan Hasil Serapan"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 pt-3">
        {TABS.map(tabItem => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              tab === tabItem.id
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}>
            {tabItem.icon} {tabItem.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Karbon Hijau ──────────────────────────────────────────────── */}
      {tab === "green" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-green-50 border-green-200">
            <p className="text-sm font-bold text-green-800 mb-1">🌿 Serapan Karbon Lahan / Hutan</p>
            <p className="text-xs text-green-700 leading-relaxed">
              Masukkan total serapan karbon dari lahan atau hutan Anda yang sudah
              dihitung dan diverifikasi oleh pihak ketiga (konsultan lingkungan, auditor karbon, dll).
            </p>
          </div>

          <div className="card p-4 flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Total Serapan Karbon Lahan (tCO₂e / tahun)
              </label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 1250.50"
                value={greenAbsorb} onChange={e => setGreenAbsorb(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400" />
              <p className="text-xs text-gray-400 mt-1">
                Angka ini harus berasal dari hasil hitungan pihak ketiga yang terverifikasi.
              </p>
            </div>

            {greenAbsorb && parseFloat(greenAbsorb) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <p className="text-xs text-green-700 font-bold">
                  = {(parseFloat(greenAbsorb) * 1000 / 12).toFixed(0)} kg CO₂e/bulan
                </p>
                <p className="text-xs text-green-600">
                  ({parseFloat(greenAbsorb).toFixed(2)} tCO₂e/tahun ÷ 12)
                </p>
              </div>
            )}

            {/* Upload sertifikat kepemilikan lahan */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                📄 Sertifikat Kepemilikan Lahan <span className="text-red-500">*wajib</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                <span className="text-2xl">🏡</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700">
                    {greenLandFile ? greenLandFile.name : "Upload Sertifikat Kepemilikan Lahan"}
                  </p>
                  <p className="text-xs text-gray-400">HGU / SHM / Akta — PDF atau gambar</p>
                </div>
                <input type="file" accept=".pdf,image/*" className="hidden"
                  onChange={e => setGreenLandFile(e.target.files[0] || null)} />
              </label>
            </div>

            {/* Upload bukti hitungan serapan */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                📊 Dokumen Hitungan Serapan (Terverifikasi Pihak Ketiga) <span className="text-red-500">*wajib</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                <span className="text-2xl">🌲</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700">
                    {greenCertFile ? greenCertFile.name : "Upload Laporan / Sertifikat Karbon Lahan"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Laporan dari konsultan, auditor karbon, atau lembaga terverifikasi (VCS, Gold Standard, dll)
                  </p>
                </div>
                <input type="file" accept=".pdf,image/*" className="hidden"
                  onChange={e => setGreenCertFile(e.target.files[0] || null)} />
              </label>
            </div>

            {/* Catatan metodologi */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Mengapa Input Manual?</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Perhitungan karbon hutan (FOLU) sangat kompleks — melibatkan biomassa, jenis pohon,
                umur tegakan, dan kondisi tanah. Standar seperti IPCC Tier 2/3 memerlukan survei
                lapangan khusus. Platform ini menerima hasil yang sudah dihitung dan diverifikasi
                oleh pihak ketiga terakreditasi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Panel Surya ───────────────────────────────────────────────── */}
      {tab === "solar" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-yellow-50 border-yellow-200">
            <p className="text-sm font-bold text-yellow-800 mb-1">☀️ Panel Surya</p>
            <p className="text-xs text-yellow-700">
              Listrik dari panel surya mengurangi kebutuhan dari PLN (offset Scope 2).
            </p>
          </div>

          <div className="card p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Panel (buah)</label>
                <input type="number" min="0" placeholder="e.g. 20"
                  value={solarPanels} onChange={e => setSolarPanels(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Kapasitas/Panel (Wp)</label>
                <input type="number" min="0" placeholder="e.g. 400"
                  value={solarWp} onChange={e => setSolarWp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Jam Matahari Efektif (jam/hari)</label>
                <input type="number" min="0" step="0.1" placeholder="e.g. 3.5"
                  value={solarSunHours} onChange={e => setSolarSunHours(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                <p className="text-xs text-gray-400 mt-1">Jam sinar efektif/hari di lokasi Anda</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Faktor Efisiensi Sistem</label>
                <div className="bg-gray-100 rounded-xl px-3 py-2 border border-gray-200">
                  <p className="font-bold text-sm text-gray-600">0.75 (tetap)</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Rugi-rugi kabel, inverter, panas. Standar industri 75%.</p>
              </div>
            </div>

            {solarPanels && solarWp && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2.5">
                <p className="text-xs font-bold text-yellow-800 mb-2">Estimasi Otomatis</p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { l:"Energi/hari",  v:solarKwhDay+" kWh" },
                    { l:"Energi/bulan", v:solarKwhMonth+" kWh" },
                    { l:"Offset/bulan", v:solarOffsetKg+" kg" },
                  ].map((row,i) => (
                    <div key={i} className="bg-white rounded-lg p-2 text-center">
                      <p className="font-black text-xs text-yellow-700">{row.v}</p>
                      <p className="text-xs text-gray-400">{row.l}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-700 font-bold mt-1">
                  = {solarOffsetKg} kg CO₂e/bulan
                </p>
              </div>
            )}

            <label className="flex items-center gap-3 border-2 border-dashed border-yellow-300 rounded-xl p-3 cursor-pointer hover:bg-yellow-50">
              <span className="text-2xl">📷</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">
                  {solarProofs.length > 0 ? solarProofs.length+" file dipilih" : "Upload foto panel / kWh meter / sertifikat"}
                </p>
                <p className="text-xs text-gray-400">JPG / PNG / PDF — maks 3 file</p>
              </div>
              <input type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => setSolarProofs(Array.from(e.target.files).slice(0,3))} />
            </label>
          </div>
        </div>
      )}

      {/* ── TAB: Biogas ────────────────────────────────────────────────────── */}
      {tab === "biogas" && (
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="card p-4 bg-green-50 border-green-200">
            <p className="text-sm font-bold text-green-800 mb-1">♻️ Biogas / Biogenik</p>
            <p className="text-xs text-green-700">
              Biogas dari limbah organik menggantikan bahan bakar fosil (offset Scope 1).
            </p>
          </div>

          <div className="card p-4 flex flex-col gap-3">
            <p className="text-xs text-gray-500">Masukkan massa limbah — faktor konversi CH₄ otomatis</p>
            {[
              { key:"organik", label:"Sampah Organik",      conv:0.01  },
              { key:"sapi",    label:"Kotoran Sapi",        conv:0.04  },
              { key:"babi",    label:"Kotoran Babi",        conv:0.06  },
              { key:"ayam",    label:"Kotoran Ayam",        conv:0.07  },
              { key:"pome",    label:"POME (Limbah Sawit)", conv:28.00 },
            ].map(row => {
              const mass = parseFloat(biogasInputs[row.key]) || 0;
              const vol  = +(mass * row.conv).toFixed(4);
              return (
                <div key={row.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">{row.label}</label>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">×{row.conv} m³/kg</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" min="0" placeholder="0"
                      value={biogasInputs[row.key]}
                      onChange={e => setBiogasInputs(prev => ({ ...prev, [row.key]: e.target.value }))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                    <span className="bg-gray-100 rounded-xl px-3 flex items-center text-xs text-gray-500">kg</span>
                  </div>
                  {mass > 0 && (
                    <p className="text-xs text-green-600 mt-1">{mass} × {row.conv} = <strong>{vol} m³ CH₄</strong></p>
                  )}
                </div>
              );
            })}

            {Object.values(biogasInputs).some(v => parseFloat(v) > 0) && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-xs text-green-700">
                <div className="flex justify-between mb-1"><span>Total CH₄ (×60%)</span><strong>{biogasM3Ch4.toFixed(4)} m³</strong></div>
                <div className="flex justify-between mb-1"><span>Massa CH₄ (×0.00067)</span><strong>{biogasTonCh4} ton</strong></div>
                <div className="flex justify-between mb-1"><span>Serapan harian (×GWP 28)</span><strong>{biogasTCo2eDay} tCO₂e/hari</strong></div>
                <div className="flex justify-between font-bold border-t border-green-200 pt-1">
                  <span>Serapan tahunan</span><span>{biogasTCo2eYr} tCO₂e/thn</span>
                </div>
                <p className="font-bold text-green-800 mt-1 pt-1 border-t border-green-200">
                  = {biogasOffsetKg} kg CO₂e/bulan offset
                </p>
              </div>
            )}

            <label className="flex items-center gap-3 border-2 border-dashed border-green-300 rounded-xl p-3 cursor-pointer hover:bg-green-50">
              <span className="text-2xl">📷</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">
                  {biogasProofs.length > 0 ? biogasProofs.length+" file dipilih" : "Upload foto reaktor / meter gas / dokumen"}
                </p>
                <p className="text-xs text-gray-400">JPG / PNG / PDF</p>
              </div>
              <input type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => setBiogasProofs(Array.from(e.target.files))} />
            </label>
          </div>
        </div>
      )}

      {/* Save button */}
      {totalAbsorbKg > 0 && (
        <div className="px-4 mt-2">
          <button onClick={saveAbsorb}
            className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {greenSaved ? "✅ Tersimpan!" : "💾 Simpan Hasil Serapan →"}
          </button>
          <p className="text-xs text-gray-400 text-center mt-1">
            Hasil disimpan dan digunakan untuk kalkulasi Net Carbon Credit di Sertifikat
          </p>
        </div>
      )}
    </div>
  );
}
