import type {
  Agent,
  AgentIconKey,
  AgentStatus,
  Group,
  OrchestratorStats,
  RunRecord,
  StatusFilter,
} from '../types/agent';

export function matchesAgentFilter(
  agent: Agent,
  searchQuery: string,
  statusFilter: StatusFilter
): boolean {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchesQuery =
    normalizedQuery.length === 0 ||
    agent.name.toLowerCase().includes(normalizedQuery) ||
    agent.description.toLowerCase().includes(normalizedQuery) ||
    (agent.platform?.toLowerCase().includes(normalizedQuery) ?? false);

  if (!matchesQuery) return false;

  if (statusFilter === 'all') return true;
  if (statusFilter === 'highlighted') return Boolean(agent.highlighted);
  return agent.status === statusFilter;
}

export function filterGroups(
  groups: Group[],
  searchQuery: string,
  statusFilter: StatusFilter
): { groups: Group[]; matchingAgentIds: Set<string>; hasActiveFilter: boolean } {
  const hasActiveFilter = searchQuery.trim().length > 0 || statusFilter !== 'all';
  const matchingAgentIds = new Set<string>();

  for (const group of groups) {
    for (const agent of group.agents) {
      if (matchesAgentFilter(agent, searchQuery, statusFilter)) {
        matchingAgentIds.add(agent.id);
      }
    }
  }

  return { groups, matchingAgentIds, hasActiveFilter };
}

export function updateAgentInGroups(
  groups: Group[],
  agentId: string,
  updater: (agent: Agent) => Agent
): Group[] {
  return groups.map((group) => ({
    ...group,
    agents: group.agents.map((agent) => (agent.id === agentId ? updater(agent) : agent)),
  }));
}

export function addAgentToGroup(
  groups: Group[],
  groupId: string,
  input: {
    name: string;
    description: string;
    icon: AgentIconKey;
    highlighted?: boolean;
    platform?: string;
  }
): { groups: Group[]; createdAgent: Agent | null } {
  const trimmedName = input.name.trim();
  const trimmedDescription = input.description.trim();
  if (!trimmedName) {
    return { groups, createdAgent: null };
  }

  const createdAgent: Agent = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmedName,
    description:
      trimmedDescription || `Custom orchestration agent assigned to ${groupId}.`,
    icon: input.icon,
    highlighted: Boolean(input.highlighted),
    status: 'idle',
    platform: input.platform?.trim() || 'Custom',
  };

  const nextGroups = groups.map((group) =>
    group.id === groupId
      ? { ...group, agents: [...group.agents, createdAgent] }
      : group
  );

  return { groups: nextGroups, createdAgent };
}

export function deleteAgentFromGroups(groups: Group[], agentId: string): Group[] {
  return groups.map((group) => ({
    ...group,
    agents: group.agents.filter((agent) => agent.id !== agentId),
  }));
}

export function computeOrchestratorStats(
  groups: Group[],
  runHistory: RunRecord[]
): OrchestratorStats {
  let totalAgents = 0;
  let activeCount = 0;
  let runningCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let highlightedCount = 0;

  for (const group of groups) {
    for (const agent of group.agents) {
      totalAgents += 1;
      if (agent.status === 'active') activeCount += 1;
      if (agent.status === 'running') runningCount += 1;
      if (agent.status === 'success') successCount += 1;
      if (agent.status === 'error') errorCount += 1;
      if (agent.highlighted) highlightedCount += 1;
    }
  }

  const totalRuns = runHistory.length;
  const successfulRuns = runHistory.filter((r) => r.status === 'success').length;
  const totalDuration = runHistory.reduce((sum, r) => sum + r.durationMs, 0);

  return {
    totalAgents,
    activeCount,
    runningCount,
    successCount,
    errorCount,
    highlightedCount,
    totalRuns,
    successRate: totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0,
    avgDurationMs: totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0,
  };
}

export function createRunRecord(params: {
  agentId: string;
  agentName: string;
  groupId: string;
  groupTitle: string;
  status: 'success' | 'error';
  durationMs: number;
  summary: string;
  logs: string[];
  timestamp?: string;
  prompt?: string;
  deliverables?: string[];
  nextActions?: string[];
  model?: string;
}): RunRecord {
  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agentId: params.agentId,
    agentName: params.agentName,
    groupId: params.groupId,
    groupTitle: params.groupTitle,
    status: params.status,
    durationMs: params.durationMs,
    timestamp: params.timestamp ?? new Date().toISOString(),
    summary: params.summary,
    logs: params.logs,
    prompt: params.prompt,
    deliverables: params.deliverables,
    nextActions: params.nextActions,
    model: params.model,
  };
}

export type AgentRunResult = {
  success: boolean;
  durationMs: number;
  output?: string;
  error?: string;
};

export async function executeAgentRun(
  agentName: string,
  options?: { forcedOutcome?: 'success' | 'error'; delayMs?: number }
): Promise<AgentRunResult> {
  const delayMs =
    options?.delayMs ?? Math.round(1100 + Math.random() * 1200);

  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess =
        options?.forcedOutcome !== undefined
          ? options.forcedOutcome === 'success'
          : Math.random() > 0.15;

      if (isSuccess) {
        resolve({
          success: true,
          durationMs: delayMs,
          output: `Agent "${agentName}" completed workflow. Generated 3 artifacts and synced 2 downstream nodes.`,
        });
      } else {
        resolve({
          success: false,
          durationMs: delayMs,
          error: 'Upstream service timeout · Rate limit exceeded on external connector',
        });
      }
    }, delayMs);
  });
}

export const STATUS_LABELS: Record<AgentStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  running: 'Running',
  success: 'Success',
  error: 'Error',
};
