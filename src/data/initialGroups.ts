import type { Group } from '../types/agent';

export const initialGroups: Group[] = [
  {
    id: 'research',
    title: 'Research',
    position: 'top-left',
    agents: [
      {
        id: 'r1',
        name: 'Trend Scout',
        icon: 'tiktok',
        platform: 'TikTok',
        description:
          'Detects emerging trends, viral audio hooks, and fast-rising video formats on TikTok.',
        status: 'active',
      },
      {
        id: 'r2',
        name: 'Audience Listener',
        icon: 'reddit',
        platform: 'Reddit',
        highlighted: true,
        description:
          'Monitors relevant Reddit communities to identify recurring pain points, frustrations, and audience needs.',
        status: 'active',
      },
      {
        id: 'r3',
        name: 'Comment Miner',
        icon: 'instagram',
        platform: 'Instagram',
        description:
          'Analyzes Instagram comment threads to extract high-intent buying questions and objections.',
        status: 'idle',
      },
      {
        id: 'r4',
        name: 'Competitor Watch',
        icon: 'youtube',
        platform: 'YouTube',
        description:
          'Tracks competitor publishing cadence, retention hooks, and untapped content gaps.',
        status: 'idle',
      },
      {
        id: 'r5',
        name: 'Post Writer',
        icon: 'flower',
        platform: 'Claude',
        description:
          'Synthesizes research insights into structured, conversion-focused post drafts.',
        status: 'active',
      },
      {
        id: 'r6',
        name: 'Email Writer',
        icon: 'mail',
        platform: 'Gmail',
        description:
          'Writes segmented email sequences grounded in real audience insights.',
        status: 'idle',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content',
    position: 'top-right',
    agents: [
      {
        id: 'c1',
        name: 'Visual Designer',
        icon: 'figma',
        platform: 'Figma',
        highlighted: true,
        description:
          'Creates on-brand visual templates, thumbnails, and social graphics.',
        status: 'active',
      },
      {
        id: 'c2',
        name: 'Carousel Builder',
        icon: 'spark',
        platform: 'Studio',
        description:
          'Builds multi-slide educational carousels optimized for saves and shares.',
        status: 'active',
      },
      {
        id: 'c3',
        name: 'Voiceover',
        icon: 'mic',
        platform: 'Audio',
        description:
          'Produces clear, well-paced voiceover tracks synchronized with the script.',
        status: 'idle',
      },
      {
        id: 'c4',
        name: 'Video Editor',
        icon: 'activity',
        platform: 'Timeline',
        description:
          'Edits video timelines with B-roll cuts, pacing adjustments, and dynamic captions.',
        status: 'idle',
      },
      {
        id: 'c5',
        name: 'Brand Check',
        icon: 'shield',
        platform: 'Guidelines',
        description:
          'Audits copy, tone of voice, and visual assets against brand and compliance guidelines.',
        status: 'active',
      },
      {
        id: 'c6',
        name: 'Approval Desk',
        icon: 'doc',
        platform: 'Review',
        description:
          'Packages final deliverables for human sign-off before entering the publishing queue.',
        status: 'idle',
      },
    ],
  },
  {
    id: 'loop',
    title: 'The loop',
    position: 'middle-left',
    agents: [
      {
        id: 'l1',
        name: 'Post Analyst',
        icon: 'chart',
        platform: 'Analytics',
        description:
          'Evaluates hook performance, watch time, and share velocity across published posts.',
        status: 'active',
      },
      {
        id: 'l2',
        name: 'Revenue Tracker',
        icon: 'stripe',
        platform: 'Stripe',
        highlighted: true,
        description:
          'Attributes each piece of content to generated revenue and MRR impact.',
        status: 'active',
      },
      {
        id: 'l3',
        name: 'Call Tracker',
        icon: 'zoom',
        platform: 'Calls',
        description:
          'Archives call transcripts and identifies topics that convert into booked meetings.',
        status: 'idle',
      },
      {
        id: 'l4',
        name: 'Email Analyst',
        icon: 'mail',
        platform: 'Email',
        description:
          'Analyzes open rates, replies, and click attribution across email sequences.',
        status: 'idle',
      },
      {
        id: 'l5',
        name: 'Weekly Report',
        icon: 'doc',
        platform: 'Digest',
        description:
          'Compiles an executive weekly digest on top-performing content and pipeline impact.',
        status: 'active',
      },
      {
        id: 'l6',
        name: 'Loop Feeder',
        icon: 'workflow',
        platform: 'Feedback',
        description:
          'Feeds winning angles and revenue signals back into the Research pillar.',
        status: 'idle',
      },
    ],
  },
  {
    id: 'publish',
    title: 'Publish',
    position: 'middle-right',
    agents: [
      {
        id: 'p1',
        name: 'Scheduler',
        icon: 'calendar',
        platform: 'Queue',
        description:
          'Selects optimal posting windows and balances publishing volume across channels.',
        status: 'active',
      },
      {
        id: 'p2',
        name: 'TikTok Poster',
        icon: 'tiktok',
        platform: 'TikTok',
        highlighted: true,
        description:
          'Publishes vertical videos with native captions, hashtags, and optimized metadata.',
        status: 'active',
      },
      {
        id: 'p3',
        name: 'Reels Poster',
        icon: 'instagram',
        platform: 'Instagram',
        description:
          'Publishes Instagram Reels with custom covers and first-comment CTAs.',
        status: 'idle',
      },
      {
        id: 'p4',
        name: 'Shorts Poster',
        icon: 'youtube',
        platform: 'YouTube',
        description:
          'Uploads YouTube Shorts and links them to related long-form videos.',
        status: 'idle',
      },
      {
        id: 'p5',
        name: 'X Poster',
        icon: 'x',
        platform: 'X (Twitter)',
        description:
          'Schedules threads and standalone posts tailored for feed engagement.',
        status: 'active',
      },
      {
        id: 'p6',
        name: 'Newsletter',
        icon: 'newsletter',
        platform: 'Newsletter',
        description:
          'Delivers curated weekly editions to active newsletter subscribers.',
        status: 'idle',
      },
    ],
  },
  {
    id: 'sales',
    title: 'Sales',
    position: 'bottom-left',
    agents: [
      {
        id: 's1',
        name: 'Lead Scorer',
        icon: 'database',
        platform: 'CRM',
        description:
          'Scores leads by engagement depth, company fit, and buying intent signals.',
        status: 'active',
      },
      {
        id: 's2',
        name: 'Call Booker',
        icon: 'calendar',
        platform: 'Booking',
        highlighted: true,
        description:
          'Qualifies interested leads and immediately sends a calendar booking link.',
        status: 'active',
      },
      {
        id: 's3',
        name: 'Reminder',
        icon: 'activity',
        platform: 'Alerts',
        description:
          'Sends pre-call SMS and email reminders to minimize meeting no-shows.',
        status: 'idle',
      },
      {
        id: 's4',
        name: 'Follow-up',
        icon: 'mail',
        platform: 'Outreach',
        description:
          'Automates post-call follow-ups and context-aware nurture sequences.',
        status: 'idle',
      },
      {
        id: 's5',
        name: 'Payment Link',
        icon: 'dollar',
        platform: 'Billing',
        description:
          'Generates custom checkout links and tracks invoice settlement status.',
        status: 'active',
      },
      {
        id: 's6',
        name: 'CRM Sync',
        icon: 'hubspot',
        platform: 'HubSpot',
        description:
          'Synchronizes deal stages, call notes, and revenue events across systems.',
        status: 'idle',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    position: 'bottom-right',
    agents: [
      {
        id: 'cm1',
        name: 'Comment Replier',
        icon: 'message',
        platform: 'Replies',
        highlighted: true,
        description:
          'Drafts and posts fast, on-brand replies across public comment sections.',
        status: 'active',
      },
      {
        id: 'cm2',
        name: 'DM Agent',
        icon: 'message',
        platform: 'Messages',
        description:
          'Handles direct messages and routes qualified prospects to call booking.',
        status: 'active',
      },
      {
        id: 'cm3',
        name: 'FAQ Builder',
        icon: 'doc',
        platform: 'Knowledge',
        description:
          'Turns recurring community questions into an up-to-date FAQ knowledge base.',
        status: 'idle',
      },
      {
        id: 'cm4',
        name: 'Review Asker',
        icon: 'spark',
        platform: 'Reviews',
        description:
          'Requests reviews and testimonials at peak customer satisfaction moments.',
        status: 'idle',
      },
      {
        id: 'cm5',
        name: 'Lead Catcher',
        icon: 'bot',
        platform: 'Capture',
        description:
          'Detects buying intent inside discussions and routes contacts to Sales.',
        status: 'active',
      },
      {
        id: 'cm6',
        name: 'Escalation',
        icon: 'shield',
        platform: 'Support',
        description:
          'Flags sensitive cases and escalates urgent requests to a human operator.',
        status: 'idle',
      },
    ],
  },
];
