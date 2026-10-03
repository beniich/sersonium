/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TactileHeader, ActiveNavPath } from '../components/TactileHeader';
import { ArchitectureView } from '../components/ArchitectureView';
import { SixPillarsView } from '../components/SixPillarsView';
import { Footer } from '../components/Footer';
import { VaultView } from '../components/VaultView';
import { PricingView } from '../components/PricingView';
import { CockpitConsoleView } from '../components/CockpitConsoleView';
import { EsgGrafanaView } from '../components/EsgGrafanaView';
import { ScheduleModal } from '../components/ScheduleModal';
import { GlobalState } from '../types';
import type { User } from 'firebase/auth';

interface PublicPortalProps {
  onSignIn: () => void;
  onEnterMockMode?: () => void;
  onNavigateToSection?: (page: string, itemId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  mode?: 'system' | 'light' | 'dark';
  authError?: string | null;
  state?: GlobalState;
  user?: User | null;
}

export default function PublicPortal({
  onSignIn,
  onEnterMockMode,
  onNavigateToSection: _onNavigateToSection,
  state: _globalState,
}: PublicPortalProps) {
  const [currentView, setCurrentView] = useState<ActiveNavPath>('architecture');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Token countdown simulation
  const [tokenCountdown, setTokenCountdown] = useState('23:59:59');

  useEffect(() => {
    let totalSec = 23 * 3600 + 59 * 60 + 59;
    const timer = setInterval(() => {
      totalSec = Math.max(0, totalSec - 1);
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      setTokenCountdown(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (path: ActiveNavPath) => {
    setCurrentView(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPillar = (pillarIndex: number) => {
    if (pillarIndex === 0 || pillarIndex === 3) {
      setCurrentView('3d-digital-twin');
    } else if (pillarIndex === 1 || pillarIndex === 5) {
      setCurrentView('cockpit');
    } else if (pillarIndex === 2) {
      setCurrentView('esg-carbon');
    } else if (pillarIndex === 4) {
      setCurrentView('grafana-observability');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterDashboard = () => {
    if (onEnterMockMode) {
      onEnterMockMode();
    } else if (onSignIn) {
      onSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf8ff] text-[#1b1b20] flex flex-col font-['Inter'] selection:bg-[#630ed4] selection:text-white">
      {/* Top Tactile Header */}
      {currentView !== 'cockpit' && (
        <TactileHeader
          activePath={currentView}
          onNavigate={handleNavigate}
          onLaunchCockpit={() => handleNavigate('cockpit')}
          onLaunchDashboard={handleEnterDashboard}
          onOpenVault={() => handleNavigate('vault')}
          tokenCountdown={tokenCountdown}
        />
      )}

      {/* VIEW 1: COCKPIT CONSOLE & 3D DIGITAL TWIN */}
      {(currentView === 'cockpit' || currentView === '3d-digital-twin') && (
        <CockpitConsoleView
          onNavigate={handleNavigate}
          onClose={() => handleNavigate('architecture')}
        />
      )}

      {/* VIEW 2: ZERO-TRUST EPHEMERAL ACCESS VAULT */}
      {currentView === 'vault' && (
        <>
          <VaultView
            onUnlockTwin={() => handleNavigate('cockpit')}
            onNavigate={handleNavigate}
          />
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* VIEW 3: PLANS TARIFAIRES & SOUSCRIPTION */}
      {currentView === 'pricing' && (
        <>
          <PricingView
            onUnlockCockpit={() => handleNavigate('cockpit')}
          />
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* VIEW 4: ESG CSRD & INDUSTRIAL GRAFANA OBSERVABILITY */}
      {(currentView === 'esg-carbon' || currentView === 'grafana-observability') && (
        <>
          <EsgGrafanaView onNavigate={handleNavigate} />
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* VIEW 5: ARCHITECTURE PIPELINE HAUTE FIDÉLITÉ (Exact design requested) */}
      {currentView === 'architecture' && (
        <div className="pt-20 flex-1 flex flex-col justify-between">
          <main className="flex-1">
            <ArchitectureView
              onNavigate={handleNavigate}
              onLaunchCockpit={() => handleNavigate('cockpit')}
            />
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
      )}

      {/* VIEW 6: LES 6 PILIERS INDUSTRIELS & BANC DE DÉPLOIEMENT (Exact design requested) */}
      {currentView === '6-core-pillars' && (
        <div className="pt-20 flex-1 flex flex-col justify-between">
          <main className="flex-1">
            <SixPillarsView
              onNavigate={handleNavigate}
              onOpenPillar={handleOpenPillar}
            />
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
      )}

      {/* Schedule Architecture Review Modal */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />
    </div>
  );
}
