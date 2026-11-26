// src/data/initialApprovals.ts
// SENSORIUM AI × Fieldnote - Initial Human-in-the-Loop Approvals
// Critical ZTNA authorization queue requiring human verification before agent execution

import type { ApprovalItem } from '../types/agent';

export const initialApprovals: ApprovalItem[] = [
  {
    id: 'AP-204',
    title: 'Okta admin for Leo Park',
    subtitle: 'Access review · asked by Trinity Rivera',
    ageLabel: '12m',
    status: 'pending',
    locked: true,
    agentId: 'agent-iam-provisioner',
  },
  {
    id: 'AP-203',
    title: 'Refund $7,420 to Northwind',
    subtitle: 'Initiator: system · over the $5,000 auto-limit',
    ageLabel: '24m',
    status: 'pending',
    locked: false,
    agentId: 'agent-finance-audit',
  },
  {
    id: 'AP-201',
    title: 'Remove 3 stale vendors',
    subtitle: 'Vendor renewal revokation by System',
    ageLabel: '1h',
    status: 'pending',
    locked: false,
    agentId: 'agent-contract-watcher',
  },
  {
    id: 'AP-198',
    title: 'Promote K8s Ingress to Global Gateway',
    subtitle: 'Zero Trust ingress policy elevation requested by CI/CD agent',
    ageLabel: '2h',
    status: 'pending',
    locked: true,
    agentId: 'agent-ztna-guard',
  },
  {
    id: 'AP-195',
    title: 'Rotate Master Vault Sovereign Keys',
    subtitle: 'Quarterly cryptographic key renewal policy triggered',
    ageLabel: '3h',
    status: 'pending',
    locked: true,
    agentId: 'agent-vault-rotator',
  },
];

