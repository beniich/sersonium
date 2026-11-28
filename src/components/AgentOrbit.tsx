// src/components/AgentOrbit.tsx
// SENSORIUM AI — Nouveau Dashboard Fieldnote & Agent Orbit 36
// Intégration complète fidèle à new26_11 (TopNavBar, Dock, Sidebar, Multi-vues, Zero-Trust ZT 100%, Services 128)

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTheme } from '../App';
import {
  Plus,
  History,
  Sun,
  Moon,
  Filter,
  Check,
  LayoutGrid,
  Zap,
  Puzzle,
  BarChart3,
  Settings,
  Home,
  CheckCircle2,
  Clock,
  Folder,
  ChevronDown,
  ChevronRight,
  Search,
  RefreshCw,
  Menu,
  X,
  Bot,
  ChevronsUpDown,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
} from 'lucide-react';
import { initialGroups } from '../data/initialGroups';
import { initialApprovals, initialWorkflows } from '../data/fieldnoteSeed';
import {
  SENSORIUM_RUBRIQUES,
  SENSORIUM_TOTAL_SERVICES,
} from '../data/sensoriumCatalog';
import type {
  Agent,
  AgentIconKey,
  ApprovalItem,
  Group,
  RunRecord,
  SensoriumRubrique,
  StatusFilter,
  TimeframeOption,
  WorkflowItem,
  WorkflowStatus,
  WorkspaceView,
} from '../types/agent';
import {
  computeOrchestratorStats,
  filterGroups,
  updateAgentInGroups,
} from '../utils/orchestrator';
import { buildStatusSummary, parseOrbitOrder } from '../utils/commandParser';
import { OrbitDiagram } from './orbit/OrbitDiagram';
import { OrbitCommandBar, type CommandFeedbackState } from './orbit/OrbitCommandBar';
import { AgentSidePanel } from './orbit/AgentSidePanel';
import { AgentResultModal } from './orbit/AgentResultModal';
import { AgentPreviewModal } from './orbit/AgentPreviewModal';
import { CreateAgentModal } from './orbit/CreateAgentModal';
import { CreateWorkflowModal } from './orbit/CreateWorkflowModal';
import { RunHistoryView } from './orbit/RunHistoryView';
import { FieldnoteOverview } from './orbit/FieldnoteOverview';
import { WorkflowsView } from './orbit/WorkflowsView';
import { ApprovalsView } from './orbit/ApprovalsView';
import { ServicesCatalogView } from './orbit/ServicesCatalogView';
import { RubriqueIcon } from './orbit/RubriqueIcon';
import { CommandPaletteModal } from './orbit/CommandPaletteModal';
import { TopNavBar, type TopBarModalType } from './orbit/TopNavBar';
import { TopBarModals } from './orbit/TopBarModals';
import { MultiUsersView } from './orbit/MultiUsersView';
import {
  INITIAL_MEMBERS,
  INITIAL_ORGANIZATIONS,
  type OrgMember,
  type OrgPlan,
  type Organization,
} from '../data/organizations';
import {
  type AuthSessionSnapshot,
  authApi,
  getAuthSnapshot,
  orgsApi,
  secureFetch,
  subscribeAuth,
  syncSessionOrganization,
} from '../services/orbitApiClient';
import { authService } from '../services/auth.service';

const FILTER_OPTIONS: { value: StatusFilter; label: string; dotClass: string }[] = [
  { value: 'all', label: 'All Agents', dotClass: 'bg-slate-400' },
  { value: 'highlighted', label: 'Priority', dotClass: 'bg-[#D96B43]' },
  { value: 'active', label: 'Active', dotClass: 'bg-sky-500' },
  { value: 'idle', label: 'Idle', dotClass: 'bg-slate-300 dark:bg-slate-600' },
  { value: 'running', label: 'Running', dotClass: 'bg-amber-500' },
  { value: 'success', label: 'Succeeded', dotClass: 'bg-emerald-500' },
  { value: 'error', label: 'Failed', dotClass: 'bg-red-500' },
];

const VIEW_LABELS: Record<WorkspaceView, { crumb: string; title: string }> = {
  overview: { crumb: 'OVERVIEW', title: 'Overview' },
  orbit: { crumb: 'AGENT ORBIT', title: 'Agent Orbit' },
  services: { crumb: 'SERVICES · 128', title: 'Services & Categories' },
  workflows: { crumb: 'WORKFLOWS', title: 'Workflows' },
  approvals: { crumb: 'APPROVALS', title: 'Needs you' },
  history: { crumb: 'RUN HISTORY', title: 'Run history' },
  users: { crumb: 'MULTI-USERS', title: 'Multi-User Manager' },
};

export interface AgentOrbitProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  onNavigateToERP?: () => void;
  user?: any;
}

export default function AgentOrbit({
  isDark: isDarkProp,
  onToggleTheme,
  onNavigateToERP,
  user,
}: AgentOrbitProps) {
  // Synchronisation utilisateur connecté Firebase / SENSORIUM
  const effectiveUser = useMemo(() => {
    if (user) return user;
    return authService.getSession().user;
  }, [user]);

  // Synchronisation avec le ThemeContext global de SENSORIUM
  const themeContext = useTheme();

  const [localIsDark, setLocalIsDark] = useState<boolean>(() => {
    if (isDarkProp !== undefined) return isDarkProp;
    try {
      const saved = localStorage.getItem('theme') || localStorage.getItem('cafm_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return true;
    } catch {
      return true;
    }
  });

  const isDark = isDarkProp !== undefined
    ? isDarkProp
    : (themeContext?.isDark !== undefined ? themeContext.isDark : localIsDark);

  const handleToggleTheme = useCallback(() => {
    if (onToggleTheme) {
      onToggleTheme();
    } else if (themeContext?.toggleTheme) {
      themeContext.toggleTheme();
    } else {
      setLocalIsDark((d) => !d);
    }
  }, [onToggleTheme, themeContext]);

  const [activeView, setActiveView] = useState<WorkspaceView>('overview');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('today');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fieldnote_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isFinanceExpanded, setIsFinanceExpanded] = useState(true);
  const [isRubriquesExpanded, setIsRubriquesExpanded] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);
  const [selectedRubriqueId, setSelectedRubriqueId] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<SensoriumRubrique['pillar'] | null>(null);

  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initialWorkflows);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);
  const [lastRun, setLastRun] = useState<RunRecord | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
  const [decidingApprovalId, setDecidingApprovalId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);
  const [selectedRunForConclusion, setSelectedRunForConclusion] = useState<RunRecord | null>(null);
  const [selectedRunForPreview, setSelectedRunForPreview] = useState<RunRecord | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandFeedback, setCommandFeedback] = useState<CommandFeedbackState | null>(null);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [activeOrgId, setActiveOrgId] = useState<string>(INITIAL_ORGANIZATIONS[0].id);
  const [members, setMembers] = useState<OrgMember[]>(INITIAL_MEMBERS);
  const [topBarModal, setTopBarModal] = useState<TopBarModalType>(null);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<AuthSessionSnapshot>(() => getAuthSnapshot());
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => Boolean(effectiveUser));
  const [connectedEmail, setConnectedEmail] = useState<string | null>(() => effectiveUser?.email || 'beniich.contact@gmail.com');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [operatorProfile, setOperatorProfile] = useState<{
    name: string;
    initials: string;
    role: string;
  }>(() => {
    if (effectiveUser) {
      const name = effectiveUser.displayName || effectiveUser.email?.split('@')[0] || 'Opérateur';
      const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
      const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
      return { name, initials, role: effectiveUser.role || 'Operator' };
    }
    return { name: 'Dana Kim', initials: 'DK', role: 'Operations' };
  });

  // Mise à jour de l'identité lorsque effectiveUser change
  useEffect(() => {
    if (effectiveUser) {
      const name = effectiveUser.displayName || effectiveUser.email?.split('@')[0] || 'Opérateur';
      const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
      const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
      setOperatorProfile({ name, initials, role: effectiveUser.role || 'Operator' });
      setConnectedEmail(effectiveUser.email || null);
      setIsGoogleConnected(true);
    }
  }, [effectiveUser]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return subscribeAuth((snap) => {
      setAuthSession(snap);
      if (snap.user) {
        setOperatorProfile({
          name: snap.user.name,
          initials: snap.user.initials,
          role: snap.user.role,
        });
        setConnectedEmail(snap.user.email);
      }
      if (snap.organization) {
        const syncedOrg = snap.organization;
        setOrganizations((prev) => {
          const exists = prev.some((o) => o.id === syncedOrg.id);
          return exists
            ? prev.map((o) => (o.id === syncedOrg.id ? syncedOrg : o))
            : [syncedOrg, ...prev];
        });
        setActiveOrgId(syncedOrg.id);
      }
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeName = isDark ? 'dark' : 'light';
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    root.setAttribute('data-theme', themeName);
    body.setAttribute('data-theme', themeName);
    try {
      localStorage.setItem('theme', themeName);
      localStorage.setItem('cafm_theme', themeName);
    } catch {}
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('fieldnote_sidebar_collapsed', String(isSidebarCollapsed));
    } catch {}
  }, [isSidebarCollapsed]);

  // Global Cmd+K / Ctrl+K shortcut for Command Palette
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const hydrateState = async (measureLatency = false) => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      if (measureLatency) {
        setLatencyMs(Math.max(1, Math.round(performance.now() - start)));
      }
      const data = (await res.json()) as {
        groups?: Group[];
        runHistory?: RunRecord[];
        workflows?: WorkflowItem[];
        approvals?: ApprovalItem[];
      };
      if (Array.isArray(data.groups)) setGroups(data.groups);
      if (Array.isArray(data.runHistory)) setRunHistory(data.runHistory);
      if (Array.isArray(data.workflows)) setWorkflows(data.workflows);
      if (Array.isArray(data.approvals)) setApprovals(data.approvals);
    } catch {
      // retain current state if offline
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void hydrateState();
  }, []);

  useEffect(() => {
    if (!actionBanner) return;
    const timer = window.setTimeout(() => setActionBanner(null), 5000);
    return () => window.clearTimeout(timer);
  }, [actionBanner]);

  const selectedContext = useMemo(() => {
    if (!selectedAgentId) return null;
    for (const group of groups) {
      const found = group.agents.find((a) => a.id === selectedAgentId);
      if (found) return { agent: found, group };
    }
    return null;
  }, [groups, selectedAgentId]);

  const stats = useMemo(
    () => computeOrchestratorStats(groups, runHistory),
    [groups, runHistory]
  );

  const filterResult = useMemo(
    () => filterGroups(groups, '', statusFilter),
    [groups, statusFilter]
  );

  const statusCounts = useMemo<Record<StatusFilter, number>>(() => {
    const idleCount =
      stats.totalAgents -
      stats.activeCount -
      stats.runningCount -
      stats.successCount -
      stats.errorCount;
    return {
      all: stats.totalAgents,
      highlighted: stats.highlightedCount,
      active: stats.activeCount,
      idle: Math.max(0, idleCount),
      running: stats.runningCount,
      success: stats.successCount,
      error: stats.errorCount,
    };
  }, [stats]);

  const activeFilterOption = useMemo(
    () => FILTER_OPTIONS.find((opt) => opt.value === statusFilter) ?? FILTER_OPTIONS[0],
    [statusFilter]
  );

  const pendingApprovalsCount = useMemo(
    () => approvals.filter((a) => a.status === 'pending').length,
    [approvals]
  );

  const activeOrg = useMemo(
    () => organizations.find((o) => o.id === activeOrgId) ?? organizations[0],
    [organizations, activeOrgId]
  );

  const hasDegradedServices = useMemo(
    () =>
      SENSORIUM_RUBRIQUES.some((r) =>
        r.services.some((s) => s.status === 'degraded')
      ),
    []
  );

  const folderCounts = useMemo(() => {
    const finance = workflows.filter((w) => w.folder === 'Finance');
    return {
      financeTotal: finance.length,
      monthEnd: finance.filter((w) => w.subfolder === 'Month-end close').length,
      invoiceRecon: finance.filter((w) => w.subfolder === 'Invoice recon').length,
      vendors: finance.filter((w) => w.subfolder === 'Vendors').length,
      peopleOps: workflows.filter((w) => w.folder === 'People ops').length,
      itAccess: workflows.filter((w) => w.folder === 'IT & access').length,
    };
  }, [workflows]);

  useEffect(() => {
    if (!isFilterOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterOpen]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
    setLastResult(null);
    setLastRun(null);
    setRunError(null);
  };

  const handleClosePanel = () => {
    setSelectedAgentId(null);
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
    setLastResult(null);
    setLastRun(null);
    setRunError(null);
  };

  const applyOrgSnapshot = (org: Organization | null | undefined) => {
    if (!org) return;
    setOrganizations((prev) => {
      const exists = prev.some((o) => o.id === org.id);
      return exists ? prev.map((o) => (o.id === org.id ? org : o)) : [org, ...prev];
    });
    syncSessionOrganization(org);
  };

  const handleProtectedHttpFailure = (status: number, message: string): boolean => {
    if (status === 401) {
      setAuthPromptReason(
        message || 'Sign in or create an account to execute and modify the workspace.'
      );
      setTopBarModal('signup');
      setActionBanner({ tone: 'error', message });
      return true;
    }
    if (status === 402) {
      setAuthPromptReason(message);
      setTopBarModal('subscription');
      setActionBanner({ tone: 'error', message });
      return true;
    }
    return false;
  };

  const executeAgentById = async (agent: Agent, prompt: string) => {
    if (isRunning) return false;

    setSelectedAgentId(agent.id);
    setIsRunning(true);
    setProgress(15);
    setLastResult(null);
    setLastRun(null);
    setRunError(null);
    const ts = new Date().toLocaleTimeString();
    setRunLogs([`[${ts}] Calling POST /api/agents/${agent.id}/run...`]);

    setGroups((prev) =>
      updateAgentInGroups(prev, agent.id, (a) => ({ ...a, status: 'running' }))
    );

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : Math.min(90, prev + 8)));
    }, 220);

    try {
      const response = await secureFetch(`/api/agents/${encodeURIComponent(agent.id)}/run`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as {
        error?: string;
        run?: RunRecord;
        groups?: Group[];
        runHistory?: RunRecord[];
        organization?: Organization | null;
      };

      window.clearInterval(progressTimer);
      setProgress(100);

      if (Array.isArray(data.groups)) setGroups(data.groups);
      if (Array.isArray(data.runHistory)) setRunHistory(data.runHistory);
      applyOrgSnapshot(data.organization);
      if (data.run) {
        setLastRun(data.run);
        setRunLogs(data.run.logs);
      }

      if (response.ok && data.run?.status === 'success') {
        setLastResult('success');
        if (data.run) {
          setSelectedRunForPreview(data.run);
        }
        return true;
      } else {
        const message = data.error || `Request failed with status ${response.status}`;
        handleProtectedHttpFailure(response.status, message);
        setRunError(message);
        setLastResult('error');
        if (!data.run) {
          setRunLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${message}`]);
          setGroups((prev) =>
            updateAgentInGroups(prev, agent.id, (a) => ({ ...a, status: 'idle' }))
          );
        }
        return false;
      }
    } catch (err) {
      window.clearInterval(progressTimer);
      setProgress(100);
      const message =
        err instanceof Error ? err.message : 'Network error connecting to backend service.';
      setRunError(message);
      setLastResult('error');
      setRunLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${message}`]);
      setGroups((prev) =>
        updateAgentInGroups(prev, agent.id, (a) => ({ ...a, status: 'error' }))
      );
      return false;
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAgent = async (prompt: string) => {
    if (!selectedContext || isRunning) return;
    await executeAgentById(selectedContext.agent, prompt);
  };

  const resetAgentById = async (agentId: string): Promise<boolean> => {
    if (selectedAgentId === agentId) {
      setProgress(0);
      setRunLogs([]);
      setLastResult(null);
      setLastRun(null);
      setRunError(null);
    }

    try {
      const res = await secureFetch(`/api/agents/${encodeURIComponent(agentId)}/reset`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = (await res.json()) as { groups?: Group[] };
        if (Array.isArray(data.groups)) {
          setGroups(data.groups);
          return true;
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        handleProtectedHttpFailure(res.status, errData.error || 'Authentication required.');
        return false;
      }
    } catch {
      // Fallback local reset
    }

    setGroups((prev) =>
      updateAgentInGroups(prev, agentId, (a) => ({
        ...a,
        status: 'idle',
      }))
    );
    return true;
  };

  const handleResetAgent = async () => {
    if (!selectedContext || isRunning) return;
    await resetAgentById(selectedContext.agent.id);
  };

  const handleResetAllAgents = async (): Promise<boolean> => {
    try {
      const res = await secureFetch('/api/agents/reset-all', { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { groups?: Group[] };
        if (Array.isArray(data.groups)) {
          setGroups(data.groups);
          return true;
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        handleProtectedHttpFailure(res.status, errData.error || 'Authentication required.');
        return false;
      }
    } catch {
      // Fallback local reset when offline
    }
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        agents: g.agents.map((a) => ({ ...a, status: 'idle' })),
      }))
    );
    return true;
  };

  const handleUpdateAgent = async (
    agentId: string,
    updates: { name: string; description: string; highlighted: boolean }
  ) => {
    const res = await secureFetch(`/api/agents/${encodeURIComponent(agentId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = (await res.json()) as { groups?: Group[] };
      if (Array.isArray(data.groups)) setGroups(data.groups);
    } else {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      handleProtectedHttpFailure(res.status, errData.error || 'Update failed.');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    const res = await secureFetch(`/api/agents/${encodeURIComponent(agentId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = (await res.json()) as { groups?: Group[] };
      if (Array.isArray(data.groups)) setGroups(data.groups);
      handleClosePanel();
    } else {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      handleProtectedHttpFailure(res.status, errData.error || 'Deletion failed.');
    }
  };

  const handleCreateAgent = async (params: {
    groupId: string;
    name: string;
    description: string;
    icon: AgentIconKey;
    highlighted: boolean;
    platform: string;
  }) => {
    const res = await secureFetch('/api/agents', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = (await res.json()) as { agent?: Agent; groups?: Group[] };
      if (Array.isArray(data.groups)) setGroups(data.groups);
      if (data.agent) {
        setSelectedAgentId(data.agent.id);
      }
    } else {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      handleProtectedHttpFailure(res.status, errData.error || 'Agent creation rejected.');
    }
  };

  const handleCreateWorkflow = async (params: {
    name: string;
    integrations: string;
    folder: WorkflowItem['folder'];
    subfolder?: string;
    status: WorkflowStatus;
    linkedAgentId: string;
    description: string;
  }) => {
    const res = await secureFetch('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = (await res.json()) as { workflows?: WorkflowItem[]; workflow?: WorkflowItem };
      if (Array.isArray(data.workflows)) setWorkflows(data.workflows);
      if (data.workflow) {
        setActionBanner({
          tone: 'success',
          message: `Workflow "${data.workflow.name}" created in ${data.workflow.folder}.`,
        });
      }
    } else {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      handleProtectedHttpFailure(res.status, errData.error || 'Workflow creation rejected.');
    }
  };

  const handleToggleWorkflowStatus = async (workflowId: string, nextStatus: WorkflowStatus) => {
    const res = await secureFetch(`/api/workflows/${encodeURIComponent(workflowId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      const data = (await res.json()) as { workflows?: WorkflowItem[] };
      if (Array.isArray(data.workflows)) setWorkflows(data.workflows);
    } else {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      handleProtectedHttpFailure(res.status, errData.error || 'Update rejected.');
    }
  };

  const handleRunWorkflow = async (workflow: WorkflowItem) => {
    if (runningWorkflowId) return;
    setRunningWorkflowId(workflow.id);
    try {
      const res = await secureFetch(`/api/workflows/${encodeURIComponent(workflow.id)}/run`, {
        method: 'POST',
      });
      const data = (await res.json()) as {
        error?: string;
        run?: RunRecord;
        workflows?: WorkflowItem[];
        groups?: Group[];
        runHistory?: RunRecord[];
        organization?: Organization | null;
      };
      if (Array.isArray(data.workflows)) setWorkflows(data.workflows);
      if (Array.isArray(data.groups)) setGroups(data.groups);
      if (Array.isArray(data.runHistory)) setRunHistory(data.runHistory);
      applyOrgSnapshot(data.organization);

      if (res.ok && data.run?.status === 'success') {
        if (data.run) {
          setSelectedRunForPreview(data.run);
        }
        setActionBanner({
          tone: 'success',
          message: `${workflow.name}: ${data.run.summary}`,
        });
      } else {
        const errMsg = data.error || `Workflow "${workflow.name}" failed.`;
        if (!handleProtectedHttpFailure(res.status, errMsg)) {
          setActionBanner({ tone: 'error', message: errMsg });
        }
      }
    } catch (err) {
      setActionBanner({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Failed to run workflow.',
      });
    } finally {
      setRunningWorkflowId(null);
    }
  };

  const handleDecideApproval = async (
    approvalId: string,
    decision: 'approved' | 'declined'
  ) => {
    setDecidingApprovalId(approvalId);
    try {
      const res = await secureFetch(`/api/approvals/${encodeURIComponent(approvalId)}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        const data = (await res.json()) as { approvals?: ApprovalItem[] };
        if (Array.isArray(data.approvals)) setApprovals(data.approvals);
        setActionBanner({
          tone: 'success',
          message: `${approvalId} marked as ${decision}.`,
        });
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        handleProtectedHttpFailure(res.status, errData.error || 'Decision rejected.');
      }
    } finally {
      setDecidingApprovalId(null);
    }
  };

  const handleBatchDecideApprovals = async (decision: 'approved' | 'declined') => {
    const res = await secureFetch('/api/approvals/batch', {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
    if (res.ok) {
      const data = (await res.json()) as { approvals?: ApprovalItem[] };
      if (Array.isArray(data.approvals)) setApprovals(data.approvals);
      setActionBanner({
        tone: 'success',
        message: `All pending approvals marked as ${decision}.`,
      });
    } else {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      handleProtectedHttpFailure(res.status, errData.error || 'Action rejected.');
    }
  };

  const handleClearHistory = async () => {
    const res = await secureFetch('/api/runs', { method: 'DELETE' });
    if (res.ok) {
      setRunHistory([]);
    } else {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      handleProtectedHttpFailure(res.status, errData.error || 'Action rejected.');
    }
  };

  const handleNavigateView = (view: WorkspaceView) => {
    setActiveView(view);
    setIsMobileSidebarOpen(false);
    if (view !== 'workflows') {
      setSelectedFolder(null);
      setSelectedSubfolder(null);
    }
    if (view !== 'services') {
      setSelectedRubriqueId(null);
      setSelectedPillar(null);
    }
  };

  const handleSelectRubrique = (rubriqueId: string | null) => {
    setSelectedRubriqueId(rubriqueId);
    setSelectedPillar(null);
    setActiveView('services');
    setIsMobileSidebarOpen(false);
  };

  const handleSelectFolder = (folder: string, subfolder?: string) => {
    setSelectedFolder(folder);
    setSelectedSubfolder(subfolder ?? null);
    setActiveView('workflows');
    setIsMobileSidebarOpen(false);
  };

  const handleInspectAgentById = (agentId: string) => {
    for (const g of groups) {
      const found = g.agents.find((a) => a.id === agentId);
      if (found) {
        setActiveView('orbit');
        handleSelectAgent(found);
        return;
      }
    }
  };

  const handleOpenFreePreview = () => {
    if (lastRun) {
      setSelectedRunForPreview(lastRun);
      return;
    }
    if (runHistory.length > 0) {
      setSelectedRunForPreview(runHistory[0]);
      return;
    }
    const primaryGroup = groups[0];
    const primaryAgent = primaryGroup?.agents[0];
    const snapshotRun: RunRecord = {
      id: `preview-snapshot-${activeOrg.id}`,
      agentId: primaryAgent?.id ?? 'r2',
      agentName: primaryAgent?.name ?? 'Audience Listener',
      groupId: primaryGroup?.id ?? 'research',
      groupTitle: primaryGroup?.title ?? 'Research',
      status: 'success',
      durationMs: latencyMs ?? 240,
      timestamp: new Date().toISOString(),
      model: 'gemini-3.5-flash-lite',
      prompt: `Live global analysis for ${activeOrg.name} (${stats.totalAgents} agents, ${workflows.length} workflows).`,
      summary: `SENSORIUM operational summary for "${activeOrg.name}" (${activeOrg.plan}): ${stats.activeCount} active agents out of ${stats.totalAgents}, ${workflows.filter((w) => w.status === 'active').length} workflows in production, and Zero-Trust ZT 100% compliance.`,
      deliverables: [
        `Coverage of ${stats.totalAgents} agents across ${groups.length} domains`,
        `${SENSORIUM_TOTAL_SERVICES} monitored API services (${hasDegradedServices ? 'minor SLA alert' : 'Nominal SLA'})`,
        `${members.length} users configured in workspace ${activeOrg.name}`,
      ],
      nextActions: [
        'Select any agent in Agent Orbit to trigger a targeted analysis',
        'Download this report in TXT, Markdown, or JSON format below',
      ],
      logs: [
        `[${new Date().toLocaleTimeString()}] Preview snapshot generated for ${activeOrg.name}`,
        `[${new Date().toLocaleTimeString()}] ${stats.totalAgents} AI Agents indexed`,
        `[${new Date().toLocaleTimeString()}] Zero-Trust security posture: ZT 100%`,
      ],
    };
    setSelectedRunForPreview(snapshotRun);
  };

  const handleSubmitOrbitOrder = async (rawOrder: string) => {
    const trimmed = rawOrder.trim();
    if (!trimmed || isProcessingCommand) return;

    setIsProcessingCommand(true);
    setCommandHistory((prev) => [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 20));

    try {
      const parsed = parseOrbitOrder(trimmed, groups, workflows);
      switch (parsed.type) {
        case 'empty':
          return;
        case 'help':
          setCommandFeedback({
            tone: 'info',
            message:
              'Orders: "run Trend Scout", "run Audience Listener: <brief>", "run group Research", "run workflow Viral Content", "status", "preview", "reset all"',
          });
          return;
        case 'status':
          setCommandFeedback({
            tone: 'info',
            message: buildStatusSummary(groups),
          });
          return;
        case 'open_preview':
          handleOpenFreePreview();
          setCommandFeedback({
            tone: 'success',
            message: 'Opened Results Preview window.',
          });
          return;
        case 'navigate':
          handleNavigateView(parsed.view);
          setCommandFeedback({
            tone: 'success',
            message: `Switched view to ${parsed.label}.`,
          });
          return;
        case 'reset_all': {
          const ok = await handleResetAllAgents();
          setCommandFeedback(
            ok
              ? { tone: 'success', message: 'All 36 AI agents reset to idle.' }
              : { tone: 'error', message: 'Sign in required to reset workspace agents.' }
          );
          return;
        }
        case 'reset_agent': {
          const ok = await resetAgentById(parsed.agent.id);
          setCommandFeedback(
            ok
              ? { tone: 'success', message: `${parsed.agent.name} reset to idle.` }
              : { tone: 'error', message: 'Sign in required to reset this agent.' }
          );
          return;
        }
        case 'run_workflow':
          setCommandFeedback({
            tone: 'info',
            message: `Dispatching workflow "${parsed.workflow.name}"...`,
          });
          await handleRunWorkflow(parsed.workflow);
          return;
        case 'run_group': {
          setCommandFeedback({
            tone: 'info',
            message: `Launching ${parsed.group.title} priority agent (${parsed.priorityAgent.name})...`,
          });
          const ok = await executeAgentById(parsed.priorityAgent, parsed.prompt);
          setCommandFeedback(
            ok
              ? {
                  tone: 'success',
                  message: `${parsed.group.title} (${parsed.priorityAgent.name}) completed order.`,
                }
              : {
                  tone: 'error',
                  message: `Could not complete order on ${parsed.priorityAgent.name}. Check auth or logs.`,
                }
          );
          return;
        }
        case 'run_agent': {
          const routeNote =
            parsed.matchedVia === 'keyword'
              ? ` (routed via topic)`
              : parsed.matchedVia === 'fallback'
                ? ` (orchestrator default)`
                : '';
          setCommandFeedback({
            tone: 'info',
            message: `Injecting order to ${parsed.agent.name}${routeNote}...`,
          });
          const ok = await executeAgentById(parsed.agent, parsed.prompt);
          setCommandFeedback(
            ok
              ? { tone: 'success', message: `${parsed.agent.name} executed order successfully.` }
              : {
                  tone: 'error',
                  message: `Execution halted on ${parsed.agent.name} — sign in or inspect side panel.`,
                }
          );
          return;
        }
        case 'unknown':
          setCommandFeedback({
            tone: 'error',
            message: `Unrecognized order "${parsed.raw}". Type "help" to see supported commands.`,
          });
          return;
      }
    } finally {
      setIsProcessingCommand(false);
    }
  };

  const currentHeader = VIEW_LABELS[activeView];

  const renderSidebarContent = (showCollapseButton = true) => (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-3.5 overflow-y-auto pr-0.5">
        {/* Workspace Header Pill */}
        <div className="flex items-center justify-between p-1.5 bg-white dark:bg-[#282a2d] rounded-2xl shadow-xs border border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#1A1C20] dark:bg-white flex items-center justify-center text-white dark:text-[#111317] text-xs font-semibold shrink-0">
              F
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-semibold text-[#181A1F] dark:text-[#e2e2e6]">
                Fieldnote
              </div>
              <div className="text-[10px] text-[#8E929C] truncate max-w-[96px]">
                {activeOrg.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigateView('orbit')}
              aria-label="Switch to 36 AI Agents Orbit"
              title="Switch to 36 AI Agents Orbit"
              className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-[#8E929C] hover:text-slate-900 dark:hover:text-white transition"
            >
              <ChevronsUpDown className="w-4 h-4" />
            </button>
            {showCollapseButton && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-[#8E929C] hover:text-slate-900 dark:hover:text-white transition"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsCommandOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          className="w-full relative flex items-center bg-[#E8EAEF]/70 dark:bg-[#282a2d] hover:bg-white dark:hover:bg-[#333538] text-xs rounded-xl pl-3 pr-2.5 py-2 border border-transparent dark:border-white/[0.06] text-[#8E929C] transition text-left"
        >
          <Search className="w-3.5 h-3.5 mr-2 shrink-0" />
          <span className="flex-1">Search...</span>
          <span className="text-[10px] font-mono">⌘K</span>
        </button>

        {/* WORKSPACE Nav */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-[#8E929C]/80 uppercase px-2 mb-1.5">
            Workspace
          </div>
          <nav className="space-y-0.5" aria-label="Workspace navigation">
            <button
              type="button"
              onClick={() => handleNavigateView('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeView === 'overview'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Home className="w-4 h-4" />
                <span>Overview</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateView('orbit')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeView === 'orbit'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Bot className="w-4 h-4" />
                <span>Agent Orbit</span>
              </span>
              <span className="text-[11px] text-[#8E929C] font-normal tabular-nums">
                {stats.totalAgents}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateView('services')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeView === 'services'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Services</span>
              </span>
              <span className="text-[11px] text-[#8E929C] font-normal tabular-nums">
                {SENSORIUM_TOTAL_SERVICES}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateView('workflows')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeView === 'workflows'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Zap className="w-4 h-4" />
                <span>Workflows</span>
              </span>
              <span className="text-[11px] text-[#8E929C] font-normal tabular-nums">
                {workflows.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateView('approvals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeView === 'approvals'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Approvals</span>
              </span>
              <span className="w-4 h-4 rounded-full bg-[#E5FA52] text-[#111317] font-semibold text-[10px] flex items-center justify-center tabular-nums">
                {pendingApprovalsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateView('history')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeView === 'history'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Run history</span>
              </span>
              {runHistory.length > 0 && (
                <span className="text-[11px] text-[#8E929C] font-normal tabular-nums">
                  {runHistory.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavigateView('users')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeView === 'users'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Multi-users</span>
              </span>
              <span className="text-[11px] text-[#8E929C] font-normal tabular-nums">
                {members.length}
              </span>
            </button>
          </nav>
        </div>

        {/* LIVE Section */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-[#8E929C]/80 uppercase px-2 mb-1.5 flex items-center gap-1.5">
            <span>Live</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4edea3] animate-pulse" />
          </div>
          <div className="space-y-1 px-2 text-xs tabular-nums">
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-[#8E929C] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4edea3]" />
                Running
              </span>
              <span className="font-medium text-[11px] text-slate-800 dark:text-[#e2e2e6]">
                {stats.activeCount + stats.runningCount}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-[#8E929C] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Queued
              </span>
              <span className="font-medium text-[11px] text-slate-800 dark:text-[#e2e2e6]">
                {pendingApprovalsCount + workflows.filter((w) => w.status === 'paused').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-[#8E929C] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Failed today
              </span>
              <span className="font-medium text-[11px] text-slate-800 dark:text-[#e2e2e6]">
                {stats.errorCount}
              </span>
            </div>
          </div>
        </div>

        {/* FOLDERS Section */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-[#8E929C]/80 uppercase px-2 mb-1.5">
            Folders
          </div>
          <div className="space-y-1">
            <div className="bg-black/[0.02] dark:bg-white/[0.03] rounded-xl p-1.5 border border-transparent dark:border-white/[0.04]">
              <button
                type="button"
                onClick={() => setIsFinanceExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium text-slate-800 dark:text-[#e2e2e6]"
              >
                <span className="flex items-center gap-2">
                  {isFinanceExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#8E929C]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#8E929C]" />
                  )}
                  <Folder className="w-3.5 h-3.5 text-[#8E929C]" />
                  <span>Finance</span>
                </span>
                <span className="text-[10px] text-[#8E929C] tabular-nums">
                  {folderCounts.financeTotal}
                </span>
              </button>

              {isFinanceExpanded && (
                <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 dark:border-[#444749]/60 pl-2">
                  <button
                    type="button"
                    onClick={() => handleSelectFolder('Finance', 'Month-end close')}
                    className={`w-full text-[11px] py-1 px-2 rounded-lg flex items-center justify-between transition ${
                      selectedSubfolder === 'Month-end close'
                        ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white font-medium shadow-xs'
                        : 'text-[#8E929C] hover:text-black dark:hover:text-[#e2e2e6]'
                    }`}
                  >
                    <span>Month-end close</span>
                    <span className="text-[10px] tabular-nums">{folderCounts.monthEnd}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectFolder('Finance', 'Invoice recon')}
                    className={`w-full text-[11px] py-1 px-2 rounded-lg flex items-center justify-between transition ${
                      selectedSubfolder === 'Invoice recon' ||
                      (!selectedFolder && !selectedSubfolder && activeView === 'overview')
                        ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white font-medium shadow-xs border border-transparent dark:border-white/[0.06]'
                        : 'text-[#8E929C] hover:text-black dark:hover:text-[#e2e2e6]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-black dark:bg-white" />
                      Invoice recon
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-[#333538] text-slate-600 dark:text-[#c4c7c9] px-1 rounded tabular-nums">
                      {folderCounts.invoiceRecon}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectFolder('Finance', 'Vendors')}
                    className={`w-full text-[11px] py-1 px-2 rounded-lg flex items-center justify-between transition ${
                      selectedSubfolder === 'Vendors'
                        ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white font-medium shadow-xs'
                        : 'text-[#8E929C] hover:text-black dark:hover:text-[#e2e2e6]'
                    }`}
                  >
                    <span>Vendors</span>
                    <span className="text-[10px] tabular-nums">{folderCounts.vendors}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSelectFolder('People ops')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition ${
                selectedFolder === 'People ops'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white font-medium shadow-xs'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6]'
              }`}
            >
              <span className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#8E929C]" />
                <Folder className="w-3.5 h-3.5 text-[#8E929C]" />
                <span>People ops</span>
              </span>
              <span className="text-[10px] tabular-nums">{folderCounts.peopleOps}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectFolder('IT & access')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition ${
                selectedFolder === 'IT & access'
                  ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white font-medium shadow-xs'
                  : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6]'
              }`}
            >
              <span className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#8E929C]" />
                <Folder className="w-3.5 h-3.5 text-[#8E929C]" />
                <span>IT &amp; access</span>
              </span>
              <span className="text-[10px] tabular-nums">{folderCounts.itAccess}</span>
            </button>
          </div>
        </div>

        {/* SENSORIUM CATEGORIES (128 services) */}
        <div>
          <button
            type="button"
            onClick={() => setIsRubriquesExpanded((v) => !v)}
            aria-expanded={isRubriquesExpanded}
            className="w-full flex items-center justify-between text-[10px] font-semibold tracking-wider text-[#8E929C]/80 uppercase px-2 mb-1.5 hover:text-[#111317] dark:hover:text-[#e2e2e6] transition-colors"
          >
            <span>Services · {SENSORIUM_TOTAL_SERVICES}</span>
            {isRubriquesExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {isRubriquesExpanded && (
            <div className="space-y-0.5" role="list" aria-label="SENSORIUM Categories">
              {SENSORIUM_RUBRIQUES.map((rubrique) => {
                const isSelected =
                  activeView === 'services' && selectedRubriqueId === rubrique.id;
                return (
                  <button
                    key={rubrique.id}
                    type="button"
                    onClick={() => handleSelectRubrique(rubrique.id)}
                    title={rubrique.title}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-[11px] transition text-left ${
                      isSelected
                        ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white font-semibold shadow-xs border border-black/[0.04] dark:border-white/[0.08]'
                        : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <RubriqueIcon
                        icon={rubrique.icon}
                        className="w-3.5 h-3.5 shrink-0 opacity-85"
                      />
                      <span className="truncate font-medium tracking-tight">
                        {rubrique.title}
                      </span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] tabular-nums shrink-0">
                      {rubrique.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar User Footer */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#DCE2EA] dark:bg-[#282a2d] border border-transparent dark:border-white/10 flex items-center justify-center text-[11px] font-semibold text-slate-700 dark:text-[#e2e2e6]">
            {operatorProfile.initials}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-[#e2e2e6] leading-tight">
              {operatorProfile.name}
            </div>
            <div className="text-[10px] text-[#8E929C]">{operatorProfile.role}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-lg text-[#8E929C] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const renderCollapsedSidebarContent = () => (
    <div className="flex flex-col items-center justify-between h-full gap-2">
      {/* Expand Toggle & Quick Search */}
      <div className="flex flex-col items-center gap-1.5 w-full shrink-0">
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="w-10 h-9 rounded-xl bg-white dark:bg-[#282a2d] border border-black/[0.04] dark:border-white/[0.06] shadow-xs flex items-center justify-center text-[#181A1F] dark:text-[#e2e2e6] hover:bg-slate-50 dark:hover:bg-[#333538] transition"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setIsCommandOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          aria-label="Search (⌘K)"
          title="Search (⌘K)"
          className="w-10 h-8 rounded-xl bg-[#E8EAEF]/70 dark:bg-[#282a2d] hover:bg-white dark:hover:bg-[#333538] text-[#8E929C] flex items-center justify-center border border-transparent dark:border-white/[0.06] transition"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable Workspace & Service Icons Rail */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center gap-1 py-0.5">
        <nav
          className="flex flex-col items-center gap-1 w-full shrink-0"
          aria-label="Workspace navigation"
        >
          {[
            { id: 'overview' as WorkspaceView, label: 'Overview', icon: Home },
            {
              id: 'orbit' as WorkspaceView,
              label: `Agent Orbit (${stats.totalAgents})`,
              icon: Bot,
            },
            {
              id: 'services' as WorkspaceView,
              label: `Services (${SENSORIUM_TOTAL_SERVICES})`,
              icon: Layers,
            },
            {
              id: 'workflows' as WorkspaceView,
              label: `Workflows (${workflows.length})`,
              icon: Zap,
            },
            {
              id: 'approvals' as WorkspaceView,
              label: `Approvals (${pendingApprovalsCount})`,
              icon: CheckCircle2,
              badge: pendingApprovalsCount,
            },
            {
              id: 'history' as WorkspaceView,
              label: `Run history (${runHistory.length})`,
              icon: Clock,
            },
            {
              id: 'users' as WorkspaceView,
              label: `Multi-users (${members.length})`,
              icon: Users,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === 'services'
                ? activeView === 'services' && !selectedRubriqueId
                : activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigateView(item.id)}
                aria-label={item.label}
                title={item.label}
                className={`w-10 h-8 shrink-0 rounded-xl flex items-center justify-center relative transition ${
                  isActive
                    ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.08]'
                    : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[#E5FA52] ring-1 ring-[#111317]/20" />
                )}
              </button>
            );
          })}
        </nav>

        <div
          className="w-6 h-px bg-slate-200/80 dark:bg-white/[0.08] my-1 shrink-0"
          aria-hidden="true"
        />

        <div
          className="text-[9px] font-semibold tracking-wider text-[#8E929C]/80 uppercase mb-0.5 shrink-0"
          title={`Services · ${SENSORIUM_TOTAL_SERVICES}`}
        >
          Services
        </div>

        <div
          className="flex flex-col items-center gap-1 w-full pb-1"
          role="list"
          aria-label="SENSORIUM service icons"
        >
          {SENSORIUM_RUBRIQUES.map((rubrique) => {
            const isSelected =
              activeView === 'services' && selectedRubriqueId === rubrique.id;
            return (
              <button
                key={rubrique.id}
                type="button"
                onClick={() => handleSelectRubrique(rubrique.id)}
                aria-label={`${rubrique.title} (${rubrique.count})`}
                title={`${rubrique.title} · ${rubrique.count} services`}
                className={`w-10 h-8 shrink-0 rounded-xl flex items-center justify-center transition ${
                  isSelected
                    ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-xs border border-black/[0.04] dark:border-white/[0.08]'
                    : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <RubriqueIcon icon={rubrique.icon} className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsed Footer */}
      <div className="pt-2 border-t border-slate-200/70 dark:border-white/[0.08] w-full flex flex-col items-center gap-1.5 shrink-0">
        <div
          title={`${operatorProfile.name} · ${operatorProfile.role}`}
          className="w-8 h-8 rounded-full bg-[#DCE2EA] dark:bg-[#282a2d] border border-transparent dark:border-white/10 flex items-center justify-center text-[11px] font-semibold text-slate-700 dark:text-[#e2e2e6]"
        >
          {operatorProfile.initials}
        </div>
        <button
          type="button"
          onClick={handleToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8E929C] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E7E9ED] dark:bg-[#0c0e11] text-[#1B1D21] dark:text-[#e2e2e6] p-0 sm:p-2 flex items-stretch transition-colors duration-200">
      {/* Application Shell Frame */}
      <div className="w-full min-h-screen sm:h-[calc(100vh-1rem)] lg:min-h-[640px] bg-[#E9EBEF] dark:bg-[#111317] rounded-none sm:rounded-[18px] p-1.5 sm:p-2.5 shadow-[0_18px_45px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.7)] dark:shadow-[0_18px_45px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col overflow-visible relative border border-white/60 dark:border-white/[0.08] gap-2">
        {/* Integrated Top Navigation Bar */}
        <TopNavBar
          organizations={organizations}
          activeOrg={activeOrg}
          onSelectOrg={(orgId) => {
            setActiveOrgId(orgId);
            const found = organizations.find((o) => o.id === orgId);
            if (found) {
              setActionBanner({
                tone: 'success',
                message: `Workspace switched to "${found.name}" (${found.plan}).`,
              });
            }
          }}
          onOpenModal={(modal) => {
            setAuthPromptReason(null);
            setTopBarModal(modal);
          }}
          onOpenVitrine={() => {
            setSelectedRubriqueId(null);
            setSelectedPillar('Showcase & Solutions');
            setActiveView('services');
          }}
          onNavigateView={handleNavigateView}
          activeView={activeView}
          isGoogleConnected={isGoogleConnected}
          connectedEmail={connectedEmail}
          latencyMs={latencyMs}
          hasDegradedServices={hasDegradedServices}
          totalAgents={stats.totalAgents}
          totalServices={SENSORIUM_TOTAL_SERVICES}
          workflowsCount={workflows.length}
          pendingApprovalsCount={pendingApprovalsCount}
          membersCount={members.length}
          onOpenPreview={handleOpenFreePreview}
          authUser={authSession.user}
          onNavigateToERP={onNavigateToERP}
        />

        {/* Main Workspace Container */}
        <div className="flex-1 flex gap-2 overflow-hidden p-0.5">
          {/* Leftmost Icon Dock (Desktop/Tablet) */}
          <aside
            className="hidden md:flex w-12 flex-col justify-between items-center py-1 shrink-0"
            aria-label="Primary icon dock"
          >
            <div className="w-11 bg-[#1C1E22] dark:bg-[#1a1c1f] rounded-full py-3 flex flex-col items-center gap-4 shadow-[0_16px_30px_-10px_rgba(0,0,0,0.35)] border border-white/10">
              {/* Uploaded Brand Logo Mark */}
              <button
                type="button"
                onClick={() => handleNavigateView('overview')}
                aria-label="Fieldnote Home"
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white/10 hover:bg-white/20 transition"
              >
                <img
                  src="/assets/aistudio/ico_sensorium_1813a14b.png"
                  alt="Fieldnote Brand Mark"
                  className="w-full h-full object-contain invert opacity-95"
                  onError={(e) => {
                    // Fallback to local logo icon
                    (e.target as HTMLImageElement).src = '/logo-icon.png';
                  }}
                />
              </button>

              {[
                { id: 'overview' as WorkspaceView, label: 'Overview', icon: LayoutGrid },
                { id: 'workflows' as WorkspaceView, label: 'Workflows', icon: Zap },
                { id: 'orbit' as WorkspaceView, label: 'Agent Orbit (36)', icon: Puzzle },
                {
                  id: 'services' as WorkspaceView,
                  label: `Services (${SENSORIUM_TOTAL_SERVICES})`,
                  icon: Layers,
                },
                { id: 'history' as WorkspaceView, label: 'Run History', icon: BarChart3 },
              ].map((dockItem) => {
                const Icon = dockItem.icon;
                const isActive = activeView === dockItem.id;
                return (
                  <button
                    key={dockItem.id}
                    type="button"
                    onClick={() => handleNavigateView(dockItem.id)}
                    aria-label={dockItem.label}
                    title={dockItem.label}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition relative ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/55 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isActive && (
                      <span className="absolute -left-1 top-2 w-1.5 h-1.5 rounded-full bg-[#E5FA52]" />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleToggleTheme}
                aria-label="Toggle theme"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-8 h-8 rounded-xl text-white/55 hover:bg-white/10 hover:text-white flex items-center justify-center transition"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Decorative Track Bar */}
            <div
              className="w-1.5 h-32 bg-black/10 dark:bg-white/10 rounded-full my-auto relative flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-3 h-8 bg-white dark:bg-[#282a2d] rounded-full shadow-xs border border-black/10 dark:border-white/15" />
            </div>

            {/* Bottom Avatar Action */}
            <button
              type="button"
              onClick={() => handleNavigateView('approvals')}
              aria-label="Open approval queue"
              title="Open approval queue"
              className="w-10 h-10 rounded-full bg-[#1C1E22] dark:bg-[#1a1c1f] text-white dark:text-[#e2e2e6] flex items-center justify-center shadow-lg border border-white/10 hover:opacity-90 transition relative"
            >
              <span className="text-xs font-semibold">FN</span>
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#E5FA52] text-[#111317] text-[9px] font-bold flex items-center justify-center">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </aside>

          {/* Secondary Sidebar (Desktop Persistent — Expanded or Compact Icon Rail) */}
          <aside
            className={`hidden lg:flex bg-[#F2F4F7]/95 dark:bg-[#1a1c1f] rounded-[20px] flex-col border border-white dark:border-white/[0.06] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] shrink-0 transition-[width,padding] duration-200 ${
              isSidebarCollapsed ? 'w-[60px] p-2' : 'w-60 p-3'
            }`}
            aria-label="Workspace sidebar"
          >
            {isSidebarCollapsed
              ? renderCollapsedSidebarContent()
              : renderSidebarContent(true)}
          </aside>

          {/* Mobile Sidebar Drawer */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/40"
                aria-hidden="true"
              />
              <aside className="relative w-72 max-w-[85vw] h-full bg-[#F2F4F7] dark:bg-[#1a1c1f] p-4 z-10 shadow-2xl border-r border-white/40 dark:border-white/[0.08]">
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-1.5 rounded-lg text-[#8E929C] hover:text-black dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-[calc(100%-2.5rem)]">{renderSidebarContent(false)}</div>
              </aside>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col gap-3 overflow-y-auto px-0.5 pb-1.5 min-w-0">
            {/* Header Navigation & View Actions */}
            <header className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  aria-label="Open workspace navigation"
                  className="lg:hidden w-9 h-9 rounded-full bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-white shadow-xs"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div>
                  <div className="text-[10px] tracking-widest font-semibold uppercase text-[#8E929C] flex items-center gap-1.5">
                    <span>FIELDNOTE</span>
                    <span>/</span>
                    <span className="text-slate-700 dark:text-[#c4c7c9]">
                      {currentHeader.crumb}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3 mt-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-[#111317] dark:text-white">
                      {activeView === 'orbit'
                        ? `${stats.totalAgents} AI Agents`
                        : currentHeader.title}
                    </h1>
                    <span className="text-xs text-[#8E929C] font-medium hidden sm:inline">
                      {activeView === 'orbit'
                        ? 'Orchestrated by Sensorium AI · Click any agent to execute'
                        : activeView === 'services'
                        ? `SENSORIUM Demo Corp · ${SENSORIUM_TOTAL_SERVICES} available services across 20 categories`
                        : 'Wednesday, 18 November · 11:02'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Contextual Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {activeView === 'overview' && (
                  <div
                    role="group"
                    aria-label="Timeframe"
                    className="bg-[#E2E4E9] dark:bg-[#1e2023] p-1 rounded-full flex items-center text-xs font-medium shadow-inner border border-transparent dark:border-white/[0.06]"
                  >
                    {([
                      { key: 'today', label: 'Today' },
                      { key: '7d', label: '7 days' },
                      { key: '30d', label: '30 days' },
                    ] as const).map((tf) => (
                      <button
                        key={tf.key}
                        type="button"
                        onClick={() => setTimeframe(tf.key)}
                        className={`px-3 py-1 rounded-full transition ${
                          timeframe === tf.key
                            ? 'bg-white dark:bg-[#282a2d] text-[#111317] dark:text-white shadow-xs border border-transparent dark:border-white/[0.08]'
                            : 'text-[#8E929C] hover:text-[#111317] dark:hover:text-[#e2e2e6]'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                )}

                {activeView === 'orbit' && (
                  <>
                    <div ref={filterContainerRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen((open) => !open)}
                        aria-expanded={isFilterOpen}
                        aria-haspopup="menu"
                        aria-label={
                          statusFilter === 'all'
                            ? 'Filter agents by status'
                            : `Filter agents: ${activeFilterOption.label}`
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap tabular-nums ${
                          statusFilter !== 'all'
                            ? 'bg-[#FDF0EA] dark:bg-orange-500/20 border-[#D96B43]/60 text-[#B84A24] dark:text-orange-200'
                            : 'bg-white dark:bg-[#1e2023] border-white dark:border-white/[0.08] text-slate-700 dark:text-[#e2e2e6]'
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {statusFilter === 'all'
                            ? 'Filter'
                            : `${activeFilterOption.label} (${filterResult.matchingAgentIds.size})`}
                        </span>
                      </button>

                      {isFilterOpen && (
                        <div
                          role="menu"
                          aria-label="Filter agents by status"
                          className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200 dark:border-white/[0.1] shadow-xl py-1.5 z-30"
                        >
                          <div className="px-3 py-1 flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E929C]">
                              Status Filter
                            </span>
                            {statusFilter !== 'all' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusFilter('all');
                                  setIsFilterOpen(false);
                                }}
                                className="text-[11px] font-medium text-[#D96B43] hover:underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                          {FILTER_OPTIONS.map((option) => {
                            const isSelected = statusFilter === option.value;
                            const count = statusCounts[option.value];
                            return (
                              <button
                                key={option.value}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isSelected}
                                onClick={() => {
                                  setStatusFilter(option.value);
                                  setIsFilterOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 flex items-center justify-between text-xs transition-colors ${
                                  isSelected
                                    ? 'bg-[#FDF0EA] dark:bg-orange-500/15 text-slate-950 dark:text-white font-semibold'
                                    : 'text-slate-600 dark:text-[#c4c7c9] hover:bg-slate-100/80 dark:hover:bg-[#282a2d]'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${option.dotClass}`}
                                    aria-hidden="true"
                                  />
                                  <span>{option.label}</span>
                                </span>
                                <span className="flex items-center gap-1.5 tabular-nums text-[11px] text-[#8E929C]">
                                  <span>{count}</span>
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-[#D96B43]" />
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavigateView('history')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-[#e2e2e6] hover:opacity-90 transition tabular-nums"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History{runHistory.length > 0 ? ` (${runHistory.length})` : ''}</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => void hydrateState(true)}
                  aria-label="Refresh workspace state"
                  title="Refresh workspace state"
                  className="w-9 h-9 rounded-full bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.08] shadow-xs flex items-center justify-center text-[#8E929C] hover:text-black dark:hover:text-white transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleToggleTheme}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="w-9 h-9 rounded-full bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.08] shadow-xs flex items-center justify-center text-[#8E929C] hover:text-black dark:hover:text-white transition"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>

                {activeView === 'orbit' ? (
                  <button
                    type="button"
                    onClick={() => setIsCreateAgentOpen(true)}
                    className="px-4 py-2 bg-[#141518] dark:bg-white hover:opacity-90 text-white dark:text-[#111317] text-xs font-semibold rounded-full inline-flex items-center gap-1.5 shadow-md transition active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New agent</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreateWorkflowOpen(true)}
                    className="px-4 py-2 bg-[#141518] dark:bg-white hover:opacity-90 text-white dark:text-[#111317] text-xs font-semibold rounded-full inline-flex items-center gap-1.5 shadow-md transition active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New workflow</span>
                  </button>
                )}
              </div>
            </header>

            {/* Feedback Banner for Workflow / Approval Actions */}
            {actionBanner && (
              <div
                role="status"
                className={`px-4 py-2.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 border ${
                  actionBanner.tone === 'success'
                    ? 'bg-emerald-50 dark:bg-[#4edea3]/10 border-emerald-200 dark:border-[#4edea3]/25 text-emerald-800 dark:text-[#4edea3]'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                <span className="truncate">{actionBanner.message}</span>
                <button
                  type="button"
                  onClick={() => setActionBanner(null)}
                  aria-label="Dismiss notification"
                  className="shrink-0 opacity-70 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Active Workspace View */}
            {activeView === 'overview' && (
              <FieldnoteOverview
                timeframe={timeframe}
                workflows={workflows}
                approvals={approvals}
                stats={stats}
                runningWorkflowId={runningWorkflowId}
                decidingApprovalId={decidingApprovalId}
                onOpenRunLog={() => handleNavigateView('history')}
                onOpenAllWorkflows={() => handleNavigateView('workflows')}
                onOpenApprovalsQueue={() => handleNavigateView('approvals')}
                onRunWorkflow={handleRunWorkflow}
                onDecideApproval={handleDecideApproval}
                onBatchDecideApprovals={handleBatchDecideApprovals}
              />
            )}

            {activeView === 'orbit' && (
              <div className="pt-0.5 pb-6 space-y-4">
                <OrbitDiagram
                  groups={groups}
                  selectedAgentId={selectedAgentId}
                  matchingAgentIds={filterResult.matchingAgentIds}
                  hasActiveFilter={filterResult.hasActiveFilter}
                  onSelectAgent={handleSelectAgent}
                />
                <OrbitCommandBar
                  groups={groups}
                  isBusy={isProcessingCommand || isRunning || Boolean(runningWorkflowId)}
                  feedback={commandFeedback}
                  commandHistory={commandHistory}
                  onDismissFeedback={() => setCommandFeedback(null)}
                  onSubmitOrder={handleSubmitOrbitOrder}
                />
              </div>
            )}

            {activeView === 'services' && (
              <ServicesCatalogView
                groups={groups}
                selectedRubriqueId={selectedRubriqueId}
                selectedPillar={selectedPillar}
                onSelectRubrique={setSelectedRubriqueId}
                onSelectPillar={setSelectedPillar}
                onOpenOrbit={() => handleNavigateView('orbit')}
                onInspectAgent={handleInspectAgentById}
              />
            )}

            {activeView === 'workflows' && (
              <WorkflowsView
                workflows={workflows}
                groups={groups}
                selectedFolder={selectedFolder}
                selectedSubfolder={selectedSubfolder}
                runningWorkflowId={runningWorkflowId}
                onClearFolderFilter={() => {
                  setSelectedFolder(null);
                  setSelectedSubfolder(null);
                }}
                onRunWorkflow={handleRunWorkflow}
                onToggleWorkflowStatus={handleToggleWorkflowStatus}
                onInspectAgent={handleInspectAgentById}
                onOpenNewWorkflow={() => setIsCreateWorkflowOpen(true)}
              />
            )}

            {activeView === 'approvals' && (
              <ApprovalsView
                approvals={approvals}
                decidingApprovalId={decidingApprovalId}
                onDecideApproval={handleDecideApproval}
                onBatchDecideApprovals={handleBatchDecideApprovals}
              />
            )}

            {activeView === 'history' && (
              <RunHistoryView
                runs={runHistory}
                stats={stats}
                onClearHistory={handleClearHistory}
                onBackToOrbit={() => handleNavigateView('orbit')}
                onSelectRun={(run) => setSelectedRunForConclusion(run)}
                onPreviewRun={(run) => setSelectedRunForPreview(run)}
              />
            )}

            {activeView === 'users' && (
              <MultiUsersView
                organizations={organizations}
                activeOrg={activeOrg}
                members={members}
                authUser={authSession.user}
                onSelectOrg={(orgId) => {
                  setActiveOrgId(orgId);
                  const found = organizations.find((o) => o.id === orgId);
                  if (found) {
                    setActionBanner({
                      tone: 'success',
                      message: `Workspace switched to "${found.name}" (${found.plan}).`,
                    });
                  }
                }}
                onSyncMembers={setMembers}
                onOpenAuth={() => {
                  setAuthPromptReason(null);
                  setTopBarModal('signup');
                }}
                onOpenSubscription={() => setTopBarModal('subscription')}
                onOpenCreateOrg={() => setTopBarModal('create-org')}
                onNotify={(tone, message) => setActionBanner({ tone, message })}
              />
            )}
          </main>
        </div>
      </div>

      {/* Agent Orbit Side Panel */}
      <AgentSidePanel
        agent={selectedContext?.agent ?? null}
        group={selectedContext?.group ?? null}
        isRunning={isRunning}
        progress={progress}
        runLogs={runLogs}
        lastResult={lastResult}
        lastRun={lastRun}
        runError={runError}
        onClose={handleClosePanel}
        onRun={handleRunAgent}
        onReset={handleResetAgent}
        onUpdateAgent={handleUpdateAgent}
        onDeleteAgent={handleDeleteAgent}
        onOpenResultModal={(run) => setSelectedRunForConclusion(run)}
        onOpenPreviewModal={(run) => setSelectedRunForPreview(run)}
      />

      {/* Agent Result Conclusion Modal (Google AI Studio style) */}
      <AgentResultModal
        run={selectedRunForConclusion}
        onClose={() => setSelectedRunForConclusion(null)}
        onOpenPreview={(run) => setSelectedRunForPreview(run)}
      />

      {/* Agent Result Preview Modal (Google AI Studio Preview style) */}
      <AgentPreviewModal
        run={selectedRunForPreview}
        availableRuns={runHistory}
        onSelectRun={(run) => setSelectedRunForPreview(run)}
        onClose={() => setSelectedRunForPreview(null)}
      />

      {/* Modals */}
      <CreateAgentModal
        isOpen={isCreateAgentOpen}
        groups={groups}
        onClose={() => setIsCreateAgentOpen(false)}
        onCreate={handleCreateAgent}
      />

      <CreateWorkflowModal
        isOpen={isCreateWorkflowOpen}
        groups={groups}
        onClose={() => setIsCreateWorkflowOpen(false)}
        onCreate={handleCreateWorkflow}
      />

      <CommandPaletteModal
        isOpen={isCommandOpen}
        groups={groups}
        workflows={workflows}
        approvals={approvals}
        onClose={() => setIsCommandOpen(false)}
        onNavigateView={handleNavigateView}
        onSelectAgent={(agent) => {
          setActiveView('orbit');
          handleSelectAgent(agent);
        }}
        onSelectWorkflow={(wf) => {
          setActiveView('workflows');
          setSelectedFolder(wf.folder);
          setSelectedSubfolder(wf.subfolder ?? null);
        }}
        onSelectRubrique={(rubrique) => handleSelectRubrique(rubrique.id)}
      />

      <TopBarModals
        activeModal={topBarModal}
        activeOrg={activeOrg}
        members={members}
        authUser={authSession.user}
        authPromptReason={authPromptReason}
        isGoogleConnected={isGoogleConnected}
        connectedEmail={connectedEmail}
        onClose={() => {
          setAuthPromptReason(null);
          setTopBarModal(null);
        }}
        onSwitchToModal={(modal) => setTopBarModal(modal)}
        onRegisterUser={async (params) => {
          const res = await authApi.register(params);
          setMembers([res.user]);
          setAuthPromptReason(null);
          setActionBanner({
            tone: 'success',
            message: `Account created for ${res.user.name} · Organization "${res.organization.name}" activated.`,
          });
        }}
        onLoginUser={async (params) => {
          const res = await authApi.login(params);
          setMembers([res.user]);
          setAuthPromptReason(null);
          setActionBanner({
            tone: 'success',
            message: `Welcome ${res.user.name} (${res.organization.name}).`,
          });
        }}
        onLogoutUser={async () => {
          await authApi.logout();
          setOrganizations(INITIAL_ORGANIZATIONS);
          setActiveOrgId(INITIAL_ORGANIZATIONS[0].id);
          setMembers(INITIAL_MEMBERS);
          setOperatorProfile({ name: 'Dana Kim', initials: 'DK', role: 'Operations' });
          setActionBanner({
            tone: 'success',
            message: 'Signed out cleanly.',
          });
        }}
        onCreateOrganization={async (name, plan: OrgPlan) => {
          const res = await orgsApi.createOrganization({ name, plan });
          applyOrgSnapshot(res.organization);
          setActiveOrgId(res.organization.id);
          setActionBanner({
            tone: 'success',
            message: `Organization "${res.organization.name}" created and activated.`,
          });
        }}
        onSyncOrganization={(org) => {
          applyOrgSnapshot(org);
        }}
        onSyncMembers={(nextMembers) => {
          setMembers(nextMembers);
        }}
        onToggleGoogleConnection={async () => {
          const next = !isGoogleConnected;
          if (authSession.isAuthenticated) {
            const res = await authApi.googleLink({
              connected: next,
              email: connectedEmail ?? authSession.user?.email,
            });
            setIsGoogleConnected(res.googleConnected);
            setConnectedEmail(res.googleEmail);
          } else {
            setIsGoogleConnected(next);
          }
          setActionBanner({
            tone: 'success',
            message: next
              ? `Google Workspace reconnected (${connectedEmail ?? authSession.user?.email ?? 'google@workspace.io'}).`
              : 'Google account disconnected.',
          });
        }}
        onNotify={(tone, message) => {
          setActionBanner({ tone, message });
        }}
      />
    </div>
  );
}
