import { 
  LayoutDashboard, 
  Cpu, 
  Wrench, 
  ShieldCheck, 
  Globe, 
  Activity, 
  Compass, 
  FileText, 
  Sparkles,
  Layers,
  Database,
  Lock,
  Package,
  Users
} from 'lucide-react';
import { RbacRole } from '../bridge/useRbac';

export interface NavModuleConfig {
  id: string;
  label: string;
  shortLabel?: string;
  path: string;
  icon: any;
  roles: RbacRole[];
  category: 'supervision' | 'intelligence' | 'governance' | 'infrastructure';
  badge?: string;
  description: string;
}

export interface ContextualTabConfig {
  id: string;
  label: string;
  icon: any;
  description: string;
}

export const NAV_CONFIG = {
  // Modules maîtres de l'application
  modules: {
    OVERVIEW: {
      id: 'overview',
      label: 'Vue Globale',
      shortLabel: 'Cockpit',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'FACILITY_LEAD', 'FIELD_TECHNICIAN', 'CSRD_AUDITOR', 'VIEWER'] as RbacRole[],
      category: 'supervision',
      badge: 'Live',
      description: 'Supervision temps réel multi-sites, KPIs et alertes critiques',
    },
    ASSETS: {
      id: 'assets',
      label: 'Fiche Actifs 360°',
      shortLabel: 'Actifs',
      path: '/dashboard?tab=ov-asset-hub',
      icon: Layers,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'FACILITY_LEAD', 'FIELD_TECHNICIAN'] as RbacRole[],
      category: 'infrastructure',
      badge: '360°',
      description: 'Dossier machine maître, historique GMAO, télémétrie sub-seconde et conformité',
    },
    TWIN: {
      id: 'twin',
      label: 'Jumeau 3D & Actionneurs',
      shortLabel: 'Jumeau 3D',
      path: '/cockpit',
      icon: Compass,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'FACILITY_LEAD'] as RbacRole[],
      category: 'supervision',
      badge: '3D Spatial',
      description: 'Visualisation spatiale 3D interactive, vannes CVC et éclairage dynamique',
    },
    EDGE: {
      id: 'edge',
      label: 'Silicon X1 & Compute',
      shortLabel: 'Silicon X1',
      path: '/compute',
      icon: Cpu,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN'] as RbacRole[],
      category: 'intelligence',
      badge: 'NPU 240T',
      description: 'Supervision des processeurs neuronaux edge, isolats V8 et inférence locale',
    },
    TELEMETRY: {
      id: 'telemetry',
      label: 'Télémétrie & Flux Kafka',
      shortLabel: 'Télémétrie',
      path: '/dashboard?tab=ov-telemetry',
      icon: Activity,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'FACILITY_LEAD', 'FIELD_TECHNICIAN'] as RbacRole[],
      category: 'infrastructure',
      description: 'Pipelines Kafka, débits sub-secondes et anomalies thermiques/énergétiques',
    },
    COMPLIANCE: {
      id: 'compliance',
      label: 'Conformité DORA & ESG',
      shortLabel: 'DORA / ESG',
      path: '/compliance/dora',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'CSRD_AUDITOR'] as RbacRole[],
      category: 'governance',
      badge: 'Art. 28',
      description: 'Registre des tiers TPSP, résilience opérationnelle et bilan carbone CSRD',
    },
    CAFM: {
      id: 'cafm',
      label: 'GMAO & Maintenance',
      shortLabel: 'GMAO',
      path: '/dashboard?tab=ov-cafm',
      icon: Wrench,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'FACILITY_LEAD', 'FIELD_TECHNICIAN'] as RbacRole[],
      category: 'infrastructure',
      description: 'Ordres de travaux, plannings préventifs et gestion des techniciens d’astreinte',
    },
    AI_STUDIO: {
      id: 'ai-studio',
      label: 'Studio Artefacts IA',
      shortLabel: 'Copilote IA',
      path: '/ai-studio',
      icon: Sparkles,
      roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'FACILITY_LEAD'] as RbacRole[],
      category: 'intelligence',
      badge: 'Grounded',
      description: 'Éditeur de code d’artefacts et assistant d’hypervision IA contextuelle',
    },
  } as Record<string, NavModuleConfig>,

  // Navigation contextuelle au sein d'un équipement sélectionné
  contextual: {
    ASSET_DETAIL: {
      tabs: [
        { id: 'technique', label: 'Specs & Dossier', icon: FileText, description: 'Caractéristiques électromécaniques, manuels GED' },
        { id: 'telemetrie', label: 'Télémétrie Live', icon: Activity, description: 'Flux sub-seconde température, pression, puissance' },
        { id: 'maintenance', label: 'Historique GMAO', icon: Wrench, description: 'Interventions, tickets de maintenance et pièces de rechange' },
        { id: 'conformite', label: 'Conformité DORA', icon: ShieldCheck, description: 'Piste d’audit d’intégrité, résilience et Scope 1/2' },
        { id: 'custom', label: 'Champs Métier', icon: Sparkles, description: 'Propriétés dynamiques définies par l’exploitant' },
      ] as ContextualTabConfig[]
    }
  }
};
