import React, { useState } from "react";
import qData from "./quisioner.json";

export function Questionnaire({ status, onSave }) {
  const [currentAnswers, setCurrentAnswers] = useState(status.answers || {});

  // Logika 3 Bulan
  const canEdit = () => {
    if (!status.isComplete) return true;
    if (status.resetCount === 0) return true; // Kesempatan reset pertama gratis
    
    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const last = new Date(status.lastUpdated).getTime();
    return (now - last) > threeMonths;
  };

  if (status.isComplete && !canEdit()) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">✓</div>
          <div>
            <p className="text-sm font-bold text-green-800">Profil Emisi Terverifikasi</p>
            <p className="text-[10px] text-green-600">Data dikunci hingga: {new Date(new Date(status.lastUpdated).getTime() + 7776000000).toLocaleDateString()}</p>
          </div>
        </div>
        <button className="text-xs bg-white text-gray-400 px-3 py-1 rounded-lg border cursor-not-allowed">Terkunci</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">📊</span>
        <h3 className="font-bold text-gray-800">Lengkapi Profil Emisi</h3>
      </div>
      
      {/* Mapping dari quisioner.json */}
      <div className="max-h-64 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {qData.sections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <p className="text-xs font-black text-green-700 uppercase tracking-widest">{sec.section}</p>
            {sec.questions?.map((q, qIdx) => (
              <div key={qIdx} className="space-y-1">
                <label className="text-[11px] text-gray-500">{q.label}</label>
                {q.type === "dropdown" ? (
                  <select className="w-full p-2 bg-gray-50 border rounded-xl text-xs">
                    {q.options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="number" className="w-full p-2 bg-gray-50 border rounded-xl text-xs" placeholder="0" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button 
        onClick={() => onSave({ 
          isComplete: true, 
          lastUpdated: new Date().toISOString(),
          resetCount: status.resetCount + 1 
        })}
        className="w-full py-3 bg-green-800 text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition"
      >
        Simpan & Verifikasi Data
      </button>
    </div>
  );
}