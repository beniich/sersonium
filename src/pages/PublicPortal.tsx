import React from "react";
import { SensoriumShowcase } from "../components/SensoriumShowcase";
import { GlobalState } from "../types";
import type { User } from "firebase/auth";

interface PublicPortalProps {
  onSignIn: () => void;
  onEnterMockMode?: () => void;
  onNavigateToSection?: (page: string, itemId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  mode?: "system" | "light" | "dark";
  authError?: string | null;
  state?: GlobalState;
  user?: User | null;
}

export default function PublicPortal({ onSignIn, onEnterMockMode, onNavigateToSection, state, isDark, toggleTheme, mode, authError, user }: PublicPortalProps) {
  return (
    <SensoriumShowcase 
      onSignIn={onSignIn} 
      onEnterDashboard={onEnterMockMode || onSignIn}
      onNavigateToSection={onNavigateToSection}
      state={state}
      isDark={isDark}
      toggleTheme={toggleTheme}
      mode={mode}
      authError={authError}
      user={user}
    />
  );
}
