import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRbac } from '../bridge/useRbac';

export type AssetDetailTab = 'technique' | 'telemetrie' | 'maintenance' | 'conformite' | 'custom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface AppContextType {
  activeTenantId: string;
  activeCampus: string;
  activeAssetId: string;
  activeAssetTab: AssetDetailTab;
  breadcrumbs: BreadcrumbItem[];
  setActiveAsset: (id: string) => void;
  setActiveAssetTab: (tab: AssetDetailTab) => void;
  setActiveCampus: (campus: string) => void;
  jumpToAsset: (assetId: string, targetTab?: AssetDetailTab) => void;
  onNavigateSection?: (page: string, tabId?: string) => void;
  setOnNavigateSection: (fn: (page: string, tabId?: string) => void) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTenant } = useRbac();

  const [activeTenantId, setActiveTenantId] = useState<string>(() => currentTenant?.id || 'tenant-demo');
  const [activeCampus, setActiveCampus] = useState<string>('Datacenter Francfort (Cluster EU-North)');
  const [activeAssetId, setActiveAsset] = useState<string>('fra-1');
  const [activeAssetTab, setActiveAssetTab] = useState<AssetDetailTab>('telemetrie');
  const [navigateSectionHandler, setNavigateSectionHandler] = useState<((page: string, tabId?: string) => void) | null>(null);

  const setOnNavigateSection = useCallback((fn: (page: string, tabId?: string) => void) => {
    setNavigateSectionHandler(() => fn);
  }, []);

  // Saut contextuel immédiat vers un équipement précis et son sous-onglet
  const jumpToAsset = useCallback((assetId: string, targetTab: AssetDetailTab = 'telemetrie') => {
    setActiveAsset(assetId);
    setActiveAssetTab(targetTab);

    // Déclenchement de la navigation vers la Fiche Asset 360°
    if (navigateSectionHandler) {
      navigateSectionHandler('overview', 'ov-asset-hub');
    } else {
      navigate('/dashboard?tab=ov-asset-hub');
    }
  }, [navigate, navigateSectionHandler]);

  // Calcul dynamique et intelligent du fil d'Ariane
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const tenantName = currentTenant?.name || 'Souveraineté EU';
    const items: BreadcrumbItem[] = [
      {
        label: tenantName,
        onClick: () => {
          if (navigateSectionHandler) navigateSectionHandler('overview', 'ov-general');
          else navigate('/dashboard');
        }
      }
    ];

    const path = location.pathname;

    if (path.includes('cockpit') || path.includes('twin')) {
      items.push({ label: 'Jumeau Numérique 3D', active: true });
    } else if (path.includes('compute') || path.includes('edge')) {
      items.push({ label: 'Silicon X1 Edge AI', active: true });
    } else if (path.includes('compliance')) {
      items.push({ label: 'Gouvernance & DORA TPSP', active: true });
    } else if (path.includes('ai-studio')) {
      items.push({ label: 'Studio Artefacts IA', active: true });
    } else {
      // Dans le dashboard / overview
      items.push({
        label: activeCampus,
        onClick: () => {
          if (navigateSectionHandler) navigateSectionHandler('overview', 'ov-general');
        }
      });

      if (activeAssetId) {
        items.push({
          label: `Équipement #${activeAssetId.toUpperCase()}`,
          onClick: () => {
            if (navigateSectionHandler) navigateSectionHandler('overview', 'ov-asset-hub');
          }
        });

        const tabLabels: Record<AssetDetailTab, string> = {
          technique: 'Specs & Dossier',
          telemetrie: 'Télémétrie Live',
          maintenance: 'GMAO & Travaux',
          conformite: 'Conformité DORA',
          custom: 'Champs Métier'
        };

        items.push({
          label: tabLabels[activeAssetTab] || 'Détails',
          active: true
        });
      }
    }

    return items;
  }, [currentTenant?.name, location.pathname, activeCampus, activeAssetId, activeAssetTab, navigateSectionHandler, navigate]);

  const value = useMemo<AppContextType>(() => ({
    activeTenantId,
    activeCampus,
    activeAssetId,
    activeAssetTab,
    breadcrumbs,
    setActiveAsset,
    setActiveAssetTab,
    setActiveCampus,
    jumpToAsset,
    onNavigateSection: navigateSectionHandler || undefined,
    setOnNavigateSection,
  }), [
    activeTenantId,
    activeCampus,
    activeAssetId,
    activeAssetTab,
    breadcrumbs,
    jumpToAsset,
    navigateSectionHandler,
    setOnNavigateSection
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
