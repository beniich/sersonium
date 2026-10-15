import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ShieldAlert, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[SENSORIUM ERROR BOUNDARY CAUGHT]", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem("sensorium_auth_user");
      localStorage.removeItem("sensorium_access_token");
      localStorage.removeItem("sensorium_rbac_session");
    } catch {
      // Ignore
    }
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-[#0E0E12] border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  SENSORIUM <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">DÉGRADÉ ACTIF</span>
                </h1>
                <p className="text-xs text-gray-400">Interception par le Bouclier de Résilience Applicative</p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-200">
                    Une anomalie d'exécution a été contenue avec succès.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Pour garantir l'intégrité de vos opérations et des données sensibles, l'interface a basculé en confinement sécurisé.
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnostic collapsible */}
            {this.state.error && (
              <details className="mb-6 bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-mono text-gray-400">
                <summary className="cursor-pointer text-gray-300 font-semibold mb-2 select-none">
                  Afficher le journal de diagnostic
                </summary>
                <div className="overflow-x-auto p-2 bg-black/60 rounded text-red-300/80 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-600/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Relancer le Cockpit
              </button>

              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-medium border border-white/10 transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Retour Accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
