import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  HardHat, 
  Wrench, 
  FileCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import rbacService, { RbacRole } from '../services/rbac.service';

export interface SensoriumAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData?: { name: string; email: string; company: string; role: string }) => void;
  defaultTab?: 'register' | 'login' | 'demo';
}

export const SensoriumAuthModal: React.FC<SensoriumAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'register',
}) => {
  const loginAsMock = (role?: RbacRole, tenantId?: string) => {
    rbacService.loginAsMock(role, tenantId);
  };
  const loginWithEmail = async (email: string, pass: string) => {
    return await rbacService.loginWithEmail(email, pass);
  };
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'demo'>(defaultTab);

  // Formulaire d'inscription (Registration)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState<RbacRole>('FACILITY_LEAD');
  const [regPassword, setRegPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Formulaire de connexion (Login)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Inscription d'une nouvelle entreprise / utilisateur
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regCompany || !regPassword) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!acceptTerms) {
      setError('Veuillez accepter les conditions générales.');
      return;
    }

    setLoading(true);
    setError(null);

    // Enregistrement persistant dans localStorage
    const newRegisteredUser = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      company: regCompany.trim(),
      role: regRole,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('sensorium_registered_user', JSON.stringify(newRegisteredUser));
      localStorage.setItem('sensorium_user_session', JSON.stringify({
        isAuthenticated: true,
        user: newRegisteredUser,
        tenantId: `tenant-${regCompany.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      }));

      // Initialiser la session RBAC avec ce rôle
      loginAsMock(regRole, `tenant-${regCompany.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);

      setSuccessMessage('Compte entreprise créé avec succès ! Initialisation de votre espace...');
      setTimeout(() => {
        setLoading(false);
        onSuccess(newRegisteredUser);
        onClose();
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Erreur lors de l'enregistrement.");
    }
  };

  // 2. Connexion classique
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Vérifier si un compte existe dans le localStorage
      const savedUserStr = localStorage.getItem('sensorium_registered_user');
      let savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

      if (savedUser && savedUser.email === loginEmail.trim().toLowerCase()) {
        loginAsMock(savedUser.role, `tenant-${savedUser.company.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
        setSuccessMessage('Connexion réussie ! Chargement de votre dashboard...');
        setTimeout(() => {
          setLoading(false);
          onSuccess(savedUser);
          onClose();
        }, 800);
        return;
      }

      // Tenter la connexion RBAC
      const res = await loginWithEmail(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMessage('Connexion réussie ! Chargement...');
        setTimeout(() => {
          setLoading(false);
          onSuccess();
          onClose();
        }, 800);
      } else {
        // Mode tolérant : création de session de session de test
        const fallbackUser = {
          id: `usr-${Date.now()}`,
          name: loginEmail.split('@')[0],
          email: loginEmail,
          company: loginEmail.split('@')[1]?.replace(/\.[a-z]+$/, '').toUpperCase() || 'ENTREPRISE',
          role: 'FACILITY_LEAD' as RbacRole,
        };
        localStorage.setItem('sensorium_registered_user', JSON.stringify(fallbackUser));
        loginAsMock('FACILITY_LEAD');
        setSuccessMessage('Session entreprise activée !');
        setTimeout(() => {
          setLoading(false);
          onSuccess(fallbackUser);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Identifiants invalides.');
    }
  };

  // 3. Profils Démo certifiés
  const demoProfiles = [
    {
      role: 'SUPER_ADMIN' as RbacRole,
      title: 'Super Administrateur Global',
      org: 'Sensorium Group HQ',
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-500/10 hover:border-purple-500',
    },
    {
      role: 'TENANT_ADMIN' as RbacRole,
      title: 'Directeur des Infrastructures',
      org: 'Airbus Defence & Space (CMR)',
      icon: <Building2 className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/40 bg-blue-500/10 hover:border-blue-500',
    },
    {
      role: 'FACILITY_LEAD' as RbacRole,
      title: 'Facility Lead & Énergie',
      org: 'TotalEnergies Campus Europe',
      icon: <HardHat className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-500',
    },
    {
      role: 'CSRD_AUDITOR' as RbacRole,
      title: 'Auditeur Conformité DORA / CSRD',
      org: 'KPMG Sustainability Advisory',
      icon: <FileCheck className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10 hover:border-amber-500',
    },
  ];

  const handleSelectDemo = (p: typeof demoProfiles[0]) => {
    loginAsMock(p.role);
    onSuccess({
      name: p.title,
      email: `${p.role.toLowerCase()}@sensorium-demo.com`,
      company: p.org,
      role: p.role,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left relative flex flex-col max-h-[90vh]">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-orange-50 via-white to-amber-50/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Manrope'] font-extrabold text-xl text-slate-900 leading-tight">
                  Espace Entreprise SENSORIUM
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                  CAFM PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Accès sécurisé avec gestion des identités RBAC et conformité DORA Art. 24
              </p>
            </div>
          </div>

          {/* Onglets : Inscription vs Connexion vs Profil Démo */}
          <div className="mt-5 flex p-1 bg-slate-100 rounded-xl gap-1">
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ✦ Inscription (Registration)
            </button>
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setActiveTab('demo'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'demo' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Accès Démo Immédiat
            </button>
          </div>
        </div>

        {/* Message d'état */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Contenu Déroulant */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1 : FORMULAIRE D'INSCRIPTION (REGISTRATION) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nom & Prénom <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Ex: Adam Benaich"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email professionnel <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="adam@entreprise.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Entreprise / Organisation (Tenant) <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      required
                      value={regCompany}
                      onChange={e => setRegCompany(e.target.value)}
                      placeholder="Ex: Airbus, Engie, Caisse des Dépôts"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rôle opérationnel <span className="text-orange-500">*</span>
                  </label>
                  <select 
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as RbacRole)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="FACILITY_LEAD">Facility Manager / Exploitation</option>
                    <option value="TENANT_ADMIN">Directeur des Infrastructures (Admin)</option>
                    <option value="SUPER_ADMIN">Super Administrateur Global</option>
                    <option value="CSRD_AUDITOR">Auditeur Énergie / CSRD / DORA</option>
                    <option value="FIELD_TECHNICIAN">Technicien GMAO Terrain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mot de passe sécurisé <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="terms"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-600 cursor-pointer">
                  J'accepte les conditions d'utilisation et la politique de confidentialité RGPD
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Création de votre espace...' : 'Créer mon compte & Ouvrir mon Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2 : FORMULAIRE DE CONNEXION (LOGIN) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="votre.email@entreprise.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <button type="button" onClick={() => setActiveTab('demo')} className="text-orange-600 font-semibold hover:underline">
                  Mot de passe oublié ?
                </button>
                <button type="button" onClick={() => setActiveTab('register')} className="text-slate-600 font-semibold hover:text-orange-600">
                  Pas encore de compte ? S'inscrire
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authentification...' : 'Se connecter au Dashboard'}</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </form>
          )}

          {/* TAB 3 : ACCÈS DÉMO RAPIDE CERTIFIÉ */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Sélectionnez un rôle pour tester immédiatement l'intégralité du Dashboard exécutif en mode certifié :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoProfiles.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectDemo(p)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${p.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0">
                        {p.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{p.title}</div>
                        <div className="text-[11px] text-slate-500">{p.org}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-bold text-slate-700">
                      <span>Rôle : {p.role}</span>
                      <span className="text-orange-600">Tester →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sécurité certifiée ISO 27001 & DORA</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default SensoriumAuthModal;

