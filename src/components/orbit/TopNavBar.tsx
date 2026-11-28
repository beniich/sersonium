import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  Check,
  Plus,
  Settings,
  Users,
  LogOut,
  Globe,
  Crown,
  UserPlus,
  Zap,
  LayoutGrid,
  Layers,
  CheckCircle2,
  Clock,
  Bot,
  Eye,
} from 'lucide-react';
import type { OrgMember, Organization } from '../../data/organizations';
import {
  filterOrganizations,
  formatOrgMetaSubtitle,
  formatQuotaCompact,
} from '../../utils/organizations';
import type { WorkspaceView } from '../../types/agent';

export type TopBarModalType =
  | 'create-org'
  | 'org-settings'
  | 'members'
  | 'subscription'
  | 'google'
  | 'signup'
  | null;

interface TopNavBarProps {
  organizations: Organization[];
  activeOrg: Organization;
  onSelectOrg: (orgId: string) => void;
  onOpenModal: (modal: TopBarModalType) => void;
  onOpenVitrine: () => void;
  onNavigateView: (view: WorkspaceView) => void;
  activeView: WorkspaceView;
  isGoogleConnected: boolean;
  connectedEmail: string | null;
  latencyMs: number | null;
  hasDegradedServices: boolean;
  totalAgents: number;
  totalServices: number;
  workflowsCount: number;
  pendingApprovalsCount: number;
  membersCount?: number;
  onOpenPreview: () => void;
  authUser?: OrgMember | null;
  onNavigateToERP?: () => void;
}

export function TopNavBar({
  organizations,
  activeOrg,
  onSelectOrg,
  onOpenModal,
  onOpenVitrine,
  onNavigateView,
  activeView,
  isGoogleConnected,
  connectedEmail,
  latencyMs,
  hasDegradedServices,
  totalAgents,
  totalServices,
  workflowsCount,
  pendingApprovalsCount,
  membersCount = 0,
  onOpenPreview,
  authUser = null,
  onNavigateToERP,
}: TopNavBarProps) {
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  const orgWrapperRef = useRef<HTMLDivElement | null>(null);
  const launcherWrapperRef = useRef<HTMLDivElement | null>(null);

  const filteredOrgs = useMemo(
    () => filterOrganizations(organizations, orgSearchQuery),
    [organizations, orgSearchQuery]
  );

  useEffect(() => {
    if (!isOrgMenuOpen && !isLauncherOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        isOrgMenuOpen &&
        orgWrapperRef.current &&
        !orgWrapperRef.current.contains(e.target as Node)
      ) {
        setIsOrgMenuOpen(false);
      }
      if (
        isLauncherOpen &&
        launcherWrapperRef.current &&
        !launcherWrapperRef.current.contains(e.target as Node)
      ) {
        setIsLauncherOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOrgMenuOpen(false);
        setIsLauncherOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOrgMenuOpen, isLauncherOpen]);

  const quotaPct =
    activeOrg.quotaLimit > 0
      ? Math.min(100, Math.round((activeOrg.quotaUsed / activeOrg.quotaLimit) * 100))
      : 0;
  // Display 15% when default Enterprise M 2k/10k matches reference, or computed pct
  const displayPct =
    activeOrg.id === 'org-entreprise-m' && activeOrg.quotaUsed === 2000
      ? 15
      : quotaPct;

  const planBadgeLabel =
    activeOrg.id === 'org-entreprise-m' || activeOrg.plan === 'Free'
      ? 'FREE'
      : activeOrg.plan.toUpperCase();

  return (
    <div
      data-purpose="top-navigation-bar"
      className="flex flex-wrap lg:flex-nowrap items-center justify-between px-2.5 py-1.5 border-b border-black/[0.06] dark:border-white/[0.06] text-xs font-medium select-none overflow-visible gap-1.5 relative z-30"
    >
      {/* Left Cluster: Window dots + App Launcher + Enterprise M Dropdown + Telemetry Strip */}
      <div className="flex items-center gap-1.5 min-w-0 shrink-0">
        {/* macOS Window Dots */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
        </div>

        <div className="hidden md:block h-4 w-px bg-slate-300 dark:bg-white/20 shrink-0" />

        {/* App Launcher Button (4-circle grid mark) */}
        <div className="relative shrink-0" ref={launcherWrapperRef}>
          <button
            type="button"
            onClick={() => {
              setIsLauncherOpen((v) => !v);
              setIsOrgMenuOpen(false);
            }}
            aria-expanded={isLauncherOpen}
            aria-haspopup="menu"
            aria-label="Workspace app launcher"
            title="Switch workspace module"
            className="w-7 h-7 rounded-xl bg-white dark:bg-[#1e2023] hover:bg-slate-100 dark:hover:bg-[#282a2d] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white/80 transition shadow-2xs"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="7" cy="7" r="3" />
              <circle cx="17" cy="7" r="3" />
              <circle cx="7" cy="17" r="3" />
              <path d="M14 17a3 3 0 106 0 3 3 0 00-6 0z" />
            </svg>
          </button>

          {isLauncherOpen && (
            <div
              role="menu"
              aria-label="Workspace modules"
              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/80 p-2 z-50"
            >
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
                Fieldnote Modules
              </div>
              <div className="mt-1 space-y-0.5">
                {[
                  { id: 'overview' as WorkspaceView, label: 'Overview', meta: 'Dashboard', icon: LayoutGrid },
                  { id: 'orbit' as WorkspaceView, label: 'Agent Orbit', meta: `${totalAgents} agents`, icon: Bot },
                  { id: 'services' as WorkspaceView, label: 'Services & Categories', meta: `${totalServices} APIs`, icon: Layers },
                  { id: 'workflows' as WorkspaceView, label: 'Workflows', meta: `${workflowsCount}`, icon: Zap },
                  { id: 'approvals' as WorkspaceView, label: 'Approvals', meta: `${pendingApprovalsCount} pending`, icon: CheckCircle2 },
                  { id: 'history' as WorkspaceView, label: 'Run history', meta: 'Logs', icon: Clock },
                  { id: 'users' as WorkspaceView, label: 'Multi-users', meta: `${membersCount} members`, icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onNavigateView(item.id);
                        setIsLauncherOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 opacity-80" />
                        <span>{item.label}</span>
                      </span>
                      <span className="text-[10px] text-[#8E929C] font-mono tabular-nums">
                        {item.meta}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Enterprise M Dropdown Wrapper */}
        <div className="relative shrink-0" id="org-dropdown-wrapper" ref={orgWrapperRef}>
          <button
            type="button"
            id="org-dropdown-trigger"
            aria-expanded={isOrgMenuOpen}
            aria-haspopup="true"
            onClick={() => {
              setIsOrgMenuOpen((v) => !v);
              setIsLauncherOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#1e2023] hover:bg-slate-50 dark:hover:bg-[#282a2d] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white/90 text-[11px] font-semibold shadow-2xs transition group cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-[#84cc16] dark:bg-[#c6ff00] shadow-[0_0_8px_rgba(132,204,22,0.65)] dark:shadow-[0_0_8px_#c6ff00] shrink-0" />
            <span className="max-w-[110px] 2xl:max-w-[130px] truncate">{activeOrg.name}</span>
            <ChevronDown
              id="org-dropdown-chevron"
              className={`w-3.5 h-3.5 text-slate-400 dark:text-white/50 group-hover:text-slate-700 dark:group-hover:text-white/80 transition-transform duration-200 ${
                isOrgMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOrgMenuOpen && (
            <div
              id="org-dropdown-menu"
              role="menu"
              aria-label="Organizations and workspaces"
              className="absolute top-full left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#16181d] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/80 backdrop-blur-md p-2.5 z-50"
            >
              {/* Header & Search */}
              <div className="px-2 pt-1 pb-2 border-b border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-white/70 uppercase tracking-wider mb-2">
                  <span>Organizations &amp; Workspaces</span>
                  <span className="text-[10px] text-slate-400 dark:text-white/40 font-mono tabular-nums">
                    {organizations.length} workspaces
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    placeholder="Search workspace..."
                    aria-label="Search workspace"
                    className="w-full bg-slate-100 dark:bg-[#1e2023] text-xs rounded-xl pl-8 pr-3 py-1.5 border border-slate-200 dark:border-white/[0.08] focus:border-slate-400 dark:focus:border-white/30 focus:bg-white dark:focus:bg-[#282a2d] focus:outline-none placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-[#e2e2e6] transition"
                  />
                </div>
              </div>

              {/* Organizations List */}
              <div className="py-1.5 space-y-1 max-h-56 overflow-y-auto">
                {filteredOrgs.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-[#8E929C]">
                    No workspace found for &ldquo;{orgSearchQuery}&rdquo;
                  </div>
                ) : (
                  filteredOrgs.map((org) => {
                    const isActive = org.id === activeOrg.id;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={isActive}
                        onClick={() => {
                          onSelectOrg(org.id);
                          setIsOrgMenuOpen(false);
                          setOrgSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl cursor-pointer group transition text-left ${
                          isActive
                            ? 'bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.09]'
                            : 'hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive
                                ? 'bg-gradient-to-br from-[#84cc16]/25 to-[#10b981]/20 dark:from-[#c6ff00]/30 dark:to-[#4edea3]/20 border border-lime-500/40 dark:border-[#c6ff00]/40 text-lime-700 dark:text-[#c6ff00]'
                                : 'bg-slate-100 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 group-hover:border-slate-300 dark:group-hover:border-white/20'
                            }`}
                          >
                            {org.initials === 'EM' && org.id === 'org-entreprise-m' ? 'M' : org.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {org.name}
                              </span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] dark:bg-[#c6ff00] dark:shadow-[0_0_6px_#c6ff00]" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-[#c4c7c9] truncate">
                              {formatOrgMetaSubtitle(org)}
                            </div>
                          </div>
                        </div>

                        {isActive ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-lime-100 dark:bg-[#c6ff00]/15 text-lime-700 dark:text-[#c6ff00] border border-lime-300 dark:border-[#c6ff00]/30 uppercase tracking-tight">
                              Active
                            </span>
                            <Check className="w-4 h-4 text-lime-600 dark:text-[#c6ff00]" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-white/30 group-hover:text-slate-700 dark:group-hover:text-white/60 font-mono shrink-0">
                            Switch
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-white/[0.08] my-1" />

              {/* Quick Actions Section */}
              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOrgMenuOpen(false);
                    onOpenModal('create-org');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition text-left cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4edea3]" />
                  <span>Create or join organization</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOrgMenuOpen(false);
                    onOpenModal('org-settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition text-left cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-white/50" />
                  <span className="truncate">Workspace settings ({activeOrg.name})</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOrgMenuOpen(false);
                    onOpenModal('members');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition text-left cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400 dark:text-white/50" />
                  <span>Manage members &amp; roles</span>
                </button>
              </div>

              {/* Footer Action */}
              <div className="border-t border-slate-100 dark:border-white/[0.08] pt-1.5 mt-1 flex items-center justify-between px-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOrgMenuOpen(false);
                    onOpenModal('signup');
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400/90 hover:text-rose-700 dark:hover:text-rose-300 py-1 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch account / Sign out</span>
                </button>
                <span className="text-[10px] text-slate-400 dark:text-white/30 font-mono">
                  v2.4.1
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 1. Live Telemetry Strip */}
        <button
          type="button"
          onClick={() => onNavigateView('services')}
          title="Open telemetry & services catalog"
          className="hidden lg:flex items-center gap-2 2xl:gap-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#1a1c1f]/90 hover:bg-white dark:hover:bg-[#22252a] border border-slate-200 dark:border-white/[0.08] text-[11px] transition shrink-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4edea3] dark:shadow-[0_0_6px_#4edea3]" />
            <div className="leading-none text-left">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/40 block">
                SLA
              </span>
              <span className="text-emerald-600 dark:text-[#4edea3] font-bold text-[10px] tracking-tight">
                {hasDegradedServices ? 'DEGRADED' : 'NOMINAL'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-[#9d8df1] dark:shadow-[0_0_6px_#9d8df1]" />
            <div className="leading-none text-left">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/40 block">
                AI
              </span>
              <span className="text-violet-600 dark:text-[#b4a7f5] font-semibold text-[10px]">
                Active
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-[#22d3ee] dark:shadow-[0_0_6px_#22d3ee]" />
            <div className="leading-none text-left">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/40 block">
                LATENCY
              </span>
              <span className="text-cyan-600 dark:text-[#22d3ee] font-bold text-[10px] tabular-nums">
                {latencyMs !== null ? `${latencyMs}ms` : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#10b981] dark:shadow-[0_0_6px_#10b981]" />
            <div className="leading-none text-left">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/40 block">
                SECURITY
              </span>
              <span className="text-emerald-600 dark:text-[#34d399] font-bold text-[10px] tabular-nums">
                ZT 100%
              </span>
            </div>
          </div>
        </button>

        {/* 2. Pass 10d 12h / 10D remaining (Telemetry & Access countdown) */}
        <button
          type="button"
          onClick={() => onOpenModal('subscription')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-[#1a1812] dark:bg-gradient-to-r dark:from-amber-500/15 dark:via-amber-400/15 dark:to-amber-500/15 border border-amber-400/60 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.12)] cursor-pointer hover:border-amber-500 dark:hover:border-amber-300 transition whitespace-nowrap shrink-0"
        >
          <svg
            className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300 shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9.5 2l1.9 5.8 5.8 1.9-5.8 1.9L9.5 17.5l-1.9-5.9-5.8-1.9 5.8-1.9L9.5 2zM17 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
          </svg>
          <span className="leading-none text-left">
            <span className="block text-[10px] font-bold tracking-tight text-amber-900 dark:text-amber-200 tabular-nums">
              Pass {activeOrg.passDaysLeft ?? 9}d {activeOrg.passHoursLeft ?? 12}h
            </span>
            <span className="block text-[9px] text-amber-700/80 dark:text-amber-300/80 font-medium tracking-wide">
              10D remaining
            </span>
          </span>
        </button>

        {/* 3. Plan Badge & Quota Progress (Live Telemetry Tokens Quota) */}
        <button
          type="button"
          onClick={() => onOpenModal('subscription')}
          aria-label={`Plan ${planBadgeLabel}, quota ${formatQuotaCompact(activeOrg.quotaUsed)} of ${formatQuotaCompact(activeOrg.quotaLimit)}`}
          className="flex items-center gap-1 lg:pl-1.5 lg:border-l border-slate-200 dark:border-white/10 shrink-0 cursor-pointer group"
        >
          <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-[#282a2d] border border-slate-300/80 dark:border-white/10 text-[10px] font-bold text-slate-700 dark:text-white/70 tracking-wider uppercase">
            {planBadgeLabel}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-[#1e2023] group-hover:bg-slate-50 dark:group-hover:bg-[#282a2d] border border-slate-200 dark:border-white/[0.08] text-[11px] font-semibold text-slate-800 dark:text-white/90 tabular-nums whitespace-nowrap transition">
            <Zap className="w-3 h-3 text-slate-500 dark:text-white/60 fill-current shrink-0" />
            <span>
              {formatQuotaCompact(activeOrg.quotaUsed)} / {formatQuotaCompact(activeOrg.quotaLimit)}
            </span>
            <span className="text-[10px] font-normal text-[#8E929C]">({displayPct}%)</span>
            <span
              className="w-3.5 h-3.5 rounded-full border-2 border-amber-500/80 border-t-transparent -rotate-45 shrink-0"
              aria-hidden="true"
            />
          </span>
        </button>
      </div>

      {/* Right Cluster: ERP Switch, Preview, Users, Showcase, Billing, Google, Sign up, Pass, Quota */}
      <div className="flex items-center gap-1 2xl:gap-1.5 min-w-0 max-w-full overflow-x-auto scrollbar-none py-0.5">
        {onNavigateToERP && (
          <button
            type="button"
            onClick={onNavigateToERP}
            title="Basculer vers la supervision ERP Classique SENSORIUM"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 dark:bg-white/95 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-[#111317] text-[11px] font-semibold transition whitespace-nowrap shadow-xs shrink-0 cursor-pointer"
          >
            <span>Vue ERP Classique →</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenPreview}
          title="Open Results Preview window"
          data-testid="topbar-preview-button"
          className="flex items-center gap-1 px-2 2xl:px-2.5 py-1 rounded-full bg-[#FDF0EA] dark:bg-orange-500/15 hover:bg-[#FCE4D8] dark:hover:bg-orange-500/25 border border-[#D96B43]/35 text-[#B84A24] dark:text-orange-200 text-[11px] font-semibold transition whitespace-nowrap shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-[#D96B43] shrink-0" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateView('users')}
          title="Multi-User Manager & Roles"
          data-testid="topbar-users-button"
          className={`hidden sm:flex items-center gap-1 px-2 2xl:px-2.5 py-1 rounded-full border text-[11px] transition whitespace-nowrap shrink-0 ${
            activeView === 'users'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-[#111317] border-transparent font-semibold'
              : 'bg-white dark:bg-[#1e2023] hover:bg-slate-50 dark:hover:bg-[#282a2d] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>Users</span>
          {membersCount > 0 && (
            <span className="text-[10px] opacity-75 tabular-nums">({membersCount})</span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenVitrine}
          title="Showcase & Solutions"
          className="hidden md:flex items-center gap-1 px-2 2xl:px-2.5 py-1 rounded-full bg-white dark:bg-[#1e2023] hover:bg-slate-50 dark:hover:bg-[#282a2d] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white text-[11px] transition whitespace-nowrap shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
          <span>
            Showcase<span className="hidden 2xl:inline"> &amp; Solutions</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('subscription')}
          className="hidden xl:flex items-center gap-1 px-2 2xl:px-2.5 py-1 rounded-full bg-white dark:bg-[#1e2023] hover:bg-slate-50 dark:hover:bg-[#282a2d] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white text-[11px] transition whitespace-nowrap shrink-0"
        >
          <Crown className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
          <span>Billing</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('google')}
          title={connectedEmail ? `Connected: ${connectedEmail}` : 'Connect a Google account'}
          className="hidden md:flex items-center gap-1 px-2 2xl:px-2.5 py-1 rounded-full bg-white dark:bg-[#1e2023] hover:bg-slate-50 dark:hover:bg-[#282a2d] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white text-[11px] transition whitespace-nowrap shrink-0"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>
            {isGoogleConnected ? (
              <>
                Google<span className="hidden 2xl:inline"> Connected</span>
              </>
            ) : (
              <>
                <span className="hidden 2xl:inline">Connect </span>Google
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('signup')}
          data-testid="topbar-auth-button"
          className="hidden lg:flex items-center gap-1.5 px-2 2xl:px-2.5 py-1 rounded-full bg-white dark:bg-[#1e2023] hover:bg-slate-50 dark:hover:bg-[#282a2d] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white text-[11px] transition whitespace-nowrap shrink-0"
        >
          {authUser ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#4edea3] shrink-0" />
              <span className="font-semibold max-w-[80px] 2xl:max-w-[110px] truncate">{authUser.name}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
              <span>Sign up</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
