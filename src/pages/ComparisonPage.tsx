import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Server,
  Lock,
  FileText,
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  ArrowRight,
  TrendingUp,
  Building2,
  Sparkles,
  Award,
  Globe,
  Database,
  Smartphone,
  ChevronRight,
  Quote,
  Copy,
  Check,
  Leaf,
  Scale,
  ShieldAlert,
  EyeOff,
  Activity,
  MessageSquareQuote
} from "lucide-react";

interface ComparisonPageProps {
  isDark?: boolean;
  onNavigate?: (page: string) => void;
}

interface ComparisonFeature {
  category: string;
  manageEngine: {
    status: "good" | "neutral" | "bad";
    title: string;
    description: string;
  };
  sensorium: {
    status: "superior";
    title: string;
    description: string;
    badge: string;
  };
  executiveValue: string;
}

const COMPARISON_DATA: ComparisonFeature[] = [
  {
    category: "Gestion du Parc",
    manageEngine: {
      status: "good",
      title: "Excellente (Inventaire, Patchs)",
      description: "Gestion réactive classique : inventaire matériel, déploiement d'agents lourds et planification de correctifs."
    },
    sensorium: {
      status: "superior",
      title: "Intégrée & Prédictive",
      description: "L'IA intégrée prédit la panne matérielle et logicielle avant qu'elle n'arrive, avec déploiement d'agent en 1 seul clic.",
      badge: "IA Prédictive"
    },
    executiveValue: "Réduction de 47% des arrêts non planifiés et déploiement instantané sans formation."
  },
  {
    category: "Sécurité",
    manageEngine: {
      status: "neutral",
      title: "Basée sur des règles (Policies)",
      description: "Périmètre de confiance statique : une fois authentifié, l'accès est accordé jusqu'à expiration du bail."
    },
    sensorium: {
      status: "superior",
      title: "Zero-Trust Native",
      description: "L'accès est vérifié en continu (mTLS, posture du poste, clés éphémères), pas seulement au début de session.",
      badge: "Zero-Trust ZTNA"
    },
    executiveValue: "Élimination des mouvements latéraux d'attaquants en cas de compromission d'un poste."
  },
  {
    category: "Souveraineté",
    manageEngine: {
      status: "neutral",
      title: "Produit Global (Standard US/Inde)",
      description: "Hébergement dépendant du Cloud propriétaire Zoho/ManageEngine soumis aux lois extraterritoriales (Cloud Act)."
    },
    sensorium: {
      status: "superior",
      title: "Souveraine & Maîtrisée",
      description: "Contrôle total sur la localisation des données en local (On-Premise) ou cloud souverain étanche. Idéal pour la CMR et Caisse des Dépôts.",
      badge: "100% Souverain"
    },
    executiveValue: "Sanctuarisation des données étatiques, bancaires et de retraite contre l'espionnage économique."
  },
  {
    category: "Conformité",
    manageEngine: {
      status: "neutral",
      title: "Rapports de logs standards",
      description: "Extraction de journaux bruts nécessitant des traitements manuels pour satisfaire les auditeurs."
    },
    sensorium: {
      status: "superior",
      title: "Générateur de PAS / DORA",
      description: "L'application génère elle-même les dossiers de conformité légale (DORA, NIS2, PAS, ISO 27001) certifiés et prêts à l'audit.",
      badge: "Audit Automatisé"
    },
    executiveValue: "Gain de 120h d'expertise juridique et technique lors de chaque audit réglementaire."
  },
  {
    category: "Périmètre",
    manageEngine: {
      status: "neutral",
      title: "Uniquement l'IT (PC, Serveurs)",
      description: "Cloisonné aux terminaux informatiques bureautiques traditionnels sans vision du bâtiment."
    },
    sensorium: {
      status: "superior",
      title: "Convergence IT & OT",
      description: "Gère simultanément les postes de travail (PC/Mac/Linux) ET les infrastructures physiques (IoT, GTB, Bâtiments, Jumeaux BIM 3D).",
      badge: "IT + OT + BIM"
    },
    executiveValue: "Console unique pour le DSI, le RSSI et le Directeur Technique Bâtiment (Smart Building)."
  },
  {
    category: "Modèle",
    manageEngine: {
      status: "neutral",
      title: "Licence classique / SaaS",
      description: "Tarification complexe par module individuel avec silos étanches et licences additionnelles."
    },
    sensorium: {
      status: "superior",
      title: "SaaS Multi-tenant Souverain",
      description: "Isolation cryptographique stricte par client avec souveraineté totale et déploiement autonome.",
      badge: "Multi-Tenant Étanche"
    },
    executiveValue: "Chaque organisation possède son propre coffre-fort de données sans risque de fuite croisée."
  }
];

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ isDark = true, onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  const STRATEGIC_PITCH_TEXT = `ManageEngine est un excellent outil de gestion technique, mais c'est un outil 'aveugle'. Il vous dit que votre PC est à jour, mais il ne sait pas si le bâtiment où se trouve ce PC est en surchauffe, ni si l'installation de ce logiciel impacte votre bilan carbone, ni si vous êtes en conformité avec le règlement européen DORA.

SENSORIUM, en revanche, est une plateforme de Résilience. Nous ne nous contentons pas de gérer vos terminaux, nous lions votre infrastructure informatique à votre infrastructure physique et réglementaire. Nous vous offrons une visibilité à 360° : Technique, Sécuritaire, Environnementale et Légale.`;

  const handleCopyPitch = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(STRATEGIC_PITCH_TEXT);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2500);
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${isDark ? "bg-[#0b0f17] text-white" : "bg-slate-50 text-slate-900"} font-sans space-y-8`}>
      
      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-indigo-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Sparkles size={14} className="text-orange-400" />
            <span>Benchmark Technologique &amp; Stratégique</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            SENSORIUM <span className="text-slate-500 font-light">vs</span> ManageEngine :
            <span className="block mt-1 bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Le Comparatif Next-Gen
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Pourquoi les grandes institutions souveraines (<strong>CMR, Caisse des Dépôts, banques et opérateurs d'infrastructures vitales</strong>)
            dépassent le modèle UEM traditionnel pour adopter l'approche unifiée, souveraine et prédictive de <strong>SENSORIUM</strong>.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-medium">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Zero-Trust Natif
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Building2 size={14} className="text-orange-400" /> Souveraineté CMR / Caisse des Dépôts
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Cpu size={14} className="text-cyan-400" /> Convergence IT + OT + IoT
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <FileText size={14} className="text-purple-400" /> Générateur DORA &amp; PAS
            </span>
          </div>
        </div>
      </div>

      {/* ─── Executive Battlecard : Comment présenter SENSORIUM face à ManageEngine ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-amber-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header de la Battlecard */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <MessageSquareQuote size={14} />
                <span>Executive Battlecard / Argumentaire C-Level</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Comment présenter SENSORIUM face à ManageEngine ?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                La réponse stratégique clé en main face à l'objection classique d'un DSI, RSSI ou Directeur Général.
              </p>
            </div>

            <button
              onClick={handleCopyPitch}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 shrink-0 shadow-lg ${
                copiedPitch
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-orange-500/20"
              }`}
            >
              {copiedPitch ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedPitch ? "Argumentaire Copié !" : "Copier le Pitch Commercial"}</span>
            </button>
          </div>

          {/* Objection Question */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Quote size={16} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                Objection Prospective du Client :
              </p>
              <p className="text-sm sm:text-base font-semibold text-white mt-0.5 italic">
                &laquo; Pourquoi choisir SENSORIUM plutôt que ManageEngine qui est mondialement connu ? &raquo;
              </p>
            </div>
          </div>

          {/* Deux Cartes de Contraste Stratégique */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Carte ManageEngine */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-red-500/20 relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                  <EyeOff size={13} />
                  <span>ManageEngine : L'Outil Technique &laquo; Aveugle &raquo;</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Périmètre IT Isolé</span>
              </div>
              <blockquote className="text-xs sm:text-sm text-slate-300 leading-relaxed italic border-l-2 border-red-500/40 pl-3">
                &laquo; ManageEngine est un excellent outil de gestion technique, mais c'est un <strong className="text-red-300 font-semibold">outil 'aveugle'</strong>. Il vous dit que votre PC est à jour, mais il ne sait pas si le bâtiment où se trouve ce PC est en surchauffe, ni si l'installation de ce logiciel impacte votre bilan carbone, ni si vous êtes en conformité avec le règlement européen DORA. &raquo;
              </blockquote>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">❌ Ignore la thermique des salles</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">❌ Pas de Scope ESG</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">❌ Pas de livrable DORA / PAS</span>
              </div>
            </div>

            {/* Carte SENSORIUM */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950/80 to-amber-950/30 border border-amber-500/40 relative space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>SENSORIUM : La Plateforme de Résilience Globale</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Visibilité 360°
                </span>
              </div>
              <blockquote className="text-xs sm:text-sm text-slate-100 leading-relaxed italic border-l-2 border-amber-400 pl-3 font-medium">
                &laquo; SENSORIUM, en revanche, est une <strong className="text-amber-300 font-bold">plateforme de Résilience</strong>. Nous ne nous contentons pas de gérer vos terminaux, nous lions votre infrastructure informatique à votre infrastructure physique et réglementaire. Nous vous offrons une visibilité à 360° : <span className="underline decoration-amber-400 font-bold text-white">Technique, Sécuritaire, Environnementale et Légale</span>. &raquo;
              </blockquote>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">✓ IA Prédictive avant panne</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">✓ Corrélation Bâtiment / IoT</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">✓ Souveraineté &amp; Audit DORA</span>
              </div>
            </div>
          </div>

          {/* Décomposition des 4 Piliers de la Visibilité à 360° */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity size={14} className="text-orange-400" />
              <span>Les 4 Piliers de la Visibilité à 360° SENSORIUM</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Pilier 1 : Technique */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 hover:border-cyan-500/40 transition space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Cpu size={16} />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">1. Technique</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Au-delà de l'inventaire : <strong>IA prédictive</strong> qui anticipe la panne disque/mémoire avant l'incident, télémétrie noyau, déploiement sans friction.
                </p>
                <div className="text-[10px] text-cyan-400 font-medium">
                  Différentiateur : Prédiction proactive vs constat passif
                </div>
              </div>

              {/* Pilier 2 : Sécuritaire */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 hover:border-emerald-500/40 transition space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">2. Sécuritaire</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Zero-Trust continu</strong> : validation permanente de l'intégrité, coupure réseau éclair en cas de menace, blocage matériel des ports USB.
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">
                  Différentiateur : Contrôle Kernel continu vs règles statiques
                </div>
              </div>

              {/* Pilier 3 : Environnemental */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-lime-500/20 hover:border-lime-500/40 transition space-y-2">
                <div className="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/30 text-lime-400 flex items-center justify-center">
                  <Leaf size={16} />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">3. Environnemental</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Corrélation <strong>IT + Bâtiment</strong> : détection de surchauffe locale, monitoring énergétique en temps réel et calcul du bilan carbone Scope 2/3.
                </p>
                <div className="text-[10px] text-lime-400 font-medium">
                  Différentiateur : Vision thermodynamique &amp; RSE absente chez ME
                </div>
              </div>

              {/* Pilier 4 : Légal & Réglementaire */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 transition space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Scale size={16} />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">4. Légal &amp; Réglementaire</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conformité native <strong>DORA (Résilience opérationnelle)</strong>, NIS 2 et générateur automatique de Plans d'Assurance Sécurité (PAS) pour les régulateurs.
                </p>
                <div className="text-[10px] text-purple-400 font-medium">
                  Différentiateur : Livrables juridiques opposables vs simples logs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tableau Comparatif Principal ─── */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-orange-400" />
              Matrice Comparative : ManageEngine (UEM) vs SENSORIUM
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyse détaillée fonction par fonction et valeur ajoutée métier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csv = [
                  "Fonctionnalite,ManageEngine (UEM),SENSORIUM (Next-Gen),Valeur Metier",
                  ...COMPARISON_DATA.map(
                    (d) =>
                      `"${d.category}","${d.manageEngine.title}","${d.sensorium.title}","${d.executiveValue}"`
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "comparatif-sensorium-vs-manageengine.csv";
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition"
            >
              <Download size={13} />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <th className="py-4 px-6 w-1/5">Fonctionnalité</th>
                <th className="py-4 px-6 w-2/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                    <span>ManageEngine (UEM Traditionnel)</span>
                  </div>
                </th>
                <th className="py-4 px-6 w-2/5 bg-orange-500/5 border-l border-r border-orange-500/20">
                  <div className="flex items-center gap-2 text-orange-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse inline-block" />
                    <span>SENSORIUM (L'Approche "Next-Gen")</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {COMPARISON_DATA.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Catégorie */}
                  <td className="py-5 px-6 font-bold text-slate-200 align-top">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                      <span>{item.category}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-normal leading-normal">
                      Impact : {item.executiveValue}
                    </p>
                  </td>

                  {/* ManageEngine */}
                  <td className="py-5 px-6 text-slate-300 align-top space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        {item.manageEngine.title}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {item.manageEngine.description}
                    </p>
                  </td>

                  {/* SENSORIUM */}
                  <td className="py-5 px-6 bg-orange-500/5 border-l border-r border-orange-500/20 align-top space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-400 text-sm">
                        {item.sensorium.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-amber-300 border border-orange-500/30">
                        {item.sensorium.badge}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-medium">
                      {item.sensorium.description}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4 Piliers Fondamentaux (Deep Dive) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Cpu size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">1. IA Prédictive vs Réactive</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            ManageEngine attend qu'un ticket ou une panne survienne. SENSORIUM corrèle la télémétrie CPU/RAM/Disque avec des modèles prédictifs pour intervenir avant l'incident.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">2. Zero-Trust Authentique</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Validation permanente de l'intégrité de la machine (bloquage USB dynamique, isolement réseau éclair, posture matérielle) sans se fier à une simple IP de réseau local.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Building2 size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">3. Souveraineté &amp; Séquestre</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hébergement étanche sans transfert vers des tiers américains ou indiens. Chaque organisation (CMR, Caisse de Dépôt) possède son coffre et contrôle ses certificats.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">4. Convergence IT + OT + BIM</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            La seule plateforme au monde fusionnant la gestion des postes de travail avec la supervision des bâtiments intelligents (IoT, Modbus, énergie, jumeau numérique 3D).
          </p>
        </div>
      </div>

      {/* ─── Call to Action / Redirection vers Déploiement ─── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-xl font-extrabold tracking-tight">Prêt à tester la différence SENSORIUM ?</h3>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            Déployez l'agent léger sur vos terminaux en 1 seul clic ou configurez un nouveau client avec notre installeur tout-en-un pré-configuré.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate("uem")}
              className="px-5 py-2.5 rounded-xl bg-white text-orange-950 font-bold text-xs hover:bg-orange-50 transition shadow-lg flex items-center gap-2"
            >
              <span>Accéder au Cockpit UEM</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default ComparisonPage;
