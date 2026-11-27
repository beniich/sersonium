import type { ApprovalItem, TimeframeOption, WorkflowItem } from '../types/agent.ts';

export const initialWorkflows: WorkflowItem[] = [
  {
    id: 'wf-viral-to-revenue',
    name: 'Viral Content → Revenue',
    integrations: 'TikTok · Reddit · Figma · Stripe',
    folder: 'Finance',
    subfolder: 'Invoice recon',
    status: 'active',
    statusLabel: 'Live',
    isLive: true,
    icon: 'spark',
    sparkline: [8, 9, 10, 8, 10, 9, 10, 8, 9, 0, 0, 0],
    linkedAgentId: 'r1',
    description:
      'Trend Scout → Audience Listener → Competitor Watch → Post Writer → Visual Designer/Carousel/Voiceover/Video Editor → Brand Check/Approval Desk → Scheduler/TikTok/Reels → Post Analyst/Revenue Tracker → Loop Feeder.',
    runsCount: 142,
  },
  {
    id: 'wf-comment-to-booking',
    name: 'Comment Lead → Booked Call',
    integrations: 'Instagram · HubSpot · Booking',
    folder: 'People ops',
    status: 'active',
    statusLabel: 'Live',
    isLive: true,
    icon: 'calendar',
    sparkline: [7, 8, 9, 8, 10, 9, 8, 10, 0],
    linkedAgentId: 'r3',
    description:
      'Comment Miner → Lead Catcher → Lead Scorer → DM Agent → Call Booker → Reminder → Call Tracker → Follow-up & Payment Link → CRM Sync.',
    runsCount: 96,
  },
  {
    id: 'wf-reactive-competitor',
    name: 'Reactive Competitor Watch',
    integrations: 'YouTube · Analytics · TikTok',
    folder: 'IT & access',
    status: 'active',
    statusLabel: '18m ago',
    isLive: false,
    icon: 'shield',
    sparkline: [8, 7, 10, 6, 8, 9, 0],
    linkedAgentId: 'r4',
    description:
      'Competitor Watch → Post Analyst → Post Writer → Visual Designer & Video Editor → Brand Check → Scheduler & TikTok/Reels Poster → Loop Feeder.',
    runsCount: 54,
  },
  {
    id: 'wf-weekly-loop',
    name: 'Weekly Optimization Loop',
    integrations: 'Digest · Stripe · Feedback',
    folder: 'Finance',
    subfolder: 'Month-end close',
    status: 'active',
    statusLabel: '1h ago',
    isLive: false,
    icon: 'invoice',
    sparkline: [7, 9, 8, 10, 9, 8, 0],
    linkedAgentId: 'l5',
    description:
      'Weekly Report → Revenue Tracker → Post/Email/Call Analyst → Loop Feeder → Audience Listener & Comment Miner → Trend Scout.',
    runsCount: 64,
  },
  {
    id: 'wf-community-social-proof',
    name: 'Community Activation → Social Proof',
    integrations: 'Reviews · Messages · Knowledge',
    folder: 'People ops',
    status: 'active',
    statusLabel: '2h ago',
    isLive: false,
    icon: 'user',
    sparkline: [6, 8, 8, 7, 9, 8, 0],
    linkedAgentId: 'cm4',
    description:
      'Review Asker → Comment Replier → Lead Catcher → DM Agent → FAQ Builder → Escalation.',
    runsCount: 47,
  },
  {
    id: 'wf-email-to-closing',
    name: 'Email Sequence → Closing',
    integrations: 'Gmail · HubSpot · Billing',
    folder: 'Finance',
    subfolder: 'Vendors',
    status: 'active',
    statusLabel: 'Scheduled',
    isLive: false,
    icon: 'wallet',
    sparkline: [7, 8, 6, 9, 8, 0],
    linkedAgentId: 'r6',
    description:
      'Email Writer → Email Analyst → Lead Scorer → Call Booker → Payment Link → CRM Sync & Revenue Tracker → Loop Feeder.',
    runsCount: 78,
  },
  {
    id: 'wf-invoice-recon',
    name: 'Invoice reconciliation',
    integrations: 'Stripe · Billing · HubSpot',
    folder: 'Finance',
    subfolder: 'Invoice recon',
    status: 'active',
    statusLabel: 'Live',
    isLive: true,
    icon: 'invoice',
    sparkline: [7, 9, 7, 10, 8, 10, 7, 10, 8, 0, 0, 0],
    linkedAgentId: 'l2',
    description:
      'Reconciles Stripe payments collected via Payment Link and Revenue Tracker with HubSpot CRM.',
    runsCount: 112,
  },
  {
    id: 'wf-brand-compliance',
    name: 'Brand Compliance & Sign-Off',
    integrations: 'Guidelines · Review',
    folder: 'IT & access',
    status: 'paused',
    statusLabel: 'Paused',
    isLive: false,
    icon: 'shield',
    sparkline: [5, 7, 6, 4, 0, 0],
    linkedAgentId: 'c5',
    description:
      'Brand Check validates copy tone and visuals before forwarding to Approval Desk ahead of the Scheduler queue.',
    runsCount: 19,
  },
  {
    id: 'wf-refund-guardrail',
    name: 'Escalation & Refunds',
    integrations: 'Support · Billing · Review',
    folder: 'Finance',
    subfolder: 'Month-end close',
    status: 'paused',
    statusLabel: 'Paused',
    isLive: false,
    icon: 'wallet',
    sparkline: [6, 8, 5, 0],
    linkedAgentId: 'cm6',
    description:
      'Escalation intercepts sensitive support cases and high-value refunds for human review in Needs you.',
    runsCount: 31,
  },
  {
    id: 'wf-lead-enrichment-draft',
    name: 'Inbound lead CRM enrichment',
    integrations: 'HubSpot · Gmail · Capture',
    folder: 'People ops',
    status: 'draft',
    statusLabel: 'Draft',
    isLive: false,
    icon: 'user',
    sparkline: [4, 5, 0],
    linkedAgentId: 's1',
    description:
      'Lead Catcher feeds Lead Scorer and CRM Sync (HubSpot) to qualify inbound prospects automatically.',
    runsCount: 0,
  },
];

export const initialApprovals: ApprovalItem[] = [
  {
    id: 'AP-204',
    title: 'TikTok campaign brand compliance',
    subtitle: 'Access & brand review · requested by Brand Check',
    ageLabel: '12m',
    locked: true,
    status: 'pending',
    workflowId: 'wf-brand-compliance',
  },
  {
    id: 'AP-203',
    title: 'Refund $7,420 to Northwind',
    subtitle: 'Initiator: system · over the $5,000 auto-limit',
    ageLabel: '24m',
    status: 'pending',
    workflowId: 'wf-refund-guardrail',
  },
  {
    id: 'AP-201',
    title: 'VIP Email → Closing Sequence',
    subtitle: 'Pre-send review · Email Writer & Payment Link',
    ageLabel: '1h',
    status: 'pending',
    workflowId: 'wf-email-to-closing',
  },
];

export type ChartColumnPoint = {
  time: string;
  runs: number;
  dots: number;
  isPeak?: boolean;
  tone?: 'strong' | 'medium' | 'muted' | 'faint';
};

export const CHART_SERIES_BY_TIMEFRAME: Record<
  TimeframeOption,
  {
    totalRuns: number;
    deltaText: string;
    subtitle: string;
    successRate: string;
    medianRun: string;
    peakLabel: string;
    liveCount: number;
    scheduledCount: number;
    failedCount: number;
    queueCount: number;
    columns: ChartColumnPoint[];
    axisLabels: string[];
  }
> = {
  today: {
    totalRuns: 335,
    deltaText: '↑ 14% last Wednesday',
    subtitle: 'Runs since midnight, 82 more scheduled before 24:00',
    successRate: '99.4%',
    medianRun: '4.1 s',
    peakLabel: '09:25',
    liveCount: 3088,
    scheduledCount: 82,
    failedCount: 1,
    queueCount: 0,
    axisLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '24'],
    columns: [
      { time: '00:00', runs: 3, dots: 1, tone: 'medium' },
      { time: '01:00', runs: 2, dots: 1, tone: 'medium' },
      { time: '02:00', runs: 4, dots: 1, tone: 'medium' },
      { time: '03:00', runs: 3, dots: 1, tone: 'medium' },
      { time: '04:00', runs: 7, dots: 2, tone: 'medium' },
      { time: '05:00', runs: 26, dots: 8, tone: 'medium' },
      { time: '06:00', runs: 19, dots: 6, tone: 'medium' },
      { time: '07:00', runs: 8, dots: 2, tone: 'medium' },
      { time: '07:45', runs: 14, dots: 4, tone: 'medium' },
      { time: '08:30', runs: 24, dots: 7, tone: 'medium' },
      { time: '09:25', runs: 48, dots: 14, isPeak: true, tone: 'strong' },
      { time: '10:15', runs: 38, dots: 11, tone: 'strong' },
      { time: '11:00', runs: 28, dots: 8, tone: 'strong' },
      { time: '12:00', runs: 17, dots: 5, tone: 'medium' },
      { time: '13:30', runs: 11, dots: 3, tone: 'medium' },
      { time: '15:00', runs: 7, dots: 2, tone: 'muted' },
      { time: '16:30', runs: 4, dots: 1, tone: 'muted' },
      { time: '18:00', runs: 3, dots: 1, tone: 'muted' },
      { time: '19:30', runs: 3, dots: 1, tone: 'muted' },
      { time: '21:00', runs: 2, dots: 1, tone: 'faint' },
      { time: '22:30', runs: 1, dots: 1, tone: 'faint' },
      { time: '24:00', runs: 1, dots: 1, tone: 'faint' },
    ],
  },
  '7d': {
    totalRuns: 2418,
    deltaText: '↑ 9% prior 7 days',
    subtitle: 'Completed across 24 active workflows this week',
    successRate: '99.6%',
    medianRun: '3.8 s',
    peakLabel: 'Thu 10:00',
    liveCount: 3088,
    scheduledCount: 164,
    failedCount: 4,
    queueCount: 2,
    axisLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    columns: [
      { time: 'Mon AM', runs: 142, dots: 5, tone: 'medium' },
      { time: 'Mon PM', runs: 185, dots: 7, tone: 'medium' },
      { time: 'Tue AM', runs: 210, dots: 8, tone: 'medium' },
      { time: 'Tue PM', runs: 265, dots: 10, tone: 'strong' },
      { time: 'Wed AM', runs: 290, dots: 11, tone: 'strong' },
      { time: 'Wed PM', runs: 230, dots: 8, tone: 'medium' },
      { time: 'Thu AM', runs: 348, dots: 14, isPeak: true, tone: 'strong' },
      { time: 'Thu PM', runs: 274, dots: 10, tone: 'strong' },
      { time: 'Fri AM', runs: 215, dots: 8, tone: 'medium' },
      { time: 'Fri PM', runs: 132, dots: 5, tone: 'medium' },
      { time: 'Sat', runs: 68, dots: 3, tone: 'muted' },
      { time: 'Sun', runs: 59, dots: 2, tone: 'muted' },
    ],
  },
  '30d': {
    totalRuns: 10420,
    deltaText: '↑ 22% last month',
    subtitle: 'Automated runs executed across Finance, Ops & Orbit',
    successRate: '99.5%',
    medianRun: '4.0 s',
    peakLabel: 'Nov 14',
    liveCount: 3088,
    scheduledCount: 410,
    failedCount: 11,
    queueCount: 0,
    axisLabels: ['W1', 'W2', 'W3', 'W4'],
    columns: [
      { time: 'Nov 01', runs: 280, dots: 6, tone: 'medium' },
      { time: 'Nov 04', runs: 340, dots: 8, tone: 'medium' },
      { time: 'Nov 07', runs: 410, dots: 9, tone: 'medium' },
      { time: 'Nov 10', runs: 495, dots: 11, tone: 'strong' },
      { time: 'Nov 12', runs: 460, dots: 10, tone: 'strong' },
      { time: 'Nov 14', runs: 612, dots: 14, isPeak: true, tone: 'strong' },
      { time: 'Nov 16', runs: 520, dots: 12, tone: 'strong' },
      { time: 'Nov 18', runs: 475, dots: 10, tone: 'strong' },
      { time: 'Nov 20', runs: 390, dots: 9, tone: 'medium' },
      { time: 'Nov 22', runs: 335, dots: 7, tone: 'medium' },
    ],
  },
};
