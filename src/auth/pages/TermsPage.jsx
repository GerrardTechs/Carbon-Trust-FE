/**
 * TermsPage.jsx
 * Route: /terms
 */

const LAST_UPDATED  = "1 Juni 2025";
const COMPANY_LEGAL = "PT CarbonTrust Teknologi Indonesia";
const LEGAL_EMAIL   = "legal@carbontrust.id";
const ADDRESS       = "Jl. Sudirman Kav. 52–53, Jakarta Selatan 12190, Indonesia";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .tp-shell { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f8fafc; min-height: 100dvh; color: #1e293b; }
  .tp-inner { max-width: 720px; margin: 0 auto; background: #fff; min-height: 100dvh; box-shadow: 0 0 40px rgba(0,0,0,.07); }
  .tp-hero { background: linear-gradient(135deg, #14532d 0%, #0f766e 100%); padding: 40px 32px 32px; }
  .tp-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #bbf7d0; background: rgba(255,255,255,.15); padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; }
  .tp-hero-title { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: -.02em; margin-bottom: 8px; }
  .tp-hero-sub { font-size: 13px; color: rgba(255,255,255,.75); line-height: 1.6; }
  .tp-meta { display: flex; gap: 16px; flex-wrap: wrap; padding: 14px 32px; background: #f0fdf4; border-bottom: 1px solid #dcfce7; font-size: 12px; color: #166534; font-weight: 600; }
  .tp-meta a { color: #166534; }
  .tp-toc { padding: 20px 32px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  .tp-toc-title { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; font-weight: 700; margin-bottom: 10px; }
  .tp-toc-list { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
  .tp-toc-item a { font-size: 12px; font-weight: 600; color: #166534; text-decoration: none; background: #dcfce7; padding: 4px 10px; border-radius: 999px; display: inline-block; }
  .tp-toc-item a:hover { background: #bbf7d0; }
  .tp-body { padding: 32px; display: flex; flex-direction: column; gap: 36px; }
  .tp-section { scroll-margin-top: 80px; }
  .tp-section-num { display: inline-block; font-size: 10px; font-weight: 800; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 999px; margin-bottom: 8px; letter-spacing: .04em; }
  .tp-section-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 12px; letter-spacing: -.01em; }
  .tp-p { font-size: 14px; color: #374151; line-height: 1.75; margin-bottom: 10px; }
  .tp-p:last-child { margin-bottom: 0; }
  .tp-list { margin: 8px 0 8px 20px; display: flex; flex-direction: column; gap: 4px; }
  .tp-list li { font-size: 14px; color: #374151; line-height: 1.6; }
  .tp-callout { border-radius: 12px; padding: 14px 16px; margin: 10px 0; font-size: 13px; line-height: 1.6; }
  .tp-callout-green  { background: #f0fdf4; border-left: 4px solid #16a34a; color: #166534; }
  .tp-callout-amber  { background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e; }
  .tp-callout-red    { background: #fff1f2; border-left: 4px solid #ef4444; color: #9f1239; }
  .tp-callout strong { font-weight: 700; }
  .tp-divider { height: 1px; background: #f1f5f9; margin-top: 28px; }
  .tp-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; font-size: 12px; color: #64748b; line-height: 1.7; }
  .tp-footer a { color: #166534; font-weight: 700; text-decoration: none; }
  .tp-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #166534; text-decoration: none; padding: 10px 32px; background: #f0fdf4; border-bottom: 1px solid #dcfce7; }
  .tp-back:hover { background: #dcfce7; }
  @media (max-width: 600px) {
    .tp-hero { padding: 28px 20px 24px; }
    .tp-hero-title { font-size: 20px; }
    .tp-meta, .tp-toc, .tp-body, .tp-footer { padding-left: 20px; padding-right: 20px; }
    .tp-body { gap: 28px; }
  }
`;

const sections = [
  {
    id: "t1", num: "01",
    title: "Penerimaan Ketentuan",
    body: (
      <>
        <p className="tp-p">
          Dengan mengakses atau menggunakan platform <strong>{COMPANY_LEGAL}</strong> ("CarbonTrust"),
          Anda menyatakan telah membaca, memahami, dan menyetujui Ketentuan Layanan ini secara
          keseluruhan. Jika Anda tidak menyetujui salah satu ketentuan, harap hentikan penggunaan
          platform ini.
        </p>
        <p className="tp-p">
          Ketentuan ini berlaku untuk seluruh pengguna platform, termasuk akun Company, Landlord,
          Admin, dan pengunjung tanpa akun (Public View).
        </p>
        <div className="tp-callout tp-callout-amber">
          <strong>Perhatian:</strong> Ketentuan ini dapat diperbarui sewaktu-waktu. Penggunaan
          platform setelah tanggal pembaruan dianggap sebagai penerimaan atas ketentuan yang baru.
        </div>
      </>
    ),
  },
  {
    id: "t2", num: "02",
    title: "Deskripsi Layanan",
    body: (
      <>
        <p className="tp-p">
          CarbonTrust adalah platform manajemen kredit karbon berbasis teknologi yang menyediakan:
        </p>
        <ul className="tp-list">
          <li>Pencatatan dan verifikasi emisi serta serapan karbon sesuai ISO 14064:2018 dan IPCC 2006</li>
          <li>Pendaftaran dan pemantauan lahan karbon dengan sensor IoT dan analisis satelit</li>
          <li>Marketplace jual-beli kredit karbon (carbon credit trading) antar perusahaan terdaftar</li>
          <li>Laporan MRV (Measurement, Reporting, Verification) dan skor ESG</li>
          <li>Transparansi data publik melalui Public View sesuai Paris Agreement Article 6</li>
          <li>Sertifikasi kredit karbon berbasis blockchain untuk keabsahan dan ketidakubahannya</li>
        </ul>
      </>
    ),
  },
  {
    id: "t3", num: "03",
    title: "Hak & Kewajiban Pengguna",
    body: (
      <>
        <p className="tp-p"><strong>Hak Pengguna:</strong></p>
        <ul className="tp-list">
          <li>Mengakses fitur sesuai peran akun yang didaftarkan</li>
          <li>Mendapatkan laporan MRV dan sertifikat ISO 14064 atas lahan yang terdaftar</li>
          <li>Mengajukan dan menerima bid kredit karbon di marketplace</li>
          <li>Mengontrol visibilitas data perusahaan di Public View</li>
        </ul>
        <p className="tp-p" style={{ marginTop: 12 }}><strong>Kewajiban Pengguna:</strong></p>
        <ul className="tp-list">
          <li>Memberikan informasi yang akurat, lengkap, dan dapat diverifikasi saat pendaftaran dan pelaporan emisi</li>
          <li>Tidak menggunakan platform untuk tujuan penipuan, pencucian kredit karbon, atau pelaporan palsu (greenwashing)</li>
          <li>Menjaga kerahasiaan kredensial akun dan segera melaporkan akses tidak sah</li>
          <li>Mematuhi regulasi pelaporan emisi yang berlaku di yurisdiksi operasi masing-masing</li>
          <li>Tidak melakukan scraping, reverse engineering, atau eksploitasi sistem platform</li>
        </ul>
        <div className="tp-callout tp-callout-red" style={{ marginTop: 10 }}>
          <strong>Pelanggaran berat:</strong> Pelaporan emisi palsu, manipulasi data sensor IoT,
          atau pembuatan kredit karbon fiktif dapat mengakibatkan pemblokiran akun permanen dan
          pelaporan ke otoritas berwenang (KLHK, OJK).
        </div>
      </>
    ),
  },
  {
    id: "t4", num: "04",
    title: "Akurasi & Tanggung Jawab Data",
    body: (
      <>
        <p className="tp-p">
          Pengguna bertanggung jawab penuh atas keakuratan data yang diunggah ke platform,
          termasuk data emisi, dokumen kepemilikan lahan, dan koordinat parsel.
        </p>
        <p className="tp-p">
          CarbonTrust menyediakan alat kalkulasi berbasis IPCC 2006 dan faktor emisi ESDM
          Indonesia sebagai panduan. Namun, hasil kalkulasi bersifat <strong>indikatif</strong>
          dan bukan merupakan audit resmi. Verifikasi resmi untuk keperluan regulasi tetap
          memerlukan auditor independen yang terakreditasi.
        </p>
        <div className="tp-callout tp-callout-green">
          <strong>Data Blockchain:</strong> Setelah transaksi kredit karbon direkam di blockchain,
          data tersebut bersifat imutabel dan tidak dapat diubah atau dihapus oleh siapapun,
          termasuk tim CarbonTrust.
        </div>
      </>
    ),
  },
  {
    id: "t5", num: "05",
    title: "Marketplace & Transaksi Kredit Karbon",
    body: (
      <>
        <p className="tp-p">
          CarbonTrust bertindak sebagai <strong>fasilitator</strong> marketplace, bukan sebagai
          pihak dalam transaksi jual-beli kredit karbon. Transaksi terjadi langsung antara
          Company Buyer dan Company/Landlord Seller.
        </p>
        <ul className="tp-list">
          <li>Bid yang diajukan bersifat mengikat — Anda bertanggung jawab atas setiap bid yang dikirimkan</li>
          <li>Setelah bid diterima seller, proses escrow dimulai dan dana tidak dapat ditarik sepihak</li>
          <li>CarbonTrust tidak menjamin ketersediaan kredit atau penyelesaian transaksi jika terjadi force majeure</li>
          <li>Sengketa transaksi diselesaikan melalui mekanisme dispute resolution platform sebelum jalur hukum</li>
        </ul>
        <div className="tp-callout tp-callout-amber">
          <strong>Biaya Platform:</strong> CarbonTrust membebankan biaya layanan (platform fee)
          sebesar yang tertera pada halaman Pricing. Biaya ini tidak dapat dikembalikan setelah
          transaksi selesai.
        </div>
      </>
    ),
  },
  {
    id: "t6", num: "06",
    title: "Kepemilikan Intelektual",
    body: (
      <>
        <p className="tp-p">
          Seluruh elemen platform CarbonTrust — termasuk kode sumber, desain UI, algoritma
          kalkulasi karbon, metodologi MRV, dan merek dagang — adalah milik eksklusif
          {COMPANY_LEGAL} dan dilindungi oleh hukum hak cipta Indonesia.
        </p>
        <p className="tp-p">
          Pengguna diberikan lisensi terbatas, non-eksklusif, dan tidak dapat dialihkan untuk
          menggunakan platform sesuai Ketentuan ini. Penggunaan di luar cakupan tersebut
          memerlukan izin tertulis.
        </p>
        <p className="tp-p">
          Data yang diunggah pengguna (laporan emisi, dokumen lahan) tetap menjadi milik
          pengguna. Dengan mengunggah data, pengguna memberikan lisensi kepada CarbonTrust
          untuk memproses data tersebut guna menyediakan layanan platform.
        </p>
      </>
    ),
  },
  {
    id: "t7", num: "07",
    title: "Pembatasan Tanggung Jawab",
    body: (
      <>
        <p className="tp-p">
          Sejauh yang diizinkan oleh hukum yang berlaku, CarbonTrust tidak bertanggung jawab atas:
        </p>
        <ul className="tp-list">
          <li>Kerugian bisnis akibat ketidakakuratan data kalkulasi emisi yang dihasilkan platform</li>
          <li>Gangguan layanan yang disebabkan oleh pemeliharaan, gangguan infrastruktur pihak ketiga, atau force majeure</li>
          <li>Kerugian akibat tindakan pengguna lain di marketplace</li>
          <li>Perubahan regulasi karbon yang memengaruhi nilai kredit yang telah diterbitkan</li>
        </ul>
        <div className="tp-callout tp-callout-amber">
          <strong>Batas Tanggung Jawab:</strong> Total tanggung jawab CarbonTrust kepada satu
          pengguna tidak akan melebihi jumlah biaya layanan yang telah dibayarkan oleh pengguna
          tersebut dalam 12 bulan terakhir.
        </div>
      </>
    ),
  },
  {
    id: "t8", num: "08",
    title: "Penangguhan & Penghentian Akun",
    body: (
      <>
        <p className="tp-p">
          CarbonTrust berhak menangguhkan atau menghentikan akun pengguna tanpa pemberitahuan
          sebelumnya jika ditemukan:
        </p>
        <ul className="tp-list">
          <li>Pelanggaran Ketentuan Layanan ini</li>
          <li>Aktivitas penipuan atau manipulasi data</li>
          <li>Penggunaan platform untuk tujuan ilegal</li>
          <li>Ketidakaktifan akun lebih dari 24 bulan</li>
        </ul>
        <p className="tp-p">
          Pengguna dapat mengajukan banding atas penangguhan akun melalui{" "}
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> dalam 14 hari kerja sejak
          penangguhan dilakukan.
        </p>
      </>
    ),
  },
  {
    id: "t9", num: "09",
    title: "Hukum yang Berlaku & Penyelesaian Sengketa",
    body: (
      <>
        <p className="tp-p">
          Ketentuan Layanan ini tunduk pada dan ditafsirkan sesuai dengan hukum Republik Indonesia.
        </p>
        <p className="tp-p">
          Setiap sengketa yang timbul dari atau berkaitan dengan Ketentuan ini akan diselesaikan
          melalui:
        </p>
        <ul className="tp-list">
          <li><strong>Tahap 1:</strong> Negosiasi langsung antara para pihak dalam 30 hari</li>
          <li><strong>Tahap 2:</strong> Mediasi melalui Badan Mediasi dan Arbitrase Asuransi Indonesia (BMAI) atau lembaga mediasi yang disepakati</li>
          <li><strong>Tahap 3:</strong> Arbitrase melalui Badan Arbitrase Nasional Indonesia (BANI) di Jakarta, jika mediasi gagal</li>
        </ul>
        <p className="tp-p">
          Para pihak mengesampingkan yurisdiksi pengadilan umum untuk sengketa yang dapat
          diselesaikan melalui arbitrase.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="tp-shell">
      <style>{CSS}</style>
      <div className="tp-inner">

        <a href="/" className="tp-back">← Kembali ke CarbonTrust</a>

        <div className="tp-hero">
          <div className="tp-badge">Ketentuan Layanan</div>
          <h1 className="tp-hero-title">Syarat & Ketentuan Penggunaan</h1>
          <p className="tp-hero-sub">
            Harap baca ketentuan ini dengan seksama sebelum menggunakan platform
            CarbonTrust. Penggunaan platform berarti Anda menyetujui semua ketentuan di bawah ini.
          </p>
        </div>

        <div className="tp-meta">
          <span>📅 Berlaku sejak: {LAST_UPDATED}</span>
          <span>🏛️ {COMPANY_LEGAL}</span>
          <span>📧 <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a></span>
        </div>

        <div className="tp-toc">
          <div className="tp-toc-title">Daftar Isi</div>
          <ul className="tp-toc-list">
            {sections.map(s => (
              <li key={s.id} className="tp-toc-item">
                <a href={`#${s.id}`}>{s.num}. {s.title}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="tp-body">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="tp-section">
              <span className="tp-section-num">{s.num}</span>
              <h2 className="tp-section-title">{s.title}</h2>
              {s.body}
              {i < sections.length - 1 && <div className="tp-divider" />}
            </section>
          ))}
        </div>

        <div className="tp-footer">
          <p>
            <strong>{COMPANY_LEGAL}</strong><br />
            {ADDRESS}<br />
            Pertanyaan hukum: <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
          </p>
          <p style={{ marginTop: 12, fontSize: 11, color: "#94a3b8" }}>
            Ketentuan ini berlaku mulai {LAST_UPDATED} dan menggantikan semua versi sebelumnya.
            Lihat juga: <a href="/privacy">Kebijakan Privasi</a>
          </p>
        </div>
      </div>
    </div>
  );
}
