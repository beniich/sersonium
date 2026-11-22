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
  | 'spark';

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
