import type { Agent } from '../types/agent.ts';

export type AgentSourceSpec = {
  source: string;
  dataType: string;
  description: string;
};

export type AgentParamSpec = {
  parameter: string;
  example: string;
  role: string;
};

export type AgentOutputTargetSpec = {
  targetAgent: string;
  payloadType: string;
  description: string;
};

export type AgentAlgorithmStep = {
  title: string;
  summary: string;
  formula?: string;
  signals: string[];
};

export type AgentTechnicalSpec = {
  agentId: string;
  agentName: string;
  sources: AgentSourceSpec[];
  analyzedSignals: string[];
  parameters: AgentParamSpec[];
  contextualInputs: { fromAgent: string; detail: string }[];
  sampleInputJson: Record<string, unknown>;
  outputs: AgentOutputTargetSpec[];
  sampleOutputJson: Record<string, unknown>;
  algorithms: AgentAlgorithmStep[];
  pipelineSteps: string[];
};

const DETAILED_SPECS: Record<string, AgentTechnicalSpec> = {
  r1: {
    agentId: 'r1',
    agentName: 'Trend Scout',
    sources: [
      {
        source: 'TikTok For You / Search',
        dataType: 'Videos + metadata',
        description:
          'Trending videos, audio tracks used, hashtags, view counts, likes, shares, and comments.',
      },
      {
        source: 'TikTok Creative Center',
        dataType: 'Official trends',
        description:
          'Viral sounds, rising hashtags, popular effects, and trend forecasts.',
      },
      {
        source: 'TikTok API / Scraping',
        dataType: 'Raw data',
        description:
          'Post volume per sound/hashtag, growth rate, and propagation velocity.',
      },
      {
        source: 'CapCut / Popular Sounds',
        dataType: 'Audio Hooks',
        description: 'Most-used sounds across recent templates and videos.',
      },
      {
        source: 'Manual Watch / Lists',
        dataType: 'Tracked accounts',
        description: 'Competitor accounts, influential creators, and niche accounts to monitor.',
      },
    ],
    analyzedSignals: [
      'Rapid growth of a sound (e.g., +300% usage in 48h)',
      'Repeating new formats (hook structure, transition type, duration)',
      'Emerging hashtags with high engagement rate',
      'Recurring text hooks in the first 3 seconds',
      'Recurring effects/transitions and completion / share rates',
    ],
    parameters: [
      {
        parameter: 'Niches / Keywords',
        example: '"productivity", "saas", "personal growth"',
        role: 'Filters trends relevant to the brand',
      },
      {
        parameter: 'Growth threshold',
        example: '+150% in 24-48h',
        role: 'Defines what qualifies as emerging',
      },
      {
        parameter: 'Languages & Min. volume',
        example: 'en, fr · > 500 videos',
        role: 'Targets active markets without micro-noise',
      },
      {
        parameter: 'Frequency & Blacklist',
        example: 'Every 4-6h · exclusions',
        role: 'Keeps data fresh and removes saturated sounds',
      },
    ],
    contextualInputs: [
      { fromAgent: 'Loop Feeder', detail: 'Angles and topics that already performed strongly recently' },
      { fromAgent: 'Audience Listener', detail: 'Problems and frustrations actively discussed on Reddit' },
      { fromAgent: 'Competitor Watch', detail: 'Topics already covered or missed by competitors' },
      { fromAgent: 'Post Analyst', detail: 'Hook types with the highest retention performance' },
    ],
    sampleInputJson: {
      niches: ['productivity', 'no-code tools', 'freelance'],
      languages: ['en', 'fr'],
      growth_threshold: 1.8,
      time_window: '48h',
      min_video_count: 400,
      priority_accounts: ['@account1', '@account2'],
      exclude_sounds: ['overused_sound_1'],
      feedback_from_loop: ["hooks mentioning 'wasted time'", 'before/after formats'],
    },
    outputs: [
      {
        targetAgent: 'Post Writer',
        payloadType: 'Validated Hooks & Formats',
        description:
          'Top first-3-second text hooks, winning narrative structures, and recommended angle.',
      },
      {
        targetAgent: 'Visual Designer',
        payloadType: 'Visual Codes & Templates',
        description:
          'Thumbnail styles, dominant palettes, typography, and rising CapCut formats.',
      },
      {
        targetAgent: 'Video Editor',
        payloadType: 'Audio Hooks & Pacing',
        description:
          'Viral sound IDs, BPM, cut timing (e.g., 1.4s), and transitions to replicate.',
      },
      {
        targetAgent: 'Audience Listener',
        payloadType: 'Emerging Topics to Cross-Check',
        description:
          'Rising TikTok themes to validate against real user pain points on Reddit.',
      },
      {
        targetAgent: 'Scheduler',
        payloadType: 'Window of Opportunity',
        description:
          'Estimated trend lifespan (e.g., peak in 36h) to prioritize queue placement.',
      },
    ],
    sampleOutputJson: {
      scan_id: 'ts-2026-11-27-09h',
      trend_score: 91.4,
      signal_status: 'emerging_high_velocity',
      detected_trends: [
        {
          id: 'tr-hook-before-after-01',
          niche: 'no-code tools',
          audio_hook: { title: 'Clean Lo-Fi Beat #44', growth_48h: '+285%', saturation: 'low' },
          visual_format: 'Split-screen Before/After + centered 3s text',
          opening_hook_template: 'You spend 6h every week doing this manually...',
          metrics: { velocity: 2.85, engagement_velocity: 0.114, novelty_score: 0.88, creators_diversity: 0.79 },
          recommended_ttl_hours: 48,
        },
      ],
      routing: {
        to_post_writer: ['hook_template', 'pain_angle'],
        to_video_editor: ['audio_hook', 'cut_pacing_ms'],
        to_visual_designer: ['split_screen_layout', 'caption_style'],
        to_audience_listener: ['no-code tools', 'time automation'],
      },
    },
    algorithms: [
      {
        title: '1. Growth Velocity',
        summary: 'Measures volume acceleration of a sound, hashtag, or format over 24h-48h.',
        formula: 'Velocity = (Current_Volume - Previous_Volume) / Previous_Volume',
        signals: ['Growth > +150% to +300%', '7-day moving average comparison', 'Second-derivative acceleration'],
      },
      {
        title: '2. Abnormal Spike Detection',
        summary: 'Detects sudden statistical breakouts relative to the historical baseline.',
        formula: 'Z-Score = (x - μ) / σ  |  EWMA_t = α·x_t + (1 - α)·EWMA_{t-1}',
        signals: ['Z-Score > 2.5', 'IQR Outliers (Q3 + 1.5×IQR)', 'EWMA exponential smoothing'],
      },
      {
        title: '3. Engagement Velocity & Novelty',
        summary: 'Evaluates real quality (shares/views, completion) and multi-creator freshness.',
        formula: 'Trend Score = 0.35·Growth + 0.25·Engagement + 0.20·Novelty + 0.10·Diversity + 0.10·Official',
        signals: ['Shares/Views & Completion', 'Creator diversity (anti-spam)', 'First-3-second hook clustering'],
      },
    ],
    pipelineSteps: [
      'Data collection (sounds, hashtags, formats)',
      'Growth Velocity & Anomaly Detection computation (Z-Score / EWMA)',
      'Engagement Velocity & Novelty Score calculation',
      'Format & hook clustering (first 3 seconds)',
      'Composite Trend Score & quality filtering',
      'Routing to Post Writer, Video Editor, Visual Designer & Audience Listener',
    ],
  },
  r2: {
    agentId: 'r2',
    agentName: 'Audience Listener',
    sources: [
      {
        source: 'Targeted Reddit Subreddits',
        dataType: 'Posts + full threads',
        description: 'Questions, complaints, tool requests, and user feedback across niche subreddits.',
      },
      {
        source: 'Reddit Search & Hot/Rising',
        dataType: 'Rising signals',
        description: 'Discussions rapidly gaining upvotes and reply volume.',
      },
      {
        source: 'Deep Comment Threads',
        dataType: 'Raw verbatims',
        description: 'Exact phrases used by practitioners to describe their blockers.',
      },
    ],
    analyzedSignals: [
      'Recurring frustrations and unsolved problems (Pain Intensity)',
      'Explicit mentions of competing solutions and dissatisfaction reasons',
      'Exact Voice of Customer phrases reusable in hooks',
      'Budget inquiries / intent to switch tools',
    ],
    parameters: [
      { parameter: 'Tracked subreddits', example: 'r/SaaS, r/entrepreneur, r/nocode', role: 'Targets high-ICP-density communities' },
      { parameter: 'Analysis window', example: 'Last 7 days', role: 'Balances freshness with statistical volume' },
      { parameter: 'Upvote / reply threshold', example: '>= 15 upvotes or 8 comments', role: 'Filters out isolated low-resonance posts' },
      { parameter: 'Intent keywords', example: '"alternative to", "how do you", "hate"', role: 'Isolates urgent needs and buying intent' },
    ],
    contextualInputs: [
      { fromAgent: 'Trend Scout', detail: 'Emerging TikTok topics to validate on Reddit' },
      { fromAgent: 'Comment Miner', detail: 'Frequent objections captured from Instagram' },
      { fromAgent: 'Loop Feeder', detail: 'Pain angles that produced the highest MRR' },
    ],
    sampleInputJson: {
      subreddits: ['r/SaaS', 'r/freelance', 'r/nocode'],
      time_window: '7d',
      min_comments: 8,
      intent_phrases: ['struggling with', 'alternative to', 'waste of time'],
      topics_from_trend_scout: ['no-code tools', 'crm automation'],
    },
    outputs: [
      {
        targetAgent: 'Post Writer',
        payloadType: 'Pain & Verbatim Matrix',
        description: 'Top 5 problems ranked by urgency with exact quotes for ultra-relevant posts.',
      },
      {
        targetAgent: 'Email Writer',
        payloadType: 'Segments & Objections',
        description: 'Rebuttals for psychological blockers and solution-oriented subject lines.',
      },
      {
        targetAgent: 'FAQ Builder',
        payloadType: 'Recurring Questions',
        description: 'New frequent questions ready to convert into help pages or carousels.',
      },
      {
        targetAgent: 'Trend Scout',
        payloadType: 'Watch Keywords',
        description: 'New emerging terms to monitor on TikTok.',
      },
    ],
    sampleOutputJson: {
      scan_id: 'al-2026-11-27',
      top_pain_clusters: [
        {
          cluster_id: 'pain-manual-reporting',
          label: 'Time wasted on weekly client reporting',
          pain_score: 89.2,
          mentions_count: 64,
          sentiment_polarity: -0.71,
          verbatim_quotes: ['I spend every Friday afternoon copying CSVs into Notion'],
        },
      ],
    },
    algorithms: [
      {
        title: '1. Semantic Extraction & Pain Clustering',
        summary: 'Vectorizes posts and groups similar complaints by semantic proximity.',
        formula: 'Cluster Coherence = mean(cosine_sim(e_i, centroid_k))',
        signals: ['Dense thread embeddings', 'HDBSCAN / k-means clustering', 'Emotional n-gram extraction'],
      },
      {
        title: '2. Pain Intensity Scoring (Pain Score)',
        summary: 'Weights frequency, emotional urgency, community engagement, and business value.',
        formula: 'Pain Score = 0.35·Frequency + 0.30·Negative_Intensity + 0.20·Thread_Engagement + 0.15·Purchase_Intent',
        signals: ['Sentiment analysis (VADER / LLM)', 'Comment-to-upvote ratio', 'Urgency marker detection'],
      },
      {
        title: '3. Emerging Trend Detection (Topic Drift)',
        summary: 'Compares this week’s cluster frequency against the prior 4 weeks.',
        formula: 'Topic Lift = P(topic | week_t) / P(topic | baseline_30d)',
        signals: ['Topic Lift > 1.6x', 'Cross-check with Trend Scout TikTok signals'],
      },
    ],
    pipelineSteps: [
      'Ingestion of targeted Reddit posts and comments',
      'Anti-spam / bot filtering and language detection',
      'Sentiment analysis and verbatim extraction',
      'Semantic clustering of recurring problems',
      'Pain Score & Topic Lift computation',
      'Distribution to Post Writer, Email Writer, FAQ Builder & Trend Scout',
    ],
  },
  s1: {
    agentId: 's1',
    agentName: 'Lead Scorer',
    sources: [
      {
        source: 'CRM & HubSpot',
        dataType: 'Profiles & firmographics',
        description: 'Company size, job title, industry, contact history, and deal stages.',
      },
      {
        source: 'Community & Comment Miner',
        dataType: 'Social intent signals',
        description: 'Comments, inbound DMs, bio link clicks, and asset downloads.',
      },
      {
        source: 'Email Analyst & Stripe',
        dataType: 'Engagement & billing',
        description: 'Repeated opens, pricing page clicks, and payment history.',
      },
    ],
    analyzedSignals: [
      'ICP Fit (Ideal Customer Profile: decision-maker role, size, industry)',
      'Explicit intent (demo request, pricing question, checkout visit)',
      'Interaction recency and velocity (Time Decay)',
    ],
    parameters: [
      { parameter: 'Hot Lead threshold', example: 'Score >= 75 / 100', role: 'Triggers immediate routing to Call Booker' },
      { parameter: 'Time half-life (Decay)', example: '7 days', role: 'Reduces weight of older interactions' },
      { parameter: 'ICP vs Behavior weight', example: '40% Fit / 60% Intent', role: 'Balances company profile with recent actions' },
    ],
    contextualInputs: [
      { fromAgent: 'Lead Catcher', detail: 'New prospects captured from DMs / comments' },
      { fromAgent: 'Email Analyst', detail: 'Contacts clicking a CTA >= 2 times' },
      { fromAgent: 'Revenue Tracker', detail: 'Profiles matching highest-LTV customers' },
    ],
    sampleInputJson: {
      lead_id: 'ld-9081',
      company_size: 45,
      role: 'Head of Growth',
      events: ['clicked_pricing_page', 'replied_dm_interested', 'downloaded_playbook'],
      last_activity_hours_ago: 3,
    },
    outputs: [
      {
        targetAgent: 'Call Booker',
        payloadType: 'Hot Leads (>= 75)',
        description: 'Sends hot leads with full context to immediately offer a booking slot.',
      },
      {
        targetAgent: 'Follow-up',
        payloadType: 'Warm Leads (45-74)',
        description: 'Triggers a targeted nurture sequence based on the detected objection.',
      },
      {
        targetAgent: 'CRM Sync',
        payloadType: 'Updated Score & Tier',
        description: 'Updates HubSpot properties and pipeline stage.',
      },
    ],
    sampleOutputJson: {
      lead_id: 'ld-9081',
      score: 88,
      tier: 'HOT',
      breakdown: { icp_fit: 36, behavioral_intent: 52 },
      next_agent: 'Call Booker',
    },
    algorithms: [
      {
        title: '1. Hybrid Fit + Intent Model',
        summary: 'Combines static ICP score with weighted behavioral intent score.',
        formula: 'Lead Score = 0.40 × ICP_Fit + 0.60 × Intent_Velocity',
        signals: ['Decision-maker role & target size', 'High-intent actions (pricing, DM, booking)'],
      },
      {
        title: '2. Exponential Decay (Time Decay)',
        summary: 'Gives maximum weight to signals from the last 24-72h.',
        formula: 'W(t) = exp(-λ · Δt_hours)',
        signals: ['Configurable half-life', 'Multi-channel recurrence bonus'],
      },
    ],
    pipelineSteps: [
      'Collection of CRM, Social, Email, and Web events',
      'ICP profile enrichment',
      'Time Decay application on every event',
      'Composite 0-100 scoring and tiering (Cold / Warm / Hot)',
      'Routing to Call Booker, Follow-up & CRM Sync',
    ],
  },
};

const PILLAR_DEFAULT_SPEC: Record<
  string,
  Omit<AgentTechnicalSpec, 'agentId' | 'agentName'>
> = {
  research: {
    sources: [
      { source: 'Social & web platform signals', dataType: 'Content & metadata', description: 'Public feeds, comments, trends, and competitor posts.' },
      { source: 'Loop Feeder Memory', dataType: 'Performance history', description: 'Winning angles and attribution feedback from prior cycles.' },
    ],
    analyzedSignals: [
      'Topic and format emergence velocity',
      'High-intent questions and recurring objections',
      'Thematic gaps left uncovered by competitors',
    ],
    parameters: [
      { parameter: 'Observation window', example: '24h - 7d', role: 'Controls Research pillar responsiveness' },
      { parameter: 'Languages / Markets', example: 'en, fr', role: 'Targets priority audiences' },
    ],
    contextualInputs: [
      { fromAgent: 'Loop Feeder', detail: 'Priority themes from the latest weekly digest' },
      { fromAgent: 'Post Analyst', detail: 'Retention performance of recent hooks' },
    ],
    sampleInputJson: { pillar: 'Research', window: '48h', languages: ['en', 'fr'], priority_focus: 'conversion' },
    outputs: [
      { targetAgent: 'Visual Designer & Carousel Builder', payloadType: 'Creative briefs', description: 'Validated angles and hooks ready for production.' },
      { targetAgent: 'Approval Desk', payloadType: 'Structured drafts', description: 'Proposals ready to enter the Content phase.' },
    ],
    sampleOutputJson: { status: 'validated', pillar: 'Research', insights_count: 6, handoff_target: 'Content' },
    algorithms: [
      {
        title: 'Signal-to-Noise & ICP Relevance Scoring',
        summary: 'Ranks each insight by velocity, buyer intent, and market fit.',
        formula: 'Insight Score = 0.40·Velocity + 0.35·Intent + 0.25·ICP_Match',
        signals: ['Semantic deduplication', 'Noise / spam filtering', 'Conversion prioritization'],
      },
    ],
    pipelineSteps: [
      'Multi-source collection',
      'Semantic filtering and deduplication',
      'Relevance & intent scoring',
      'Structured handoff to Content',
    ],
  },
  content: {
    sources: [
      { source: 'Research Briefs (Post Writer / Trend Scout)', dataType: 'Scripts & hooks', description: 'Structured copy, editorial angles, and recommended formats.' },
      { source: 'Brand Guidelines & Figma Assets', dataType: 'Brand Guidelines', description: 'Colors, typography, tone of voice, and compliance rules.' },
    ],
    analyzedSignals: [
      'Mobile readability and visual impact in the first 3 seconds',
      'Strict adherence to brand rules and approved claims',
      'Audio / subtitle / B-roll pacing alignment',
    ],
    parameters: [
      { parameter: 'Target format', example: '9:16 Reels/TikTok · 4:5 Carousel', role: 'Adapts layout template per channel' },
      { parameter: 'Brand Check threshold', example: '>= 95% compliance', role: 'Blocks non-compliant outputs before Approval Desk' },
    ],
    contextualInputs: [
      { fromAgent: 'Trend Scout', detail: 'Rising audio hooks and visual templates' },
      { fromAgent: 'Brand Check', detail: 'Editorial and visual validation rules' },
    ],
    sampleInputJson: { pillar: 'Content', format: 'vertical_9_16', brand_profile: 'sensorium_v2', strict_compliance: true },
    outputs: [
      { targetAgent: 'Scheduler', payloadType: 'Publish-ready assets', description: 'Validated and approved creatives ready for scheduling.' },
      { targetAgent: 'Approval Desk', payloadType: 'Human review package', description: 'Full preview with compliance score.' },
    ],
    sampleOutputJson: { status: 'ready_for_publish', compliance_score: 98, assets: ['thumbnail_v1.png', 'video_subtitled.mp4'] },
    algorithms: [
      {
        title: 'Brand Check & Visual Retention Verification',
        summary: 'Checks contrast, visual pacing, and lexical compliance prior to sign-off.',
        formula: 'Quality Gate = min(Brand_Compliance, Readability_Score, Pacing_Index)',
        signals: ['WCAG contrast & social safe-zones', 'Prohibited claims detection', 'Audio/caption synchronization'],
      },
    ],
    pipelineSteps: [
      'Research brief intake',
      'Multi-format creative generation / assembly',
      'Automated Brand Check review',
      'Final Approval Desk validation → Publish',
    ],
  },
  loop: {
    sources: [
      { source: 'Analytics, Stripe & Calls', dataType: 'Metrics & revenue', description: 'Views, retention, email clicks, transcripts, and MRR payments.' },
    ],
    analyzedSignals: [
      'Correlation between opening hooks and collected revenue (MRR)',
      'Drop-off points in videos and email sequences',
      'Call topics converting best into paid meetings',
    ],
    parameters: [
      { parameter: 'Attribution window', example: '30-day multi-touch', role: 'Links every piece of content to real conversions' },
      { parameter: 'Digest cycle', example: 'Weekly (Monday 08:00)', role: 'Feeds Weekly Report and Loop Feeder' },
    ],
    contextualInputs: [
      { fromAgent: 'Revenue Tracker', detail: 'MRR attribution by content and campaign' },
      { fromAgent: 'CRM Sync', detail: 'Won/lost deals and sales cycle length' },
    ],
    sampleInputJson: { pillar: 'The loop', attribution_window_days: 30, include_mrr: true },
    outputs: [
      { targetAgent: 'Trend Scout & Audience Listener', payloadType: 'Winning signals', description: 'Automatic re-injection of highest-ROI formats and angles.' },
    ],
    sampleOutputJson: { status: 'loop_updated', top_roi_angle: 'before_after_automation', attributed_mrr_eur: 14200 },
    algorithms: [
      {
        title: 'Multi-Touch Attribution & ROI Elasticity',
        summary: 'Distributes generated revenue across touchpoints preceding payment.',
        formula: 'Content ROI = Attributed_MRR / Production_Cost_Effort',
        signals: ['Time-weighted attribution', 'Creative fatigue detection', 'Loop Feeder feedback cycle'],
      },
    ],
    pipelineSteps: [
      'Aggregation of engagement metrics + Stripe + calls',
      'Multi-touch attribution calculation',
      'Winning angle & drop-off identification',
      'Re-injection via Loop Feeder to Research',
    ],
  },
  publish: {
    sources: [
      { source: 'Approval Desk & Scheduler', dataType: 'Approved queue', description: 'Approved assets with metadata, captions, and target slots.' },
    ],
    analyzedSignals: [
      'Audience peak windows by timezone',
      'Optimal spacing to prevent cross-channel cannibalization',
    ],
    parameters: [
      { parameter: 'Weekly cadence', example: '5-7 posts / channel', role: 'Maintains consistency without saturation' },
      { parameter: 'Target timezone', example: 'Europe/Paris · America/New_York', role: 'Optimizes publishing hour' },
    ],
    contextualInputs: [
      { fromAgent: 'Approval Desk', detail: 'Validated content ready to publish' },
      { fromAgent: 'Post Analyst', detail: 'Historical hours with peak completion rate' },
    ],
    sampleInputJson: { pillar: 'Publish', channels: ['TikTok', 'Instagram', 'YouTube', 'X', 'Newsletter'], timezone: 'America/New_York' },
    outputs: [
      { targetAgent: 'Post Analyst & Comment Replier', payloadType: 'Published URLs & IDs', description: 'Immediately activates performance tracking and reply moderation.' },
    ],
    sampleOutputJson: { status: 'published', scheduled_slots: 12, active_channels: ['TikTok', 'Reels', 'Shorts', 'X'] },
    algorithms: [
      {
        title: 'Slot Optimization & Multi-Channel Smoothing',
        summary: 'Maximizes initial reach while preventing publishing collisions.',
        formula: 'Slot Score = Audience_Online_Prob × (1 - Channel_Overlap_Penalty)',
        signals: ['Timezone activity curves', 'Format rotation', 'First-comment CTA trigger'],
      },
    ],
    pipelineSteps: [
      'Receipt of approved assets',
      'Optimal slot calculation per platform',
      'Native publishing (captions, covers, tags)',
      'Notification to Post Analyst & Community',
    ],
  },
  sales: {
    sources: [
      { source: 'HubSpot CRM, Billing & Booking', dataType: 'Leads & transactions', description: 'Engagement scores, booked meetings, reminders, and payment links.' },
    ],
    analyzedSignals: [
      'Conversion probability and no-show risk',
      'Responsiveness to post-call follow-ups and billing link opens',
    ],
    parameters: [
      { parameter: 'Booking SLA', example: '< 2 min after qualification', role: 'Maximizes hot lead booking rate' },
      { parameter: 'Pre-call reminders', example: 'T-24h + T-1h (SMS + Email)', role: 'Keeps no-show rate below 8%' },
    ],
    contextualInputs: [
      { fromAgent: 'Lead Catcher & DM Agent', detail: 'Real-time qualified prospects' },
      { fromAgent: 'Call Tracker', detail: 'Call notes and objections to personalize follow-ups' },
    ],
    sampleInputJson: { pillar: 'Sales', pipeline: 'B2B_Inbound', auto_booking_threshold: 75, send_payment_link: true },
    outputs: [
      { targetAgent: 'Revenue Tracker & CRM Sync', payloadType: 'Deals & collections', description: 'Updates deal stages and attributes revenue to source content.' },
    ],
    sampleOutputJson: { status: 'pipeline_synced', qualified_leads: 14, calls_booked: 6, pending_invoices: 3 },
    algorithms: [
      {
        title: 'Real-Time Qualification & Closing Orchestration',
        summary: 'Automatically routes each prospect based on score and pipeline stage.',
        formula: 'Priority = Lead_Score × Urgency_Multiplier × Deal_Value_Estimate',
        signals: ['Behavioral scoring', 'No-show risk detection', 'Contextual post-call follow-up'],
      },
    ],
    pipelineSteps: [
      'Inbound lead intake and scoring',
      'Booking link dispatch',
      'Automated SMS/Email reminders',
      'Post-call follow-up, Payment Link & HubSpot sync',
    ],
  },
  community: {
    sources: [
      { source: 'Comments, DMs & Customer Reviews', dataType: 'Inbound conversations', description: 'Direct messages, public comments, sensitive tickets, and reviews.' },
    ],
    analyzedSignals: [
      'Hidden purchase intent inside comments and DMs',
      'Negative sentiment or critical escalation requiring human intervention',
      'Repetitive questions suited for an FAQ entry',
    ],
    parameters: [
      { parameter: 'Target response time', example: '< 5 minutes', role: 'Boosts algorithmic reach and captures warm leads' },
      { parameter: 'Escalation threshold', example: 'Sentiment < -0.6 or dispute', role: 'Transfers immediately to a human operator' },
    ],
    contextualInputs: [
      { fromAgent: 'TikTok / Reels / Shorts Poster', detail: 'New posts requiring active comment monitoring' },
      { fromAgent: 'FAQ Builder', detail: 'Brand-aligned approved knowledge base' },
    ],
    sampleInputJson: { pillar: 'Community', channels: ['Instagram', 'TikTok', 'YouTube'], auto_capture_leads: true },
    outputs: [
      { targetAgent: 'Lead Scorer & CRM Sync', payloadType: 'Detected prospects', description: 'Forwards every buying signal captured from comments or DMs.' },
      { targetAgent: 'Approvals (Needs you)', payloadType: 'Sensitive cases', description: 'Secure human escalation for critical situations.' },
    ],
    sampleOutputJson: { status: 'engaged', replies_sent: 42, leads_captured: 7, escalations_flagged: 1 },
    algorithms: [
      {
        title: 'Intent Classification & Safe Routing',
        summary: 'Classifies every incoming message (Question, Purchase, Review, Risk) and enforces guardrails.',
        formula: 'Route = argmax(P(Lead), P(FAQ), P(Escalation))',
        signals: ['Purchase intent detection', 'Toxicity / dispute analysis', 'FAQ knowledge matching'],
      },
    ],
    pipelineSteps: [
      'Real-time comment and DM listening',
      'Classification (Engagement / Lead / FAQ / Escalation)',
      'On-brand reply or handoff to Sales / Human',
      'Continuous FAQ enrichment and review collection',
    ],
  },
};

export function getAgentTechnicalSpec(
  agent: Pick<Agent, 'id' | 'name' | 'description' | 'platform'>,
  groupId: string
): AgentTechnicalSpec {
  const exact = DETAILED_SPECS[agent.id];
  if (exact) {
    return exact;
  }

  const base = PILLAR_DEFAULT_SPEC[groupId] ?? PILLAR_DEFAULT_SPEC.research;
  return {
    agentId: agent.id,
    agentName: agent.name,
    ...base,
    sampleInputJson: {
      agent_id: agent.id,
      agent_name: agent.name,
      platform: agent.platform ?? 'API',
      ...base.sampleInputJson,
    },
    sampleOutputJson: {
      agent_id: agent.id,
      agent_name: agent.name,
      summary: agent.description,
      ...base.sampleOutputJson,
    },
  };
}
