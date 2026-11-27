export type TimeWindowOption = '24h' | '48h' | '7d';

export type TrendLanguage = 'fr' | 'en' | 'es';

export type TrendScoutConfig = {
  velocityThresholdPct: number;
  zScoreThreshold: number;
  minVideoCount: number;
  timeWindow: TimeWindowOption;
  niches: string[];
  languages: TrendLanguage[];
  excludeSaturated: boolean;
};

export type RawTrendSignal = {
  id: string;
  title: string;
  audioHook: string;
  visualFormat: string;
  niche: string;
  language: TrendLanguage;
  volumePrev: number;
  volumeCurrent: number;
  engagementRate: number; // 0..1 (weighted likes/shares/comments/completion)
  noveltyScore: number; // 0..1
  creatorsDiversity: number; // 0..1
  officialSignal: boolean;
  saturation: 'low' | 'medium' | 'high';
  baselineMeanGrowthPct: number;
  baselineStdGrowthPct: number;
};

export type EvaluatedTrendSignal = RawTrendSignal & {
  growthVelocityPct: number;
  zScore: number;
  trendScore: number;
  matchesNiche: boolean;
  matchesLanguage: boolean;
  matchesVolume: boolean;
  matchesSaturation: boolean;
  matchesVelocity: boolean;
  matchesZScore: boolean;
  passed: boolean;
  rejectionReason: string | null;
};

export type TrendEvaluationSummary = {
  signals: EvaluatedTrendSignal[];
  passedSignals: EvaluatedTrendSignal[];
  totalCount: number;
  passedCount: number;
  rejectedThresholdCount: number;
  rejectedFilterCount: number;
  avgTrendScore: number;
  avgVelocityPct: number;
  maxZScore: number;
};

export const AVAILABLE_TREND_NICHES = [
  'productivity',
  'no-code tools',
  'freelance',
  'saas',
  'personal growth',
  'ai automation',
];

export const DEFAULT_TREND_SCOUT_CONFIG: TrendScoutConfig = {
  velocityThresholdPct: 180,
  zScoreThreshold: 2.5,
  minVideoCount: 400,
  timeWindow: '48h',
  niches: ['productivity', 'no-code tools', 'freelance', 'saas'],
  languages: ['fr', 'en'],
  excludeSaturated: true,
};

export const TREND_SCOUT_RAW_SIGNALS: RawTrendSignal[] = [
  {
    id: 'sig-01',
    title: 'You waste 6h/week doing this manually',
    audioHook: 'Clean Lo-Fi Beat #44',
    visualFormat: 'Split-screen Before/After 3s',
    niche: 'no-code tools',
    language: 'fr',
    volumePrev: 210,
    volumeCurrent: 810,
    engagementRate: 0.88,
    noveltyScore: 0.91,
    creatorsDiversity: 0.84,
    officialSignal: true,
    saturation: 'low',
    baselineMeanGrowthPct: 58,
    baselineStdGrowthPct: 62,
  },
  {
    id: 'sig-02',
    title: '3 Notion automations nobody uses',
    audioHook: 'Tech Synth Pulse 118bpm',
    visualFormat: 'Screen POV + Dynamic Zoom',
    niche: 'productivity',
    language: 'fr',
    volumePrev: 320,
    volumeCurrent: 1090,
    engagementRate: 0.83,
    noveltyScore: 0.85,
    creatorsDiversity: 0.79,
    officialSignal: true,
    saturation: 'low',
    baselineMeanGrowthPct: 52,
    baselineStdGrowthPct: 54,
  },
  {
    id: 'sig-03',
    title: 'How I replaced 4 SaaS tools with 1 workflow',
    audioHook: 'Minimalist Piano Loop',
    visualFormat: 'White text hook + desk B-roll',
    niche: 'saas',
    language: 'en',
    volumePrev: 440,
    volumeCurrent: 1410,
    engagementRate: 0.81,
    noveltyScore: 0.78,
    creatorsDiversity: 0.86,
    officialSignal: true,
    saturation: 'medium',
    baselineMeanGrowthPct: 49,
    baselineStdGrowthPct: 55,
  },
  {
    id: 'sig-04',
    title: 'Client onboarding in 90 seconds flat',
    audioHook: 'Fast Cut Percs v2',
    visualFormat: 'Timer + live screen capture',
    niche: 'freelance',
    language: 'fr',
    volumePrev: 180,
    volumeCurrent: 575,
    engagementRate: 0.79,
    noveltyScore: 0.86,
    creatorsDiversity: 0.73,
    officialSignal: false,
    saturation: 'low',
    baselineMeanGrowthPct: 45,
    baselineStdGrowthPct: 52,
  },
  {
    id: 'sig-05',
    title: 'AI Agent Swarm Demo in 15s',
    audioHook: 'Cyber Ambient Drop',
    visualFormat: 'Animated diagram + fast voiceover',
    niche: 'ai automation',
    language: 'en',
    volumePrev: 260,
    volumeCurrent: 1240,
    engagementRate: 0.92,
    noveltyScore: 0.94,
    creatorsDiversity: 0.88,
    officialSignal: true,
    saturation: 'low',
    baselineMeanGrowthPct: 64,
    baselineStdGrowthPct: 68,
  },
  {
    id: 'sig-06',
    title: '5AM morning routine with no phone',
    audioHook: 'Acoustic Sunrise (Saturated)',
    visualFormat: 'Aesthetic slow-motion vlog',
    niche: 'personal growth',
    language: 'fr',
    volumePrev: 900,
    volumeCurrent: 2150,
    engagementRate: 0.62,
    noveltyScore: 0.34,
    creatorsDiversity: 0.91,
    officialSignal: true,
    saturation: 'high',
    baselineMeanGrowthPct: 60,
    baselineStdGrowthPct: 45,
  },
  {
    id: 'sig-07',
    title: 'Freelance invoicing without awkward follow-ups',
    audioHook: 'Indie Guitar Riff',
    visualFormat: 'Facecam + Slack bubbles',
    niche: 'freelance',
    language: 'fr',
    volumePrev: 240,
    volumeCurrent: 540,
    engagementRate: 0.71,
    noveltyScore: 0.68,
    creatorsDiversity: 0.69,
    officialSignal: false,
    saturation: 'low',
    baselineMeanGrowthPct: 42,
    baselineStdGrowthPct: 48,
  },
  {
    id: 'sig-08',
    title: 'Stop paying $200/mo for CRM seats',
    audioHook: 'Deep Bass Alert',
    visualFormat: 'Split-screen price comparison',
    niche: 'saas',
    language: 'en',
    volumePrev: 150,
    volumeCurrent: 360,
    engagementRate: 0.74,
    noveltyScore: 0.77,
    creatorsDiversity: 0.62,
    officialSignal: false,
    saturation: 'low',
    baselineMeanGrowthPct: 40,
    baselineStdGrowthPct: 46,
  },
  {
    id: 'sig-09',
    title: 'Automate your CRM in 5 minutes',
    audioHook: 'Latina Lo-Fi Groove',
    visualFormat: 'Step-by-step subtitled tutorial',
    niche: 'no-code tools',
    language: 'es',
    volumePrev: 190,
    volumeCurrent: 680,
    engagementRate: 0.84,
    noveltyScore: 0.82,
    creatorsDiversity: 0.75,
    officialSignal: true,
    saturation: 'low',
    baselineMeanGrowthPct: 47,
    baselineStdGrowthPct: 56,
  },
  {
    id: 'sig-10',
    title: 'Deep work 90 minutes timer challenge',
    audioHook: 'Brown Noise Focus',
    visualFormat: 'Minimalist desk timelapse',
    niche: 'productivity',
    language: 'en',
    volumePrev: 500,
    volumeCurrent: 980,
    engagementRate: 0.66,
    noveltyScore: 0.52,
    creatorsDiversity: 0.81,
    officialSignal: false,
    saturation: 'medium',
    baselineMeanGrowthPct: 44,
    baselineStdGrowthPct: 42,
  },
];

const WINDOW_MULTIPLIER: Record<TimeWindowOption, { velocity: number; zScore: number }> = {
  '24h': { velocity: 1.12, zScore: 1.08 },
  '48h': { velocity: 1.0, zScore: 1.0 },
  '7d': { velocity: 0.84, zScore: 0.88 },
};

export function evaluateTrendSignals(
  rawSignals: RawTrendSignal[],
  config: TrendScoutConfig
): TrendEvaluationSummary {
  const normalizedNiches = config.niches.map((n) => n.trim().toLowerCase()).filter(Boolean);
  const mult = WINDOW_MULTIPLIER[config.timeWindow];

  const evaluated: EvaluatedTrendSignal[] = rawSignals.map((signal) => {
    const rawVelocityPct =
      signal.volumePrev > 0
        ? ((signal.volumeCurrent - signal.volumePrev) / signal.volumePrev) * 100
        : 0;
    const growthVelocityPct = Number((rawVelocityPct * mult.velocity).toFixed(1));

    const rawZ =
      signal.baselineStdGrowthPct > 0
        ? (growthVelocityPct - signal.baselineMeanGrowthPct) / signal.baselineStdGrowthPct
        : 0;
    const zScore = Number(Math.max(0, rawZ * mult.zScore).toFixed(2));

    // Composite Trend Score (0 - 100)
    const normGrowth = Math.min(1, Math.max(0, growthVelocityPct / 350));
    const officialVal = signal.officialSignal ? 1 : 0.25;
    const trendScore = Number(
      (
        (0.35 * normGrowth +
          0.25 * signal.engagementRate +
          0.2 * signal.noveltyScore +
          0.1 * signal.creatorsDiversity +
          0.1 * officialVal) *
        100
      ).toFixed(1)
    );

    const matchesNiche =
      normalizedNiches.length === 0 ||
      normalizedNiches.some(
        (n) =>
          signal.niche.toLowerCase().includes(n) ||
          signal.title.toLowerCase().includes(n) ||
          n.includes(signal.niche.toLowerCase())
      );
    const matchesLanguage =
      config.languages.length === 0 || config.languages.includes(signal.language);
    const matchesVolume = signal.volumeCurrent >= config.minVideoCount;
    const matchesSaturation = !config.excludeSaturated || signal.saturation !== 'high';
    const matchesVelocity = growthVelocityPct >= config.velocityThresholdPct;
    const matchesZScore = zScore >= config.zScoreThreshold;

    const passed =
      matchesNiche &&
      matchesLanguage &&
      matchesVolume &&
      matchesSaturation &&
      matchesVelocity &&
      matchesZScore;

    let rejectionReason: string | null = null;
    if (!matchesNiche) rejectionReason = 'Out of niche';
    else if (!matchesLanguage) rejectionReason = 'Excluded language';
    else if (!matchesSaturation) rejectionReason = 'Saturated sound';
    else if (!matchesVolume) rejectionReason = `Volume < ${config.minVideoCount}`;
    else if (!matchesVelocity) rejectionReason = `Velocity < +${config.velocityThresholdPct}%`;
    else if (!matchesZScore) rejectionReason = `Z-Score < ${config.zScoreThreshold.toFixed(1)}`;

    return {
      ...signal,
      growthVelocityPct,
      zScore,
      trendScore,
      matchesNiche,
      matchesLanguage,
      matchesVolume,
      matchesSaturation,
      matchesVelocity,
      matchesZScore,
      passed,
      rejectionReason,
    };
  });

  evaluated.sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? -1 : 1;
    return b.trendScore - a.trendScore;
  });

  const passedSignals = evaluated.filter((s) => s.passed);
  const rejectedFilterCount = evaluated.filter(
    (s) => !s.matchesNiche || !s.matchesLanguage || !s.matchesVolume || !s.matchesSaturation
  ).length;
  const rejectedThresholdCount = evaluated.filter(
    (s) =>
      s.matchesNiche &&
      s.matchesLanguage &&
      s.matchesVolume &&
      s.matchesSaturation &&
      (!s.matchesVelocity || !s.matchesZScore)
  ).length;

  const avgTrendScore =
    passedSignals.length > 0
      ? Number(
          (
            passedSignals.reduce((acc, s) => acc + s.trendScore, 0) / passedSignals.length
          ).toFixed(1)
        )
      : 0;
  const avgVelocityPct =
    passedSignals.length > 0
      ? Math.round(
          passedSignals.reduce((acc, s) => acc + s.growthVelocityPct, 0) / passedSignals.length
        )
      : 0;
  const maxZScore =
    passedSignals.length > 0
      ? Number(Math.max(...passedSignals.map((s) => s.zScore)).toFixed(2))
      : 0;

  return {
    signals: evaluated,
    passedSignals,
    totalCount: evaluated.length,
    passedCount: passedSignals.length,
    rejectedThresholdCount,
    rejectedFilterCount,
    avgTrendScore,
    avgVelocityPct,
    maxZScore,
  };
}

export function buildTrendScoutConfigPrompt(
  config: TrendScoutConfig,
  summary: TrendEvaluationSummary
): string {
  const payload = {
    niches: config.niches,
    languages: config.languages,
    velocity_threshold_pct: config.velocityThresholdPct,
    z_score_threshold: config.zScoreThreshold,
    min_video_count: config.minVideoCount,
    time_window: config.timeWindow,
    exclude_saturated: config.excludeSaturated,
    validated_signals_preview: summary.passedSignals.slice(0, 3).map((s) => ({
      title: s.title,
      niche: s.niche,
      velocity_pct: s.growthVelocityPct,
      z_score: s.zScore,
      trend_score: s.trendScore,
    })),
  };
  return `Applied Trend Scout settings: ${JSON.stringify(payload)}`;
}
