export type AgentStatus = 'active' | 'idle' | 'running' | 'success' | 'error';

export type AgentIconKey =
  | 'tiktok'
  | 'reddit'
  | 'instagram'
  | 'youtube'
  | 'flower'
  | 'mail'
  | 'figma'
  | 'mic'
  | 'chart'
  | 'stripe'
  | 'calendar'
  | 'x'
  | 'newsletter'
  | 'hubspot'
  | 'zoom'
  | 'doc'
  | 'dollar'
  | 'message'
  | 'google'
  | 'spark'
  | 'database'
  | 'activity'
  | 'terminal'
  | 'cpu'
  | 'lock'
  | 'shield'
  | 'workflow'
  | 'bot'
  | 'network'
  | 'server';

export type Agent = {
  id: string;
  name: string;
  icon: AgentIconKey;
  highlighted?: boolean;
  description: string;
  status: AgentStatus;
  platform?: string;
};

export type GroupPosition =
  | 'top-left'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-right';

export type Group = {
  id: string;
  title: string;
  position: GroupPosition;
  agents: Agent[];
};

export type StatusFilter = 'all' | 'active' | 'idle' | 'running' | 'success' | 'error' | 'highlighted';

export type RunRecord = {
  id: string;
  agentId: string;
  agentName: string;
  groupId: string;
  groupTitle: string;
  status: 'success' | 'error';
  durationMs: number;
  timestamp: string;
  summary: string;
  logs: string[];
  prompt?: string;
  deliverables?: string[];
  nextActions?: string[];
  model?: string;
};

export type OrchestratorStats = {
  totalAgents: number;
  activeCount: number;
  runningCount: number;
  successCount: number;
  errorCount: number;
  highlightedCount: number;
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
};

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export type WorkflowIconKey =
  | 'invoice'
  | 'user'
  | 'shield'
  | 'calendar'
  | 'wallet'
  | 'spark'
  | 'payroll'
  | 'activity'
  | 'cpu';

export type WorkflowItem = {
  id: string;
  name: string;
  integrations: string;
  folder: 'Finance' | 'People ops' | 'IT & access';
  subfolder?: string;
  status: WorkflowStatus;
  statusLabel: string;
  isLive?: boolean;
  icon: WorkflowIconKey;
  sparkline: number[];
  linkedAgentId: string;
  agentId?: string;
  description: string;
  runsCount: number;
};

export type ApprovalStatus = 'pending' | 'approved' | 'declined';

export type ApprovalItem = {
  id: string;
  title: string;
  subtitle: string;
  ageLabel: string;
  locked?: boolean;
  status: ApprovalStatus;
  decidedAt?: string;
  workflowId?: string;
  agentId?: string;
};

export type TimeframeOption = 'today' | '7d' | '30d';

export type WorkspaceView =
  | 'overview'
  | 'orbit'
  | 'workflows'
  | 'approvals'
  | 'history'
  | 'services'
  | 'users';

export type SensoriumRubriqueIconKey =
  | 'globe'
  | 'layers'
  | 'compass'
  | 'cpu'
  | 'wrench'
  | 'network'
  | 'shield'
  | 'laptop'
  | 'lock'
  | 'database'
  | 'activity'
  | 'users'
  | 'server'
  | 'target'
  | 'bot'
  | 'factory'
  | 'zap'
  | 'shield-alert'
  | 'plug'
  | 'settings';

export type SensoriumServiceItem = {
  id: string;
  name: string;
  endpoint: string;
  status: 'online' | 'degraded' | 'standby';
  latencyMs: number;
  linkedAgentId: string;
  summary: string;
};

export type SensoriumRubrique = {
  id: string;
  title: string;
  count: number;
  icon: SensoriumRubriqueIconKey;
  pillar:
    | 'Showcase & Solutions'
    | 'Global ERP View'
    | 'Vision Dashboard'
    | '360° Asset Profile'
    | '3D Digital Twin'
    | 'AI Copilot';
  cluster: string;
  description: string;
  services: SensoriumServiceItem[];
};

