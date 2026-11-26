// src/data/initialWorkflows.ts
// SENSORIUM AI × Fieldnote - Initial 24 Workflows
// Mapped to SENSORIUM's 36 AI Agents & ZTNA Sovereign Infrastructure

import type { WorkflowItem } from '../types/agent';

export const initialWorkflows: WorkflowItem[] = [
  // 1. Invoice reconciliation (Active, Live)
  {
    id: 'wf-invoice-recon',
    name: 'Invoice reconciliation',
    icon: 'invoice',
    integrations: 'Stripe · Netsuite',
    status: 'active',
    statusLabel: 'Live',
    isLive: true,
    sparkline: [3, 5, 2, 8, 9, 7, 10, 8, 6, 9, 10, 4],
    agentId: 'agent-finance-audit',
  },
  // 2. Employee onboarding
  {
    id: 'wf-employee-onboarding',
    name: 'Employee onboarding',
    icon: 'user',
    integrations: 'Rippling · Okta, Slack',
    status: 'active',
    statusLabel: '18m ago',
    sparkline: [2, 4, 3, 6, 7, 5, 8, 9, 6, 7, 8, 5],
    agentId: 'agent-iam-provisioner',
  },
  // 3. Quarterly access review
  {
    id: 'wf-quarterly-access',
    name: 'Quarterly access review',
    icon: 'shield',
    integrations: 'Okta · Quarterly · AWS',
    status: 'active',
    statusLabel: '1h ago',
    sparkline: [4, 6, 2, 7, 8, 6, 9, 7, 5, 6, 8, 3],
    agentId: 'agent-ztna-guard',
  },
  // 4. Vendor renewals
  {
    id: 'wf-vendor-renewals',
    name: 'Vendor renewals',
    icon: 'calendar',
    integrations: 'Subpart · Gmail',
    status: 'active',
    statusLabel: '3h ago',
    sparkline: [1, 2, 0, 4, 3, 2, 5, 4, 2, 3, 4, 1],
    agentId: 'agent-contract-watcher',
  },
  // 5. Payroll export
  {
    id: 'wf-payroll-export',
    name: 'Payroll export',
    icon: 'payroll',
    integrations: 'Gusto · 11:00 AM',
    status: 'active',
    statusLabel: 'Scheduled',
    sparkline: [0, 0, 1, 2, 0, 1, 3, 2, 1, 2, 0, 2],
    agentId: 'agent-payroll-export',
  },
  // 6. Kafka Telemetry Edge Ingestion
  {
    id: 'wf-kafka-telemetry',
    name: 'Kafka Edge Telemetry',
    icon: 'activity',
    integrations: 'Broker 9092 · InfluxDB',
    status: 'active',
    statusLabel: 'Live',
    isLive: true,
    sparkline: [9, 10, 8, 10, 9, 10, 8, 10, 9, 10, 10, 9],
    agentId: 'agent-kafka-telemetry',
  },
  // 7. ZTNA Microsegmentation Audit
  {
    id: 'wf-ztna-microsegmentation',
    name: 'ZTNA Microsegmentation Audit',
    icon: 'shield',
    integrations: 'Palo Alto · Cilium eBPF',
    status: 'active',
    statusLabel: '12m ago',
    sparkline: [5, 6, 4, 7, 8, 9, 7, 8, 6, 7, 9, 5],
    agentId: 'agent-ztna-audit',
  },
  // 8. ESG Carbon Footprint Aggregator
  {
    id: 'wf-esg-carbon',
    name: 'ESG Scope 1-3 Carbon Footprint',
    icon: 'activity',
    integrations: 'Grafana · IoT Sensors · Schneider',
    status: 'active',
    statusLabel: '45m ago',
    sparkline: [4, 5, 3, 6, 5, 7, 6, 8, 5, 6, 7, 4],
    agentId: 'agent-esg-footprint',
  },
  // 9. DORA Resilience Chaos Drill
  {
    id: 'wf-dora-resilience',
    name: 'DORA Digital Resilience Drill',
    icon: 'cpu',
    integrations: 'Chaos Mesh · EKS · Multi-AZ',
    status: 'active',
    statusLabel: '2h ago',
    sparkline: [3, 4, 2, 5, 6, 4, 7, 5, 3, 5, 6, 2],
    agentId: 'agent-dora-chaos',
  },
  // 10. Autonomous Drone Inspection Dispatch
  {
    id: 'wf-drone-inspection',
    name: 'Edge Robotics Perimeter Patrol',
    icon: 'cpu',
    integrations: 'DJI Matrice 300 · RTMP Stream',
    status: 'active',
    statusLabel: '30m ago',
    sparkline: [6, 7, 5, 8, 9, 8, 7, 9, 6, 8, 9, 6],
    agentId: 'agent-robotics-patrol',
  },
  // 11. Customer Churn Prediction
  {
    id: 'wf-churn-prediction',
    name: 'Predictive Churn Engine',
    icon: 'activity',
    integrations: 'Snowflake · Segment · Mixpanel',
    status: 'active',
    statusLabel: '4h ago',
    sparkline: [2, 3, 1, 4, 3, 5, 4, 6, 3, 4, 5, 2],
    agentId: 'agent-sales-churn',
  },
  // 12. Digital Twin Physics Telemetry
  {
    id: 'wf-digital-twin-sync',
    name: '3D Digital Twin Sync',
    icon: 'cpu',
    integrations: 'Three.js · BIM Revit · OPC-UA',
    status: 'active',
    statusLabel: 'Live',
    isLive: true,
    sparkline: [8, 9, 7, 10, 8, 9, 10, 9, 8, 10, 9, 8],
    agentId: 'agent-digital-twin',
  },
  // 13. High-Value Lead Enrichment
  {
    id: 'wf-lead-enrichment',
    name: 'B2B Lead Intelligence Agent',
    icon: 'user',
    integrations: 'HubSpot · LinkedIn · Clearbit',
    status: 'active',
    statusLabel: '5h ago',
    sparkline: [3, 4, 2, 5, 4, 6, 5, 7, 4, 5, 6, 3],
    agentId: 'agent-lead-enricher',
  },
  // 14. IAM Privileged Key Rotation
  {
    id: 'wf-iam-key-rotation',
    name: 'Vault Sovereign Key Rotation',
    icon: 'shield',
    integrations: 'HashiCorp Vault · AWS KMS',
    status: 'active',
    statusLabel: '6h ago',
    sparkline: [1, 2, 1, 3, 2, 4, 3, 5, 2, 3, 4, 1],
    agentId: 'agent-vault-rotator',
  },
  // 15. Real-time Threat Defense
  {
    id: 'wf-threat-defense',
    name: 'AI Honeypot & Threat Isolation',
    icon: 'shield',
    integrations: 'WAF · Cloudflare · Suricata',
    status: 'active',
    statusLabel: 'Live',
    isLive: true,
    sparkline: [7, 8, 6, 9, 10, 8, 9, 10, 7, 9, 8, 7],
    agentId: 'agent-threat-detector',
  },
  // 16. Multi-Cloud Cost Optimizer
  {
    id: 'wf-finops-optimizer',
    name: 'Multi-Cloud FinOps Optimization',
    icon: 'invoice',
    integrations: 'AWS CUR · Azure FinOps · GCP',
    status: 'active',
    statusLabel: '8h ago',
    sparkline: [2, 3, 1, 4, 3, 5, 4, 6, 3, 4, 5, 2],
    agentId: 'agent-finops-optimizer',
  },
  // 17. Social Sentiment Pulse
  {
    id: 'wf-social-sentiment',
    name: 'Omnichannel Brand Sentiment',
    icon: 'activity',
    integrations: 'X API · Discord · Reddit Webhooks',
    status: 'active',
    statusLabel: '9h ago',
    sparkline: [4, 5, 3, 6, 5, 7, 6, 8, 4, 6, 7, 3],
    agentId: 'agent-brand-sentiment',
  },
  // 18. Smart Facility HVAC Automation
  {
    id: 'wf-hvac-automation',
    name: 'Edge HVAC Dynamic Modulation',
    icon: 'activity',
    integrations: 'BACnet · Modbus IP · Trane BMS',
    status: 'active',
    statusLabel: '10h ago',
    sparkline: [5, 6, 4, 7, 6, 8, 7, 9, 5, 7, 8, 4],
    agentId: 'agent-hvac-controller',
  },

  // --- PAUSED WORKFLOWS (4) ---
  // 19. Stale Docker Image Pruner
  {
    id: 'wf-docker-pruner',
    name: 'Stale Container Registry Prune',
    icon: 'cpu',
    integrations: 'Harbor · Docker Hub · AWS ECR',
    status: 'paused',
    statusLabel: 'Paused 2d ago',
    sparkline: [2, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    agentId: 'agent-container-cleaner',
  },
  // 20. Legacy FTP Sync
  {
    id: 'wf-legacy-ftp',
    name: 'Legacy SFTP EDI Exchanger',
    icon: 'calendar',
    integrations: 'OpenSSH SFTP · SAP S/4HANA',
    status: 'paused',
    statusLabel: 'Paused 5d ago',
    sparkline: [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    agentId: 'agent-edi-sync',
  },
  // 21. Ad Spend Bidding Robot
  {
    id: 'wf-ad-spend-bidder',
    name: 'Meta & Google Ads RTB Optimizer',
    icon: 'invoice',
    integrations: 'Google Ads API · Meta Graph API',
    status: 'paused',
    statusLabel: 'Paused 1w ago',
    sparkline: [3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    agentId: 'agent-ad-bidder',
  },
  // 22. Warehouse AGV Auto-Charging
  {
    id: 'wf-agv-charging',
    name: 'Warehouse AGV Battery Docking',
    icon: 'cpu',
    integrations: 'ROS2 · LiDAR Navigation · KUKA',
    status: 'paused',
    statusLabel: 'Paused 3d ago',
    sparkline: [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    agentId: 'agent-agv-docking',
  },

  // --- DRAFTS WORKFLOWS (2) ---
  // 23. Quantum Cryptography Migration
  {
    id: 'wf-quantum-crypto',
    name: 'Post-Quantum Lattice Key Exchange',
    icon: 'shield',
    integrations: 'Kyber 1024 · Dilithium · OpenSSL 3.2',
    status: 'draft',
    statusLabel: 'Draft v0.3',
    sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    agentId: 'agent-pqc-crypto',
  },
  // 24. LoRaWAN Agricultural Gateway Mesh
  {
    id: 'wf-lorawan-mesh',
    name: 'Agri-Sensor Soil Humidity Mesh',
    icon: 'activity',
    integrations: 'LoRaWAN TTN · ESP32 · Solar Hub',
    status: 'draft',
    statusLabel: 'Draft v0.1',
    sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    agentId: 'agent-lorawan-mesh',
  },
];

