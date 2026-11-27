import type { Agent, Group, WorkflowItem, WorkspaceView } from '../types/agent.ts';

export type ParsedOrder =
  | { type: 'empty' }
  | { type: 'help' }
  | { type: 'status' }
  | { type: 'reset_all' }
  | { type: 'open_preview' }
  | { type: 'navigate'; view: WorkspaceView; label: string }
  | { type: 'reset_agent'; agent: Agent; group: Group }
  | { type: 'run_workflow'; workflow: WorkflowItem }
  | { type: 'run_all'; agents: { agent: Agent; group: Group }[]; prompt: string }
  | { type: 'run_multi'; targets: { agent: Agent; group: Group }[]; prompt: string }
  | { type: 'run_group'; group: Group; priorityAgent: Agent; agents: Agent[]; prompt: string }
  | {
      type: 'run_agent';
      agent: Agent;
      group: Group;
      prompt: string;
      matchedVia: 'explicit' | 'keyword' | 'fallback';
    }
  | { type: 'unknown'; raw: string };

export interface LiveOrderTarget {
  agentIds: string[];
  label: string;
  kind: 'agent' | 'group' | 'all' | 'multi' | 'workflow' | 'none';
}

const VIEW_ALIASES: { keywords: string[]; view: WorkspaceView; label: string }[] = [
  { keywords: ['overview', 'accueil', 'dashboard'], view: 'overview', label: 'Overview' },
  { keywords: ['orbit', 'agents'], view: 'orbit', label: 'Agent Orbit' },
  { keywords: ['services', 'categories', 'catalog', 'catalogue'], view: 'services', label: 'Services & Categories' },
  { keywords: ['workflows', 'workflow'], view: 'workflows', label: 'Workflows' },
  { keywords: ['approvals', 'approval', 'needs you', 'validations'], view: 'approvals', label: 'Approvals' },
  { keywords: ['history', 'historique', 'logs', 'runs'], view: 'history', label: 'Run history' },
  { keywords: ['users', 'multi-users', 'members', 'team', 'utilisateurs'], view: 'users', label: 'Multi-users' },
];

// Complete keyword coverage across all 36 AI agents (6 pillars x 6 agents)
const KEYWORD_AGENT_HINTS: { keywords: string[]; agentId: string }[] = [
  // Publish specific posters before generic platform terms where needed
  { keywords: ['tiktok poster', 'publish tiktok', 'post tiktok', 'publier tiktok'], agentId: 'p2' },
  { keywords: ['reels poster', 'publish reels', 'instagram reels', 'publier reels'], agentId: 'p3' },
  { keywords: ['shorts poster', 'youtube shorts', 'publish shorts', 'publier shorts'], agentId: 'p4' },
  { keywords: ['x poster', 'twitter', 'tweet', 'publish x', 'thread x'], agentId: 'p5' },
  // 1. Research (r1-r6)
  { keywords: ['tiktok', 'trend', 'sound', 'viral', 'audio hook', 'tendance'], agentId: 'r1' },
  { keywords: ['reddit', 'audience', 'community pain', 'subreddit', 'frustration'], agentId: 'r2' },
  { keywords: ['instagram', 'comment miner', 'buying question', 'objection'], agentId: 'r3' },
  { keywords: ['youtube', 'competitor', 'concurrent', 'content gap'], agentId: 'r4' },
  { keywords: ['post writer', 'claude', 'post draft', 'conversion post', 'brouillon'], agentId: 'r5' },
  { keywords: ['email writer', 'gmail', 'cold mail', 'email sequence'], agentId: 'r6' },
  // 2. Content (c1-c6)
  { keywords: ['figma', 'design', 'thumbnail', 'visual', 'miniature'], agentId: 'c1' },
  { keywords: ['carousel', 'slides', 'carrousel'], agentId: 'c2' },
  { keywords: ['voice', 'voiceover', 'audio', 'voix'], agentId: 'c3' },
  { keywords: ['video', 'b-roll', 'subtitle', 'timeline', 'montage'], agentId: 'c4' },
  { keywords: ['brand', 'compliance', 'charte', 'guideline'], agentId: 'c5' },
  { keywords: ['approval desk', 'sign-off', 'validation', 'human review'], agentId: 'c6' },
  // 3. The loop (l1-l6)
  { keywords: ['post analyst', 'analytics', 'watch time', 'retention', 'metrics'], agentId: 'l1' },
  { keywords: ['stripe', 'revenue', 'mrr', 'revenu', 'attribution'], agentId: 'l2' },
  { keywords: ['call tracker', 'transcript', 'zoom', 'retranscription'], agentId: 'l3' },
  { keywords: ['email analyst', 'open rate', 'click attribution', 'taux ouverture'], agentId: 'l4' },
  { keywords: ['weekly', 'report', 'digest', 'hebdo'], agentId: 'l5' },
  { keywords: ['loop feeder', 'feedback loop', 'winning angle', 'réinjecte'], agentId: 'l6' },
  // 4. Publish (p1-p6)
  { keywords: ['scheduler', 'schedule', 'posting window', 'planif', 'queue'], agentId: 'p1' },
  { keywords: ['newsletter', 'edition', 'abonné'], agentId: 'p6' },
  // 5. Sales (s1-s6)
  { keywords: ['lead scorer', 'score lead', 'scoring', 'company fit'], agentId: 's1' },
  { keywords: ['call booker', 'book call', 'booking', 'meeting', 'calendly', 'rdv'], agentId: 's2' },
  { keywords: ['reminder', 'no-show', 'sms alert', 'rappel'], agentId: 's3' },
  { keywords: ['follow-up', 'follow up', 'nurture', 'outreach', 'relance'], agentId: 's4' },
  { keywords: ['payment', 'invoice', 'checkout', 'facture', 'billing'], agentId: 's5' },
  { keywords: ['crm sync', 'hubspot', 'deal stage', 'crm'], agentId: 's6' },
  // 6. Community (cm1-cm6)
  { keywords: ['comment replier', 'reply comment', 'répondre commentaire'], agentId: 'cm1' },
  { keywords: ['dm agent', 'direct message', 'dm', 'inbox'], agentId: 'cm2' },
  { keywords: ['faq', 'knowledge base', 'documentation'], agentId: 'cm3' },
  { keywords: ['review asker', 'testimonial', 'avis client'], agentId: 'cm4' },
  { keywords: ['lead catcher', 'capture lead', 'buying intent'], agentId: 'cm5' },
  { keywords: ['escalation', 'escalate', 'urgent support', 'escalade'], agentId: 'cm6' },
];

export function findAgentById(
  agentId: string,
  groups: Group[]
): { agent: Agent; group: Group } | null {
  for (const group of groups) {
    const agent = group.agents.find((a) => a.id === agentId);
    if (agent) return { agent, group };
  }
  return null;
}

function findAgentMatch(
  query: string,
  groups: Group[]
): { agent: Agent; group: Group } | null {
  const q = query.replace(/^@/, '').trim().toLowerCase();
  if (!q) return null;

  // 1. Exact name or ID match
  for (const group of groups) {
    for (const agent of group.agents) {
      if (agent.name.toLowerCase() === q || agent.id.toLowerCase() === q) {
        return { agent, group };
      }
    }
  }

  // 2. Agent name or platform contained in query or query contained in agent name (longest name first)
  const candidates: { agent: Agent; group: Group }[] = [];
  for (const group of groups) {
    for (const agent of group.agents) {
      candidates.push({ agent, group });
    }
  }
  candidates.sort((a, b) => b.agent.name.length - a.agent.name.length);

  for (const item of candidates) {
    const nameLower = item.agent.name.toLowerCase();
    if (q.includes(nameLower) || (q.length >= 3 && nameLower.includes(q))) {
      return item;
    }
  }

  return null;
}

function findGroupMatch(query: string, groups: Group[]): Group | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const g of groups) {
    const titleLower = g.title.toLowerCase();
    const idLower = g.id.toLowerCase();
    if (q === titleLower || q === idLower || q.includes(titleLower) || q.includes(idLower)) {
      return g;
    }
  }
  return null;
}

function findWorkflowMatch(query: string, workflows: WorkflowItem[]): WorkflowItem | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const wf of workflows) {
    if (wf.name.toLowerCase() === q || wf.id.toLowerCase() === q) {
      return wf;
    }
  }
  for (const wf of workflows) {
    const nameLower = wf.name.toLowerCase();
    if (nameLower.includes(q) || q.includes(nameLower)) {
      return wf;
    }
  }
  return null;
}

function splitTargetAndBrief(text: string): { target: string; brief: string } {
  const colonIdx = text.indexOf(':');
  if (colonIdx > 0) {
    return {
      target: text.slice(0, colonIdx).trim(),
      brief: text.slice(colonIdx + 1).trim(),
    };
  }
  const dashSplit = text.split(/\s+--\s+|\s+-\s+/);
  if (dashSplit.length > 1) {
    return {
      target: dashSplit[0].trim(),
      brief: dashSplit.slice(1).join(' ').trim(),
    };
  }
  return { target: text.trim(), brief: '' };
}

function parseMultiTargets(
  targetExpr: string,
  groups: Group[]
): { agent: Agent; group: Group }[] {
  if (!/[+,&]/.test(targetExpr)) return [];
  const parts = targetExpr
    .split(/[+,&]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 2) return [];

  const matched: { agent: Agent; group: Group }[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const hit = findAgentMatch(part, groups);
    if (!hit) return [];
    if (!seen.has(hit.agent.id)) {
      seen.add(hit.agent.id);
      matched.push(hit);
    }
  }
  return matched.length >= 2 ? matched : [];
}

export function parseOrbitOrder(
  rawInput: string,
  groups: Group[],
  workflows: WorkflowItem[],
  pinnedAgentId?: string | null
): ParsedOrder {
  const raw = rawInput.trim();
  if (!raw) return { type: 'empty' };
  const lower = raw.toLowerCase();

  // 1. Help
  if (lower === 'help' || lower === 'aide' || lower === '?' || lower === 'commands') {
    return { type: 'help' };
  }

  // 2. Status
  if (
    lower === 'status' ||
    lower === 'statut' ||
    lower === 'en cours' ||
    lower === 'running'
  ) {
    return { type: 'status' };
  }

  // 3. Preview modal
  if (lower === 'preview' || lower === 'open preview' || lower === 'aperçu' || lower === 'apercu') {
    return { type: 'open_preview' };
  }

  // 4. Reset all
  if (
    lower === 'reset all' ||
    lower === 'reset tous' ||
    lower === 'reset 36' ||
    lower === 'reset everything' ||
    lower === 'réinitialiser' ||
    lower === 'reinitialiser' ||
    lower === 'reset'
  ) {
    return { type: 'reset_all' };
  }

  // 5. Reset specific agent
  if (/^reset\s+/i.test(raw)) {
    const target = raw.replace(/^reset\s+/i, '').trim();
    const matched = findAgentMatch(target, groups);
    if (matched) {
      return { type: 'reset_agent', agent: matched.agent, group: matched.group };
    }
    return { type: 'unknown', raw };
  }

  // 6. Navigation commands ("open workflows", "go to history", "ouvre overview")
  if (/^(open|go to|ouvre|affiche|show)\s+/i.test(raw)) {
    const dest = raw.replace(/^(open|go to|ouvre|affiche|show)\s+/i, '').trim().toLowerCase();
    for (const alias of VIEW_ALIASES) {
      if (alias.keywords.some((kw) => dest === kw || dest.includes(kw))) {
        return { type: 'navigate', view: alias.view, label: alias.label };
      }
    }
  }

  // 7. Full 36-agent orchestration ("run all", "run 36 agents", "lance tous", "orchestrate all: <brief>")
  if (
    /^(?:run|lance|start|execute|exécute|trigger|orchestrate)\s+(?:all(?:\s+36)?(?:\s+agents)?|36(?:\s+agents)?|tous(?:\s+les\s+36)?(?:\s+agents)?)(?:$|\s*[:\-])/i.test(
      raw
    )
  ) {
    const brief = raw
      .replace(
        /^(?:run|lance|start|execute|exécute|trigger|orchestrate)\s+(?:all(?:\s+36)?(?:\s+agents)?|36(?:\s+agents)?|tous(?:\s+les\s+36)?(?:\s+agents)?)\s*[:\-]?\s*/i,
        ''
      )
      .trim();
    const allAgents = groups.flatMap((group) =>
      group.agents.map((agent) => ({ agent, group }))
    );
    return {
      type: 'run_all',
      agents: allAgents,
      prompt: brief || 'Execute synchronized 36-agent pipeline across all 6 pillars',
    };
  }

  // 8. Explicit workflow commands ("run workflow ...", "lance workflow ...", "workflow ...")
  if (/^(?:(?:run|lance|start|execute|exécute|trigger)\s+)?workflow\s+/i.test(raw)) {
    const wfQuery = raw
      .replace(/^(?:(?:run|lance|start|execute|exécute|trigger)\s+)?workflow\s+/i, '')
      .trim();
    const wf = findWorkflowMatch(wfQuery, workflows);
    if (wf) {
      return { type: 'run_workflow', workflow: wf };
    }
    return { type: 'unknown', raw };
  }

  // 9. Explicit group/pillar commands ("run group Research", "lance pôle Content")
  if (
    /^(?:(?:run|lance|start|execute|exécute|trigger)\s+)?(?:group|groupe|pole|pôle|pillar)\s+/i.test(
      raw
    )
  ) {
    const rest = raw
      .replace(
        /^(?:(?:run|lance|start|execute|exécute|trigger)\s+)?(?:group|groupe|pole|pôle|pillar)\s+/i,
        ''
      )
      .trim();
    const { target, brief } = splitTargetAndBrief(rest);
    const matchedGroup = findGroupMatch(target, groups);
    if (matchedGroup && matchedGroup.agents.length > 0) {
      const priorityAgent =
        matchedGroup.agents.find((a) => a.highlighted) ?? matchedGroup.agents[0];
      return {
        type: 'run_group',
        group: matchedGroup,
        priorityAgent,
        agents: matchedGroup.agents,
        prompt: brief || `Execute ${matchedGroup.title} pillar pipeline`,
      };
    }
    return { type: 'unknown', raw };
  }

  // 10. Explicit @mention ("@Trend Scout: scan hooks", "@Call Booker book meeting")
  if (raw.startsWith('@')) {
    const withoutAt = raw.slice(1).trim();
    const { target, brief } = splitTargetAndBrief(withoutAt);
    const multi = parseMultiTargets(target, groups);
    if (multi.length >= 2) {
      return { type: 'run_multi', targets: multi, prompt: brief || raw };
    }
    const direct = findAgentMatch(target, groups);
    if (direct) {
      return {
        type: 'run_agent',
        agent: direct.agent,
        group: direct.group,
        prompt: brief,
        matchedVia: 'explicit',
      };
    }
    for (const group of groups) {
      for (const agent of group.agents) {
        if (withoutAt.toLowerCase().startsWith(agent.name.toLowerCase())) {
          const remainder = withoutAt.slice(agent.name.length).replace(/^[\s:,-]+/, '').trim();
          return {
            type: 'run_agent',
            agent,
            group,
            prompt: remainder,
            matchedVia: 'explicit',
          };
        }
      }
    }
  }

  // 11. Explicit run/launch command ("lance Trend Scout", "run Audience Listener: check reddit", "run Trend Scout + Post Writer: brief")
  if (/^(run|lance|start|execute|exécute|trigger|ask|demande(?:\s+à)?)\s+/i.test(raw)) {
    const stripped = raw
      .replace(/^(run|lance|start|execute|exécute|trigger|ask|demande(?:\s+à)?)\s+/i, '')
      .trim();
    const { target, brief } = splitTargetAndBrief(stripped);

    const multi = parseMultiTargets(target, groups);
    if (multi.length >= 2) {
      return { type: 'run_multi', targets: multi, prompt: brief || stripped };
    }

    const matchedAgent = findAgentMatch(target, groups);
    if (matchedAgent) {
      return {
        type: 'run_agent',
        agent: matchedAgent.agent,
        group: matchedAgent.group,
        prompt: brief,
        matchedVia: 'explicit',
      };
    }

    // Try matching agent name embedded inside a longer sentence like "run Trend Scout for SaaS"
    for (const group of groups) {
      for (const agent of group.agents) {
        const idx = stripped.toLowerCase().indexOf(agent.name.toLowerCase());
        if (idx !== -1) {
          const remainder = (
            stripped.slice(0, idx) +
            ' ' +
            stripped.slice(idx + agent.name.length)
          )
            .replace(/^[\s:,-]+/, '')
            .trim();
          return {
            type: 'run_agent',
            agent,
            group,
            prompt: brief || remainder,
            matchedVia: 'explicit',
          };
        }
      }
    }

    // Try workflow match
    const wf = findWorkflowMatch(target, workflows);
    if (wf) {
      return { type: 'run_workflow', workflow: wf };
    }

    // Try group match
    const grp = findGroupMatch(target, groups);
    if (grp && grp.agents.length > 0) {
      const priorityAgent = grp.agents.find((a) => a.highlighted) ?? grp.agents[0];
      return {
        type: 'run_group',
        group: grp,
        priorityAgent,
        agents: grp.agents,
        prompt: brief || `Execute ${grp.title} pillar pipeline`,
      };
    }

    return { type: 'unknown', raw };
  }

  // 12. Pinned agent from the 36-agent dialogue selector takes priority for free-form prompts
  if (pinnedAgentId) {
    const pinned = findAgentById(pinnedAgentId, groups);
    if (pinned) {
      return {
        type: 'run_agent',
        agent: pinned.agent,
        group: pinned.group,
        prompt: raw,
        matchedVia: 'explicit',
      };
    }
  }

  // 13. Implicit multi or single agent mention ("Trend Scout: find SaaS hooks" or "Trend Scout")
  const { target, brief } = splitTargetAndBrief(raw);
  const multi = parseMultiTargets(target, groups);
  if (multi.length >= 2) {
    return { type: 'run_multi', targets: multi, prompt: brief || raw };
  }

  const directAgent = findAgentMatch(target, groups);
  if (directAgent) {
    return {
      type: 'run_agent',
      agent: directAgent.agent,
      group: directAgent.group,
      prompt: brief,
      matchedVia: 'explicit',
    };
  }

  // Check if an agent name appears cleanly inside the raw natural-language sentence
  for (const group of groups) {
    for (const agent of group.agents) {
      if (lower.includes(agent.name.toLowerCase())) {
        return {
          type: 'run_agent',
          agent,
          group,
          prompt: raw,
          matchedVia: 'explicit',
        };
      }
    }
  }

  // 14. Natural-language keyword routing across all 36 agents
  for (const hint of KEYWORD_AGENT_HINTS) {
    if (hint.keywords.some((kw) => lower.includes(kw))) {
      const matched = findAgentById(hint.agentId, groups);
      if (matched) {
        return {
          type: 'run_agent',
          agent: matched.agent,
          group: matched.group,
          prompt: raw,
          matchedVia: 'keyword',
        };
      }
    }
  }

  // 15. Natural-language free-form prompt fallback -> route to primary Research priority agent
  if (raw.split(/\s+/).length >= 3) {
    const primaryGroup = groups[0];
    const fallbackAgent =
      primaryGroup?.agents.find((a) => a.highlighted) ?? primaryGroup?.agents[0];
    if (primaryGroup && fallbackAgent) {
      return {
        type: 'run_agent',
        agent: fallbackAgent,
        group: primaryGroup,
        prompt: raw,
        matchedVia: 'fallback',
      };
    }
  }

  return { type: 'unknown', raw };
}

export function resolveLiveOrderTarget(
  rawInput: string,
  groups: Group[],
  workflows: WorkflowItem[],
  pinnedAgentId?: string | null
): LiveOrderTarget {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    if (pinnedAgentId) {
      const pinned = findAgentById(pinnedAgentId, groups);
      if (pinned) {
        return {
          agentIds: [pinned.agent.id],
          label: pinned.agent.name,
          kind: 'agent',
        };
      }
    }
    return { agentIds: [], label: '', kind: 'none' };
  }

  const parsed = parseOrbitOrder(trimmed, groups, workflows, pinnedAgentId);
  switch (parsed.type) {
    case 'run_agent':
    case 'reset_agent':
      return {
        agentIds: [parsed.agent.id],
        label: parsed.agent.name,
        kind: 'agent',
      };
    case 'run_group':
      return {
        agentIds: parsed.agents.map((a) => a.id),
        label: `${parsed.group.title} (${parsed.agents.length})`,
        kind: 'group',
      };
    case 'run_multi':
      return {
        agentIds: parsed.targets.map((t) => t.agent.id),
        label: `${parsed.targets.length} agents`,
        kind: 'multi',
      };
    case 'run_all':
      return {
        agentIds: parsed.agents.map((a) => a.agent.id),
        label: `All ${parsed.agents.length} agents`,
        kind: 'all',
      };
    case 'reset_all': {
      const allIds = groups.flatMap((g) => g.agents.map((a) => a.id));
      return {
        agentIds: allIds,
        label: `Reset ${allIds.length} agents`,
        kind: 'all',
      };
    }
    case 'run_workflow':
      return {
        agentIds: parsed.workflow.linkedAgentId ? [parsed.workflow.linkedAgentId] : [],
        label: parsed.workflow.name,
        kind: 'workflow',
      };
    default:
      return { agentIds: [], label: '', kind: 'none' };
  }
}

export function buildStatusSummary(groups: Group[]): string {
  const allAgents = groups.flatMap((g) => g.agents);
  const running = allAgents.filter((a) => a.status === 'running');
  const active = allAgents.filter((a) => a.status === 'active');
  const succeeded = allAgents.filter((a) => a.status === 'success');
  const failed = allAgents.filter((a) => a.status === 'error');

  if (running.length > 0) {
    return `Running (${running.length}): ${running.map((a) => a.name).join(', ')} · Active: ${active.length} · Succeeded: ${succeeded.length}`;
  }
  return `No agents currently running · ${active.length} active, ${succeeded.length} succeeded, ${failed.length} failed out of ${allAgents.length} total.`;
}
