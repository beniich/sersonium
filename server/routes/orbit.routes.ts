// server/routes/orbit.routes.ts
// SENSORIUM AI — Routeur des 36 Agents Orbit & Workflow Execution

import { Router, Request, Response } from 'express';
import {
  loadStore,
  findAgentContext,
  createAgentInStore,
  updateAgentInStore,
  deleteAgentInStore,
  setAgentStatusInStore,
  recordAgentRunInStore,
  clearRunHistoryInStore,
  runAgentOrchestration,
} from '../services/orbit.service.js';
import { createRunRecord } from '../../src/utils/orchestrator.js';
import type { AgentIconKey } from '../../src/types/agent.js';

const router = Router();

// Health check de l'orchestrateur
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    engine: 'sensorium-orbit-ai',
    agentsCount: 36,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// État complet des agents et de l'historique
router.get('/state', async (_req: Request, res: Response) => {
  try {
    const state = await loadStore();
    res.json({
      groups: state.groups,
      runHistory: state.runHistory,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load orbit state' });
  }
});

// Création d'un agent
router.post('/agents', async (req: Request, res: Response) => {
  try {
    const { groupId, name, description, icon, highlighted, platform } = req.body || {};
    if (!groupId || !name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Valid groupId and agent name are required.' });
      return;
    }

    const { agent, state } = await createAgentInStore({
      groupId,
      name: name.trim().slice(0, 80),
      description: (description || '').trim().slice(0, 500),
      icon: (icon as AgentIconKey) || 'spark',
      highlighted: Boolean(highlighted),
      platform: (platform || 'Sensorium').trim().slice(0, 40),
    });

    if (!agent) {
      res.status(404).json({ error: `Group "${groupId}" not found.` });
      return;
    }

    res.status(201).json({ agent, groups: state.groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create agent.' });
  }
});

// Mise à jour d'un agent
router.patch('/agents/:id', async (req: Request, res: Response) => {
  try {
    const agentId = req.params.id;
    const { name, description, highlighted } = req.body || {};

    const { agent, state } = await updateAgentInStore(agentId, {
      name: typeof name === 'string' ? name.trim().slice(0, 80) : undefined,
      description: typeof description === 'string' ? description.trim().slice(0, 500) : undefined,
      highlighted: typeof highlighted === 'boolean' ? highlighted : undefined,
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }

    res.json({ agent, groups: state.groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update agent.' });
  }
});

// Suppression d'un agent
router.delete('/agents/:id', async (req: Request, res: Response) => {
  try {
    const { deleted, state } = await deleteAgentInStore(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }
    res.json({ groups: state.groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete agent.' });
  }
});

// Réinitialisation du statut de l'agent
router.post('/agents/:id/reset', async (req: Request, res: Response) => {
  try {
    const state = await loadStore();
    const ctx = findAgentContext(state, req.params.id);
    if (!ctx) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }
    const nextState = await setAgentStatusInStore(req.params.id, 'idle');
    res.json({ groups: nextState.groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reset agent.' });
  }
});

// Exécution d'un agent (Run Agent)
router.post('/agents/:id/run', async (req: Request, res: Response) => {
  const agentId = req.params.id;
  try {
    const state = await loadStore();
    const ctx = findAgentContext(state, agentId);
    if (!ctx) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }

    const { prompt } = req.body || {};
    const userBrief = typeof prompt === 'string' ? prompt.trim().slice(0, 1500) : '';

    const result = await runAgentOrchestration({
      agent: ctx.agent,
      group: ctx.group,
      userBrief,
    });

    const tsLabel = new Date().toLocaleTimeString();
    const logs = [
      `[${tsLabel}] POST /api/agents/${ctx.agent.id}/run`,
      `[${tsLabel}] Modèle: ${result.model}`,
      `[${tsLabel}] 200 OK (${result.durationMs}ms)`,
      `[${tsLabel}] ${result.summary}`,
    ];

    const run = createRunRecord({
      agentId: ctx.agent.id,
      agentName: ctx.agent.name,
      groupId: ctx.group.id,
      groupTitle: ctx.group.title,
      status: 'success',
      durationMs: result.durationMs,
      summary: result.summary,
      logs,
      prompt: userBrief || undefined,
      deliverables: result.deliverables,
      nextActions: result.nextActions,
      model: result.model,
    });

    const nextState = await recordAgentRunInStore(run);
    res.json({
      run,
      groups: nextState.groups,
      runHistory: nextState.runHistory,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erreur lors de l\'exécution de l\'agent.' });
  }
});

// Effacement de l'historique
router.delete('/runs', async (_req: Request, res: Response) => {
  try {
    const nextState = await clearRunHistoryInStore();
    res.json({ runHistory: nextState.runHistory });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clear run history.' });
  }
});

export default router;

