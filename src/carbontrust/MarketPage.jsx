/**
 * CarbonTrust — MarketPage.jsx
 * FIXED:
 *   - /projects?search= tidak ada di BE → ganti ke /public/projects, filter lokal
 *   - projIcon(tipe): param bernama `tipe` tapi body pakai `t` (undefined) → fix ke `tipe`
 *   - GET /bids?companyId= ditambah untuk lihat bid sendiri
 *   - PATCH /bids/:id/accept dan /reject ditambah untuk seller
 */
import { useState, useEffect, useCallback } from "react";
import { apiFetch, MOCK_PROJECTS, Modal, Ic } from "./shared.jsx";

// FIX: param `tipe`, bukan `t` (t = variabel terjemahan, crash saat dipakai di sini)
const projIcon = tipe =>
  (tipe?.includes("Reforest") || tipe?.includes("Reforestasi")) ? "🌲" :
  (tipe?.includes("Solar")    || tipe?.includes("Renewable"))   ? "☀️" :
  tipe?.includes("Blue")   ? "🌊" :
  (tipe?.includes("Peat")  || tipe?.includes("Gambut")) ? "🌾" : "🌿";

const MOCK_INBOX = [
  { id:"msg-001", from:"Borneo Green Alliance", fromFlag:"🇮🇩", projId:"PRJ-001",
    text:"Terima kasih atas bid Anda! Kami tertarik untuk berdiskusi lebih lanjut mengenai volume pembelian.",
    time:"2 jam lalu", read:false },
  { id:"msg-002", from:"Sumatra Peat Restore", fromFlag:"🇮🇩", projId:"PRJ-003",
    text:"Bid Anda telah kami terima. Apakah Anda bersedia menaikkan bid ke $17.5/t untuk volume 500 ton?",
    time:"1 hari lalu", read:true },
];

export function MarketPage({ t, company, projects, setProjects }) {
  const [search,        setSearch]        = useState("");
  const [detail,        setDetail]        = useState(null);
  const [bids,          setBids]          = useState({});
  const [myBids,        setMyBids]        = useState([]);   // bid yang sudah dikirim user ini
  const [bidPrice,      setBidPrice]      = useState("");
  const [bidVolume,     setBidVolume]     = useState("");
  const [submitted,     setSubmitted]     = useState(false);
  const [offerModal,    setOffer]         = useState(false);
  const [myOffer,       setMyOffer]       = useState(null);
  const [offerForm,     setOfferForm]     = useState({ credits:"", note:"" });
  const [loadingProj,   setLoadingProj]   = useState(false);

  // Messaging
  const [inboxModal,    setInboxModal]    = useState(false);
  const [msgModal,      setMsgModal]      = useState(false);
  const [msgTarget,     setMsgTarget]     = useState(null);
  const [msgText,       setMsgText]       = useState("");
  const [msgSent,       setMsgSent]       = useState(false);
  const [inbox,         setInbox]         = useState(MOCK_INBOX);
  const [thread,        setThread]        = useState(null);
  const [replyText,     setReplyText]     = useState("");
  const [conversations, setConversations] = useState({});

  const unreadCount = inbox.filter(msg => !msg.read).length;
  const companyId   = company?.id || company?._id;

  // FIX: /projects tidak ada di BE — pakai /public/projects, filter lokal
  useEffect(() => {
    setLoadingProj(true);
    apiFetch("/public/projects").then(fetchedData => {
      if (Array.isArray(fetchedData) && fetchedData.length) setProjects(fetchedData);
      setLoadingProj(false);
    }).catch(() => setLoadingProj(false));
  }, []);

  // Load bid milik user ini dari BE
  useEffect(() => {
    if (!companyId) return;
    apiFetch(`/bids?companyId=${companyId}`).then(fetchedData => {
      if (Array.isArray(fetchedData)) setMyBids(fetchedData);
    });
  }, [companyId]);

  // Load bids per project saat detail dibuka
  async function loadBidsForProject(proj) {
    const projId = proj._id || proj.id;
    const fetchedData = await apiFetch(`/bids?projectId=${projId}`);
    if (Array.isArray(fetchedData)) {
      setBids(prev => ({ ...prev, [proj.id]: fetchedData }));
    }
  }

  // Filter lokal berdasarkan search
  const sorted = [...projects]
    .filter(proj => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (proj.company || "").toLowerCase().includes(q) ||
             (proj.country || "").toLowerCase().includes(q) ||
             (proj.type    || "").toLowerCase().includes(q);
    })
    .sort((projA, projB) => {
      const sa = (projA.verified ? 2 : 0) + (projA.rating || 0) + (projA.ndvi || 0);
      const sb = (projB.verified ? 2 : 0) + (projB.rating || 0) + (projB.ndvi || 0);
      return sb - sa;
    });

  // Submit bid ke BE
  async function submitBid(proj) {
    const price = parseFloat(bidPrice);
    const vol   = parseFloat(bidVolume) || 100;
    if (!price || price <= 0) return;

    const res = await apiFetch("/bids", {
      method: "POST",
      body: JSON.stringify({
        projectId:      proj._id || proj.id,
        buyerCompanyId: companyId,
        buyerName:      company?.name || "PT. Anda",
        pricePerTon:    price,
        volume:         vol,
      }),
    });

    const newBid = {
      id:      res?.id || `bid-${Date.now()}`,
      bidder:  company?.name || "PT. Anda",
      price,
      volume:  vol,
      total:   +(price * vol).toFixed(0),
      time:    new Date().toLocaleString("id-ID"),
      status:  "pending",
    };
    setBids(prev => ({
      ...prev,
      [proj.id]: [...(prev[proj.id] || []), newBid].sort((bidA, bidB) => bidB.price - bidA.price),
    }));
    setMyBids(prev => [...prev, newBid]);
    setBidPrice(""); setBidVolume("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  // Accept / reject bid (untuk seller)
  async function handleBidAction(bidId, action, projId) {
    const res = await apiFetch(`/bids/${bidId}/${action}`, { method: "PATCH" });
    if (res) {
      setBids(prev => ({
        ...prev,
        [projId]: (prev[projId] || []).map(bid =>
          bid.id === bidId ? { ...bid, status: action === "accept" ? "accepted" : "rejected" } : bid
        ),
      }));
    }
  }

  function publishOffer() {
    if (!offerForm.credits) return;
    setMyOffer({
      company: company?.name || "PT. Anda",
      credits: parseInt(offerForm.credits),
      note:    offerForm.note,
      time:    new Date().toLocaleDateString("id-ID"),
    });
    setOffer(false);
  }

  function sendMessage() {
    if (!msgText.trim() || !msgTarget) return;
    const msg = {
      from: company?.name || "PT. Anda",
      text: msgText.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" }),
      isMine: true,
    };
    setConversations(prev => ({
      ...prev,
      [msgTarget.projId]: [...(prev[msgTarget.projId] || []), msg],
    }));
    setMsgText("");
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 2000);
  }

  function sendReply() {
    if (!replyText.trim() || !thread) return;
    const reply = {
      from: company?.name || "PT. Anda",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" }),
      isMine: true,
    };
    setConversations(prev => ({
      ...prev,
      [thread.projId]: [...(prev[thread.projId] || [
        { from:thread.from, text:thread.text, time:thread.time, isMine:false }
      ]), reply],
    }));
    setInbox(prev => prev.map(msgItem => msgItem.id === thread.id ? { ...msgItem, read:true } : msgItem));
    setReplyText("");
  }

  return (
    <div className="flex flex-col pb-4 fade-up">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 rounded-xl bg-green-50 border border-green-200 px-3 py-2 flex items-start gap-2">
            <span className="text-base">🏷️</span>
            <div>
              <p className="text-xs font-bold text-green-800">Carbon Credit Marketplace</p>
              <p className="text-xs text-green-600">Ajukan bid untuk membeli kredit karbon terverifikasi</p>
            </div>
          </div>
          <button
            onClick={() => setInboxModal(true)}
            className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-xl">💬</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        <input
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400"
          placeholder={`🔍 ${t.market?.search || "Cari perusahaan, negara, tipe..."}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">
          {loadingProj ? "Memuat project..." : `${sorted.length} project tersedia · ketuk untuk bid`}
        </p>
      </div>

      {/* My active bids banner */}
      {myBids.filter(b => b.status === "pending").length > 0 && (
        <div className="mx-4 mt-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-xs font-bold text-blue-700 mb-1">📋 Bid Aktif Kamu</p>
          <p className="text-xs text-blue-600">
            {myBids.filter(b => b.status === "pending").length} bid sedang pending · {myBids.filter(b => b.status === "accepted").length} diterima
          </p>
        </div>
      )}

      {/* My offer banner */}
      {myOffer && (
        <div className="mx-4 mt-3 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
          <p className="text-xs font-bold text-teal-700 mb-1">📢 Penawaran Kamu Aktif</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-black text-teal-800">{myOffer.credits.toLocaleString()} tCO₂e</p>
              <p className="text-xs text-teal-600">{myOffer.time}</p>
              {myOffer.note && <p className="text-xs text-teal-500 mt-0.5">{myOffer.note}</p>}
            </div>
            <button onClick={() => setMyOffer(null)} className="text-xs text-red-400 font-bold hover:underline">Tarik</button>
          </div>
        </div>
      )}

      {/* Project cards */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        {loadingProj ? (
          <div className="text-center py-10 text-gray-400 text-sm">Memuat project...</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {search ? "Tidak ada project yang cocok" : "Belum ada project tersedia"}
          </div>
        ) : sorted.map((proj, idx) => {
          const projBids = bids[proj.id] || [];
          return (
            <div
              key={proj.id || idx}
              className={`card p-4 transition-all ${idx === 0 ? "border-2 border-green-300 bg-green-50/30" : ""}`}
            >
              {idx === 0 && (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                  ⭐ Top Rated
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-3xl flex-shrink-0">
                  {projIcon(proj.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{proj.company}</p>
                      <p className="text-xs text-gray-500">{proj.flag} {proj.country} · {proj.type}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {proj.verified
                        ? <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold">✅ ISO</span>
                        : <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">⏳</span>
                      }
                    </div>
                  </div>

                  {proj.ndvi && (
                    <div className="mt-2 bg-white border border-green-100 rounded-xl p-2 grid grid-cols-2 gap-1 text-xs">
                      <p className="text-green-700"><span className="font-bold">NDVI:</span> {proj.ndvi}</p>
                      <p className="text-green-700"><span className="font-bold">Abs:</span> {proj.absRate} t/ha/yr</p>
                      <p className="text-gray-500"><span className="font-bold">Stok:</span> {proj.available?.toLocaleString()} t</p>
                      <p className="text-amber-500">⭐ {proj.rating}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2.5">
                    {projBids.length > 0 && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                        {projBids.length} bid
                      </span>
                    )}
                    <button
                      onClick={() => { setMsgTarget({ company:proj.company, projId:proj.id }); setMsgModal(true); setMsgSent(false); setMsgText(""); }}
                      className="text-xs px-2.5 py-1.5 rounded-xl font-bold border border-slate-200 text-slate-600 bg-slate-50 active:scale-95 transition-all"
                    >
                      💬 Kontak
                    </button>
                    <button
                      onClick={() => { setDetail(proj); setSubmitted(false); setBidPrice(""); setBidVolume(""); loadBidsForProject(proj); }}
                      className="ml-auto text-xs px-3 py-1.5 rounded-xl font-bold text-white active:scale-95 transition-all"
                      style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}
                    >
                      Bid →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tombol tawarkan kredit */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setOffer(true)}
          className="w-full py-3 rounded-xl font-bold border-2 border-dashed border-green-400 text-green-700 bg-green-50 active:scale-95 transition-all text-sm"
        >
          + Tawarkan Kredit Karbon Kamu
        </button>
        <p className="text-xs text-gray-400 text-center mt-1">
          Wajib upload sertifikat ISO di halaman Verify terlebih dahulu
        </p>
      </div>

      {/* MODAL: Detail & Bid */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`🌿 ${detail?.company}`}>
        {detail && (
          <div className="flex flex-col gap-4 p-1">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Profil Penjual</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l:"Negara",  v:`${detail.flag} ${detail.country}` },
                  { l:"Tipe",    v:detail.type },
                  { l:"Stok",    v:`${detail.available?.toLocaleString()} t` },
                  { l:"Rating",  v:`⭐ ${detail.rating}` },
                  ...(detail.ndvi ? [
                    { l:"NDVI",    v:detail.ndvi },
                    { l:"Serapan", v:`${detail.absRate} t/ha/yr` },
                  ] : []),
                  { l:"Status",  v:detail.verified ? "✅ ISO 14064" : "⏳ Pending" },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-lg p-2.5">
                    <p className="text-xs text-gray-400">{item.l}</p>
                    <p className="font-bold text-sm text-gray-800">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-1">📜 Kredit Karbon Ditawarkan</p>
              <p className="text-xs text-green-600">
                <strong>{detail.available?.toLocaleString()} tCO₂e</strong> tersertifikasi tersedia
              </p>
              {detail.verified
                ? <span className="inline-block mt-1.5 text-xs bg-green-700 text-white px-2 py-0.5 rounded-full font-bold">✅ Dapat dibid</span>
                : <span className="inline-block mt-1.5 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⏳ Belum ISO — tidak bisa dibid</span>
              }
            </div>

            {detail.verified ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-700">Ajukan Bid</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Harga (USD/tCO₂)</label>
                    <input type="number" min="0" step="0.1" placeholder="e.g. 18.5"
                      value={bidPrice} onChange={e => setBidPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Volume (ton)</label>
                    <input type="number" min="1" placeholder="e.g. 500"
                      value={bidVolume} onChange={e => setBidVolume(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                  </div>
                </div>
                {bidPrice && bidVolume && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <p className="text-xs text-green-700 font-bold">
                      Total bid: <span className="text-green-800">${(parseFloat(bidPrice) * parseFloat(bidVolume)).toLocaleString()} USD</span>
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setMsgTarget({ company:detail.company, projId:detail.id }); setMsgModal(true); setDetail(null); }}
                    className="flex-1 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-600 text-sm"
                  >
                    💬 Kontak Penjual
                  </button>
                  <button
                    onClick={() => submitBid(detail)}
                    disabled={!bidPrice || submitted}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 active:scale-95 transition-all"
                    style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}
                  >
                    {submitted ? "✓ Terkirim!" : "Submit Bid"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-bold text-center">
                Penjual belum upload sertifikat ISO. Tidak dapat dibid saat ini.
              </div>
            )}

            {/* Daftar bid dari BE */}
            {(bids[detail.id] || []).length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">
                  Bid Aktif ({(bids[detail.id] || []).length}) — tertinggi dulu
                </p>
                <div className="flex flex-col gap-1.5">
                  {(bids[detail.id] || []).map((bid, i) => {
                    const isMyBid = bid.buyerCompanyId === companyId || bid.bidder === (company?.name);
                    const isSeller = detail.companyId === companyId;
                    return (
                      <div key={bid.id || i}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                          bid.status === "accepted" ? "bg-green-50 border border-green-200" :
                          bid.status === "rejected" ? "bg-red-50 border border-red-100 opacity-60" :
                          i === 0 ? "bg-green-50 border border-green-200" : "bg-gray-50"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">{bid.buyerName || bid.bidder}</p>
                          <p className="text-xs text-gray-400">{bid.volume} ton · {bid.status}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className={`font-black text-sm ${i === 0 ? "text-green-700" : "text-gray-600"}`}>
                            ${bid.pricePerTon || bid.price}/t {i === 0 && "👑"}
                          </p>
                          {/* Accept/reject hanya tampil untuk seller, bid masih pending */}
                          {isSeller && bid.status === "pending" && (
                            <div className="flex gap-1">
                              <button onClick={() => handleBidAction(bid.id, "accept", detail.id)}
                                className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-lg font-bold">
                                Terima
                              </button>
                              <button onClick={() => handleBidAction(bid.id, "reject", detail.id)}
                                className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-lg font-bold">
                                Tolak
                              </button>
                            </div>
                          )}
                          {isMyBid && <span className="text-xs text-blue-500 font-bold">Bid kamu</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL: Tawarkan kredit */}
      <Modal open={offerModal} onClose={() => setOffer(false)} title="📢 Tawarkan Kredit Karbon">
        <div className="flex flex-col gap-3 p-1">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            Pastikan kamu sudah upload sertifikat ISO di halaman <strong>Verify</strong> sebelum menawarkan kredit.
          </div>
          {[
            { label:"Jumlah Kredit (tCO₂e)", key:"credits", type:"number", ph:"e.g. 1200" },
            { label:"Catatan (opsional)",     key:"note",    type:"text",   ph:"e.g. Lahan gambut Sentinel-2" },
          ].map(fieldItem => (
            <div key={fieldItem.key}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{fieldItem.label}</label>
              <input
                type={fieldItem.type} placeholder={fieldItem.ph}
                value={offerForm[fieldItem.key]}
                onChange={e => setOfferForm(prev => ({ ...prev, [fieldItem.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          ))}
          <button onClick={publishOffer} disabled={!offerForm.credits}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            Publish Penawaran
          </button>
        </div>
      </Modal>

      {/* MODAL: Inbox */}
      <Modal open={inboxModal} onClose={() => { setInboxModal(false); setThread(null); }} title="💬 Pesan & Negosiasi">
        {thread ? (
          <div className="flex flex-col gap-3">
            <button onClick={() => setThread(null)} className="text-xs text-gray-500 font-bold text-left hover:text-gray-700">
              ← Kembali ke inbox
            </button>
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-xs font-bold text-gray-700">{thread.from} {thread.fromFlag}</p>
              <p className="text-xs text-gray-400">Re: {projects.find(proj => proj.id === thread.projId)?.company || thread.projId}</p>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
                  <p className="text-xs text-gray-700">{thread.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{thread.time}</p>
                </div>
              </div>
              {(conversations[thread.projId] || []).map((msg, i) => (
                <div key={i} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${msg.isMine ? "bg-green-600 text-white rounded-tr-sm" : "bg-gray-100 rounded-tl-sm"}`}>
                    <p className={`text-xs ${msg.isMine ? "text-white" : "text-gray-700"}`}>{msg.text}</p>
                    <p className={`text-xs mt-0.5 ${msg.isMine ? "text-green-200" : "text-gray-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Ketik balasan..."
                value={replyText} onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendReply()}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              <button onClick={sendReply} disabled={!replyText.trim()}
                className="px-4 py-2 rounded-xl font-bold text-white text-sm disabled:opacity-40 active:scale-95 transition-all"
                style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
                Kirim
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {inbox.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Belum ada pesan masuk</p>}
            {inbox.map(msg => (
              <button key={msg.id}
                onClick={() => { setThread(msg); setInbox(prev => prev.map(msgItem => msgItem.id === msg.id ? { ...msgItem, read:true } : msgItem)); }}
                className={`w-full text-left rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-gray-50 ${!msg.read ? "bg-blue-50 border border-blue-100" : "bg-white border border-gray-100"}`}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg flex-shrink-0">🌿</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold truncate ${!msg.read ? "text-blue-800" : "text-gray-700"}`}>
                      {msg.from} {msg.fromFlag}
                    </p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{msg.time}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.text}</p>
                  {!msg.read && <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Baru</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* MODAL: Kirim Pesan ke Penjual */}
      <Modal open={msgModal} onClose={() => setMsgModal(false)} title={`💬 Kontak ${msgTarget?.company || "Penjual"}`}>
        <div className="flex flex-col gap-3 p-1">
          <div className="bg-slate-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-500">Pesan akan terkirim ke:</p>
            <p className="text-sm font-bold text-gray-800">{msgTarget?.company}</p>
          </div>
          {msgTarget && (conversations[msgTarget.projId] || []).length > 0 && (
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-2">
              {(conversations[msgTarget.projId] || []).map((msg, i) => (
                <div key={i} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${msg.isMine ? "bg-green-600 text-white" : "bg-white border border-gray-200"}`}>
                    <p className={`text-xs ${msg.isMine ? "text-white" : "text-gray-700"}`}>{msg.text}</p>
                    <p className={`text-xs mt-0.5 ${msg.isMine ? "text-green-200" : "text-gray-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Pesan</label>
            <textarea rows={3}
              placeholder="e.g. Halo, kami tertarik dengan kredit karbon Anda. Apakah bisa berdiskusi mengenai volume dan harga?"
              value={msgText} onChange={e => setMsgText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none" />
          </div>
          {msgSent && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <p className="text-xs font-bold text-green-700">✅ Pesan terkirim ke {msgTarget?.company}</p>
            </div>
          )}
          <button onClick={sendMessage} disabled={!msgText.trim() || msgSent}
            className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 active:scale-95 transition-all"
            style={{ background:"linear-gradient(135deg,#166534,#0f766e)" }}>
            {msgSent ? "✓ Terkirim!" : "Kirim Pesan"}
          </button>
          <p className="text-xs text-gray-400 text-center">Balasan akan muncul di 💬 Inbox</p>
        </div>
      </Modal>
    </div>
  );
}
