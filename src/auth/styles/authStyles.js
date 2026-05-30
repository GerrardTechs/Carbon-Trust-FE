import { G } from "../constants/tokens.js";

export const authCss = `
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
