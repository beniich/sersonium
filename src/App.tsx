import React, { useState, useEffect, createContext, useContext, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import DashboardLayout from "./components/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import SecurityPage from "./pages/SecurityPage";
import InfrastructurePage from "./pages/InfrastructurePage";
import ComputePage from "./pages/ComputePage";
import SettingsPage from "./pages/SettingsPage";
import NetworkPage from "./pages/NetworkPage";
import ZeroTrustPage from "./pages/ZeroTrustPage";
import StoragePage from "./pages/StoragePage";
import WorkspacePage from "./pages/WorkspacePage";
import StrategyPage from "./pages/StrategyPage";
import BrandVisionPage from "./pages/BrandVisionPage";
import AdCampaignsPage from "./pages/AdCampaignsPage";
import PricingPage from "./pages/PricingPage";
import PublicPortal from "./pages/PublicPortal";
import KafkaMonitor from "./components/KafkaMonitor";
import { Loader2 } from "lucide-react";
import { useGlobalState } from "./hooks/useGlobalState";
import { initAuth, googleSignIn, logout } from "./firebase";
import type { User } from "firebase/auth";

export type ThemeMode = "system" | "light" | "dark";

export interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  theme: "dark" | "light";
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  isDark: false,
  theme: "light",
  setMode: () => {},
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export type Language = "en" | "fr";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

const getSystemPreference = (): boolean => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

export default function App() {
  const [activeItemId, setActiveItemId] = useState<string>("ov-1");
  const [activePage, setActivePage] = useState<string>("overview");
  
  // Track operating system/browser preference in real-time
  const [systemIsDark, setSystemIsDark] = useState<boolean>(getSystemPreference);

  // Preference mode: 'system' by default (auto-detect on load), or explicit 'light' / 'dark'
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cafm_theme_mode") as ThemeMode | null;
        if (stored === "system" || stored === "light" || stored === "dark") {
          return stored;
        }
      } catch {
        // Fallback
      }
    }
    return "system";
  });

  // Effective dark status
  const isDark = mode === "system" ? systemIsDark : mode === "dark";

  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const effectiveIsOnline = isOnline && !simulatedOffline;

  const [currentBrand, setCurrentBrand] = useState<"cafm" | "nanobanana">("cafm");

  // Automatically listen to OS/browser theme preference changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Initial sync
    setSystemIsDark(mediaQuery.matches);

    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  // Synchronize dark mode class and attributes across document and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeName = isDark ? "dark" : "light";

    if (isDark) {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }

    root.setAttribute("data-theme", themeName);
    body.setAttribute("data-theme", themeName);
    root.setAttribute("data-theme-mode", mode);
    body.setAttribute("data-theme-mode", mode);
    root.style.colorScheme = themeName;
    body.style.colorScheme = themeName;

    try {
      localStorage.setItem("cafm_theme_mode", mode);
      localStorage.setItem("cafm_theme", themeName);
    } catch {
      // Ignore localStorage errors in sandbox
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#070709" : "#ffffff");
    }
  }, [isDark, mode]);

  const toggleTheme = () => {
    setModeState((currentMode) => {
      if (currentMode === "system") {
        // From auto/system mode, switch to explicit mode opposite to the resolved state
        return isDark ? "light" : "dark";
      } else if (currentMode === "light") {
        return "dark";
      } else {
        // Return to auto-detect system preference
        return "system";
      }
    });
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const setTheme = (theme: "dark" | "light") => {
    setModeState(theme);
  };

  const themeContextValue = useMemo<ThemeContextType>(
    () => ({
      mode,
      isDark,
      theme: isDark ? "dark" : "light",
      setMode,
      toggleTheme,
      setTheme,
    }),
    [mode, isDark]
  );

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sensorium_language") || localStorage.getItem("cafm_language");
        if (stored) return stored as Language;
        const navLang = navigator.language.slice(0, 2);
        const defaultLang: Language = navLang === "fr" ? "fr" : "en";
        localStorage.setItem("sensorium_language", defaultLang);
        localStorage.setItem("cafm_language", defaultLang);
        return defaultLang;
      } catch {}
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("sensorium_language", lang);
      localStorage.setItem("cafm_language", lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en");
  };

  const languageContextValue = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
    }),
    [language]
  );
  
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setAuthLoading(false);
      },
      () => {
        setUser(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const [isMockMode, setIsMockMode] = useState<boolean>(() => {
    // In production, always disable mock mode
    if (process.env.NODE_ENV === "production") {
      return false;
    }
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cafm_mock_mode");
        if (stored !== null) return stored === "true";
      } catch {
        // localStorage not available
      }
    }
    // Default to false so landing page is shown to visitors
    return false;
  });

  const { 
    state, 
    loading, 
    isMock, 
    simulateTrafficSpike, 
    simulateSecurityIncident, 
    simulateNodeAlert, 
    resetMockData 
  } = useGlobalState(user?.uid || null, isMockMode);

  const toggleMockMode = () => {
    setIsMockMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem("cafm_mock_mode", String(next));
      } catch {}
      return next;
    });
  };

  const handleEnterMockMode = () => {
    setIsMockMode(true);
    try {
      localStorage.setItem("cafm_mock_mode", "true");
    } catch {}
  };

  const handleReturnToPortal = () => {
    setIsMockMode(false);
    try {
      localStorage.setItem("cafm_mock_mode", "false");
    } catch {}
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await googleSignIn();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError("The authentication window was closed before sign-in completed.");
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError("The browser blocked the popup window. Please allow popups or open the app in a new tab.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError(`This domain (${window.location.hostname}) is not authorized yet in Firebase Console > Authentication > Settings > Authorized domains.`);
      } else {
        setAuthError(err.message || "Google authentication failed. Please open the application in a new tab ('Open in new tab') at the top right.");
      }
    }
  };

  if (authLoading) {
    return (
      <ThemeContext.Provider value={themeContextValue}>
        <LanguageContext.Provider value={languageContextValue}>
          <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDark ? 'bg-[#070709] text-neutral-100' : 'bg-slate-50 text-slate-900'}`}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#F38020]" />
              <p className="text-sm font-mono text-neutral-500 tracking-widest uppercase">Checking Authentication...</p>
            </div>
          </div>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );
  }

  const handleNavigateFromPortal = (page: string, itemId: string) => {
    setActivePage(page);
    setActiveItemId(itemId);
    handleEnterMockMode();
  };

  if (!user || !state?.subscriptionTier) {
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <LanguageContext.Provider value={languageContextValue}>
        <PublicPortal
          onSignIn={handleSignIn}
          onEnterMockMode={handleEnterMockMode}
          onNavigateToSection={handleNavigateFromPortal}
          isDark={isDark}
          toggleTheme={toggleTheme}
          mode={mode}
          authError={authError}
          state={state}
        />
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}

  if (loading || !state) {
    return (
      <ThemeContext.Provider value={themeContextValue}>
        <LanguageContext.Provider value={languageContextValue}>
          <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDark ? 'bg-[#070709] text-neutral-100' : 'bg-slate-50 text-slate-900'}`}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#F38020]" />
              <p className="text-sm font-mono text-neutral-500 tracking-widest uppercase">Initializing Tenant Workspace...</p>
            </div>
          </div>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );
  }

  const renderPage = () => {
    const commonProps = {
      state,
      isDark,
      activeItemId,
      user,
      onSignIn: handleSignIn,
      onSelectTab: (id: string) => setActiveItemId(id)
    };
    switch (activePage) {
      case "overview": return <OverviewPage {...commonProps} />;
      case "strategy": return <StrategyPage {...commonProps} />;
      case "brand-vision": return <BrandVisionPage isDark={isDark} />;
      case "ad-campaigns": return <AdCampaignsPage isDark={isDark} />;
      case "security": return <SecurityPage {...commonProps} />;
      case "infrastructure": return <InfrastructurePage {...commonProps} />;
      case "compute": return <ComputePage {...commonProps} />;
      case "settings": return <SettingsPage {...commonProps} />;
      case "network": return <NetworkPage {...commonProps} />;
      case "zerotrust": return <ZeroTrustPage {...commonProps} />;
      case "storage": return <StoragePage {...commonProps} />;
      case "workspace": return <WorkspacePage {...commonProps} />;
      case "telemetry": return <KafkaMonitor {...commonProps} />;
      case "pricing": return (
        <PricingPage 
          state={state} 
          isDark={isDark} 
          onUpgradeTier={(tier) => {
            if (state) state.subscriptionTier = tier;
          }}
          onSelectTab={(id: string) => {
            setActiveItemId(id);
            setActivePage("infrastructure");
          }}
        />
      );
      default: return <OverviewPage {...commonProps} />;
    }
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <LanguageContext.Provider value={languageContextValue}>
        <DashboardLayout 
          activeItemId={activeItemId} 
          setActiveItemId={setActiveItemId}
          activePage={activePage}
          setActivePage={setActivePage}
          isDark={isDark}
          toggleTheme={toggleTheme}
          mode={mode}
          state={state}
          user={user}
          isMockMode={isMockMode || !user}
          onToggleMockMode={toggleMockMode}
          onReturnToPortal={handleReturnToPortal}
          onSignIn={handleSignIn}
          simulateTrafficSpike={simulateTrafficSpike}
          simulateSecurityIncident={simulateSecurityIncident}
          simulateNodeAlert={simulateNodeAlert}
          resetMockData={resetMockData}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full w-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </DashboardLayout>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
