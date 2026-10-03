import React, { useState, useEffect } from 'react';

interface VaultViewProps {
  onUnlockTwin: () => void;
  onNavigate: (path: any) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ onUnlockTwin, onNavigate }) => {
  const [authTab, setAuthTab] = useState<'login' | 'presign' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('a.mercer@beecarbonat-twin.internal');
  const [password, setPassword] = useState('••••••••••••••••••••');
  const [campusUuid, setCampusUuid] = useState('FR-IDF-SITE-CARBONAT-ALPHA');
  const [shaHash, setShaHash] = useState('7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
  const [rockerActive, setRockerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState('Pré-Signer & Déverrouiller le Twin');
  const [countdown, setCountdown] = useState('07:42:19');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Countdown timer simulation
  useEffect(() => {
    let totalSeconds = 7 * 3600 + 42 * 60 + 19;
    const interval = setInterval(() => {
      totalSeconds = Math.max(0, totalSeconds - 1);
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegenerateProof = () => {
    const chars = '0123456789abcdef';
    let res = '';
    for (let i = 0; i < 64; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    setShaHash(res);
    showToast('Nouveau Nonce matériel généré (Curv25519 Re-keyed)');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEmergencyRocker = () => {
    setRockerActive(true);
    showToast('Dexie Database Cache & Ephemeral Token PURGED. Session invalidée.');
    setTimeout(() => {
      setRockerActive(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitLabel('Attestation Enclave En Cours...');

    setTimeout(() => {
      setSubmitLabel('Session Certifiée FIPS 140-3 !');
      showToast('Enclave déverrouillée avec succès !');

      setTimeout(() => {
        setSubmitting(false);
        setSubmitLabel(
          authTab === 'login'
            ? 'Valider & Authentifier'
            : authTab === 'presign'
            ? 'Pré-Signer Clé & Déverrouiller'
            : 'Générer Identité Enclave'
        );
        onUnlockTwin();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbf8ff] pt-20 pb-16 flex flex-col justify-between">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Top System Telemetry Bar (Extruded Level 1 Plate) */}
        <div className="tactile-plate rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#e9e7ee] flex items-center justify-center text-[#630ed4] shadow-inner">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-lg text-[#1b1b20] font-bold">
                  Zero-Trust Ephemeral Access Vault
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#eaddff] text-[#25005a] font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider">
                  HSM-ENCLAVE 4.1
                </span>
              </div>
              <span className="text-xs text-[#4a4455]">
                mTLS Ephemeral Session Lifecycle • Hardware Token Key Exchange (FIPS 140-3 Level 4)
              </span>
            </div>
          </div>

          {/* Real-time Beacon Cluster */}
          <div className="flex items-center gap-4">
            <div className="tactile-debossed px-3 py-1.5 rounded-xl flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00746a] shadow-[0_0_8px_#00746a]"></span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455]">
                ENCLAVE: <strong className="text-[#1b1b20] font-semibold">ISOLATED</strong>
              </span>
            </div>
            <div className="tactile-debossed px-3 py-1.5 rounded-xl flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#630ed4] shadow-[0_0_8px_#630ed4]"></span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455]">
                ENTROPY POOL: <strong className="text-[#1b1b20] font-semibold">99.8%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Main Dual-Panel Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: Zero-Trust Enclave & Pre-Sign (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="tactile-plate rounded-xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
              {/* Specular top sheen overlay */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

              {/* Header & Hardware Key Serial */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase tracking-widest font-bold">
                    NODE DIRECTORY: CAFM-PRISMA-7
                  </span>
                  <h2 className="font-['Space_Grotesk'] text-2xl text-[#1b1b20] font-bold">
                    Credential Verification &amp; Pre-Sign
                  </h2>
                </div>
                <div className="tactile-debossed px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#630ed4]">fingerprint</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#4a4455]">0x4E7...A91C</span>
                </div>
              </div>

              {/* Physical Recessed Mode Switcher */}
              <div className="tactile-debossed p-1.5 rounded-xl flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setSubmitLabel('Valider & Authentifier');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-['Space_Grotesk'] text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    authTab === 'login'
                      ? 'text-[#630ed4] bg-[#fbf8ff] shadow-sm'
                      : 'text-[#4a4455] hover:text-[#1b1b20]'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('presign');
                    setSubmitLabel('Pré-Signer Clé & Déverrouiller');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-['Space_Grotesk'] text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    authTab === 'presign'
                      ? 'text-[#630ed4] bg-[#fbf8ff] shadow-sm'
                      : 'text-[#4a4455] hover:text-[#1b1b20]'
                  }`}
                >
                  Pré-Signature Clé
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setSubmitLabel('Générer Identité Enclave');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-['Space_Grotesk'] text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    authTab === 'register'
                      ? 'text-[#630ed4] bg-[#fbf8ff] shadow-sm'
                      : 'text-[#4a4455] hover:text-[#1b1b20]'
                  }`}
                >
                  Création Compte
                </button>
              </div>

              {/* Dynamic Form Enclave */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email Input Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-['Space_Grotesk'] text-[11px] uppercase text-[#4a4455] tracking-wider flex items-center justify-between">
                    <span>Identifiant Professionnel (mTLS Email)</span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#00746a] flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00746a]"></span>
                      Verified IDP Bound
                    </span>
                  </label>
                  <div className="tactile-debossed rounded-xl px-3.5 py-3 flex items-center gap-3 focus-within:shadow-[inset_0_0_0_1.5px_#7c3aed,inset_2px_2px_5px_rgba(112,104,133,0.3)] transition-all">
                    <span className="material-symbols-outlined text-[18px] text-[#7b7487]">alternate_email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@facility.spider.twin"
                      className="bg-transparent border-0 outline-none w-full text-sm text-[#1b1b20] placeholder:text-[#7b7487] font-medium tracking-wide"
                    />
                    <span className="material-symbols-outlined text-[16px] text-[#00746a]" title="Hardware identity bound">
                      lock
                    </span>
                  </div>
                </div>

                {/* Password Field with Machined Tactile Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-['Space_Grotesk'] text-[11px] uppercase text-[#4a4455] tracking-wider flex items-center justify-between">
                    <span>Clé Secrète de Dérivation (Password)</span>
                    <button
                      type="button"
                      onClick={() => showToast('Procédure Out-Of-Band de rotation déclenchée par SMS/mTLS.')}
                      className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] hover:underline"
                    >
                      Rotation OOB?
                    </button>
                  </label>
                  <div className="tactile-debossed rounded-xl px-3.5 py-3 flex items-center gap-3 focus-within:shadow-[inset_0_0_0_1.5px_#7c3aed,inset_2px_2px_5px_rgba(112,104,133,0.3)] transition-all">
                    <span className="material-symbols-outlined text-[18px] text-[#7b7487]">key</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter alphanumeric passkey"
                      className="bg-transparent border-0 outline-none w-full text-sm text-[#1b1b20] placeholder:text-[#7b7487] tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="tactile-btn p-1.5 rounded-lg flex items-center justify-center text-[#4a4455] hover:text-[#1b1b20] transition-all active:scale-95 cursor-pointer"
                      title="Toggle Secret Visibility"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Registration Additional Field */}
                {authTab === 'register' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['Space_Grotesk'] text-[11px] uppercase text-[#4a4455] tracking-wider">
                      Unité CAFM &amp; Site Industriel (Campus UUID)
                    </label>
                    <div className="tactile-debossed rounded-xl px-3.5 py-3 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#7b7487]">domain</span>
                      <input
                        type="text"
                        value={campusUuid}
                        onChange={(e) => setCampusUuid(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full text-sm text-[#1b1b20]"
                      />
                    </div>
                  </div>
                )}

                {/* Daily Ephemeral Token / Hardware Pre-Sign Well */}
                <div className="tactile-debossed rounded-xl p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#630ed4] animate-pulse"></div>
                      <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold tracking-wider">
                        Daily Ephemeral Token / Hardware Key
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-mono font-bold bg-[#eaddff] px-2 py-0.5 rounded">
                      RSA-PSS 4096
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="font-['JetBrains_Mono'] text-[10px] text-[#1b1b20] bg-[#efedf4] px-3 py-2 rounded-lg flex-1 overflow-hidden truncate shadow-inner">
                      SHA256: {shaHash}
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateProof}
                      className="tactile-btn px-3 py-2 rounded-lg font-['Space_Grotesk'] text-[10px] text-[#4a4455] hover:text-[#630ed4] flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                      title="Rotate Local Ephemeral Nonce"
                    >
                      <span className="material-symbols-outlined text-[14px]">sync</span>
                      <span>Nonced</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[#4a4455] pt-1">
                    <span className="font-['Space_Grotesk'] text-[10px]">
                      mTLS Handshake: <strong className="text-[#00746a] font-semibold">AES-256-GCM Ephemeral</strong>
                    </span>
                    <span className="font-['Space_Grotesk'] text-[10px] font-mono">Curve25519-Signed</span>
                  </div>
                </div>

                {/* Physical Skeuomorphic Push Button: Primary CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="tactile-btn-primary w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white transition-all active:scale-[0.98] group relative cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full bg-[#8df9ea] shadow-[0_0_10px_#8df9ea] group-hover:scale-125 transition-transform"></span>
                  <span className="font-['Space_Grotesk'] text-base tracking-wide uppercase font-bold">
                    {submitLabel}
                  </span>
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>

                {/* Separation Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="h-0.5 flex-1 bg-[#e9e7ee] rounded-full shadow-inner"></div>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase tracking-wider font-bold">
                    Fédération Industrielle SSO
                  </span>
                  <div className="h-0.5 flex-1 bg-[#e9e7ee] rounded-full shadow-inner"></div>
                </div>

                {/* Google Enterprise & SAML Tactile Plate Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Google Workspace SSO Session Identifiée (Auth Ok)');
                      setTimeout(onUnlockTwin, 800);
                    }}
                    className="tactile-btn p-3 rounded-xl flex items-center justify-center gap-2.5 text-[#1b1b20] hover:text-[#630ed4] transition-all active:scale-95 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335"></path>
                      <path d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4"></path>
                      <path d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.4 0 12s.7 3.2 1.9 5.6l3.7-2.9z" fill="#FBBC05"></path>
                      <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z" fill="#34A853"></path>
                    </svg>
                    <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider font-bold">
                      Workspace SSO
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      showToast('Clé matérielle FIDO2 / YubiKey touchée et attestée');
                      setTimeout(onUnlockTwin, 800);
                    }}
                    className="tactile-btn p-3 rounded-xl flex items-center justify-center gap-2.5 text-[#1b1b20] hover:text-[#630ed4] transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#00746a]">token</span>
                    <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider font-bold">
                      FIDO2 / YubiKey
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT PANEL: Security Hardware & Lifecycle Management (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Hardware Instrument Rack: Analog Revocation Countdown */}
            <div className="tactile-plate rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#630ed4] text-[20px]">timer</span>
                  <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-bold uppercase tracking-wider">
                    Token Lifecycle Revocation
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-[#ebddff] text-[#250059] font-['Space_Grotesk'] text-[10px] font-bold">
                  UTC SYNCHRONIZED
                </div>
              </div>

              {/* Skeuomorphic Rotary Analog Gauge Container */}
              <div className="tactile-debossed rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" fill="none" r="66" stroke="#dbd9e0" strokeLinecap="round" strokeWidth="8"></circle>
                    <circle
                      className="transition-all duration-1000 shadow-lg"
                      cx="80"
                      cy="80"
                      fill="none"
                      r="66"
                      stroke="#7c3aed"
                      strokeDasharray="414.69"
                      strokeDashoffset="103.67"
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>

                  {/* Central Hub */}
                  <div className="absolute w-32 h-32 rounded-full tactile-plate flex flex-col items-center justify-center shadow-lg border-2 border-white/60">
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono uppercase tracking-widest">
                      Revoke in
                    </span>
                    <span className="font-['Space_Grotesk'] text-2xl text-[#630ed4] font-mono font-bold tracking-tight">
                      {countdown}
                    </span>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#00746a] font-mono">23:59:59 UTC</span>
                  </div>

                  <div className="absolute top-1.5 w-2 h-3 rounded-full bg-[#630ed4] shadow-[0_0_8px_#630ed4]"></div>
                </div>

                {/* Gauge Metrics Array */}
                <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#e3e1e8]/60 text-center">
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-semibold">Issued</span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-mono font-bold">00:00:00</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-semibold">TTL Max</span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-mono font-bold">24.0 hrs</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-semibold">Drift</span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#00746a] font-mono font-bold">±1.2 ms</span>
                  </div>
                </div>
              </div>

              {/* Physical LED Status Array */}
              <div className="flex flex-col gap-2">
                <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#4a4455] font-bold">
                  Hardware Security Vectors
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="tactile-debossed px-3.5 py-2 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center w-3 h-3">
                        <span className="absolute w-3 h-3 rounded-full bg-[#00746a] opacity-80 animate-ping"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#89f5e7] shadow-[0_0_8px_#00746a]"></span>
                      </div>
                      <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-semibold">
                        mTLS Mutual Attestation
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] font-mono text-[#00746a] font-bold">
                      TLS 1.3 VALID
                    </span>
                  </div>

                  <div className="tactile-debossed px-3.5 py-2 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#630ed4] shadow-[0_0_8px_#630ed4]"></div>
                      <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-semibold">
                        Bloom Filter Revocation Cache
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] font-mono text-[#630ed4] font-bold">
                      ARMED (0 FAILS)
                    </span>
                  </div>

                  <div className="tactile-debossed px-3.5 py-2 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#712edd] shadow-[0_0_8px_#712edd]"></div>
                      <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-semibold">
                        Client Session Entropy
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] font-mono text-[#712edd] font-bold">
                      HEALTH 100%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Heavy Physical Emergency Rocker: Flush Dexie DB & Instant Logout */}
            <div className="tactile-plate rounded-xl p-4 flex flex-col gap-4 border-t-2 border-[#ba1a1a]/20">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#ba1a1a] uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Immediate Revocation Guard
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-lg text-[#1b1b20] font-bold">
                    Dexie &amp; Memory Flush
                  </h3>
                </div>
                <div className="tactile-debossed px-2.5 py-1 rounded-md text-[#ba1a1a] font-mono font-bold text-[10px]">
                  PURGE LEVEL 0
                </div>
              </div>

              <p className="text-xs text-[#4a4455] leading-relaxed">
                Activating this mechanical rocker switch invalidates local encrypted IndexedDB buffers, purges ephemeral session keys, and signals the CAFM broker cluster to terminate the mTLS tunnel.
              </p>

              <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-bold">
                    FORCE LOGOUT &amp; PURGE
                  </span>
                  <span className="text-[10px] text-[#7b7487]">Irreversible client memory wipe</span>
                </div>

                <button
                  type="button"
                  onClick={handleEmergencyRocker}
                  className="tactile-btn p-1.5 rounded-full w-16 h-8 flex items-center bg-[#fbf8ff] transition-all cursor-pointer relative shadow-md"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 ${
                      rockerActive
                        ? 'translate-x-8 bg-[#00746a]'
                        : 'translate-x-0 bg-[#ba1a1a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">power_settings_new</span>
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#4a4455] pt-1 px-1">
                <span>
                  Client Encrypted Store: <strong className="text-[#1b1b20] font-mono">1.84 MB Dexie Cache</strong>
                </span>
                <span className="text-[#00746a] font-mono font-bold">STATUS: CLEAN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Architectural Telemetry Breadcrumb */}
        <div className="tactile-debossed p-4 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[#4a4455] font-['Space_Grotesk'] text-[10px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#630ed4]">verified</span>
              FIPS 140-3 Hardware Token Compatible
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#00746a]">hub</span>
              Spider-CAFM Cluster: Node ID 0x8892-PARIS
            </span>
          </div>
          <div className="font-mono text-[#7b7487]">SESSION-NONCE: 0x9AF421BD4301C7E8</div>
        </div>
      </div>

      {/* Toast notification popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 tactile-plate px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl z-50 animate-bounce">
          <span className="material-symbols-outlined text-[20px] text-[#00746a]">check_circle</span>
          <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
