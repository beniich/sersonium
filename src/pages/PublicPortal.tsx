import React from "react";
import { SensoriumShowcase } from "../components/SensoriumShowcase";
import { GlobalState } from "../types";

interface PublicPortalProps {
  onSignIn: () => void;
  onEnterMockMode?: () => void;
  onNavigateToSection?: (page: string, itemId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  mode?: "system" | "light" | "dark";
  authError?: string | null;
  state?: GlobalState;
}

export default function PublicPortal({ onSignIn, onEnterMockMode, state, isDark, toggleTheme, mode, authError }: PublicPortalProps) {
  return (
    <SensoriumShowcase 
      onSignIn={onSignIn} 
      onEnterDashboard={onEnterMockMode || onSignIn}
      state={state}
      isDark={isDark}
      toggleTheme={toggleTheme}
      mode={mode}
      authError={authError}
    />
  );
}
