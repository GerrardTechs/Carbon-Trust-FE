import { useState, useRef, useEffect } from "react";

// ─── design tokens ─────────────────────────────────────────
const G = {
  green900: "#14532d",
  green800: "#166534",
  green700: "#15803d",
  green600: "#16a34a",
  green500: "#22c55e",
  green100: "#dcfce7",
  green50:  "#f0fdf4",
  teal700:  "#0f766e",
  teal600:  "#0d9488",
  slate800: "#1e293b",
  slate600: "#475569",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  white:    "#ffffff",
  err:      "#dc2626",
  errBg:    "#fef2f2",
};

// ─── i18n strings ───────────────────────────────────────────
const LANGS = {
  en: {
    flag: "🇺🇸", label: "English",
    welcome: {
      headline: "The Global Carbon\nTrust Layer",
      sub: "Valid, real-time, fraud-free emission & absorption data — powering transparent carbon markets under Paris Agreement Article 6.",
      continue: "Continue",
      terms: "By continuing you agree to our",
      termsLink: "Terms of Service",
      and: "and",
      privacyLink: "Privacy Policy",
    },
    role: {
      back: "Back",
      title: "Who do you\nwant to be?",
      sub: "Choose your role — this determines what you can do inside CarbonTrust.",
      company: { title: "Company", desc: "Register as a company to report emissions, trade carbon credits, and achieve net-zero targets." },
      landlord: { title: "Landlord", desc: "Register as a land owner to list your parcels, track absorption, and sell carbon credits." },
      continueAs: "Continue as",
      guest: "I'm just looking around →",
      guestSub: "View public emission & absorption data without an account",
    },
    register: {
      back: "Back",
      company: { title: "Create your company account", sub: "Set up your CarbonTrust company profile." },
      landlord: { title: "Create your landlord account", sub: "Start tracking and selling your land's carbon." },
      companyLabel: "Company / Entity Name",
      companyPlaceholder: "PT. Nusantara Hijau Tbk",
      nameLabel: "Full Name",
      namePlaceholder: "Your full name",
      emailLabelCompany: "Institutional Email",
      emailLabelLandlord: "Email Address",
      emailPlaceholderCompany: "esg@yourcompany.com",
      emailPlaceholderLandlord: "you@email.com",
      usernameLabel: "Username",
      usernamePlaceholder: "your_username",
      institutionIdLabel: "Institution ID",
      institutionIdPlaceholder: "Enter your institution ID",
      positionLabel: "Position at Institution",
      positionPlaceholder: "Select your position",
      customPositionPlaceholder: "Enter your position",
      positions: ["GHG Inventory Manager","GHG Inventory Analyst","Internal Carbon Auditor","Finance Manager","Accounting Manager","Other (specify)"],
      passwordLabel: "Password",
      passwordPlaceholder: "Min. 8 characters",
      createBtn: "Create account & verify email",
      otpNote: "A 4-character verification code will be sent to your email.",
      strength: { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" },
      errors: {
        nameReq: "Name is required",
        emailInvalid: "Enter a valid email address",
        pwShort: "Password must be at least 8 characters",
        usernameReq: "Username is required",
        positionReq: "Please select your position",
        customPositionReq: "Please enter your position",
      },
    },
    verify: {
      back: "Back",
      title: "Check your email",
      desc: "We sent a 4-character verification code to",
      desc2: ". Enter it below to verify your account.",
      btn: "Verify & continue",
      didntReceive: "Didn't receive it?",
      resend: "Resend code",
      resendIn: "Resend in",
      spamNote: "Check your spam folder if you don't see it within a minute.",
      codeResent: "Code resent!",
      invalidCode: "Invalid code. Please try again.",
    },
    operational: {
      back: "Back",
      title: "Operational Details",
      sub: "Help us understand your company's emission scope.",
      emissionObjectLabel: "Emission Object",
      emissionObjectPlaceholder: "Select emission object",
      emissionObjects: ["Office", "Site", "Office & Site"],
      companyTypeLabel: "Company Type",
      companyTypePlaceholder: "Select company type",
      companyTypes: ["Services", "Trading", "Manufacturing"],
      officeAddressLabel: "Office Address",
      officeAddressPlaceholder: "Select office address",
      siteAddressLabel: "Site Address",
      siteAddressPlaceholder: "Select site address",
      addressOptions: ["Location 1 (Example)", "Location 2 (Example)", "Add custom address..."],
      nextBtn: "Next",
    },
    calcMethod: {
      back: "Back",
      title: "Calculation Method",
      sub: "Choose how you want to calculate your emissions.",
      calcMethodLabel: "Calculation Method",
      calcMethodPlaceholder: "Select method",
      calcMethods: ["GHG Protocol Corporate Standard", "ISO 14064-1", "IPCC Guidelines", "Custom Method"],
      ghgInventoryLabel: "GHG Inventory File",
      ghgInventoryPlaceholder: "Upload your GHG inventory (optional)",
      carbonRemovalLabel: "Carbon Removal File",
      carbonRemovalPlaceholder: "Upload carbon removal data (optional)",
      equityShareLabel: "Equity Share (%)",
      equitySharePlaceholder: "e.g. 51",
      finishBtn: "Complete Setup →",
    },
    success: {
      company: { title: "Company account ready!", sub: "Your dashboard is being prepared. You can now report emissions and trade carbon credits." },
      landlord: { title: "Landlord account ready!", sub: "Your land management portal is ready. Start adding parcels and tracking absorption." },
      welcome: "Welcome,",
      loading: "Loading your dashboard…",
      verified: "Verified",
      blockchainReady: "Blockchain Ready",
    },
  },
  id: {
    flag: "🇮🇩", label: "Indonesia",
    welcome: {
      headline: "Platform Karbon\nGlobal Terpercaya",
      sub: "Data emisi & serapan yang valid, real-time, bebas fraud — mendukung pasar karbon transparan di bawah Perjanjian Paris Pasal 6.",
      continue: "Lanjutkan",
      terms: "Dengan melanjutkan, Anda menyetujui",
      termsLink: "Ketentuan Layanan",
      and: "dan",
      privacyLink: "Kebijakan Privasi",
    },
    role: {
      back: "Kembali",
      title: "Siapa Anda\ndi sini?",
      sub: "Pilih peran Anda — ini menentukan apa yang dapat Anda lakukan di CarbonTrust.",
      company: { title: "Perusahaan", desc: "Daftar sebagai perusahaan untuk melaporkan emisi, berdagang kredit karbon, dan mencapai target net-zero." },
      landlord: { title: "Pemilik Lahan", desc: "Daftar sebagai pemilik lahan untuk mendaftarkan bidang Anda, melacak serapan, dan menjual kredit karbon." },
      continueAs: "Lanjutkan sebagai",
      guest: "Saya hanya ingin melihat-lihat →",
      guestSub: "Lihat data emisi & serapan publik tanpa akun",
    },
    register: {
      back: "Kembali",
      company: { title: "Buat akun perusahaan", sub: "Siapkan profil perusahaan CarbonTrust Anda." },
      landlord: { title: "Buat akun pemilik lahan", sub: "Mulai melacak dan menjual karbon lahan Anda." },
      companyLabel: "Nama Perusahaan / Entitas",
      companyPlaceholder: "PT. Nusantara Hijau Tbk",
      nameLabel: "Nama Lengkap",
      namePlaceholder: "Nama lengkap Anda",
      emailLabelCompany: "Email Institusi",
      emailLabelLandlord: "Alamat Email",
      emailPlaceholderCompany: "esg@perusahaananda.co.id",
      emailPlaceholderLandlord: "anda@email.com",
      usernameLabel: "Username",
      usernamePlaceholder: "username_anda",
      institutionIdLabel: "ID Institusi",
      institutionIdPlaceholder: "Masukkan ID institusi Anda",
      positionLabel: "Posisi di Institusi",
      positionPlaceholder: "Pilih posisi Anda",
      customPositionPlaceholder: "Masukkan posisi Anda",
      positions: ["GHG Inventory Manager","GHG Inventory Analyst","Auditor Internal (Karbon)","Manager Keuangan","Manajer Accounting","Lainnya (Tulis sendiri)"],
      passwordLabel: "Kata Sandi",
      passwordPlaceholder: "Min. 8 karakter",
      createBtn: "Buat akun & verifikasi email",
      otpNote: "Kode verifikasi 4 karakter akan dikirim ke email Anda.",
      strength: { weak: "Lemah", fair: "Cukup", good: "Baik", strong: "Kuat" },
      errors: {
        nameReq: "Nama wajib diisi",
        emailInvalid: "Masukkan alamat email yang valid",
        pwShort: "Kata sandi minimal 8 karakter",
        usernameReq: "Username wajib diisi",
        positionReq: "Silakan pilih posisi Anda",
        customPositionReq: "Silakan masukkan posisi Anda",
      },
    },
    verify: {
      back: "Kembali",
      title: "Cek email Anda",
      desc: "Kami mengirim kode verifikasi 4 karakter ke",
      desc2: ". Masukkan di bawah untuk memverifikasi akun Anda.",
      btn: "Verifikasi & lanjutkan",
      didntReceive: "Tidak menerima kode?",
      resend: "Kirim ulang kode",
      resendIn: "Kirim ulang dalam",
      spamNote: "Periksa folder spam jika tidak muncul dalam satu menit.",
      codeResent: "Kode dikirim ulang!",
      invalidCode: "Kode tidak valid. Coba lagi.",
    },
    operational: {
      back: "Kembali",
      title: "Detail Operasional",
      sub: "Bantu kami memahami lingkup emisi perusahaan Anda.",
      emissionObjectLabel: "Objek Emisi",
      emissionObjectPlaceholder: "Pilih objek emisi",
      emissionObjects: ["Kantor", "Site", "Kantor & Site"],
      companyTypeLabel: "Jenis Perusahaan",
      companyTypePlaceholder: "Pilih jenis perusahaan",
      companyTypes: ["Jasa", "Dagang", "Manufaktur"],
      officeAddressLabel: "Alamat Kantor",
      officeAddressPlaceholder: "Pilih alamat kantor",
      siteAddressLabel: "Alamat Site",
      siteAddressPlaceholder: "Pilih alamat site",
      addressOptions: ["Map 1 (Contoh)", "Map 2 (Contoh)", "Tambahkan Alamat Sendiri..."],
      nextBtn: "Selanjutnya",
    },
    calcMethod: {
      back: "Kembali",
      title: "Metode Kalkulasi",
      sub: "Pilih cara menghitung emisi Anda.",
      calcMethodLabel: "Metode Kalkulasi",
      calcMethodPlaceholder: "Pilih metode",
      calcMethods: ["GHG Protocol Corporate Standard", "ISO 14064-1", "Panduan IPCC", "Metode Kustom"],
      ghgInventoryLabel: "File Inventaris GHG",
      ghgInventoryPlaceholder: "Upload inventaris GHG Anda (opsional)",
      carbonRemovalLabel: "File Penyerapan Karbon",
      carbonRemovalPlaceholder: "Upload data penyerapan karbon (opsional)",
      equityShareLabel: "Ekuitas (%)",
      equitySharePlaceholder: "mis. 51",
      finishBtn: "Selesaikan Pengaturan →",
    },
    success: {
      company: { title: "Akun perusahaan siap!", sub: "Dashboard Anda sedang disiapkan. Anda sekarang dapat melaporkan emisi dan berdagang kredit karbon." },
      landlord: { title: "Akun pemilik lahan siap!", sub: "Portal pengelolaan lahan Anda sudah siap. Mulai tambahkan bidang dan lacak serapan." },
      welcome: "Selamat datang,",
      loading: "Memuat dashboard Anda…",
      verified: "Terverifikasi",
      blockchainReady: "Siap Blockchain",
    },
  },
  tr: {
    flag: "🇹🇷", label: "Türkçe",
    welcome: {
      headline: "Küresel Karbon\nGüven Katmanı",
      sub: "Paris Anlaşması Madde 6 kapsamında şeffaf karbon piyasalarını destekleyen geçerli, gerçek zamanlı, dolandırıcılıktan arınmış emisyon ve absorpsiyon verisi.",
      continue: "Devam Et",
      terms: "Devam ederek kabul ediyorsunuz",
      termsLink: "Hizmet Şartları",
      and: "ve",
      privacyLink: "Gizlilik Politikası",
    },
    role: {
      back: "Geri",
      title: "Kim olmak\nistiyorsunuz?",
      sub: "Rolünüzü seçin — bu, CarbonTrust'ta neler yapabileceğinizi belirler.",
      company:  { title: "Şirket",          desc: "Emisyon raporlamak, karbon kredisi ticareti yapmak ve net sıfır hedeflerine ulaşmak için şirket olarak kayıt olun." },
      landlord: { title: "Arazi Sahibi",    desc: "Arazilerinizi listelemek, absorpsiyonu takip etmek ve karbon kredisi satmak için kayıt olun." },
      continueAs: "Olarak devam et",
      guest: "Sadece göz atıyorum →",
      guestSub: "Hesap oluşturmadan emisyon ve absorpsiyon verilerini görüntüleyin",
    },
    register: {
      back: "Geri",
      company:  { title: "Şirket hesabı oluştur",      sub: "CarbonTrust şirket profilinizi oluşturun." },
      landlord: { title: "Arazi sahibi hesabı oluştur", sub: "Arazinizin karbonunu takip etmeye ve satmaya başlayın." },
      companyLabel:             "Şirket / Kuruluş Adı",
      companyPlaceholder:       "PT. Nusantara Hijau Tbk",
      nameLabel:                "Ad Soyad",
      namePlaceholder:          "Tam adınız",
      emailLabelCompany:        "Kurumsal E-posta",
      emailLabelLandlord:       "E-posta Adresi",
      emailPlaceholderCompany:  "esg@sirketiniz.com",
      emailPlaceholderLandlord: "siz@email.com",
      usernameLabel:            "Kullanıcı Adı",
      usernamePlaceholder:      "kullanici_adi",
      institutionIdLabel:       "Kurum ID",
      institutionIdPlaceholder: "Kurum ID'nizi girin",
      positionLabel:            "Kurumdaki Pozisyon",
      positionPlaceholder:      "Pozisyonunuzu seçin",
      customPositionPlaceholder:"Pozisyonunuzu girin",
      positions: ["GHG Envanter Yöneticisi","GHG Envanter Analisti","İç Karbon Denetçisi","Finans Müdürü","Muhasebe Müdürü","Diğer (belirtin)"],
      passwordLabel:            "Şifre",
      passwordPlaceholder:      "Min. 8 karakter",
      createBtn:                "Hesap oluştur ve e-postayı doğrula",
      otpNote:                  "E-postanıza 4 karakterli bir doğrulama kodu gönderilecektir.",
      strength: { weak:"Zayıf", fair:"Orta", good:"İyi", strong:"Güçlü" },
      errors: {
        nameReq:           "Ad gereklidir",
        emailInvalid:      "Geçerli bir e-posta adresi girin",
        pwShort:           "Şifre en az 8 karakter olmalıdır",
        usernameReq:       "Kullanıcı adı gereklidir",
        positionReq:       "Lütfen pozisyonunuzu seçin",
        customPositionReq: "Lütfen pozisyonunuzu girin",
      },
    },
    verify: {
      back:          "Geri",
      title:         "E-postanızı kontrol edin",
      desc:          "4 karakterlik doğrulama kodu gönderildi:",
      desc2:         ". Hesabınızı doğrulamak için aşağıya girin.",
      btn:           "Doğrula ve devam et",
      didntReceive:  "Almadınız mı?",
      resend:        "Kodu yeniden gönder",
      resendIn:      "Yeniden gönder:",
      spamNote:      "Bir dakika içinde görmüyorsanız spam klasörünüzü kontrol edin.",
      codeResent:    "Kod yeniden gönderildi!",
      invalidCode:   "Geçersiz kod. Lütfen tekrar deneyin.",
    },
    operational: {
      back:                     "Geri",
      title:                    "Operasyonel Detaylar",
      sub:                      "Şirketinizin emisyon kapsamını anlamamıza yardımcı olun.",
      emissionObjectLabel:      "Emisyon Kaynağı",
      emissionObjectPlaceholder:"Emisyon kaynağı seçin",
      emissionObjects:          ["Ofis","Saha","Ofis & Saha"],
      companyTypeLabel:         "Şirket Türü",
      companyTypePlaceholder:   "Şirket türü seçin",
      companyTypes:             ["Hizmetler","Ticaret","Üretim"],
      officeAddressLabel:       "Ofis Adresi",
      officeAddressPlaceholder: "Ofis adresini seçin",
      siteAddressLabel:         "Saha Adresi",
      siteAddressPlaceholder:   "Saha adresini seçin",
      addressOptions:           ["Konum 1 (Örnek)","Konum 2 (Örnek)","Özel adres ekle..."],
      nextBtn:                  "İleri",
    },
    calcMethod: {
      back:                      "Geri",
      title:                     "Hesaplama Yöntemi",
      sub:                       "Emisyonlarınızı nasıl hesaplamak istediğinizi seçin.",
      calcMethodLabel:           "Hesaplama Yöntemi",
      calcMethodPlaceholder:     "Yöntem seçin",
      calcMethods:               ["GHG Protokol Kurumsal Standardı","ISO 14064-1","IPCC Kılavuzları","Özel Yöntem"],
      ghgInventoryLabel:         "GHG Envanter Dosyası",
      ghgInventoryPlaceholder:   "GHG envanterinizi yükleyin (isteğe bağlı)",
      carbonRemovalLabel:        "Karbon Uzaklaştırma Dosyası",
      carbonRemovalPlaceholder:  "Karbon uzaklaştırma verilerini yükleyin (isteğe bağlı)",
      equityShareLabel:          "Hisse Payı (%)",
      equitySharePlaceholder:    "örn. 51",
      finishBtn:                 "Kurulumu Tamamla →",
    },
    success: {
      company:  { title: "Şirket hesabı hazır!",      sub: "Kontrol paneliniz hazırlanıyor. Artık emisyon raporlayabilir ve karbon kredisi ticareti yapabilirsiniz." },
      landlord: { title: "Arazi sahibi hesabı hazır!", sub: "Arazi yönetim portalınız hazır. Parsel eklemeye ve absorpsiyonu takip etmeye başlayın." },
      welcome:        "Hoş geldiniz,",
      loading:        "Kontrol paneliniz yükleniyor…",
      verified:       "Doğrulandı",
      blockchainReady:"Blockchain Hazır",
    },
  },
};

// ─── CSS ─────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: ${G.slate100};
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .shell {
    width: 100%;
    max-width: 430px;
    min-height: 100dvh;
    background: ${G.white};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 28px 40px;
    overflow-y: auto;
    animation: fadeUp .35s ease forwards;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .btn-primary {
    width: 100%;
    padding: 15px 0;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg, ${G.green800}, ${G.teal700});
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity .15s, transform .1s;
    letter-spacing: -.01em;
    flex-shrink: 0;
  }
  .btn-primary:hover  { opacity: .92; }
  .btn-primary:active { transform: scale(.98); }
  .btn-primary:disabled { opacity: .45; cursor: not-allowed; }

  .btn-outline {
    width: 100%;
    padding: 14px 0;
    border-radius: 14px;
    border: 1.5px solid ${G.slate200};
    background: transparent;
    color: ${G.slate800};
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s, border-color .15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .btn-outline:hover  { background: ${G.slate100}; border-color: ${G.slate400}; }
  .btn-outline:active { transform: scale(.98); }

  .input-field {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1.5px solid ${G.slate200};
    font-size: 14px;
    font-family: inherit;
    color: ${G.slate800};
    background: ${G.white};
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    -webkit-appearance: none;
    appearance: none;
  }
  .input-field::placeholder { color: ${G.slate400}; }
  .input-field:focus {
    border-color: ${G.green600};
    box-shadow: 0 0 0 3px ${G.green100};
  }
  .input-field.error { border-color: ${G.err}; }

  .select-field {
    width: 100%;
    padding: 13px 40px 13px 16px;
    border-radius: 12px;
    border: 1.5px solid ${G.slate200};
    font-size: 14px;
    font-family: inherit;
    color: ${G.slate800};
    background: ${G.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 14px center;
    outline: none;
    cursor: pointer;
    transition: border-color .15s, box-shadow .15s;
    -webkit-appearance: none;
    appearance: none;
  }
  .select-field:focus {
    border-color: ${G.green600};
    box-shadow: 0 0 0 3px ${G.green100};
  }
  .select-field.error { border-color: ${G.err}; }
  .select-field option { color: ${G.slate800}; }
  .select-field.placeholder { color: ${G.slate400}; }
  
  .logo-fill {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: ${G.slate600};
    margin-bottom: 5px;
    display: block;
  }

  .err-msg {
    font-size: 12px;
    color: ${G.err};
    margin-top: 5px;
  }

  .field-group { display: flex; flex-direction: column; gap: 4px; }

  /* --- welcome screen --- */
  .welcome-top {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 60px;
    padding-bottom: 40px;
    text-align: center;
  }

  .globe-ring {
    width: 120px;
    height: 120px;        /* width == height agar benar-benar bulat */
    border-radius: 50%;
    transform: scale(1.8);
    overflow: hidden;     /* ini yang memotong gambar jadi lingkaran */
    background: white;
    border: 1.5px solid ${G.green100};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 70px;
  }

  .globe-ring img {
    width: 170%;
    height: 170%;
    object-fit: contain;  /* atau 'cover' jika ingin penuh */
  }

  .welcome-headline {
    font-size: 28px;
    font-weight: 900;
    color: ${G.slate800};
    line-height: 1.2;
    letter-spacing: -.03em;
    margin-bottom: 16px;
    max-width: 280px;
    white-space: pre-line;
  }

  .welcome-sub {
    font-size: 15px;
    color: ${G.slate600};
    line-height: 1.6;
    max-width: 300px;
  }

  .pill-row {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 24px;
  }

  .pill {
    font-size: 11px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 999px;
    letter-spacing: .03em;
  }
  .pill-green  { background: ${G.green100}; color: ${G.green800}; }
  .pill-teal   { background: #ccfbf1;       color: #0f766e; }
  .pill-slate  { background: ${G.slate200};  color: ${G.slate800}; }

  .welcome-bottom {
    padding: 0 28px 48px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .terms-note {
    font-size: 11px;
    color: ${G.slate400};
    text-align: center;
    line-height: 1.5;
  }
  .terms-note a { color: ${G.green700}; text-decoration: none; }

  /* --- lang switcher --- */
  .lang-switcher {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .lang-btn {
    font-size: 11px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 999px;
    border: 1.5px solid ${G.slate200};
    background: transparent;
    color: ${G.slate600};
    cursor: pointer;
    transition: all .15s;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
  }
  .lang-btn:hover { border-color: ${G.green600}; background: ${G.green50}; color: ${G.green800}; }
  .lang-btn.active { border-color: ${G.green600}; background: ${G.green100}; color: ${G.green800}; }

  /* --- progress dots (6 steps now) --- */
  .progress-dots { display: flex; gap: 6px; align-items: center; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: ${G.slate200}; transition: all .3s; }
  .dot.active { background: ${G.green600}; width: 24px; border-radius: 4px; }
  .dot.done   { background: ${G.green500}; }

  /* --- role screen --- */
  .role-header { padding: 48px 28px 32px; }

  .role-title {
    font-size: 24px;
    font-weight: 900;
    color: ${G.slate800};
    letter-spacing: -.03em;
    line-height: 1.25;
    margin-bottom: 8px;
    white-space: pre-line;
  }

  .role-sub {
    font-size: 14px;
    color: ${G.slate600};
    line-height: 1.55;
  }

  .role-card {
    border: 1.5px solid ${G.slate200};
    border-radius: 16px;
    padding: 20px 20px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: border-color .15s, background .15s, transform .1s;
    background: ${G.white};
  }
  .role-card:hover  { border-color: ${G.green600}; background: ${G.green50}; }
  .role-card:active { transform: scale(.985); }
  .role-card.active {
    border-color: ${G.green700};
    background: ${G.green50};
    box-shadow: 0 0 0 3px ${G.green100};
  }

  .role-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .role-icon-green  { background: ${G.green100}; }
  .role-icon-teal   { background: #ccfbf1; }

  .role-card-title {
    font-size: 15px;
    font-weight: 700;
    color: ${G.slate800};
    margin-bottom: 3px;
  }
  .role-card-desc {
    font-size: 13px;
    color: ${G.slate600};
    line-height: 1.45;
  }

  .role-radio {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid ${G.slate200};
    margin-left: auto;
    flex-shrink: 0;
    margin-top: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color .15s;
  }
  .role-card.active .role-radio { border-color: ${G.green600}; }
  .role-radio-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${G.green600};
    display: none;
  }
  .role-card.active .role-radio-dot { display: block; }

  .guest-link {
    text-align: center;
    font-size: 13px;
    color: ${G.green700};
    font-weight: 600;
    cursor: pointer;
    padding: 10px 0;
    border-radius: 10px;
    transition: background .12s;
    text-decoration: none;
    display: block;
    margin-top: 4px;
  }
  .guest-link:hover { background: ${G.green50}; }

  /* --- register / auth screens --- */
  .auth-header { padding: 36px 28px 22px; }
  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: ${G.slate600};
    cursor: pointer;
    margin-bottom: 22px;
    border: none;
    background: none;
    padding: 0;
  }
  .back-btn:hover { color: ${G.slate800}; }

  .auth-title {
    font-size: 22px;
    font-weight: 900;
    color: ${G.slate800};
    letter-spacing: -.03em;
    line-height: 1.25;
    margin-bottom: 6px;
  }
  .auth-sub {
    font-size: 13px;
    color: ${G.slate600};
    line-height: 1.5;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 999px;
    background: ${G.green100};
    color: ${G.green800};
    margin-top: 10px;
    letter-spacing: .03em;
    text-transform: uppercase;
  }

  .pw-wrap { position: relative; }
  .pw-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: ${G.slate400};
    display: flex;
    align-items: center;
    padding: 4px;
  }
  .pw-toggle:hover { color: ${G.slate600}; }

  .strength-bar {
    height: 3px;
    border-radius: 2px;
    background: ${G.slate200};
    margin-top: 8px;
    overflow: hidden;
  }
  .strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: width .3s, background .3s;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: ${G.slate400};
    font-size: 12px;
    margin: 4px 0;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${G.slate200};
  }

  /* --- section header inside forms --- */
  .section-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: ${G.slate400};
    padding: 4px 0 2px;
  }

  /* --- OTP screen --- */
  .otp-desc {
    font-size: 14px;
    color: ${G.slate600};
    line-height: 1.55;
    margin-bottom: 32px;
  }
  .otp-email { font-weight: 700; color: ${G.slate800}; }

  .otp-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 8px;
  }
  .otp-cell {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    border: 1.5px solid ${G.slate200};
    font-size: 22px;
    font-weight: 800;
    text-align: center;
    color: ${G.slate800};
    background: ${G.white};
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    text-transform: uppercase;
    letter-spacing: .05em;
    caret-color: ${G.green600};
    font-family: inherit;
  }
  .otp-cell:focus { border-color: ${G.green600}; box-shadow: 0 0 0 3px ${G.green100}; }
  .otp-cell.filled { border-color: ${G.green700}; background: ${G.green50}; }
  .otp-cell.error  { border-color: ${G.err}; animation: shake .35s ease; }

  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25%      { transform: translateX(-6px); }
    75%      { transform: translateX(6px); }
  }

  .resend-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 13px;
    color: ${G.slate600};
    margin-top: 20px;
  }
  .resend-btn {
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 700;
    color: ${G.green700};
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }
  .resend-btn:disabled { color: ${G.slate400}; cursor: default; }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* --- success flash --- */
  .success-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 28px;
    text-align: center;
    animation: fadeUp .35s ease forwards;
  }
  .success-ring {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${G.green100};
    border: 2px solid ${G.green500};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    animation: popIn .5s cubic-bezier(.34,1.56,.64,1) forwards;
  }
  @keyframes popIn {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .success-title {
    font-size: 22px;
    font-weight: 900;
    color: ${G.slate800};
    letter-spacing: -.03em;
    margin-bottom: 12px;
  }
  .success-sub { font-size: 14px; color: ${G.slate600}; line-height: 1.6; max-width: 280px; }

  /* --- upload field --- */
  .upload-field {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px dashed ${G.slate200};
    font-size: 13px;
    font-family: inherit;
    color: ${G.slate400};
    background: ${G.slate100};
    cursor: pointer;
    text-align: center;
    transition: border-color .15s, background .15s;
  }
  .upload-field:hover { border-color: ${G.green500}; background: ${G.green50}; color: ${G.green700}; }
  .upload-field.has-file { border-color: ${G.green600}; background: ${G.green50}; color: ${G.green800}; border-style: solid; }
`;

// ─── SVG Icons ───────────────────────────────────────────────
const Icons = {
  arrowLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  check: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={G.green700} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  mail: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G.green700} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  building: (color = G.green800) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  tree: (color = G.teal700) => (
    <svg width="22" height="22" viewBox="0 0 64 64" fill={color}>
      <polygon points="32,8 52,38 12,38" />
      <polygon points="32,22 56,52 8,52" />
      <rect x="28" y="52" width="8" height="8" />
    </svg>
  ),
  logo: () => (
    <img
      src="/logo_depan.svg"
      alt="Logo"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain"
      }}
    />
  ),
};

// ─── password strength ───────────────────────────────────────
function pwStrength(pw, t) {
  if (!pw) return { score: 0, label: "", color: G.slate200 };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { score: 0, label: "",             color: G.slate200 },
    { score: 1, label: t.strength.weak,   color: G.err      },
    { score: 2, label: t.strength.fair,   color: "#f97316"  },
    { score: 3, label: t.strength.good,   color: "#eab308"  },
    { score: 4, label: t.strength.strong, color: G.green600 },
  ];
  return map[s];
}

// ─── Language Switcher ───────────────────────────────────────
function LangSwitcher({ lang, setLang }) {
  return (
    <div className="lang-switcher" style={{ marginTop: 2 }}>
      {Object.keys(LANGS).map(langCode => (
        <button
          key={k}
          className={`lang-btn ${lang === k ? "active" : ""}`}
          onClick={() => setLang(k)}
        >
          {LANGS[k].flag} {LANGS[k].label}
        </button>
      ))}
    </div>
  );
}

// ─── Progress Dots (6 steps) ─────────────────────────────────
// steps: welcome(0) role(1) register(2) verify(3) operational(4) calcmethod(5)
const STEP_INDEX = { welcome: 0, role: 1, register: 2, verify: 3, operational: 4, calcmethod: 5, success: 5 };

function ProgressDots({ step }) {
  const active = STEP_INDEX[step] ?? 0;
  return (
    <div className="progress-dots">
      {[0,1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`dot ${i === active ? "active" : i < active ? "done" : ""}`}
        />
      ))}
    </div>
  );
}

// ─── SCREEN 1: Welcome ───────────────────────────────────────
function WelcomePage({ onContinue, lang, setLang }) {
  const t = LANGS[lang].welcome;
  return (
    <div className="shell">
      <div style={{ padding: "20px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="welcome" />
      </div>

      <div className="welcome-top">
        <div className="globe-ring">
          {Icons.logo()}
        </div>
        <h1 className="welcome-headline">{t.headline}</h1>
        <p className="welcome-sub">{t.sub}</p>
        <div className="pill-row">
          <span className="pill pill-green">MRV Certified</span>
          <span className="pill pill-teal">ISO 14064</span>
          <span className="pill pill-slate">Blockchain Verified</span>
          <span className="pill pill-green">AI Monitored</span>
        </div>
      </div>

      {/* decorative wave */}
      <div style={{ position: "relative", height: 72, overflow: "hidden", flexShrink: 0 }}>
        <svg viewBox="0 0 430 72" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}>
          <path d="M0,48 C80,72 180,8 280,48 C360,80 400,24 430,36 L430,72 L0,72 Z" fill={G.green50} />
          <path d="M0,56 C100,36 200,72 300,52 C370,40 410,60 430,56 L430,72 L0,72 Z" fill={G.green100} opacity=".6"/>
        </svg>
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: 40, background: G.green100 }} />
      </div>

      <div className="welcome-bottom" style={{ background: G.green50, paddingTop: 28 }}>
        <button className="btn-primary" onClick={onContinue}
          style={{ background: `linear-gradient(135deg, ${G.green800}, ${G.teal700})` }}>
          {t.continue}
        </button>
        <LangSwitcher lang={lang} setLang={setLang} />
        <p className="terms-note">
          {t.terms}{" "}
          <a href="#">{t.termsLink}</a> {t.and} <a href="#">{t.privacyLink}</a>
        </p>
      </div>
    </div>
  );
}

// ─── SCREEN 2: Role selection ────────────────────────────────
function RolePage({ onSelect, onGuest, onBack, lang }) {
  const [selected, setSelected] = useState(null);
  const t = LANGS[lang].role;

  const ROLES = [
    { id: "company",  title: t.company.title,  desc: t.company.desc,  icon: Icons.building, iconBg: "role-icon-green" },
    { id: "landlord", title: t.landlord.title, desc: t.landlord.desc, icon: Icons.tree,     iconBg: "role-icon-teal"  },
  ];

  const selectedRole = ROLES.find(role => role.id === selected);

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="role" />
      </div>

      <div className="role-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="role-title">{t.title}</h2>
        <p className="role-sub">{t.sub}</p>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {ROLES.map(role => (
            <div
              key={role.id}
              className={`role-card ${selected === role.id ? "active" : ""}`}
              onClick={() => setSelected(role.id)}
            >
              <div className={`role-icon ${role.iconBg}`}>
                {role.icon()}
              </div>
              <div style={{ flex: 1 }}>
                <p className="role-card-title">{role.title}</p>
                <p className="role-card-desc">{role.desc}</p>
              </div>
              <div className="role-radio">
                <div className="role-radio-dot" />
              </div>
            </div>
          ))}

          {/* Tambah setelah card Landlord */}
          <button 
            className="role-card" 
            onClick={() => onSelect("admin")}
            style={{ textAlign: "left", background: "white", border: "1px solid var(--border-color, #e2e8f0)", cursor: "pointer", width: "100%", padding: "16px", fontFamily: "inherit" }}
          >
            <div className="role-icon" style={{ background:"#fef3c7" }}>
              🛡️
            </div>
            <div style={{ flex: 1 }}>
              <p className="role-card-title">Admin</p>
              <p className="role-card-desc">
                {lang === "id" 
                  ? "Pantau seluruh platform — perusahaan, lahan, emisi & kredit karbon." 
                  : "Monitor the entire platform — companies, parcels, emissions & carbon credits."}
              </p>
            </div>
          </button>
        </div>

        <button
          className="btn-primary"
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          {t.continueAs} {selectedRole ? selectedRole.title : "..."}
        </button>

        <div style={{ marginTop: 8 }}>
          <div className="divider" style={{ margin: "16px 0" }}>or</div>
          <a href="#" className="guest-link" onClick={e => { e.preventDefault(); onGuest(); }}>
            {t.guest}
          </a>
          <p style={{ textAlign: "center", fontSize: 11, color: G?.slate400 || "#94a3b8", marginTop: 4 }}>
            {t.guestSub}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: generate institution ID from company name ───────
function generateInstitutionId(companyName) {
  if (!companyName || !companyName.trim()) return "";
  const stopWords = ["pt", "cv", "tbk", "persero", "the", "and", "&", "-"];
  const words = companyName.trim().split(/\s+/).filter(
    word => !stopWords.includes(w.toLowerCase().replace(/[^a-z]/g, ""))
  );
  const prefix = words
    .slice(0, 3)
    .map(wrd => wrd.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3))
    .join("");
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = ((hash << 5) - hash + companyName.charCodeAt(i)) | 0;
  }
  const suffix = String(Math.abs(hash) % 9000 + 1000);
  return `CT-${prefix.slice(0, 6)}-${suffix}`;
}

// ─── SCREEN 3: Register form (Login 1) ───────────────────────
// Extended with: username, institutionId (auto-generated), position, customPosition
function RegisterPage({ role, onSubmit, onBack, lang }) {
  const [form, setForm] = useState({
    name: "", email: "", username: "", password: "",
    institutionId: "", position: "", customPosition: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  const t = LANGS[lang].register;
  const strength = pwStrength(form.password, t);
  const isCompany = role === "company";

  // Auto-generate institution ID whenever company name changes
  function setField(name, value) {
    if (name === "name" && role === "company") {
      const newId = generateInstitutionId(value);
      setForm(prev => ({ ...prev, [name]: value, institutionId: newId }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function copyId() {
    if (!form.institutionId) return;
    navigator.clipboard.writeText(form.institutionId).catch(() => {});
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  }

  function validate() {
    const e = {};
    if (!form.name.trim())                    e.name = t.errors.nameReq;
    if (!/\S+@\S+\.\S+/.test(form.email))     e.email = t.errors.emailInvalid;
    if (!form.username.trim())                e.username = t.errors.usernameReq;
    if (form.password.length < 8)             e.password = t.errors.pwShort;
    if (isCompany && !form.position)          e.position = t.errors.positionReq;
    if (isCompany && form.position === t.positions[5] && !form.customPosition.trim())
                                               e.customPosition = t.errors.customPositionReq;
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setLoading(false);
    onSubmit(form);
  }

  const rt = (LANGS[lang].register[role] || LANGS[lang].register.company);

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="register" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{rt.title}</h2>
        <p className="auth-sub">{rt.sub}</p>
        <div className="role-badge">
          {role === "company" ? Icons.building(G.green800) : Icons.tree(G.teal700)}
          {isCompany ? LANGS[lang].role.company.title : LANGS[lang].role.landlord.title}
        </div>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>

          {/* — Account Info section — */}
          <p className="section-label">Account Info</p>

          {/* Name / Company name */}
          <div className="field-group">
            <label className="label">{isCompany ? t.companyLabel : t.nameLabel}</label>
            <input
              className={`input-field ${errors.name ? "error" : ""}`}
              type="text"
              placeholder={isCompany ? t.companyPlaceholder : t.namePlaceholder}
              value={form.name}
              onChange={e => setField("name", e.target.value)}
            />
            {errors.name && <p className="err-msg">{errors.name}</p>}
          </div>

          {/* Full name (company only - contact person) */}
          {isCompany && (
            <div className="field-group">
              <label className="label">{t.nameLabel}</label>
              <input
                className="input-field"
                type="text"
                placeholder={t.namePlaceholder}
                value={form.contactName || ""}
                onChange={e => setField("contactName", e.target.value)}
              />
            </div>
          )}

          {/* Email */}
          <div className="field-group">
            <label className="label">
              {isCompany ? t.emailLabelCompany : t.emailLabelLandlord}
            </label>
            <input
              className={`input-field ${errors.email ? "error" : ""}`}
              type="email"
              placeholder={isCompany ? t.emailPlaceholderCompany : t.emailPlaceholderLandlord}
              value={form.email}
              onChange={e => setField("email", e.target.value)}
            />
            {errors.email && <p className="err-msg">{errors.email}</p>}
          </div>

          {/* Username */}
          <div className="field-group">
            <label className="label">{t.usernameLabel}</label>
            <input
              className={`input-field ${errors.username ? "error" : ""}`}
              type="text"
              placeholder={t.usernamePlaceholder}
              value={form.username}
              onChange={e => setField("username", e.target.value)}
            />
            {errors.username && <p className="err-msg">{errors.username}</p>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="label">{t.passwordLabel}</label>
            <div className="pw-wrap">
              <input
                className={`input-field ${errors.password ? "error" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={form.password}
                style={{ paddingRight: 44 }}
                onChange={e => setField("password", e.target.value)}
              />
              <button className="pw-toggle" type="button" onClick={() => setShowPw(prev => !prev)}>
                {showPw ? Icons.eyeOff : Icons.eye}
              </button>
            </div>
            {form.password && (
              <div>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${strength.score * 25}%`, background: strength.color }} />
                </div>
                <p style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 600 }}>
                  {strength.label}
                </p>
              </div>
            )}
            {errors.password && <p className="err-msg">{errors.password}</p>}
          </div>

          {/* — Institution section (company only) — */}
          {isCompany && (
            <>
              <p className="section-label" style={{ marginTop: 4 }}>Institution</p>

              {/* Institution ID — auto-generated, read-only */}
              <div className="field-group">
                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t.institutionIdLabel}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 999, background: G.green100, color: G.green800,
                    letterSpacing: ".04em", textTransform: "uppercase",
                  }}>Auto</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input-field"
                    type="text"
                    readOnly
                    value={form.institutionId || (lang === "id" ? "Otomatis dari nama PT..." : "Generated from company name...")}
                    style={{
                      background: form.institutionId ? G.green50 : G.slate100,
                      borderColor: form.institutionId ? G.green500 : G.slate200,
                      color: form.institutionId ? G.green800 : G.slate400,
                      fontWeight: form.institutionId ? 700 : 400,
                      fontFamily: form.institutionId ? "monospace" : "inherit",
                      letterSpacing: form.institutionId ? ".06em" : "normal",
                      paddingRight: 80,
                      cursor: "default",
                    }}
                  />
                  {form.institutionId && (
                    <button
                      type="button"
                      onClick={copyId}
                      style={{
                        position: "absolute", right: 10, top: "50%",
                        transform: "translateY(-50%)",
                        background: idCopied ? G.green600 : G.green100,
                        border: "none", borderRadius: 8,
                        padding: "4px 10px", fontSize: 11, fontWeight: 700,
                        color: idCopied ? G.white : G.green800,
                        cursor: "pointer", transition: "all .15s",
                        fontFamily: "inherit",
                      }}
                    >
                      {idCopied ? "✓ Copied" : "Copy"}
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: G.slate400, marginTop: 4 }}>
                  {lang === "id"
                    ? "ID ini otomatis dibuat dari nama perusahaan Anda."
                    : "This ID is automatically generated from your company name."}
                </p>
              </div>

              {/* Position dropdown */}
              <div className="field-group">
                <label className="label">{t.positionLabel}</label>
                <select
                  className={`select-field ${!form.position ? "placeholder" : ""} ${errors.position ? "error" : ""}`}
                  value={form.position}
                  onChange={e => setField("position", e.target.value)}
                >
                  <option value="">{t.positionPlaceholder}</option>
                  {t.positions.map((pos, i) => (
                    <option key={i} value={pos}>{pos}</option>
                  ))}
                </select>
                {errors.position && <p className="err-msg">{errors.position}</p>}
              </div>

              {/* Custom position — shown when "Other" selected */}
              {form.position === t.positions[5] && (
                <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
                  <label className="label" style={{ color: G.green700 }}>Your Position</label>
                  <input
                    className={`input-field ${errors.customPosition ? "error" : ""}`}
                    style={{ borderColor: errors.customPosition ? G.err : G.green500, boxShadow: `0 0 0 3px ${G.green100}` }}
                    type="text"
                    placeholder={t.customPositionPlaceholder}
                    value={form.customPosition}
                    onChange={e => setField("customPosition", e.target.value)}
                    autoFocus
                  />
                  {errors.customPosition && <p className="err-msg">{errors.customPosition}</p>}
                </div>
              )}
            </>
          )}
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="spinner" /> : t.createBtn}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: G.slate400, marginTop: 16 }}>
          {t.otpNote}
        </p>
      </div>
    </div>
  );
}

// ─── SCREEN 4: OTP Verify ────────────────────────────────────
const OTP_LEN = 4;

function VerifyOTPPage({ email, onVerified, onBack, lang }) {
  const [cells, setCells] = useState(Array(OTP_LEN).fill(""));
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [resendCd, setResendCd] = useState(30);
  const [resent, setResent] = useState(false);
  const inputsRef = useRef([]);

  const t = LANGS[lang].verify;

  useEffect(() => {
    if (resendCd <= 0) return;
    const id = setTimeout(() => setResendCd(prev => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCd]);

  function handleCellChange(idx, val) {
    const ch = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1);
    const next = [...cells];
    next[idx] = ch;
    setCells(next);
    setErrMsg("");
    if (ch && idx < OTP_LEN - 1) inputsRef.current[idx + 1]?.focus();
    if (ch && next.every(cell => cell !== "")) submitOTP(next.join(""));
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !cells[idx] && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft"  && idx > 0)               inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LEN - 1)     inputsRef.current[idx + 1]?.focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, OTP_LEN);
    const next = [...cells];
    [...text].forEach((ch, i) => { if (i < OTP_LEN) next[i] = ch; });
    setCells(next);
    inputsRef.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
    if (text.length === OTP_LEN) submitOTP(text);
  }

  async function submitOTP(code) {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (code.length === OTP_LEN) {
      setLoading(false);
      onVerified();
    } else {
      setShake(true);
      setErrMsg(t.invalidCode);
      setCells(Array(OTP_LEN).fill(""));
      setTimeout(() => { setShake(false); inputsRef.current[0]?.focus(); }, 400);
      setLoading(false);
    }
  }

  async function resend() {
    if (resendCd > 0) return;
    setResent(true);
    setResendCd(60);
    setTimeout(() => setResent(false), 3000);
  }

  const filled = cells.filter(cell => cell !== "").length;

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="verify" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{t.title}</h2>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: G.green100, border: `1.5px solid ${G.green500}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Icons.mail}
          </div>
        </div>

        <p className="otp-desc">
          {t.desc}{" "}
          <span className="otp-email">{email}</span>{t.desc2}
        </p>

        <div className="otp-row" onPaste={handlePaste}>
          {cells.map((val, idx) => (
            <input
              key={idx}
              ref={el => inputsRef.current[idx] = el}
              className={`otp-cell ${val ? "filled" : ""} ${shake ? "error" : ""}`}
              maxLength={1}
              value={val}
              autoFocus={idx === 0}
              onChange={e => handleCellChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              inputMode="text"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {errMsg && <p className="err-msg" style={{ textAlign: "center", marginTop: 10 }}>{errMsg}</p>}

        <div style={{ marginTop: 28 }}>
          {loading ? (
            <button className="btn-primary" disabled><span className="spinner" /></button>
          ) : (
            <button className="btn-primary" disabled={filled < OTP_LEN} onClick={() => submitOTP(cells.join(""))}>
              {t.btn}
            </button>
          )}
        </div>

        <div className="resend-row">
          <span>{t.didntReceive}</span>
          <button className="resend-btn" onClick={resend} disabled={resendCd > 0}>
            {resendCd > 0 ? `${t.resendIn} ${resendCd}s` : t.resend}
          </button>
        </div>
        {resent && <p style={{ textAlign: "center", fontSize: 12, color: G.green600, marginTop: 8, fontWeight: 600 }}>{t.codeResent}</p>}
        <p style={{ textAlign: "center", fontSize: 11, color: G.slate400, marginTop: 20, lineHeight: 1.5 }}>
          {t.spamNote}
        </p>
      </div>
    </div>
  );
}

// ─── SCREEN 5: Operational Details (Login 2) ─────────────────
// emissionObject, companyType, officeAddress, siteAddress
function OperationalPage({ onSubmit, onBack, lang }) {
  const [form, setForm] = useState({
    emissionObject: "", companyType: "", officeAddress: "", siteAddress: "",
  });
  const [loading, setLoading] = useState(false);

  const t = LANGS[lang].operational;

  function setField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const needsSite = form.emissionObject === t.emissionObjects[1] || form.emissionObject === t.emissionObjects[2];
  const needsOffice = form.emissionObject === t.emissionObjects[0] || form.emissionObject === t.emissionObjects[2];

  async function handleNext() {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    onSubmit(form);
  }

  const isValid = form.emissionObject && form.companyType &&
    (!needsOffice || form.officeAddress) &&
    (!needsSite   || form.siteAddress);

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="operational" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{t.title}</h2>
        <p className="auth-sub">{t.sub}</p>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

          {/* Emission Object */}
          <div className="field-group">
            <label className="label">{t.emissionObjectLabel}</label>
            <select
              className={`select-field ${!form.emissionObject ? "placeholder" : ""}`}
              value={form.emissionObject}
              onChange={e => setField("emissionObject", e.target.value)}
            >
              <option value="">{t.emissionObjectPlaceholder}</option>
              {t.emissionObjects.map((o, i) => <option key={i} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Company Type */}
          <div className="field-group">
            <label className="label">{t.companyTypeLabel}</label>
            <select
              className={`select-field ${!form.companyType ? "placeholder" : ""}`}
              value={form.companyType}
              onChange={e => setField("companyType", e.target.value)}
            >
              <option value="">{t.companyTypePlaceholder}</option>
              {t.companyTypes.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Office Address — shown when Office or both */}
          {(!form.emissionObject || needsOffice) && (
            <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
              <label className="label">{t.officeAddressLabel}</label>
              <select
                className={`select-field ${!form.officeAddress ? "placeholder" : ""}`}
                value={form.officeAddress}
                onChange={e => setField("officeAddress", e.target.value)}
                disabled={!needsOffice}
                style={{ opacity: !form.emissionObject ? .5 : 1 }}
              >
                <option value="">{t.officeAddressPlaceholder}</option>
                {t.addressOptions.map((a, i) => <option key={i} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          {/* Site Address — shown when Site or both */}
          {(!form.emissionObject || needsSite) && (
            <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
              <label className="label">{t.siteAddressLabel}</label>
              <select
                className={`select-field ${!form.siteAddress ? "placeholder" : ""}`}
                value={form.siteAddress}
                onChange={e => setField("siteAddress", e.target.value)}
                disabled={!needsSite}
                style={{ opacity: !form.emissionObject ? .5 : 1 }}
              >
                <option value="">{t.siteAddressPlaceholder}</option>
                {t.addressOptions.map((a, i) => <option key={i} value={a}>{a}</option>)}
              </select>
            </div>
          )}

        </div>

        <button className="btn-primary" onClick={handleNext} disabled={!isValid || loading}>
          {loading ? <span className="spinner" /> : t.nextBtn}
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN 6: Calculation Method (Login 3) ──────────────────
// calcMethod, equityDetails, ghgInventory, carbonRemoval
function CalcMethodPage({ onSubmit, onBack, lang }) {
  const [form, setForm] = useState({
    calcMethod: "", equityShare: "", ghgInventory: null, carbonRemoval: null,
  });
  const [loading, setLoading] = useState(false);
  const ghgRef = useRef();
  const crRef  = useRef();

  const t = LANGS[lang].calcMethod;

  function setField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleFinish() {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    onSubmit(form);
  }

  return (
    <div className="shell">
      <div style={{ padding: "16px 28px 0", display: "flex", justifyContent: "center" }}>
        <ProgressDots step="calcmethod" />
      </div>

      <div className="auth-header">
        <button className="back-btn" onClick={onBack}>{Icons.arrowLeft} {t.back}</button>
        <h2 className="auth-title">{t.title}</h2>
        <p className="auth-sub">{t.sub}</p>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

          {/* Calculation Method */}
          <div className="field-group">
            <label className="label">{t.calcMethodLabel}</label>
            <select
              className={`select-field ${!form.calcMethod ? "placeholder" : ""}`}
              value={form.calcMethod}
              onChange={e => setField("calcMethod", e.target.value)}
            >
              <option value="">{t.calcMethodPlaceholder}</option>
              {t.calcMethods.map((m, i) => <option key={i} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Equity Share (shown for GHG Protocol) */}
          {form.calcMethod === t.calcMethods[0] && (
            <div className="field-group" style={{ animation: "fadeUp .25s ease forwards" }}>
              <label className="label">{t.equityShareLabel}</label>
              <input
                className="input-field"
                type="number"
                min="0"
                max="100"
                placeholder={t.equitySharePlaceholder}
                value={form.equityShare}
                onChange={e => setField("equityShare", e.target.value)}
              />
            </div>
          )}

          {/* GHG Inventory upload */}
          <div className="field-group">
            <label className="label">{t.ghgInventoryLabel}</label>
            <input
              type="file"
              accept=".xlsx,.csv,.xls,.pdf"
              ref={ghgRef}
              style={{ display: "none" }}
              onChange={e => setField("ghgInventory", e.target.files[0]?.name || null)}
            />
            <div
              className={`upload-field ${form.ghgInventory ? "has-file" : ""}`}
              onClick={() => ghgRef.current?.click()}
            >
              {form.ghgInventory
                ? `📄 ${form.ghgInventory}`
                : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{Icons.upload} {t.ghgInventoryPlaceholder}</span>
              }
            </div>
          </div>

          {/* Carbon Removal upload */}
          <div className="field-group">
            <label className="label">{t.carbonRemovalLabel}</label>
            <input
              type="file"
              accept=".xlsx,.csv,.xls,.pdf"
              ref={crRef}
              style={{ display: "none" }}
              onChange={e => setField("carbonRemoval", e.target.files[0]?.name || null)}
            />
            <div
              className={`upload-field ${form.carbonRemoval ? "has-file" : ""}`}
              onClick={() => crRef.current?.click()}
            >
              {form.carbonRemoval
                ? `📄 ${form.carbonRemoval}`
                : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{Icons.upload} {t.carbonRemovalPlaceholder}</span>
              }
            </div>
          </div>

        </div>

        <button className="btn-primary" onClick={handleFinish} disabled={loading}>
          {loading ? <span className="spinner" /> : t.finishBtn}
        </button>
      </div>
    </div>
  );
}

// ─── Success flash ───────────────────────────────────────────
function SuccessPage({ role, name, lang }) {
  const t = LANGS[lang].success;
  const m = t[role] || t.company;
  return (
    <div className="shell">
      <div className="success-screen">
        <div className="success-ring">{Icons.check}</div>
        <h2 className="success-title">{m.title}</h2>
        <p style={{ fontSize: 16, color: G.green700, fontWeight: 700, marginBottom: 8 }}>
          {t.welcome} {name}
        </p>
        <p className="success-sub">{m.sub}</p>
        <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
          <span className="pill pill-green">{t.verified}</span>
          <span className="pill pill-teal">{t.blockchainReady}</span>
        </div>
      </div>
      <div style={{ padding: "0 28px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.green500, animation: "spin 1s linear infinite", borderTop: `2px solid ${G.green100}` }} />
          <span style={{ fontSize: 13, color: G.slate600 }}>{t.loading}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main AuthFlow component ─────────────────────────────────
// Full flow: welcome → role → register → verify → operational → calcmethod → success → dashboard
export default function AuthFlow({ onComplete, initialLang = "id" }) {
  const [step, setStep] = useState("welcome");
  const [role, setRole] = useState(null);
  const [lang, setLang] = useState(initialLang);

  // Collected form data across all steps
  const [userData,        setUserData]        = useState(null);
  const [operationalData, setOperationalData] = useState(null);
  const [calcData,        setCalcData]        = useState(null);

  function handleRoleSelect(r) {
    setRole(r);
    if (r === "admin") {
      setStep("adminLogin");
    } else {
      setStep("register");
    }
  } 
  {step === "adminLogin" && (
    <div className="screen fade-up" style={{ padding:"40px 28px" }}>
      <button className="back-btn" onClick={() => setStep("role")}>← Back</button>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🛡️</div>
        <h2 style={{ fontFamily:"inherit", fontSize:22, fontWeight:900, color:G.slate800 }}>Admin Login</h2>
        <p style={{ fontSize:13, color:G.slate400, marginTop:6 }}>CarbonTrust Platform Admin</p>
      </div>
  
      <div className="field-group">
        <label className="label">Username</label>
        <input className="input-field" type="text" placeholder="admin"
          value={adminForm.username}
          onChange={e => setAdminForm(prev => ({ ...prev, username: e.target.value }))} />
      </div>
  
      <div className="field-group" style={{ marginTop:12 }}>
        <label className="label">Password</label>
        <input className="input-field" type="password" placeholder="••••••••"
          value={adminForm.password}
          onChange={e => setAdminForm(prev => ({ ...prev, password: e.target.value }))} />
      </div>
  
      {adminError && (
        <p style={{ color:G.err, fontSize:12, marginTop:8 }}>{adminError}</p>
      )}
  
      <button className="btn-primary" style={{ marginTop:24, width:"100%" }}
        onClick={handleAdminLogin}>
        Masuk sebagai Admin →
      </button>
    </div>
  )}

  function handleGuest() {
    if (onComplete) onComplete("guest", null, lang);
  }

  function handleRegister(formData) {
    setUserData(formData);
    setStep("verify");
  }

  const handleFinalSubmit = async (finalCalcData) => {
    // 1. Gabungkan semua data dari langkah 1 sampai akhir
    const completeData = {
      ...userData,
      ...operationalData,
      ...finalCalcData,
      role: role // Kirimkan juga role-nya (company / landlord)
    };

    setCalcData(finalCalcData); // Simpan ke state

    try {
      // 2. Tembak API Backend
      const response = await fetch("https://carbon-trust-be.onrender.com/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeData)
      });

      const result = await response.json();

      if (result.success) {
        setStep("success"); // Lanjut ke halaman centang hijau

        // 3. Setelah animasi success selesai, lempar data asli backend ke App.jsx
        setTimeout(() => {
          if (onComplete) onComplete(
            data.user.role,  // ← pakai dari response BE
            data.user,
            lang,
            data.token
          );
        }, 2000);
      } else {
        alert("Gagal registrasi di server.");
      }
    } catch (error) {
      alert("Gagal terhubung ke backend. Pastikan server nyala.");
      console.error(error);
    }
  };

  function handleVerified() {
    // After email verify: company → operational details; landlord → skip to success
    if (role === "company") {
      setStep("operational");
    } else {
      setStep("success");
      setTimeout(() => {
        if (onComplete) onComplete(role, { userData }, lang);
      }, 2200);
    }
  }

  const [adminForm, setAdminForm] = useState({ username:"", password:"" });
  const [adminError, setAdminError] = useState("");

  async function handleAdminLogin() {
    setAdminError("");
    try {
      const res = await fetch("https://carbon-trust-be.onrender.com/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
        });
      const data = await res.json();
      if (data.success) {
        if (onComplete) onComplete("admin", data.user, lang, data.token);
      } else {
        setAdminError(data.error || "Login gagal");
      }
    } catch {
      setAdminError("Tidak bisa terhubung ke server");
    }
}

  function handleOperational(data) {
    setOperationalData(data);
    setStep("calcmethod");
  }

  function handleCalcMethod(data) {
    setCalcData(data);
    setStep("success");
    setTimeout(() => {
      if (onComplete) onComplete(role, { userData, operationalData, calcData: data }, lang);
    }, 2200);
  }

  return (
    <>
      <style>{css}</style>

      {step === "welcome" && (
        <WelcomePage onContinue={() => setStep("role")} lang={lang} setLang={setLang} />
      )}
      {step === "role" && (
        <RolePage
          onSelect={handleRoleSelect}
          onGuest={handleGuest}
          onBack={() => setStep("welcome")}
          lang={lang}
        />
      )}
      {step === "register" && (
        <RegisterPage
          role={role}
          onSubmit={handleRegister}
          onBack={() => setStep("role")}
          lang={lang}
        />
      )}
      {step === "verify" && (
        <VerifyOTPPage
          email={userData?.email}
          onVerified={handleVerified}
          onBack={() => setStep("register")}
          lang={lang}
        />
      )}
      {step === "operational" && (
        <OperationalPage
          onSubmit={handleOperational}
          onBack={() => setStep("verify")}
          lang={lang}
        />
      )}
      {step === "calcmethod" && (
        <CalcMethodPage
          onSubmit={handleFinalSubmit}
          onBack={() => setStep("operational")}
          lang={lang}
        />
      )}
      {step === "success" && (
        <SuccessPage role={role} name={userData?.name} lang={lang} />
      )}
    </>
  );
}