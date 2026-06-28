/**
 * PrivacyPage.jsx
 * Route: /privacy (daftarkan di main.jsx atau router)
 *
 * Mencakup:
 *  - Data yang dikumpulkan
 *  - Tujuan penggunaan
 *  - Data publik vs privat (karena ada PublicView tanpa login)
 *  - Hak pengguna & kontak DPO
 */

const LAST_UPDATED = "1 Juni 2025";
const COMPANY_LEGAL = "PT CarbonTrust Teknologi Indonesia";
const DPO_EMAIL     = "privacy@carbontrust.id";
const DPO_ADDRESS   = "Jl. Sudirman Kav. 52–53, Jakarta Selatan 12190, Indonesia";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .pp-shell {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: #f8fafc;
    min-height: 100dvh;
    color: #1e293b;
  }
  .pp-inner {
    max-width: 720px;
    margin: 0 auto;
    background: #fff;
    min-height: 100dvh;
    box-shadow: 0 0 40px rgba(0,0,0,.07);
  }
  .pp-hero {
    background: linear-gradient(135deg, #14532d 0%, #0f766e 100%);
    padding: 40px 32px 32px;
  }
  .pp-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: #bbf7d0;
    background: rgba(255,255,255,.15);
    padding: 4px 12px;
    border-radius: 999px;
    margin-bottom: 14px;
  }
  .pp-hero-title {
    font-size: 26px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -.02em;
    margin-bottom: 8px;
  }
  .pp-hero-sub {
    font-size: 13px;
    color: rgba(255,255,255,.75);
    line-height: 1.6;
  }
  .pp-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    padding: 14px 32px;
    background: #f0fdf4;
    border-bottom: 1px solid #dcfce7;
    font-size: 12px;
    color: #166534;
    font-weight: 600;
  }
  .pp-toc {
    padding: 20px 32px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .pp-toc-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .pp-toc-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .pp-toc-item a {
    font-size: 12px;
    font-weight: 600;
    color: #166534;
    text-decoration: none;
    background: #dcfce7;
    padding: 4px 10px;
    border-radius: 999px;
    display: inline-block;
    transition: background .15s;
  }
  .pp-toc-item a:hover { background: #bbf7d0; }
  .pp-body { padding: 32px; display: flex; flex-direction: column; gap: 36px; }
  .pp-section { scroll-margin-top: 80px; }
  .pp-section-num {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    color: #166534;
    background: #dcfce7;
    padding: 2px 8px;
    border-radius: 999px;
    margin-bottom: 8px;
    letter-spacing: .04em;
  }
  .pp-section-title {
    font-size: 18px;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 12px;
    letter-spacing: -.01em;
  }
  .pp-p {
    font-size: 14px;
    color: #374151;
    line-height: 1.75;
    margin-bottom: 10px;
  }
  .pp-p:last-child { margin-bottom: 0; }
  .pp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-top: 10px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  .pp-table th {
    background: #f0fdf4;
    color: #166534;
    font-weight: 700;
    padding: 10px 14px;
    text-align: left;
    border-bottom: 1px solid #dcfce7;
  }
  .pp-table td {
    padding: 10px 14px;
    color: #374151;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
    line-height: 1.6;
  }
  .pp-table tr:last-child td { border-bottom: none; }
  .pp-table tr:hover td { background: #f8fafc; }
  .pp-callout {
    border-radius: 12px;
    padding: 14px 16px;
    margin: 10px 0;
    font-size: 13px;
    line-height: 1.6;
  }
  .pp-callout-green  { background: #f0fdf4; border-left: 4px solid #16a34a; color: #166534; }
  .pp-callout-amber  { background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e; }
  .pp-callout-blue   { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }
  .pp-callout-red    { background: #fff1f2; border-left: 4px solid #ef4444; color: #9f1239; }
  .pp-callout strong { font-weight: 700; }
  .pp-list { margin: 8px 0 8px 20px; display: flex; flex-direction: column; gap: 4px; }
  .pp-list li { font-size: 14px; color: #374151; line-height: 1.6; }
  .pp-divider { height: 1px; background: #f1f5f9; }
  .pp-footer {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 24px 32px;
    font-size: 12px;
    color: #64748b;
    line-height: 1.7;
  }
  .pp-footer a { color: #166534; font-weight: 700; text-decoration: none; }
  .pp-footer a:hover { text-decoration: underline; }
  @media (max-width: 600px) {
    .pp-hero { padding: 28px 20px 24px; }
    .pp-hero-title { font-size: 20px; }
    .pp-meta { padding: 12px 20px; }
    .pp-toc { padding: 16px 20px; }
    .pp-body { padding: 24px 20px; gap: 28px; }
    .pp-footer { padding: 20px; }
  }
`;

const sections = [
  {
    id: "s1",
    num: "01",
    title: "Pendahuluan & Identitas Pengendali Data",
    content: (
      <>
        <p className="pp-p">
          Dokumen Kebijakan Privasi ini menjelaskan bagaimana <strong>{COMPANY_LEGAL}</strong>{" "}
          ("CarbonTrust", "kami") mengumpulkan, menggunakan, menyimpan, dan melindungi data
          pribadi serta data perusahaan yang Anda berikan saat menggunakan platform manajemen
          kredit karbon kami.
        </p>
        <p className="pp-p">
          Platform ini memproses data sensitif termasuk data emisi perusahaan, koordinat dan
          dokumen kepemilikan lahan, serta transaksi kredit karbon. Kami berkomitmen untuk
          mengelola data tersebut sesuai dengan <strong>UU No. 27 Tahun 2022 tentang
          Perlindungan Data Pribadi (UU PDP)</strong> Republik Indonesia dan standar
          internasional yang relevan.
        </p>
        <div className="pp-callout pp-callout-blue">
          <strong>Data Protection Officer (DPO):</strong><br />
          {COMPANY_LEGAL}<br />
          {DPO_ADDRESS}<br />
          Email: <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>
        </div>
      </>
    ),
  },
  {
    id: "s2",
    num: "02",
    title: "Data yang Kami Kumpulkan",
    content: (
      <>
        <p className="pp-p">
          Kami mengumpulkan beberapa kategori data, tergantung peran akun Anda di platform:
        </p>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Contoh Data</th>
              <th>Peran yang Berlaku</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Data Akun & Identitas", "Nama perusahaan, nama PIC, email, nomor telepon, kata sandi (di-hash)", "Company, Landlord"],
              ["Data Perusahaan", "Nomor NPWP, akta perusahaan, entitas hukum (PT/CV/Tbk), lokasi kantor, status verifikasi ISO 14064", "Company"],
              ["Data Emisi & Serapan Karbon", "Total emisi (tCO₂e/bulan), data serapan per lahan, riwayat kalkulasi emisi, laporan MRV", "Company"],
              ["Data Kepemilikan & Koordinat Lahan", "Koordinat GPS lahan (lat/lng), luas lahan (ha), tipe ekosistem (gambut/hutan/mangrove), dokumen HGU/sertifikat, dokumen Joint Venture", "Company, Landlord"],
              ["Data Satelit & MRV", "Nilai NDVI, indeks vegetasi, analisis Sentinel-2, laporan verifikasi manual", "System (satelit & MRV)"],
              ["Data Transaksi Kredit Karbon", "Bid yang diajukan, volume kredit, harga per ton, status transaksi (pending/accepted/rejected)", "Company"],
              ["Data Sesi & Log Akses", "Alamat IP, user-agent, waktu login/logout, token sesi", "Semua pengguna terautentikasi"],
              ["Data Publik (tanpa login)", "Profil perusahaan yang dipublikasikan, total kredit tersedia, harga ask, rating project — data yang secara eksplisit dipilih perusahaan untuk dibuka ke publik", "Publik"],
            ].map(([cat, ex, role]) => (
              <tr key={cat}>
                <td style={{ fontWeight: 600 }}>{cat}</td>
                <td>{ex}</td>
                <td><span style={{ fontSize:11, background:"#f0fdf4", color:"#166534", padding:"2px 8px", borderRadius:999, fontWeight:700 }}>{role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "s3",
    num: "03",
    title: "Tujuan Penggunaan Data",
    content: (
      <>
        <p className="pp-p">Data yang dikumpulkan digunakan hanya untuk tujuan berikut:</p>
        <ul className="pp-list">
          <li><strong>Autentikasi & Keamanan Akun</strong> — Memverifikasi identitas pengguna dan mencegah akses tidak sah.</li>
          <li><strong>Verifikasi Kredit Karbon</strong> — Menghitung serapan/emisi karbon berdasarkan data lahan, analisis satelit, dan verifikasi manual sesuai metodologi ISO 14064:2018 dan IPCC 2006.</li>
          <li><strong>Pelacakan Target Net-Zero</strong> — Menyediakan laporan MRV (Measurement, Reporting, Verification) agar perusahaan dapat memantau progress net-zero mereka.</li>
          <li><strong>Marketplace Kredit Karbon</strong> — Memfasilitasi transaksi jual-beli kredit karbon antar perusahaan terdaftar.</li>
          <li><strong>Validasi Sertifikat AI</strong> — Memverifikasi dokumen ISO 14064 dan data manual terhadap ringkasan sertifikat menggunakan teknologi MRV.</li>
          <li><strong>Transparansi Publik (atas permintaan)</strong> — Menampilkan data emisi dan serapan yang dipilih perusahaan untuk dibuka ke publik melalui fitur Public View.</li>
          <li><strong>Pemenuhan Kewajiban Hukum</strong> — Mematuhi regulasi pelaporan emisi yang berlaku di Indonesia dan negara operasi lahan.</li>
          <li><strong>Peningkatan Layanan</strong> — Menganalisis pola penggunaan platform secara anonim untuk memperbaiki performa dan UX.</li>
        </ul>
        <div className="pp-callout pp-callout-amber" style={{ marginTop: 12 }}>
          <strong>Kami tidak menjual atau memonetisasi data Anda kepada pihak ketiga</strong>{" "}
          untuk tujuan periklanan atau komersial apapun.
        </div>
      </>
    ),
  },
  {
    id: "s4",
    num: "04",
    title: "Data Publik vs. Data Privat",
    content: (
      <>
        <p className="pp-p">
          Platform ini menyediakan fitur <strong>Public View</strong> — halaman yang dapat
          diakses tanpa login — yang menampilkan subset data perusahaan secara transparan
          untuk mendukung akuntabilitas iklim. Berikut pembagiannya:
        </p>

        <div className="pp-callout pp-callout-green">
          <strong>✅ Data yang DAPAT dilihat publik (tanpa login):</strong>
          <ul className="pp-list" style={{ marginTop: 6 }}>
            <li>Nama perusahaan dan negara operasi</li>
            <li>Tipe ekosistem lahan (hutan, gambut, mangrove) dan luas total</li>
            <li>Total kredit karbon tersedia (tCO₂e) dan harga ask</li>
            <li>Status verifikasi ISO 14064 (terverifikasi / pending)</li>
            <li>Status verifikasi AI sertifikat (jika tersedia)</li>
            <li>Rating project yang diberikan platform</li>
            <li>Total serapan dan emisi bulanan (angka agregat)</li>
          </ul>
        </div>

        <div className="pp-callout pp-callout-red" style={{ marginTop: 10 }}>
          <strong>🔒 Data yang SELALU PRIVAT (hanya untuk akun terautentikasi):</strong>
          <ul className="pp-list" style={{ marginTop: 6 }}>
            <li>Koordinat GPS spesifik per titik lahan</li>
            <li>Dokumen kepemilikan lahan (HGU, sertifikat saham, akta)</li>
            <li>Laporan MRV internal dan metodologi perhitungan detail</li>
            <li>Detail transaksi dan riwayat bid</li>
            <li>Data akun dan identitas PIC perusahaan</li>
            <li>Log verifikasi MRV internal</li>
          </ul>
        </div>

        <p className="pp-p" style={{ marginTop: 10 }}>
          Perusahaan dapat memilih untuk <strong>tidak</strong> menampilkan data apapun di
          Public View melalui pengaturan privasi di halaman Profil. Secara default,
          data agregat emisi dan serapan ditampilkan publik untuk mendukung transparansi
          komitmen iklim sesuai Paris Agreement Article 6.
        </p>
      </>
    ),
  },
  {
    id: "s5",
    num: "05",
    title: "Dasar Hukum Pemrosesan Data",
    content: (
      <>
        <p className="pp-p">
          Kami memproses data pribadi berdasarkan dasar hukum berikut sesuai UU PDP Pasal 20:
        </p>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Dasar Hukum</th>
              <th>Konteks Pemrosesan</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Pelaksanaan Perjanjian", "Pemrosesan data untuk menyediakan layanan platform yang Anda daftarkan (autentikasi, kalkulasi emisi, transaksi kredit karbon)"],
              ["Persetujuan (Consent)", "Menampilkan data perusahaan di Public View dan mengirimkan notifikasi non-esensial"],
              ["Kepentingan Sah (Legitimate Interest)", "Keamanan sistem, pencegahan penipuan, dan analisis agregat anonim untuk peningkatan layanan"],
              ["Kewajiban Hukum", "Pelaporan kepada regulator (KLHK, OJK) sesuai ketentuan yang berlaku di Indonesia"],
            ].map(([basis, ctx]) => (
              <tr key={basis}>
                <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{basis}</td>
                <td>{ctx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "s6",
    num: "06",
    title: "Penyimpanan & Retensi Data",
    content: (
      <>
        <p className="pp-p">
          Data disimpan di server yang berlokasi di wilayah Indonesia dan/atau Singapura
          dengan standar enkripsi <strong>AES-256 at rest</strong> dan{" "}
          <strong>TLS 1.3 in transit</strong>.
        </p>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Jenis Data</th>
              <th>Periode Retensi</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Data akun aktif", "Selama akun aktif + 30 hari setelah penghapusan akun"],
              ["Laporan MRV & kredit karbon", "10 tahun (kewajiban audit lingkungan)"],
              ["Data satelit & MRV", "2 tahun (rolling window)"],
              ["Log transaksi kredit karbon", "7 tahun (kewajiban perpajakan dan audit)"],
              ["Log sesi & akses", "90 hari"],
              ["Dokumen kepemilikan lahan", "Selama lahan terdaftar aktif + 5 tahun"],
            ].map(([type, ret]) => (
              <tr key={type}>
                <td style={{ fontWeight: 600 }}>{type}</td>
                <td>{ret}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "s7",
    num: "07",
    title: "Pengungkapan kepada Pihak Ketiga",
    content: (
      <>
        <p className="pp-p">
          Kami tidak menjual data Anda. Data hanya dibagikan kepada pihak ketiga dalam
          kondisi berikut:
        </p>
        <ul className="pp-list">
          <li><strong>Penyedia Infrastruktur Cloud</strong> — Vercel (hosting), Render (backend), MongoDB Atlas (database) — terikat perjanjian pemrosesan data (DPA) dengan standar ISO 27001.</li>
          <li><strong>Lembaga Verifikasi Karbon</strong> — Verra, Gold Standard — hanya data yang relevan untuk proses sertifikasi kredit karbon, atas persetujuan eksplisit perusahaan.</li>
          <li><strong>Regulator Pemerintah</strong> — KLHK (Kementerian Lingkungan Hidup dan Kehutanan), OJK — sesuai kewajiban pelaporan yang diatur undang-undang.</li>
          <li><strong>Perusahaan Pembeli/Penjual di Marketplace</strong> — Hanya nama perusahaan, volume, dan harga kredit yang relevan untuk proses transaksi. Detail identitas PIC tidak dibagikan.</li>
        </ul>
        <div className="pp-callout pp-callout-amber" style={{ marginTop: 10 }}>
          <strong>Transfer Data Internasional:</strong> Jika data ditransfer ke luar Indonesia
          (misal: server verifikasi internasional), kami memastikan penerima memiliki tingkat
          perlindungan data yang setara melalui Standard Contractual Clauses (SCC).
        </div>
      </>
    ),
  },
  {
    id: "s8",
    num: "08",
    title: "Hak-Hak Anda sebagai Subjek Data",
    content: (
      <>
        <p className="pp-p">
          Sesuai UU PDP Pasal 5–15, Anda memiliki hak-hak berikut atas data Anda:
        </p>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Hak</th>
              <th>Deskripsi</th>
              <th>Cara Mengajukan</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Hak Akses", "Mendapatkan salinan data pribadi yang kami simpan tentang Anda", "Email DPO"],
              ["Hak Koreksi", "Meminta perbaikan data yang tidak akurat atau tidak lengkap", "Halaman Profil / Email DPO"],
              ["Hak Penghapusan", "Meminta penghapusan data (kecuali data yang wajib diretain secara hukum)", "Email DPO"],
              ["Hak Portabilitas", "Mendapatkan data dalam format yang dapat dibaca mesin (JSON/CSV)", "Email DPO"],
              ["Hak Keberatan", "Menolak pemrosesan data tertentu (misal: penampilan di Public View)", "Pengaturan Privasi di Profil"],
              ["Hak Penarikan Consent", "Mencabut persetujuan kapan saja tanpa memengaruhi pemrosesan sebelumnya", "Pengaturan Privasi di Profil"],
            ].map(([right, desc, how]) => (
              <tr key={right}>
                <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{right}</td>
                <td>{desc}</td>
                <td style={{ fontSize: 12, color: "#64748b" }}>{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="pp-p" style={{ marginTop: 10 }}>
          Kami akan merespons permintaan Anda dalam <strong>14 hari kerja</strong>. Untuk
          permintaan yang kompleks, batas waktu dapat diperpanjang hingga 30 hari dengan
          pemberitahuan tertulis.
        </p>
      </>
    ),
  },
  {
    id: "s9",
    num: "09",
    title: "Keamanan Data",
    content: (
      <>
        <p className="pp-p">
          Kami menerapkan langkah-langkah teknis dan organisasi berikut untuk melindungi data:
        </p>
        <ul className="pp-list">
          <li>Enkripsi end-to-end untuk semua transmisi data (TLS 1.3)</li>
          <li>Enkripsi at-rest untuk database dan dokumen (AES-256)</li>
          <li>Autentikasi berbasis token JWT dengan masa berlaku sesi terbatas</li>
          <li>Role-based access control (Admin, Company, Landlord, Public)</li>
          <li>Audit log untuk semua akses ke data sensitif (koordinat lahan, dokumen)</li>
          <li>Penetration testing berkala oleh pihak ketiga independen</li>
          <li>Kebijakan zero-trust untuk akses internal tim CarbonTrust</li>
        </ul>
        <div className="pp-callout pp-callout-red" style={{ marginTop: 10 }}>
          <strong>Prosedur Notifikasi Pelanggaran Data:</strong> Jika terjadi pelanggaran
          data yang berpotensi merugikan Anda, kami akan memberitahu Anda dan Badan
          Perlindungan Data Pribadi (BPDP) dalam waktu <strong>72 jam</strong> sejak
          pelanggaran terdeteksi, sesuai UU PDP Pasal 46.
        </div>
      </>
    ),
  },
  {
    id: "s10",
    num: "10",
    title: "Cookie & Penyimpanan Lokal",
    content: (
      <>
        <p className="pp-p">
          Platform CarbonTrust menggunakan <strong>localStorage</strong> browser (bukan
          cookie pihak ketiga) untuk menyimpan:
        </p>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Tujuan</th>
              <th>Dapat Dihapus?</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["carbon_session", "Token sesi autentikasi dan preferensi bahasa", "Ya — logout otomatis menghapus"],
              ["carbon_q_status", "Status pengisian kuesioner profil emisi", "Ya — melalui pengaturan Profil"],
            ].map(([key, purpose, del]) => (
              <tr key={key}>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{key}</td>
                <td>{purpose}</td>
                <td>{del}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="pp-p" style={{ marginTop: 10 }}>
          Kami tidak menggunakan cookie pelacak (tracking cookies) atau pixel iklan dari
          pihak ketiga mana pun.
        </p>
      </>
    ),
  },
  {
    id: "s11",
    num: "11",
    title: "Perubahan Kebijakan Privasi",
    content: (
      <>
        <p className="pp-p">
          Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk
          mencerminkan perubahan regulasi atau fitur platform. Setiap pembaruan material
          akan dikomunikasikan melalui:
        </p>
        <ul className="pp-list">
          <li>Notifikasi in-app pada saat login berikutnya</li>
          <li>Email ke alamat yang terdaftar (minimal 14 hari sebelum berlaku)</li>
          <li>Tanggal "Terakhir diperbarui" pada bagian atas dokumen ini</li>
        </ul>
        <p className="pp-p">
          Penggunaan platform setelah tanggal efektif perubahan dianggap sebagai
          penerimaan atas kebijakan yang diperbarui.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="pp-shell">
      <style>{CSS}</style>
      <div className="pp-inner">

        {/* Hero */}
        <div className="pp-hero">
          <div className="pp-badge">Kebijakan Privasi</div>
          <h1 className="pp-hero-title">Perlindungan Data CarbonTrust</h1>
          <p className="pp-hero-sub">
            Kami berkomitmen untuk mengelola data emisi, lahan, dan transaksi kredit karbon
            Anda secara transparan, aman, dan sesuai dengan UU Perlindungan Data Pribadi
            Republik Indonesia (UU No. 27/2022).
          </p>
        </div>

        {/* Meta */}
        <div className="pp-meta">
          <span>📅 Terakhir diperbarui: {LAST_UPDATED}</span>
          <span>🏛️ Berlaku untuk: {COMPANY_LEGAL}</span>
          <span>📧 DPO: <a href={`mailto:${DPO_EMAIL}`} style={{ color:"#166534" }}>{DPO_EMAIL}</a></span>
        </div>

        {/* Table of contents */}
        <div className="pp-toc">
          <div className="pp-toc-title">Daftar Isi</div>
          <ul className="pp-toc-list">
            {sections.map(s => (
              <li key={s.id} className="pp-toc-item">
                <a href={`#${s.id}`}>{s.num}. {s.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="pp-body">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="pp-section">
              <span className="pp-section-num">{s.num}</span>
              <h2 className="pp-section-title">{s.title}</h2>
              {s.content}
              {i < sections.length - 1 && <div className="pp-divider" style={{ marginTop: 28 }} />}
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="pp-footer">
          <p>
            <strong>{COMPANY_LEGAL}</strong><br />
            {DPO_ADDRESS}<br />
            Untuk pertanyaan, permintaan hak data, atau pelaporan pelanggaran privasi,
            hubungi DPO kami di{" "}
            <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>.
          </p>
          <p style={{ marginTop: 12, fontSize: 11, color: "#94a3b8" }}>
            Dokumen ini merupakan bagian dari Syarat & Ketentuan penggunaan platform CarbonTrust.
            Versi ini berlaku mulai {LAST_UPDATED}.
          </p>
        </div>
      </div>
    </div>
  );
}