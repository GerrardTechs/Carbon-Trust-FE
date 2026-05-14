/**
 * CarbonTrust — carbontrust/shared.jsx
 * Exports: config, translations (TR), science constants,
 *          utility fns, hooks, shared UI components, icons.
 * Import everything from here in page components.
 */

import { useState, useEffect, useRef } from "react";
// ─── CONFIG ────────────────────────────────────────────────────────────────
export const API = "https://carbon-trust-be.onrender.com/api";
export const COMPANY_ID = "COMP-001";
export const CREDIT_PRICE = 18.5;

export const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; box-sizing: border-box; }
  @keyframes sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  .fade-up { animation: fadeUp .35s ease forwards; }
  .card { background:#fff; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 1px 4px rgba(0,0,0,.06); }
  .card-green { background:#f0fdf4; border:1px solid #bbf7d0; }
  .spin { animation: spin 1s linear infinite; }
  .pulse2 { animation: pulse2 1.4s ease infinite; }
  input[type=range] { accent-color: #16a34a; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
`;

export async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    return await res.json();
  } catch { return null; }
}

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────
export const TR = {
  en: {
    flag:"🇺🇸", label:"English",
    nav:{ home:"Home", market:"Market", calc:"Calculator", land:"Land", verify:"Verification", profile:"Profile", tx:"Transaction" },
    dash:{
      greeting:"Welcome back", tagline:"Welcome Back!",
      netCarbon:"Net Carbon Balance", totalEm:"Total Emissions", totalAbs:"Total Absorption",
      credits:"Carbon Credits", creditsUSD:"Portfolio Value",
      liveIoT:"Real-Time IoT Sensors", history:"History",
      alerts:"AI Detection & Alerts", dismiss:"Dismiss",
      myProjects:"My Active Projects", seeAll:"See all land →",
      units:{ t:"tCO₂e", kt:"ktCO₂e", Mt:"MtCO₂e", kg:"kg CO₂e" }, unitLabel:"Unit",
      activeProjects: "Active Carbon Projects",
projectStatus: { active:"Active", pending:"Pending", completed:"Completed" },
    },
    land:{
      title:"Land Ownership", addParcel:"Add Land Parcel",
      area:"Area (ha)", type:"Land Type", name:"Parcel Name",
      lat:"Latitude", lng:"Longitude", depth:"Peat Depth (m)",
      simulate:"Simulate Condition", viewAll:"All Land Parcels",
      stockFormula:"Carbon Stock Formula",
      types:{ forest:"Forest",peatland:"Peatland",mangrove:"Mangrove",agricultural:"Agricultural",industrial:"Industrial" },
      status:{ healthy:"Healthy",flooded:"Flooded",degraded:"Degraded",burned:"Burned",drying:"Peat Drying" },
      alerts:{
        flooded:"🌊 BANJIR / FLOOD — Serapan berkurang drastis. Air menggenangi lahan menghambat fotosintesis & pertukaran gas. Kredit karbon ditangguhkan.",
        degraded:"⚠️ TERDEGRADASI — Lahan kehilangan kemampuan serapan. Vegetasi rusak, struktur tanah terganggu. Perlu rehabilitasi segera.",
        peatland_degraded:"⚠️ GAMBUT TERDEGRADASI — Gambut berubah jadi emitter CO₂ aktif. Dekomposisi organik melepas CH₄ & CO₂ dalam jumlah besar (Ebo formula aktif).",
        burned:"🔥 KEBAKARAN / FIRE — Emisi masif CO₂ & CH₄. Karbon tersimpan dilepas seketika. Kredit dibatalkan untuk area terdampak. Gas metana mengancam kesehatan.",
        drying:"🌡️ GAMBUT MENGERING — Kelembaban turun drastis. Gambut kering = emitter CH₄ & CO₂. Risiko kebakaran meningkat. NDVI menurun."
      },
    },
    calc:{
      title:"Emission Calculator", scope1:"Scope 1 — Direct",
      scope2:"Scope 2 — Indirect Energy", scope3:"Scope 3 — Value Chain",
      calculate:"Calculate Emissions", totalEm:"Total Emissions",
      offsetNeeded:"Carbon Credits Needed", leakage:"Estimated Leakage",
      ref:"Based on IPCC 2006 · ESDM Indonesia EF",
      breakdownTitle:"Breakdown by Source",
      method: "Calculation Method",
methodOp: "Operational Control",
methodEq: "Equity Share",
equityPct: "Equity Share (%)",
ownershipCert: "Upload Ownership Certificate",
ownershipHint: "PDF/image of share ownership document",
ownershipReject: "File rejected — must be PDF or image (JPG/PNG)",
    },
    market:{
      title:"Carbon Market", search:"Search projects, companies, countries...",
      detail:"View Details", transact:"Start Transaction",
      aiMatch:"AI Matching", analyzing:"Analyzing compatibility...",
      score:"Compatibility Score", buyer:"Buyer", seller:"Seller",
      proceed:"Proceed to Transaction →",
      recommend:"Recommended for you",
      est500:"Estimated for 500 ton purchase",
      eqArea:"ha equivalent", renewableProj:"Renewable project",
    },
    tx:{
      title:"Transaction", new:"New Transaction",
      stage0:"Agreement Created", stage1:"Funds in Escrow",
      stage2:"Carbon Verified", stage3:"Funds Released",
      blockchain:"View on Blockchain", confirmReceipt:"Confirm Receipt",
      escrow:"Escrow Amount", immutable:"Verified by 47 nodes · Immutable",
      volume:"Volume", price:"Price/ton", total:"Total",
      noTx:"No active transaction", noTxSub:"Start a transaction from the Market page",
      status:"Transaction Status", complete:"Transaction Complete — Funds Released",
      active:"● Active", completed:"✓ Completed", inProgress:"● In progress",
      advanceDemo:"▶ Advance to next stage (demo)",
      blockchainNote:"Immutable record on Ethereum Testnet (Sepolia)",
    },
    verify:{ title:"MRV & Verification", download:"Download ISO 14064 Certificate", log:"IoT · ML · Satellite Log",
      satelliteView:"Satellite View — Land Boundaries", multiSite:"Multi-Site Satellite View",
      certDownloaded:"ISO 14064 Certificate Downloaded",
    },
    profile:{
      title:"Company Profile", settings:"Profile Settings",
      wallet:"Blockchain Wallet ID", generate:"Generate Wallet",
      walletNote:"Wallet ID can only be generated once and is permanently stored.",
      walletImportant:"Important",
      walletFull:"Your unique blockchain wallet ID will be generated and permanently stored in our database. This cannot be changed later.",
      walletGenerate:"✅ Generate My Wallet ID",
      walletStored:"✓ Permanently stored · Cannot be regenerated",
      esg:"ESG Score", esgStart:"Start ESG Assessment",
      esgDesc:"Complete questionnaire & document submission to receive AI-verified ESG score.",
      esgStatus:{ not_started:"Not Started", in_progress:"In Progress", submitted:"Submitted", verified:"Verified" },
      esgVerified:"AI-verified · Scale 0–100",
      esgAllAnswered:"All questions answered!",
      esgSubmitDesc:"Submit for AI analysis to receive your ESG score",
      esgCalculating:"Calculating...",
      esgGenerate:"Generate ESG Score →",
      tree:"Virtual Tree 🌳", treeDesc:"Grows with every completed transaction",
      simulateTx:"Simulate New Transaction (+1 🌱)",
      save:"Save Profile",
      saved:"✅ Saved!",
      companyName:"Company Name", emailLabel:"Institutional Email", locationLabel:"Location",
      removalProjectLabel:"Carbon Removal Project", entityTypeLabel:"Entity / Company Type", bizTypeLabel:"Business Activity Type",
      txCount:"Transactions",
    },
    exit:{
      btn:"Exit", title:"Exit Application", desc:"What would you like to do?",
      exitOnly:"Exit To Menu", logout:"Exit & Log Out",
      logoutDesc:"You will return to the registration screen.",
      cancelBtn:"Cancel", noActiveTx:"No active transaction",
    },
    common:{ save:"Save", cancel:"Cancel", back:"← Back", loading:"Processing...", confirm:"Confirm", download:"Download", close:"Close", add:"Add", submit:"Submit" },
  },
  id: {
    flag:"🇮🇩", label:"Indonesia",
    nav:{ home:"Beranda", market:"Bursa", calc:"Kalkulator", land:"Lahan", verify:"Verifikasi", profile:"Profil", tx:"Transaksi" },
    dash:{
      greeting:"Selamat datang", tagline:"Valid · Real-Time · Bebas Fraud",
      netCarbon:"Saldo Karbon Bersih", totalEm:"Total Emisi", totalAbs:"Total Serapan",
      credits:"Kredit Karbon", creditsUSD:"Nilai Portfolio",
      liveIoT:"Sensor IoT Real-Time", history:"Riwayat",
      alerts:"Deteksi AI & Peringatan", dismiss:"Hapus",
      myProjects:"Proyek Aktif Saya", seeAll:"Lihat semua lahan →",
      units:{ t:"tCO₂e", kt:"ktCO₂e", Mt:"MtCO₂e", kg:"kg CO₂e" }, unitLabel:"Satuan",
      activeProjects: "Proyek Karbon Aktif",
projectStatus: { active:"Aktif", pending:"Dalam Proses", completed:"Selesai" },
    },
    land:{
      title:"Kepemilikan Lahan", addParcel:"Tambah Lahan",
      area:"Luas (ha)", type:"Jenis Lahan", name:"Nama Lahan",
      lat:"Lintang", lng:"Bujur", depth:"Kedalaman Gambut (m)",
      simulate:"Simulasi Kondisi", viewAll:"Semua Bidang Lahan",
      stockFormula:"Formula Stok Karbon",
      types:{ forest:"Hutan",peatland:"Gambut",mangrove:"Mangrove",agricultural:"Pertanian",industrial:"Industri" },
      status:{ healthy:"Sehat",flooded:"Banjir",degraded:"Terdegradasi",burned:"Terbakar",drying:"Gambut Kering" },
      alerts:{
        flooded:"🌊 BANJIR TERDETEKSI — Serapan berkurang drastis. Lahan tergenang menghambat fotosintesis. Kredit karbon ditangguhkan sementara.",
        degraded:"⚠️ TERDEGRADASI — Vegetasi rusak, struktur tanah terganggu. Kapasitas serapan menurun signifikan. Rehabilitasi diperlukan.",
        peatland_degraded:"⚠️ GAMBUT TERDEGRADASI — Gambut menjadi sumber emisi CO₂ & metana aktif. Dekomposisi bahan organik melepas gas rumah kaca dalam jumlah besar.",
        burned:"🔥 KEBAKARAN TERDETEKSI — Emisi CO₂ & CH₄ masif. Karbon tersimpan dalam biomasa dilepas seketika. Kredit dibatalkan. Gas metana berbahaya.",
        drying:"🌡️ GAMBUT MENGERING — Kelembaban kritis. Gambut kering berubah jadi emitter aktif. Risiko kebakaran & emisi CH₄ sangat tinggi."
      },
    },
    calc:{
      title:"Kalkulator Emisi", scope1:"Scope 1 — Langsung",
      scope2:"Scope 2 — Energi Tidak Langsung", scope3:"Scope 3 — Rantai Nilai",
      calculate:"Hitung Emisi", totalEm:"Total Emisi",
      offsetNeeded:"Kredit Karbon Dibutuhkan", leakage:"Estimasi Leakage",
      ref:"Berdasarkan IPCC 2006 · Faktor Emisi ESDM Indonesia",
      breakdownTitle:"Rincian per Sumber",
      method: "Metode Kalkulasi",
methodOp: "Kendali Operasional",
methodEq: "Equity Share",
equityPct: "Persentase Kepemilikan Saham (%)",
ownershipCert: "Upload Sertifikat Kepemilikan",
ownershipHint: "PDF/foto dokumen kepemilikan saham",
ownershipReject: "File ditolak — harus PDF atau gambar (JPG/PNG)",
    },
    market:{
      title:"Bursa Karbon", search:"Cari proyek, perusahaan, negara...",
      detail:"Lihat Detail", transact:"Mulai Transaksi",
      aiMatch:"AI Matching", analyzing:"Menganalisis kecocokan...",
      score:"Skor Kompatibilitas", buyer:"Pembeli", seller:"Penjual",
      proceed:"Lanjutkan ke Transaksi →",
      recommend:"Rekomendasi untuk Anda",
      est500:"Estimasi pembelian 500 ton",
      eqArea:"ha setara", renewableProj:"Proyek energi terbarukan",
    },
    tx:{
      title:"Transaksi", new:"Transaksi Baru",
      stage0:"Perjanjian Dibuat", stage1:"Dana di-Escrow",
      stage2:"Karbon Diverifikasi", stage3:"Dana Dilepas",
      blockchain:"Lihat di Blockchain", confirmReceipt:"Konfirmasi Penerimaan",
      escrow:"Dana Escrow", immutable:"Diverifikasi 47 nodes · Tidak dapat diubah",
      volume:"Volume", price:"Harga/ton", total:"Total",
      noTx:"Tidak ada transaksi aktif", noTxSub:"Mulai transaksi dari halaman Bursa",
      status:"Status Transaksi", complete:"Transaksi Selesai — Dana Dilepas",
      active:"● Aktif", completed:"✓ Selesai", inProgress:"● Sedang berlangsung",
      advanceDemo:"▶ Maju ke tahap berikutnya (demo)",
      blockchainNote:"Catatan permanen di Ethereum Testnet (Sepolia)",
    },
    verify:{ title:"MRV & Verifikasi", download:"Unduh Sertifikat ISO 14064", log:"Log IoT · ML · Satelit",
      satelliteView:"Tampilan Satelit — Batas Lahan", multiSite:"Tampilan Satelit Multi-Lokasi",
      certDownloaded:"Sertifikat ISO 14064 Diunduh",
    },
    profile:{
      title:"Profil Perusahaan", settings:"Pengaturan Profil",
      wallet:"Wallet ID Blockchain", generate:"Generate Wallet",
      walletNote:"Wallet ID hanya bisa di-generate sekali dan tersimpan permanen.",
      walletImportant:"Penting",
      walletFull:"Wallet ID blockchain unik Anda akan dibuat dan disimpan permanen di database kami. Ini tidak dapat diubah nantinya.",
      walletGenerate:"✅ Buat Wallet ID Saya",
      walletStored:"✓ Tersimpan permanen · Tidak dapat diulang",
      esg:"Skor ESG", esgStart:"Mulai Penilaian ESG",
      esgDesc:"Isi kuesioner & kirim berkas untuk mendapatkan skor ESG terverifikasi AI.",
      esgStatus:{ not_started:"Belum Dimulai", in_progress:"Sedang Berjalan", submitted:"Telah Dikirim", verified:"Terverifikasi" },
      esgVerified:"Terverifikasi AI · Skala 0–100",
      esgAllAnswered:"Semua pertanyaan terjawab!",
      esgSubmitDesc:"Kirim untuk analisis AI guna mendapatkan skor ESG Anda",
      esgCalculating:"Menghitung...",
      esgGenerate:"Buat Skor ESG →",
      tree:"Pohon Virtual 🌳", treeDesc:"Tumbuh seiring transaksi",
      simulateTx:"Simulasi Transaksi Baru (+1 🌱)",
      save:"Simpan Profil", saved:"✅ Tersimpan!",
      companyName:"Nama Perusahaan", emailLabel:"Email Institusi", locationLabel:"Lokasi",
      removalProjectLabel:"Proyek Penyerapan Karbon", entityTypeLabel:"Jenis Entitas / Perusahaan", bizTypeLabel:"Jenis Kegiatan Usaha",
      txCount:"Transaksi",
    },
    exit:{
      btn:"Keluar", title:"Keluar Aplikasi", desc:"Apa yang ingin Anda lakukan?",
      exitOnly:"Keluar Aplikasi", logout:"Keluar & Log Out",
      logoutDesc:"Anda akan kembali ke halaman pendaftaran.",
      cancelBtn:"Batal", noActiveTx:"Tidak ada transaksi aktif",
    },
    common:{ save:"Simpan", cancel:"Batal", back:"← Kembali", loading:"Memproses...", confirm:"Konfirmasi", download:"Unduh", close:"Tutup", add:"Tambah", submit:"Kirim" },
  },
  zh: {
    flag:"🇨🇳", label:"中文",
    nav:{ home:"首页",market:"碳市场",calc:"计算器",land:"土地",verify:"核查",profile:"企业",tx:"交易" },
    dash:{ greeting:"欢迎回来",tagline:"有效 · 实时 · 无欺诈",netCarbon:"净碳余额",totalEm:"总排放量",totalAbs:"总吸收量",credits:"碳信用额度",creditsUSD:"投资组合价值",liveIoT:"实时物联网传感器",history:"历史",alerts:"AI检测与预警",dismiss:"关闭",myProjects:"我的活跃项目",seeAll:"查看所有土地 →",units:{t:"tCO₂e",kt:"ktCO₂e",Mt:"MtCO₂e",kg:"kg CO₂e"},unitLabel:"单位" },
    land:{ title:"土地所有权",addParcel:"+ 添加地块",area:"面积 (ha)",type:"土地类型",name:"地块名称",lat:"纬度",lng:"经度",depth:"泥炭深度 (m)",simulate:"模拟条件",viewAll:"所有土地地块",stockFormula:"碳储量公式",types:{forest:"森林",peatland:"泥炭地",mangrove:"红树林",agricultural:"农业",industrial:"工业"},status:{healthy:"健康",flooded:"洪涝",degraded:"退化",burned:"火灾",drying:"泥炭干燥"},alerts:{flooded:"🌊 检测到洪涝",peatland_degraded:"⚠️ 泥炭退化",burned:"🔥 火灾检测",drying:"🌡️ 泥炭干燥"} },
    calc:{ title:"碳排放计算器",scope1:"范围1",scope2:"范围2",scope3:"范围3",calculate:"计算排放量",totalEm:"总排放量",offsetNeeded:"所需碳信用",leakage:"泄漏估算",ref:"基于IPCC 2006",breakdownTitle:"按来源细分" },
    market:{ title:"碳市场",search:"搜索项目、公司、国家...",detail:"查看详情",transact:"开始交易",aiMatch:"AI匹配",analyzing:"分析中...",score:"兼容性得分",buyer:"买家",seller:"卖家",proceed:"继续交易 →",recommend:"为您推荐",est500:"500吨购买估算",eqArea:"公顷等效",renewableProj:"可再生能源项目" },
    tx:{ title:"交易",new:"新交易",stage0:"协议已创建",stage1:"资金在托管",stage2:"碳已验证",stage3:"资金已释放",blockchain:"在区块链查看",confirmReceipt:"确认收货",escrow:"托管金额",immutable:"由47个节点验证",volume:"数量",price:"价格/吨",total:"总计",noTx:"没有活跃交易",noTxSub:"从市场页面开始交易",status:"交易状态",complete:"交易完成 — 资金已释放",active:"● 活跃",completed:"✓ 完成",inProgress:"● 进行中",advanceDemo:"▶ 进入下一阶段（演示）",blockchainNote:"以太坊测试网（Sepolia）上的不可变记录" },
    verify:{ title:"MRV和验证",download:"下载ISO 14064证书",log:"IoT·ML·卫星日志",satelliteView:"卫星视图 — 土地边界",multiSite:"多地点卫星视图",certDownloaded:"ISO 14064证书已下载" },
    profile:{ title:"企业档案",settings:"档案设置",wallet:"区块链钱包ID",generate:"生成钱包",walletNote:"钱包ID只能生成一次。",walletImportant:"重要",walletFull:"您唯一的区块链钱包ID将被生成并永久存储。",walletGenerate:"✅ 生成我的钱包ID",walletStored:"✓ 永久存储 · 无法重新生成",esg:"ESG评分",esgStart:"开始ESG评估",esgDesc:"完成问卷和文件提交以获得AI验证的ESG评分。",esgStatus:{not_started:"未开始",in_progress:"进行中",submitted:"已提交",verified:"已验证"},esgVerified:"AI验证 · 0–100分",esgAllAnswered:"所有问题已回答！",esgSubmitDesc:"提交进行AI分析以获得ESG评分",esgCalculating:"计算中...",esgGenerate:"生成ESG评分 →",tree:"虚拟树 🌳",treeDesc:"随着每次交易成长",simulateTx:"模拟新交易 (+1 🌱)",save:"保存档案",saved:"✅ 已保存！",companyName:"企业名称",emailLabel:"机构邮箱",locationLabel:"位置",removalProjectLabel:"碳去除项目",entityTypeLabel:"实体/企业类型",bizTypeLabel:"业务活动类型",txCount:"交易" },
    exit:{ btn:"退出",title:"退出应用",desc:"您想做什么？",exitOnly:"退出应用",logout:"退出并注销",logoutDesc:"您将返回到注册页面。",cancelBtn:"取消",noActiveTx:"没有活跃交易" },
    common:{ save:"保存",cancel:"取消",back:"← 返回",loading:"处理中...",confirm:"确认",download:"下载",close:"关闭",add:"添加",submit:"提交" },
  },
  ko: {
    flag:"🇰🇷", label:"한국어",
    nav:{ home:"홈",market:"탄소시장",calc:"계산기",land:"토지",verify:"검증",profile:"기업",tx:"거래" },
    dash:{ greeting:"환영합니다",tagline:"유효 · 실시간 · 사기없음",netCarbon:"순탄소 잔액",totalEm:"총 배출량",totalAbs:"총 흡수량",credits:"탄소 크레딧",creditsUSD:"포트폴리오 가치",liveIoT:"실시간 IoT 센서",history:"기록",alerts:"AI 감지 및 경보",dismiss:"닫기",myProjects:"내 활성 프로젝트",seeAll:"모든 토지 보기 →",units:{t:"tCO₂e",kt:"ktCO₂e",Mt:"MtCO₂e",kg:"kg CO₂e"},unitLabel:"단위" },
    land:{ title:"토지 소유권",addParcel:"+ 토지 추가",area:"면적 (ha)",type:"토지 유형",name:"필지 이름",lat:"위도",lng:"경도",depth:"이탄 깊이 (m)",simulate:"조건 시뮬레이션",viewAll:"모든 토지 필지",stockFormula:"탄소 저장량 공식",types:{forest:"산림",peatland:"이탄지",mangrove:"맹그로브",agricultural:"농업",industrial:"산업"},status:{healthy:"정상",flooded:"침수",degraded:"훼손",burned:"화재",drying:"이탄 건조"},alerts:{flooded:"🌊 홍수 감지",peatland_degraded:"⚠️ 이탄 훼손",burned:"🔥 화재 감지",drying:"🌡️ 이탄 건조"} },
    calc:{ title:"탄소 배출 계산기",scope1:"범위 1",scope2:"범위 2",scope3:"범위 3",calculate:"배출량 계산",totalEm:"총 배출량",offsetNeeded:"필요 크레딧",leakage:"누출 추정",ref:"IPCC 2006 기반",breakdownTitle:"소스별 분류" },
    market:{ title:"탄소 시장",search:"프로젝트, 회사, 국가 검색...",detail:"상세 보기",transact:"거래 시작",aiMatch:"AI 매칭",analyzing:"분석 중...",score:"호환성 점수",buyer:"구매자",seller:"판매자",proceed:"거래로 진행 →",recommend:"추천",est500:"500톤 구매 추정",eqArea:"ha 등가",renewableProj:"재생에너지 프로젝트" },
    tx:{ title:"거래",new:"새 거래",stage0:"계약 생성",stage1:"자금 에스크로",stage2:"탄소 검증",stage3:"자금 해제",blockchain:"블록체인에서 보기",confirmReceipt:"수령 확인",escrow:"에스크로 금액",immutable:"47개 노드 검증",volume:"수량",price:"가격/톤",total:"합계",noTx:"활성 거래 없음",noTxSub:"시장 페이지에서 거래를 시작하세요",status:"거래 상태",complete:"거래 완료 — 자금 해제",active:"● 활성",completed:"✓ 완료",inProgress:"● 진행 중",advanceDemo:"▶ 다음 단계로 진행（데모）",blockchainNote:"이더리움 테스트넷（세폴리아）의 불변 기록" },
    verify:{ title:"MRV 및 검증",download:"ISO 14064 인증서 다운로드",log:"IoT·ML·위성 로그",satelliteView:"위성 뷰 — 토지 경계",multiSite:"다중 사이트 위성 뷰",certDownloaded:"ISO 14064 인증서 다운로드됨" },
    profile:{ title:"기업 프로필",settings:"프로필 설정",wallet:"블록체인 지갑 ID",generate:"지갑 생성",walletNote:"지갑 ID는 한 번만 생성할 수 있습니다.",walletImportant:"중요",walletFull:"귀하의 고유한 블록체인 지갑 ID가 생성되어 데이터베이스에 영구적으로 저장됩니다.",walletGenerate:"✅ 내 지갑 ID 생성",walletStored:"✓ 영구 저장 · 재생성 불가",esg:"ESG 점수",esgStart:"ESG 평가 시작",esgDesc:"설문지 및 문서 제출 완료 시 AI 검증 ESG 점수 수령.",esgStatus:{not_started:"미시작",in_progress:"진행 중",submitted:"제출됨",verified:"검증됨"},esgVerified:"AI 검증 · 0–100점",esgAllAnswered:"모든 질문에 답했습니다!",esgSubmitDesc:"AI 분석을 위해 제출하면 ESG 점수를 받습니다",esgCalculating:"계산 중...",esgGenerate:"ESG 점수 생성 →",tree:"가상 나무 🌳",treeDesc:"거래마다 성장",simulateTx:"새 거래 시뮬레이션 (+1 🌱)",save:"프로필 저장",saved:"✅ 저장됨!",companyName:"기업명",emailLabel:"기관 이메일",locationLabel:"위치",removalProjectLabel:"탄소 제거 프로젝트",entityTypeLabel:"법인/기업 유형",bizTypeLabel:"사업 활동 유형",txCount:"거래" },
    exit:{ btn:"종료",title:"앱 종료",desc:"어떻게 하시겠습니까?",exitOnly:"앱 종료",logout:"종료 및 로그아웃",logoutDesc:"등록 화면으로 돌아갑니다.",cancelBtn:"취소",noActiveTx:"활성 거래 없음" },
    common:{ save:"저장",cancel:"취소",back:"← 뒤로",loading:"처리 중...",confirm:"확인",download:"다운로드",close:"닫기",add:"추가",submit:"제출" },
  },
  ja: {
    flag:"🇯🇵", label:"日本語",
    nav:{ home:"ホーム",market:"炭素市場",calc:"計算機",land:"土地",verify:"検証",profile:"企業",tx:"取引" },
    dash:{ greeting:"おかえりなさい",tagline:"有効 · リアルタイム · 不正なし",netCarbon:"純炭素残高",totalEm:"総排出量",totalAbs:"総吸収量",credits:"カーボンクレジット",creditsUSD:"ポートフォリオ価値",liveIoT:"リアルタイムIoTセンサー",history:"履歴",alerts:"AI検知・アラート",dismiss:"閉じる",myProjects:"アクティブプロジェクト",seeAll:"全土地を見る →",units:{t:"tCO₂e",kt:"ktCO₂e",Mt:"MtCO₂e",kg:"kg CO₂e"},unitLabel:"単位" },
    land:{ title:"土地所有権",addParcel:"+ 土地追加",area:"面積 (ha)",type:"土地種別",name:"区画名",lat:"緯度",lng:"経度",depth:"泥炭深度 (m)",simulate:"条件シミュレーション",viewAll:"全土地区画",stockFormula:"炭素貯留量算式",types:{forest:"森林",peatland:"泥炭地",mangrove:"マングローブ",agricultural:"農業",industrial:"工業"},status:{healthy:"健全",flooded:"浸水",degraded:"劣化",burned:"火災",drying:"泥炭乾燥"},alerts:{flooded:"🌊 洪水検知",peatland_degraded:"⚠️ 泥炭劣化",burned:"🔥 火災検知",drying:"🌡️ 泥炭乾燥"} },
    calc:{ title:"排出量計算ツール",scope1:"スコープ1",scope2:"スコープ2",scope3:"スコープ3",calculate:"排出量を計算",totalEm:"総排出量",offsetNeeded:"必要クレジット",leakage:"リーケージ推定",ref:"IPCC 2006基準",breakdownTitle:"ソース別内訳" },
    market:{ title:"炭素市場",search:"プロジェクト、企業、国を検索...",detail:"詳細を見る",transact:"取引開始",aiMatch:"AIマッチング",analyzing:"分析中...",score:"互換性スコア",buyer:"購入者",seller:"販売者",proceed:"取引に進む →",recommend:"おすすめ",est500:"500トン購入の見積もり",eqArea:"ha相当",renewableProj:"再生可能エネルギープロジェクト" },
    tx:{ title:"取引",new:"新規取引",stage0:"契約作成",stage1:"資金エスクロー",stage2:"炭素検証",stage3:"資金解放",blockchain:"ブロックチェーンで見る",confirmReceipt:"受領確認",escrow:"エスクロー金額",immutable:"47ノード検証",volume:"数量",price:"価格/トン",total:"合計",noTx:"アクティブな取引なし",noTxSub:"市場ページから取引を開始してください",status:"取引状況",complete:"取引完了 — 資金解放",active:"● アクティブ",completed:"✓ 完了",inProgress:"● 進行中",advanceDemo:"▶ 次のステージへ（デモ）",blockchainNote:"イーサリアムテストネット（セポリア）の不変記録" },
    verify:{ title:"MRVと検証",download:"ISO 14064証明書ダウンロード",log:"IoT·ML·衛星ログ",satelliteView:"衛星ビュー — 土地境界",multiSite:"マルチサイト衛星ビュー",certDownloaded:"ISO 14064証明書ダウンロード済み" },
    profile:{ title:"企業プロフィール",settings:"プロフィール設定",wallet:"ブロックチェーンウォレットID",generate:"ウォレット生成",walletNote:"ウォレットIDは一度のみ生成可能です。",walletImportant:"重要",walletFull:"あなたのユニークなブロックチェーンウォレットIDが生成され、データベースに永久保存されます。",walletGenerate:"✅ ウォレットIDを生成",walletStored:"✓ 永久保存 · 再生成不可",esg:"ESGスコア",esgStart:"ESG評価を開始",esgDesc:"アンケートと書類提出でAI検証済みESGスコアを取得。",esgStatus:{not_started:"未開始",in_progress:"進行中",submitted:"提出済み",verified:"検証済み"},esgVerified:"AI検証済み · 0–100スケール",esgAllAnswered:"すべての質問に回答しました！",esgSubmitDesc:"AIによる分析のために提出してESGスコアを取得",esgCalculating:"計算中...",esgGenerate:"ESGスコアを生成 →",tree:"バーチャルツリー 🌳",treeDesc:"取引のたびに成長",simulateTx:"新取引シミュレーション (+1 🌱)",save:"プロフィール保存",saved:"✅ 保存済み！",companyName:"企業名",emailLabel:"機関メール",locationLabel:"場所",removalProjectLabel:"炭素除去プロジェクト",entityTypeLabel:"法人/企業タイプ",bizTypeLabel:"事業活動タイプ",txCount:"取引" },
    exit:{ btn:"終了",title:"アプリを終了",desc:"どうしますか？",exitOnly:"アプリを終了",logout:"終了してログアウト",logoutDesc:"登録画面に戻ります。",cancelBtn:"キャンセル",noActiveTx:"アクティブな取引なし" },
    common:{ save:"保存",cancel:"キャンセル",back:"← 戻る",loading:"処理中...",confirm:"確認",download:"ダウンロード",close:"閉じる",add:"追加",submit:"提出" },
  },
};

// ─── SCIENCE CONSTANTS ─────────────────────────────────────────────────────
export const ABS_RATES = {
  forest:       { healthy:8.5, flooded:3.2, degraded:1.5, burned:-50,  drying:0    },
  peatland:     { healthy:2.1, flooded:0.8, degraded:-15, burned:-120, drying:-25  },
  mangrove:     { healthy:11.4,flooded:4.5, degraded:2.0, burned:-30,  drying:0    },
  seawater:     { healthy: 14.0, flooded: 14.0, degraded: 5.0, burned: -20.0, drying: 0 },
  agricultural: { healthy:1.2, flooded:0.2, degraded:0.5, burned:-5,   drying:0    },
  industrial:   { healthy:0.0, flooded:0.0, degraded:0.0, burned:0,    drying:0    },
};
// Diesel density: 1 liter = 0.832 kg → EF 2.68 kg CO₂/liter (IPCC 2006)
// Solar/HSD conversion: input liter → auto convert to kg (×0.832) internally
export const EF = {
  // ── Scope 1: Stationary Combustion ──────────────────────────
  genset:      { ef:2.68,  unit:"liter", scope:1, category:"stationary", litToKg:0.832, source:"Genset (Solar/HSD)" },
  boiler:      { ef:2.68,  unit:"liter", scope:1, category:"stationary", litToKg:0.832, source:"Boiler (Solar/HSD)" },
  furnace:     { ef:2.68,  unit:"liter", scope:1, category:"stationary", litToKg:0.832, source:"Furnace (Solar/HSD)" },
  lpg:         { ef:3.00,  unit:"kg",    scope:1, category:"stationary", source:"LPG" },
  naturalGas:  { ef:2.04,  unit:"m³",   scope:1, category:"stationary", source:"Natural Gas" },
  coal:        { ef:2.42,  unit:"kg",    scope:1, category:"stationary", source:"Coal / Batubara" },
  // ── Scope 1: Mobile Combustion / Transport ──────────────────
  diesel:      { ef:2.68,  unit:"liter", scope:1, category:"mobile", litToKg:0.832, source:"Diesel (kendaraan)" },
  petrol:      { ef:2.31,  unit:"liter", scope:1, category:"mobile", source:"Bensin/Premium" },
  truck:       { ef:0.120, unit:"km",    scope:1, category:"mobile", source:"Truk besar / Fuso" },
  smallTruck:  { ef:0.085, unit:"km",    scope:1, category:"mobile", source:"Truk kecil / Pick-up" },
  opCar:       { ef:0.171, unit:"km",    scope:1, category:"mobile", source:"Mobil operasional" },
  bus:         { ef:0.089, unit:"km",    scope:1, category:"mobile", source:"Bus / Minibus" },
  // ── Scope 1: Fugitive ───────────────────────────────────────
  refrigerant: { ef:1430,  unit:"kg",    scope:1, category:"fugitive", source:"Refrigerant AC (R-22)" },
  // ── Scope 2: Purchased Energy ───────────────────────────────
  electricity: { ef:0.87,  unit:"kWh",  scope:2, category:"electricity", source:"Grid PLN (kWh)" },
  heatSteam:   { ef:0.26,  unit:"kWh",  scope:2, category:"steam", source:"Purchased Heat/Steam" },
  // ── Scope 3: Value Chain ────────────────────────────────────
  bizTravel:   { ef:0.255, unit:"km",   scope:3, category:"travel", source:"Business Travel (pesawat)" },
  commuting:   { ef:0.21,  unit:"km",   scope:3, category:"travel", source:"Commuting karyawan" },
  freightRoad: { ef:0.062, unit:"ton·km",scope:3, category:"freight", source:"Pengiriman darat (ton·km)" },
  freightShip: { ef:0.012, unit:"ton·km",scope:3, category:"freight", source:"Pengiriman laut (ton·km)" },
  fuelDelivery:{ ef:0.062, unit:"km",   scope:3, category:"freight", source:"Ongkir bahan bakar (km)" },
  waste:       { ef:0.5,   unit:"kg",   scope:3, category:"waste", source:"Limbah operasional" },
};

export const EF_LABELS = {
  genset:"Genset (Solar/HSD)", boiler:"Boiler (Solar/HSD)", furnace:"Furnace (Solar/HSD)",
  lpg:"LPG", naturalGas:"Gas Alam (m³)", coal:"Batubara",
  diesel:"Diesel kendaraan", petrol:"Bensin/Premium",
  truck:"Truk besar / Fuso", smallTruck:"Truk kecil / Pick-up",
  opCar:"Mobil operasional", bus:"Bus / Minibus",
  refrigerant:"Refrigerant AC",
  electricity:"Listrik PLN (kWh)", heatSteam:"Panas/Steam beli",
  bizTravel:"Perjalanan bisnis", commuting:"Komuter karyawan",
  freightRoad:"Pengiriman darat", freightShip:"Pengiriman laut",
  fuelDelivery:"Ongkir bahan bakar",
  waste:"Limbah operasional",
};

// Category labels for grouping in CalcPage
export const EF_CATEGORIES = {
  stationary: "Pembakaran Stasioner (Genset/Boiler/Furnace)",
  mobile:     "Transportasi & Kendaraan",
  fugitive:   "Emisi Fugitif",
  electricity:"Listrik yang Dibeli",
  steam:      "Panas / Steam",
  travel:     "Perjalanan & Komuter",
  freight:    "Pengiriman & Logistik",
  waste:      "Limbah",
};

// ─── UTILS ─────────────────────────────────────────────────────────────────
export function calcAbsorption(p) {
  const r = ABS_RATES[p.type]?.[p.status] ?? 0;
  return parseFloat(((r * p.area) / 12).toFixed(2));
}
export function convertUnit(val, unit) {
  if (unit === "kg") return parseFloat((val * 1000).toFixed(0));
  if (unit === "kt") return parseFloat((val / 1000).toFixed(3));
  if (unit === "Mt") return parseFloat((val / 1000000).toFixed(6));
  return val;
}

// ─── HOOKS ─────────────────────────────────────────────────────────────────
export function useInterval(cb, delay) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; }, [cb]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => ref.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
export function useApi(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    apiFetch(path).then(d => { setData(d); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, refresh: () => apiFetch(path).then(setData) };
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
export const MOCK_PARCELS = [
  { id:"LP-001",name:"Borneo Forest Block A",  type:"forest",   area:450,status:"healthy", ndvi:0.78,lat:-1.24,lng:113.92,absorptionMonthly:318.75 },
  { id:"LP-002",name:"Riau Peatland B",         type:"peatland", area:320,status:"degraded",ndvi:0.31,lat:0.52,lng:101.45,absorptionMonthly:-400.0 },
  { id:"LP-003",name:"Sumatra Mangrove Coast",  type:"mangrove", area:85, status:"flooded", ndvi:0.55,lat:-5.38,lng:105.27,absorptionMonthly:31.88 },
];
export const MOCK_COMPANY = { id:"COMP-001",name:"PT. Nusantara Hijau Tbk",email:"esg@nusantarahijau.co.id",entity:"PT Tbk",bizType:"Manufacturing & Plantation",location:"South Jakarta, Indonesia",walletId:"0xA3f7b82e4c1d0F56789aB3dE4F2c9dC2",walletGenerated:true,esgScore:null,esgStatus:"not_started",totalTransactions:14,removalProject:"REDD+ Kalimantan A" };
export const MOCK_ALERTS = [
  { id:"ALT-001",parcelId:"LP-003",type:"critical",message:"MNDWI > 0.42 — Flood confirmed · Sentinel-2",time:new Date().toISOString() },
  { id:"ALT-002",parcelId:"LP-002",type:"warning", message:"NDVI 0.31 (↓0.52) — Peat drying, high emission risk",time:new Date(Date.now()-1800000).toISOString() },
  { id:"ALT-003",parcelId:"LP-001",type:"info",    message:"Sensor C-12: CO₂ flux normal, NDVI stable 0.78",time:new Date(Date.now()-3600000).toISOString() },
];
export const MOCK_PROJECTS = [
  { id:"PRJ-001",company:"Borneo Green Alliance",country:"Indonesia",flag:"🇮🇩",price:18.5,available:3200,type:"Reforestation",verified:true,rating:4.9,ndvi:0.78,absRate:8.5, isLocked: false },
  { id:"PRJ-002",company:"Mekong Solar Co.",country:"Vietnam",flag:"🇻🇳",price:14.2,available:1800,type:"Renewable Energy",verified:true,rating:4.7,ndvi:null,absRate:0, isLocked: false },
  { id:"PRJ-003",company:"Sumatra Peat Restore",country:"Indonesia",flag:"🇮🇩",price:16.8,available:900,type:"Peat Restoration",verified:true,rating:4.6,ndvi:0.61,absRate:2.1, isLocked: false },
  { id:"PRJ-004",company:"Amazon Blue Carbon Ltd",country:"Brazil",flag:"🇧🇷",price:22.0,available:950,type:"Blue Carbon",verified:false,rating:4.8,ndvi:0.72,absRate:11.4, isLocked: false },
];

export function lockProject(id) {
  const proj = MOCK_PROJECTS.find(p => p.id === id);
  if (proj) proj.isLocked = true;
}
// ─── SHARED UI ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-lg" : "max-w-md"} max-h-[90vh] overflow-y-auto fade-up`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function SBadge({ status, t }) {
  const C = { healthy:"bg-emerald-100 text-emerald-700",flooded:"bg-blue-100 text-blue-700",degraded:"bg-amber-100 text-amber-700",burned:"bg-red-100 text-red-700",drying:"bg-orange-100 text-orange-700" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${C[status]||"bg-gray-100 text-gray-600"}`}>{t.land.status[status]||status}</span>;
}

export function Spinner() {
  return <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full spin" />;
}

export function SparkLine({ data, color = "#22c55e", h = 36 }) {
  if (!data || data.length < 2) return null;
  const mx = Math.max(...data), mn = Math.min(...data), rng = mx - mn || 1, W = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height: h }}>
      <defs><linearGradient id={`sg${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3" /><stop offset="100%" stopColor={color} stopOpacity=".02" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${W},${h}`} fill={`url(#sg${color.slice(1)})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── LOGO ──────────────────────────────────────────────────────────────────
export function Logo({ size = 38 }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo.jpg" alt="Logo CarbonTrust" style={{ width: size, height: size }}
        className="object-contain rounded-lg shadow-sm" />
      <div>
        <div className="leading-none">
          <span className="font-black text-green-700" style={{ fontSize: "1.05rem", letterSpacing: "-0.02em" }}>Carbon</span>
          <span className="font-black text-teal-600" style={{ fontSize: "1.05rem", letterSpacing: "-0.02em" }}>Trust</span>
        </div>
        <div className="text-green-600 font-semibold" style={{ fontSize: "7.5px", letterSpacing: "0.14em", marginTop: "1px" }}>
          VALID · REAL-TIME · FRAUD-FREE
        </div>
      </div>
    </div>
  );
}

// ─── ICONS ─────────────────────────────────────────────────────────────────
export const Ic = {
  Home:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>,
  Market:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.8 14L5.2 5H2V3h4.3l.8 3h11.1l-2.4 8H7.8z" /></svg>,
  Calc:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3h2v2h-2V6zm0 4h2v2h-2v-2zM7 6h2v2H7V6zm0 4h2v2H7v-2zm-1 6v-2h8v2H6zm10 0h-2v-2h2v2zm0-4h-2v-2h2v2z" /></svg>,
  Land:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" /></svg>,
  Verify:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>,
  Profile:  () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  Bell:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>,
  Globe:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>,
  Bot:      () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7 9h10v7H7V9zm3.5 3c-.83 0-1.5-.67-1.5-1.5S9.67 9 10.5 9s1.5.67 1.5 1.5S11.33 12 10.5 12zm3 0c-.83 0-1.5-.67-1.5-1.5S12.67 9 13.5 9s1.5.67 1.5 1.5S14.33 12 13.5 12z" /></svg>,
  Shield:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>,
  Check:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>,
  Chain:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>,
  Dl:       () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>,
  Star:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" /></svg>,
  Leaf:     ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 5.5-11 4z" /></svg>,
  Tx:       () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" /></svg>,
  Chart:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" /></svg>,
  Map:      () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" /></svg>,
  Plus:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>,
  Info:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>,
  Exit:     () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
};

// ─── LANG SELECTOR ─────────────────────────────────────────────────────────
export function LangSel({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const t = TR[lang] ?? TR["en"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-xl text-green-700 font-bold hover:bg-green-100">
        <Ic.Globe />{t.flag} <span className="hidden sm:inline">{t.label}</span> ▾
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-36">
          {Object.keys(TR).map(k => (
            <button key={k} onClick={() => { setLang(k); setOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-gray-50 ${lang === k ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"}`}>
              <span>{TR[k].flag}</span><span>{TR[k].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HEADER ────────────────────────────────────────────────────────────────
export function Header({ alerts, onDismiss, lang, setLang, t }) {
  const [open, setOpen] = useState(false);
  const crit = alerts.filter(a => a.type !== "info").length;
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
        <Logo size={36} />
        <div className="ml-auto flex items-center gap-2">
          <LangSel lang={lang} setLang={setLang} />
          <button onClick={() => setOpen(true)}
            className="relative w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100">
            <Ic.Bell />
            {crit > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{crit}</span>}
          </button>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={`🔔 ${t.dash.alerts}`}>
        <div className="flex flex-col gap-3">
          {alerts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No active alerts</p>}
          {alerts.map(a => (
            <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl ${a.type === "critical" ? "bg-red-50" : a.type === "warning" ? "bg-amber-50" : "bg-green-50"}`}>
              <span className="text-lg">{a.type === "critical" ? "🚨" : a.type === "warning" ? "⚠️" : "✅"}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">{a.parcelId}</p>
                <p className="text-xs text-gray-600">{a.message}</p>
                <p className="text-xs text-gray-400">{new Date(a.time).toLocaleTimeString()}</p>
              </div>
              <button
        onClick={() => onDismiss(a.id)}
        className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:bg-black/10 hover:text-gray-600 text-xs flex-shrink-0 mt-0.5"
      >
        ✕
      </button>
            </div>
          ))}
        </div>
      </Modal>
    </header>
  );
}

// ─── BOTTOM NAV ────────────────────────────────────────────────────────────
export function BottomNav({ page, setPage, t }) {
  const items = [
    { id: "home",    ic: "Home",    l: t.nav.home },
    { id: "land",    ic: "Land",    l: t.nav.land },
    { id: "calc",    ic: "Calc",    l: t.nav.calc },
    { id: "market",  ic: "Market",  l: t.nav.market },
    { id: "profile", ic: "Profile", l: t.nav.profile },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-md mx-auto flex">
        {items.map(item => {
          const active = page === item.id;
          const IC = Ic[item.ic];
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${active ? "text-green-700" : "text-gray-400 hover:text-gray-600"}`}>
              <div className={`p-1 rounded-xl transition-all ${active ? "bg-green-50 scale-110" : ""}`}><IC /></div>
              <span className="text-xs font-semibold">{item.l}</span>
              {active && <span className="w-4 h-0.5 rounded-full bg-green-600" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}