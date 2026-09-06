export type DataStatus = 
  | "FRESH"
  | "DELAYED"
  | "STALE"
  | "PARTIAL"
  | "UNAVAILABLE"
  | "OBSERVED"
  | "ESTIMATED"
  | "SIMULATED";

export type SignificanceLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type MeaningfulChangeInput = {
  symbol: string;
  priceChangePct?: number;
  marketChangePct?: number;
  sectorChangePct?: number;
  peerChangePct?: number;
  volumeRatio?: number;
  historicalZScore?: number;
  eventSignal?: number;
  userRelevance?: number;
  hasData: boolean;
  isStale?: boolean;
  isDelayed?: boolean;
  hasConflict?: boolean;
};

export type ClassifiedChange = {
  symbol: string;
  score: number;
  level: SignificanceLevel;
  isMeaningful: boolean;
  status: DataStatus;
  summary: string;
};

export type WelcomeState = {
  title: string;
  message: string;
  meaningfulCount: number;
  minorCount: number;
  lastViewedAt?: string;
};

export class MeaningfulChangeEngine {
  static weights = {
    priceMovement: 20,
    historicalUnusualness: 15,
    volumeAnomaly: 15,
    marketRelative: 15,
    sectorRelative: 10,
    peerRelative: 10,
    companyEventSignal: 10,
    userRelevance: 5,
  } as const;

  static getStatus(input: Pick<MeaningfulChangeInput, "hasData" | "isStale" | "isDelayed" | "hasConflict">): DataStatus {
    if (!input.hasData) return "UNAVAILABLE";
    if (input.hasConflict) return "PARTIAL";
    if (input.isStale) return "STALE";
    if (input.isDelayed) return "DELAYED";
    return "FRESH";
  }

  static buildWelcomeState({
    isReturningUser,
    meaningfulCount,
    minorCount = 0,
    lastViewedAt,
  }: {
    isReturningUser: boolean;
    meaningfulCount: number;
    minorCount?: number;
    lastViewedAt?: string;
  }): WelcomeState {
    if (!isReturningUser) {
      return {
        title: "Welcome to SmartPilot Watch",
        message: "Your watchlist is ready. We will highlight the movements that are worth your attention.",
        meaningfulCount: 0,
        minorCount: minorCount || 0,
      };
    }

    return {
      title: "Welcome back",
      message: lastViewedAt ? `You were last here at ${lastViewedAt}.` : "You were last here recently.",
      meaningfulCount,
      minorCount,
      lastViewedAt,
    };
  }

  static classify(input: MeaningfulChangeInput): ClassifiedChange {
    return classifyChange(input);
  }

  rankSignals(signals: MeaningfulChangeInput[]): ClassifiedChange[] {
    const deduped = new Map<string, MeaningfulChangeInput>();

    for (const signal of signals) {
      const key = signal.symbol.trim().toUpperCase();
      if (!deduped.has(key)) deduped.set(key, signal);
    }

    return [...deduped.values()]
      .map((signal) => classifyChange(signal))
      .sort((a, b) => b.score - a.score);
  }
}

export function classifyChange(input: MeaningfulChangeInput): ClassifiedChange {
  if (!input.hasData) {
    return {
      symbol: input.symbol,
      score: 0,
      level: "LOW",
      isMeaningful: false,
      status: "UNAVAILABLE",
      summary: "Missing market data. No meaningful change can be confirmed.",
    };
  }

  let score = 0;

  const price = typeof input.priceChangePct === "number" ? input.priceChangePct : 0;
  const market = typeof input.marketChangePct === "number" ? input.marketChangePct : 0;
  const sector = typeof input.sectorChangePct === "number" ? input.sectorChangePct : 0;
  const peer = typeof input.peerChangePct === "number" ? input.peerChangePct : 0;
  const volume = typeof input.volumeRatio === "number" ? input.volumeRatio : 1;
  const history = typeof input.historicalZScore === "number" ? input.historicalZScore : 0;
  const event = typeof input.eventSignal === "number" ? input.eventSignal : 0;
  const relevance = typeof input.userRelevance === "number" ? input.userRelevance : 0;

  const relativeToMarket = Math.max(0, Math.abs(price) - Math.abs(market));
  const relativeToSector = Math.max(0, Math.abs(price) - Math.abs(sector));
  const relativeToPeer = Math.max(0, Math.abs(price) - Math.abs(peer));

  const priceScore = clamp((Math.abs(price) * 100) / 8, 0, 100) * (MeaningfulChangeEngine.weights.priceMovement / 100);
  const historicalScore = clamp((Math.max(0, history) * 100) / 4, 0, 100) * (MeaningfulChangeEngine.weights.historicalUnusualness / 100);
  const volumeScore = clamp((Math.log(Math.max(1, volume)) / Math.log(4)) * 100, 0, 100) * (MeaningfulChangeEngine.weights.volumeAnomaly / 100);
  const marketRelativeScore = clamp((relativeToMarket / 4) * 100, 0, 100) * (MeaningfulChangeEngine.weights.marketRelative / 100);
  const sectorRelativeScore = clamp((relativeToSector / 4) * 100, 0, 100) * (MeaningfulChangeEngine.weights.sectorRelative / 100);
  const peerRelativeScore = clamp((relativeToPeer / 4) * 100, 0, 100) * (MeaningfulChangeEngine.weights.peerRelative / 100);
  const eventScore = clamp(event * 100, 0, 100) * (MeaningfulChangeEngine.weights.companyEventSignal / 100);
  const userScore = clamp(relevance * 100, 0, 100) * (MeaningfulChangeEngine.weights.userRelevance / 100);

  score = priceScore + historicalScore + volumeScore + marketRelativeScore + sectorRelativeScore + peerRelativeScore + eventScore + userScore;

  const status = MeaningfulChangeEngine.getStatus(input);
  const moderateThreshold = 15;
  const level = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= moderateThreshold ? "MODERATE" : "LOW";
  const isMeaningful = score >= moderateThreshold && status !== "UNAVAILABLE" && !input.isStale && !input.isDelayed;

  if (status === "STALE") {
    return {
      symbol: input.symbol,
      score: Number(score.toFixed(1)),
      level: score >= moderateThreshold ? level : "LOW",
      isMeaningful: false,
      status: "STALE",
      summary: `Market data for ${input.symbol} is stale, so the move is not treated as a live meaningful change.`,
    };
  }

  if (status === "DELAYED") {
    return {
      symbol: input.symbol,
      score: Number(score.toFixed(1)),
      level: score >= moderateThreshold ? level : "LOW",
      isMeaningful: false,
      status: "DELAYED",
      summary: `Market data for ${input.symbol} is delayed; confirmed signal strength is limited until refreshed.`,
    };
  }

  if (input.hasConflict) {
    return {
      symbol: input.symbol,
      score: Number(score.toFixed(1)),
      level: score >= moderateThreshold ? level : "LOW",
      isMeaningful: score >= moderateThreshold,
      status: "PARTIAL",
      summary: `Provider conflict detected for ${input.symbol}; the displayed value uses the primary source and the discrepancy is called out.`,
    };
  }

  if (score < moderateThreshold) {
    return {
      symbol: input.symbol,
      score: Number(score.toFixed(1)),
      level: "LOW",
      isMeaningful: false,
      status,
      summary: `Minor movement for ${input.symbol}. The move remains within normal market and sector context.`,
    };
  }

  return {
    symbol: input.symbol,
    score: Number(score.toFixed(1)),
    level,
    isMeaningful,
    status,
    summary: `${input.symbol} moved ${formatSignedPct(price)} while the market moved ${formatSignedPct(market)} and sector moved ${formatSignedPct(sector)}. Relative movement estimate indicates a meaningful deviation from the broader context.`,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatSignedPct(value: number) {
  const rounded = Number(Math.abs(value)).toFixed(1);
  return `${value >= 0 ? "+" : "-"}${rounded}%`;
}
