import React, { useState, useEffect, useRef } from "react";
import { 
  X, User, Building2, Mail, Camera, ShieldCheck, Check, 
  Sparkles, RefreshCw, Upload, Image as ImageIcon, CheckCircle2
} from "lucide-react";
import { useRbac } from "@/hooks/useRbac";
import type { User as FirebaseUser } from "firebase/auth";

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseUser?: FirebaseUser | null;
  onSuccess?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  firebaseUser,
  onSuccess,
}) => {
  const { currentUser, currentTenant, updateProfile } = useRbac();

  // Local state for form fields
  const [displayName, setDisplayName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("Entreprise M");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial state when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      const storedName = localStorage.getItem("sensorium_user_name");
      const storedCompany = localStorage.getItem("sensorium_company_name");
      const storedAvatar = localStorage.getItem("sensorium_user_avatar");

      setDisplayName(
        storedName ||
        currentUser?.name || 
        firebaseUser?.displayName || 
        firebaseUser?.email?.split("@")[0] || 
        "Administrateur"
      );

      setCompanyName(
        storedCompany ||
        currentTenant?.name || 
        "Entreprise M"
      );

      setPhotoUrl(
        storedAvatar ||
        currentUser?.photoUrl || 
        firebaseUser?.photoURL || 
        ""
      );

      setEmail(
        currentUser?.email || 
        firebaseUser?.email || 
        "admin@entreprise-m.ma"
      );

      setSuccessToast(null);
    }
  }, [isOpen, currentUser, currentTenant, firebaseUser]);

  if (!isOpen) return null;

  // Récupérer automatiquement l'image de profil du compte Gmail / Google connecté
  const handleUseGooglePhoto = () => {
    if (firebaseUser?.photoURL) {
      setPhotoUrl(firebaseUser.photoURL);
      setSuccessToast("Photo de profil Gmail importée !");
      setTimeout(() => setSuccessToast(null), 2500);
    } else {
      // Si pas de photo Firebase directe, tentative de fallback sur le stockage
      const storedAvatar = localStorage.getItem("sensorium_user_avatar");
      if (storedAvatar) {
        setPhotoUrl(storedAvatar);
      }
    }
  };

  // Upload d'image local (conversion Base64 Data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 2 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setSuccessToast("Nouvelle image sélectionnée !");
        setTimeout(() => setSuccessToast(null), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedCompany = companyName.trim() || "Entreprise M";
      const updatedName = displayName.trim() || "Administrateur";
      const updatedPhoto = photoUrl.trim();

      // Persistance locale
      localStorage.setItem("sensorium_user_name", updatedName);
      localStorage.setItem("sensorium_company_name", updatedCompany);
      if (updatedPhoto) {
        localStorage.setItem("sensorium_user_avatar", updatedPhoto);
      }

      // Mise à jour de la session RBAC et diffusion d'événements
      if (updateProfile) {
        updateProfile({
          displayName: updatedName,
          companyName: updatedCompany,
          photoUrl: updatedPhoto,
        });
      }

      setSuccessToast("Profil & Organisation mis à jour avec succès !");
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    } catch {
      setIsSubmitting(false);
    }
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "EM";

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0e111a] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden relative text-slate-100 flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Profil Utilisateur &amp; Organisation
              </h3>
              <p className="text-xs text-gray-400">
                Identité souveraine, photo de profil et nom d'entreprise
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fermer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 relative z-10 overflow-y-auto max-h-[75vh]">
          {/* Avatar & Logo Section */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-indigo-900/60 border-2 border-orange-500/40 flex items-center justify-center overflow-hidden shadow-lg shadow-orange-500/10">
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-extrabold text-white tracking-wider font-mono">
                    {initials}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all cursor-pointer"
                title="Changer la photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {firebaseUser?.photoURL && (
                  <button
                    type="button"
                    onClick={handleUseGooglePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Adopter l'avatar de votre compte Google"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Photo de profil Gmail</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 text-xs font-medium border border-orange-500/30 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer un Logo</span>
                </button>
              </div>

              <p className="text-[11px] text-gray-400">
                Format PNG, JPG ou WebP (max 2 Mo). Utilisé comme avatar et logo du Cockpit.
              </p>
            </div>
          </div>

          {/* Nom de l'utilisateur */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Nom complet de l'utilisateur</span>
              <span className="text-[10px] text-gray-500">Affiché dans le bandeau</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex : Adam Benaich"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-gray-500 outline-none transition-all font-medium"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Nom de l'entreprise par défaut : Entreprise M */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Nom de l'entreprise / Organisation active</span>
              <span className="text-[10px] text-orange-400 font-mono font-bold">Défaut : Entreprise M</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Entreprise M"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-orange-500/40 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-gray-500 outline-none transition-all font-medium"
              />
              <Building2 className="w-4 h-4 text-orange-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Organisation souveraine active dans le tenant (remplace l'ancienne appellation <em>Caisse Marocaine des Retraites</em>).
            </p>
          </div>

          {/* URL personnalisée pour le logo ou l'avatar (optionnel) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>URL de l'image / Logo (optionnel)</span>
              <span className="text-[10px] text-gray-500">HTTPS directe</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={photoUrl.startsWith("data:") ? "" : photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://mon-domaine.com/logo.png"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/[0.03] border border-gray-700/80 focus:border-orange-500 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
              <ImageIcon className="w-4 h-4 text-gray-500 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Email & Rôle (Readonly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">Compte Lié</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-200 truncate font-mono">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">Rôle SENSORIUM</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentUser?.role ?? "TENANT_ADMIN"}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistrer les Modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;

