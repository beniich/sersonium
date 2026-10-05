/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PublicPortal — Spider CAFM Landing Page (Design from nat---spider-cafm)
 * Fused into sersonium: keeps Firebase auth logic, gains new UI.
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { TactileHeader, ActiveNavPath } from '../components/TactileHeader';
import { Hero } from '../components/Hero';
import { SixPillars } from '../components/SixPillars';
import { PipelineArchitecture } from '../components/PipelineArchitecture';
import { MetricsAndCompliance } from '../components/MetricsAndCompliance';
import { CtaSection } from '../components/CtaSection';
import { Footer } from '../components/Footer';
import { ScheduleModal } from '../components/ScheduleModal';
import { TelemetryMetrics, SpatialNode, GlobalState } from '../types';
import type { User } from 'firebase/auth';

// Lazy-load heavier interactive sub-views on demand to make landing page load instant
const CockpitConsoleView = lazy(() => import('../components/CockpitConsoleView').then(m => ({ default: m.CockpitConsoleView })));
const VaultView = lazy(() => import('../components/VaultView').then(m => ({ default: m.VaultView })));
const PricingView = lazy(() => import('../components/PricingView').then(m => ({ default: m.PricingView })));
const EsgGrafanaView = lazy(() => import('../components/EsgGrafanaView').then(m => ({ default: m.EsgGrafanaView })));

interface PublicPortalProps {
  onSignIn: () => void;
  onSignOut?: () => void;
  onEnterMockMode?: () => void;
  onNavigateToSection?: (page: string, itemId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  mode?: 'system' | 'light' | 'dark';
  authError?: string | null;
  state?: GlobalState;
  user?: User | null;
  initialView?: ActiveNavPath;
  isEmbedded?: boolean;
  onUpgradeTier?: (tier: any) => void;
}

export default function PublicPortal({
  onSignIn,
  onSignOut,
  onEnterMockMode,
  onNavigateToSection: _onNavigateToSection,
  state: _globalState,
  user,
  initialView = 'architecture',
  isEmbedded = false,
  onUpgradeTier,
}: PublicPortalProps) {
  const [currentView, setCurrentView] = useState<ActiveNavPath>(initialView);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    if (initialView && initialView !== currentView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  // Live telemetry metrics
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    energyDeltaPercent: -34.8,
    ashraeBaselineKwh: 14820,
    currentLoadKwh: 9660,
    copFactor: 6.22,
    healthScore: 98.4,
    carbonAbatedTco2e: 4120,
    activeEdgeNodes: 14890,
    ingestionRps: 1420500,
    edgeLatencyMs: 0.4,
  });

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

  // Poll live telemetry or apply subtle realistic jitter
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry/snapshot');
        if (res.ok) {
          const data = await res.json();
          if (data.metrics) {
            setMetrics((prev) => ({ ...prev, ...data.metrics }));
          }
        }
      } catch {
        setMetrics((prev) => ({
          ...prev,
          ingestionRps: Math.floor(1420000 + Math.random() * 2500),
          edgeLatencyMs: Number((0.38 + Math.random() * 0.05).toFixed(2)),
        }));
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path: ActiveNavPath | 'dashboard') => {
    if (path === 'dashboard') {
      handleEnterDashboard();
      return;
    }
    setCurrentView(path as ActiveNavPath);
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

  const handleSelectNode = (_node: SpatialNode) => {
    setCurrentView('3d-digital-twin');
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
    <div className={`min-h-screen bg-[#fbf8ff] text-[#1b1b20] flex flex-col font-['Inter'] selection:bg-[#630ed4] selection:text-white ${isEmbedded ? 'rounded-2xl overflow-hidden' : ''}`}>

      {/* Top Tactile Header (shared across all views) */}
      {currentView !== 'cockpit' && (
        <TactileHeader
          activePath={currentView}
          onNavigate={handleNavigate}
          onLaunchCockpit={() => handleNavigate('cockpit')}
          onLaunchDashboard={handleEnterDashboard}
          onOpenVault={() => handleNavigate('vault')}
          tokenCountdown={tokenCountdown}
          isEmbedded={isEmbedded}
          user={user}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          subscriptionTier={_globalState?.subscriptionTier || 'free'}
          onOpenPricing={() => handleNavigate('pricing')}
        />
      )}

      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      }>
        {/* VIEW 1 — COCKPIT CONSOLE & 3D DIGITAL TWIN */}
        {(currentView === 'cockpit' || currentView === '3d-digital-twin') && (
          <CockpitConsoleView
            onNavigate={handleNavigate}
            onClose={() => handleNavigate('architecture')}
            isEmbedded={isEmbedded}
          />
        )}

        {/* VIEW 2 — ZERO-TRUST EPHEMERAL ACCESS VAULT */}
        {currentView === 'vault' && (
          <>
            <VaultView
              onUnlockTwin={() => handleNavigate('cockpit')}
              onNavigate={handleNavigate}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        )}

        {/* VIEW 3 — PLANS TARIFAIRES & SOUSCRIPTION */}
        {currentView === 'pricing' && (
          <>
            <PricingView
              onUnlockCockpit={() => handleNavigate('cockpit')}
              user={user}
              onSignIn={onSignIn}
              onUpgradeTier={onUpgradeTier}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        )}

        {/* VIEW 4 — ESG CSRD & INDUSTRIAL GRAFANA OBSERVABILITY */}
        {(currentView === 'esg-carbon' || currentView === 'grafana-observability') && (
          <>
            <EsgGrafanaView onNavigate={handleNavigate} />
            <Footer onNavigate={handleNavigate} />
          </>
        )}
      </Suspense>

      {/* VIEW 5 — ARCHITECTURE & SYSTEM TOPOLOGY / 6 PILLARS (nat---spider-cafm design) */}
      {(currentView === 'architecture' || currentView === '6-core-pillars') && (
        <div className={isEmbedded ? "pt-4" : "pt-20"}>
          <main className="flex-1">
            {/* Hero with 3D Canvas & Live Metrics */}
            <Hero
              onExploreDigitalTwin={() => handleNavigate('3d-digital-twin')}
              onExploreArchitecture={() => {
                const el = document.getElementById('architecture');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectNode={handleSelectNode}
              metrics={metrics}
            />

            {/* The 6 Pillars of Spider CAFM */}
            <SixPillars onOpenPillar={handleOpenPillar} />

            {/* Pipeline Architecture & TypeScript Schema */}
            <PipelineArchitecture />

            {/* Metrics & Compliance Seals */}
            <MetricsAndCompliance />

            {/* Deploy in 48 Hours CTA */}
            <CtaSection onOpenSchedule={() => setIsScheduleOpen(true)} />
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

