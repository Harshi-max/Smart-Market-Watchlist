export type MarketStatus = "FRESH" | "DELAYED" | "STALE" | "PARTIAL" | "UNAVAILABLE" | "OBSERVED" | "ESTIMATED" | "SIMULATED";

const stockAliasMap: Record<string, string> = {
  RELIANCEINDUSTRIES: "RELIANCE",
  TATACONSULTANCYSERVICES: "TCS",
  INFOSYS: "INFY",
  HDFCBANK: "HDFCBANK",
  ICICIBANK: "ICICIBANK",
  AXISBANK: "AXISBANK",
  STATEBANKOFINDIA: "SBIN",
};

function normalizeMarketSymbol(symbol: string): string {
  const cleaned = symbol.trim().toUpperCase().replace(/[^A-Z0-9.]/g, "");
  if (!cleaned) return "";
  const withoutSuffix = cleaned.replace(/\.(NS|NSE|BSE|BO|BOM|NSEI|MCX|NYSE|NASDAQ)$/i, "") || cleaned;
  return stockAliasMap[withoutSuffix] ?? withoutSuffix;
}

export type QuoteSnapshot = {
  symbol: string;
  price: number;
  previousClose: number;
  priceChangePct: number;
  marketChangePct: number;
  sectorChangePct: number;
  peerChangePct: number;
  volume: number;
  averageVolume: number;
  volumeRatio: number;
  sector: string;
  marketIndex: string;
  lastUpdated: string;
  source: string;
  freshness: string;
  status: MarketStatus;
  historicalZScore: number;
  eventSignal: number;
  userRelevance: number;
  peers: string[];
  narrative: string;
};

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<QuoteSnapshot | null>;
  getHistoricalData(symbol: string, range: string): Promise<unknown[]>;
  getCompanyProfile(symbol: string): Promise<{ symbol: string; sector: string; market: string; peers: string[] } | null>;
  searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; sector: string }>>;
}

const quotes: Record<string, QuoteSnapshot> = {
  RELIANCE: {
    symbol: "RELIANCE",
    price: 2845.3,
    previousClose: 2956.4,
    priceChangePct: -3.8,
    marketChangePct: -0.7,
    sectorChangePct: -1.0,
    peerChangePct: -1.2,
    volume: 2600000,
    averageVolume: 1020000,
    volumeRatio: 2.6,
    sector: "Energy",
    marketIndex: "NIFTY 50",
    lastUpdated: "2026-09-04T14:32:00.000Z",
    source: "DEMO DATA",
    freshness: "2 min ago",
    status: "OBSERVED",
    historicalZScore: 1.8,
    eventSignal: 0.8,
    userRelevance: 0.9,
    peers: ["BPCL", "IOC", "ONGC"],
    narrative: "Reliance is down 3.8% while the market is down 0.7% and volume is 2.6x normal. The move is unusually significant when viewed against broader market context.",
  },
  TCS: {
    symbol: "TCS",
    price: 3862.4,
    previousClose: 3711.4,
    priceChangePct: 4.2,
    marketChangePct: 0.4,
    sectorChangePct: 1.0,
    peerChangePct: 0.8,
    volume: 1800000,
    averageVolume: 980000,
    volumeRatio: 1.8,
    sector: "Technology",
    marketIndex: "NIFTY 50",
    lastUpdated: "2026-09-04T14:32:00.000Z",
    source: "DEMO DATA",
    freshness: "2 min ago",
    status: "OBSERVED",
    historicalZScore: 1.6,
    eventSignal: 0.6,
    userRelevance: 0.8,
    peers: ["INFY", "HCLTECH", "WIPRO"],
    narrative: "TCS is outperforming the sector and peers with a strong company-specific move and healthy volume.",
  },
  INFY: {
    symbol: "INFY",
    price: 1488.15,
    previousClose: 1515.8,
    priceChangePct: -1.9,
    marketChangePct: -0.7,
    sectorChangePct: -1.6,
    peerChangePct: -1.0,
    volume: 1200000,
    averageVolume: 1150000,
    volumeRatio: 1.1,
    sector: "Technology",
    marketIndex: "NIFTY 50",
    lastUpdated: "2026-09-04T14:32:00.000Z",
    source: "DEMO DATA",
    freshness: "2 min ago",
    status: "OBSERVED",
    historicalZScore: 0.7,
    eventSignal: 0.2,
    userRelevance: 0.6,
    peers: ["TCS", "HCLTECH", "WIPRO"],
    narrative: "Infosys is broadly aligned with technology sector movement and does not show unusual relative deviation.",
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    price: 1743.2,
    previousClose: 1726.8,
    priceChangePct: 0.9,
    marketChangePct: 0.4,
    sectorChangePct: 0.7,
    peerChangePct: 0.5,
    volume: 900000,
    averageVolume: 980000,
    volumeRatio: 0.9,
    sector: "Financials",
    marketIndex: "NIFTY 50",
    lastUpdated: "2026-09-04T14:32:00.000Z",
    source: "DEMO DATA",
    freshness: "2 min ago",
    status: "OBSERVED",
    historicalZScore: 0.4,
    eventSignal: 0.1,
    userRelevance: 0.4,
    peers: ["ICICIBANK", "AXISBANK", "KOTAKBANK"],
    narrative: "HDFC Bank is tracking the broader market with no isolated or unusual signal detected.",
  },
};

export const demoMarketProvider: MarketDataProvider = {
  async getQuote(symbol) {
    const key = normalizeMarketSymbol(symbol);
    return quotes[key] ?? null;
  },
  async getHistoricalData(symbol) {
    const key = normalizeMarketSymbol(symbol);
    const quote = quotes[key];
    return quote ? [{ price: quote.price, timestamp: quote.lastUpdated }] : [];
  },
  async getCompanyProfile(symbol) {
    const key = normalizeMarketSymbol(symbol);
    const quote = quotes[key];
    if (!quote) return null;
    return { symbol: quote.symbol, sector: quote.sector, market: quote.marketIndex, peers: quote.peers };
  },
  async searchSymbols(query) {
    const q = normalizeMarketSymbol(query);
    return Object.values(quotes)
      .filter((item) => item.symbol.includes(q) || item.sector.toUpperCase().includes(q))
      .map((item) => ({ symbol: item.symbol, name: item.symbol, sector: item.sector }));
  },
};

class AlphaVantageProvider implements MarketDataProvider {
  constructor(private readonly apiKey: string) {}

  private async request<T>(params: Record<string, string>): Promise<T> {
    if (!this.apiKey) {
      throw new Error("Market data API key is not configured.");
    }

    const url = new URL("https://www.alphavantage.co/query");
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set("apikey", this.apiKey);

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Market data provider error: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getQuote(symbol: string): Promise<QuoteSnapshot | null> {
    try {
      const normalized = normalizeMarketSymbol(symbol);
      const payload = await this.request<{ "Global Quote"?: Record<string, string> }>({
        function: "GLOBAL_QUOTE",
        symbol: normalized,
      });
      const quote = payload["Global Quote"];
      if (!quote || !quote["05. price"]) return null;

      const price = Number(quote["05. price"]);
      const previousClose = Number(quote["08. previous close"] || quote["04. close"] || price);
      const changePct = Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0");
      const volume = Number.parseInt(quote["06. volume"] || "0", 10);
      const avgVolume = Math.max(volume * 0.9, 1);

      return {
        symbol: (quote["01. symbol"] || symbol).trim().toUpperCase(),
        price,
        previousClose,
        priceChangePct: Number.isFinite(changePct) ? changePct : ((price - previousClose) / Math.max(previousClose, 1)) * 100,
        marketChangePct: 0,
        sectorChangePct: 0,
        peerChangePct: 0,
        volume,
        averageVolume: avgVolume,
        volumeRatio: volume / Math.max(avgVolume, 1),
        sector: "Market",
        marketIndex: "NIFTY 50",
        lastUpdated: new Date().toISOString(),
        source: "ALPHAVANTAGE",
        freshness: "Live",
        status: "OBSERVED",
        historicalZScore: 0.6,
        eventSignal: 0.4,
        userRelevance: 0.6,
        peers: [],
        narrative: "Live market quote loaded from Alpha Vantage.",
      };
    } catch {
      return null;
    }
  }

  async getHistoricalData(symbol: string, range: string): Promise<unknown[]> {
    try {
      const normalized = normalizeMarketSymbol(symbol);
      const payload = await this.request<{ "Time Series (Daily)"?: Record<string, Record<string, string>> }>({
        function: "TIME_SERIES_DAILY",
        symbol: normalized,
      });
      const timeSeries = payload["Time Series (Daily)"] || {};
      const days = Object.entries(timeSeries).slice(0, Number(range === "1M" ? 30 : 10));
      return days.map(([timestamp, values]) => ({ timestamp, price: Number(values["4. close"] || values["5. adjusted close"] || 0) }));
    } catch {
      return [];
    }
  }

  async getCompanyProfile(symbol: string): Promise<{ symbol: string; sector: string; market: string; peers: string[] } | null> {
    try {
      const normalized = normalizeMarketSymbol(symbol);
      const payload = await this.request<{ Symbol?: string; Sector?: string; Name?: string; AssetType?: string; Exchange?: string }>({
        function: "OVERVIEW",
        symbol: normalized,
      });
      if (!payload.Symbol) return null;
      return {
        symbol: payload.Symbol,
        sector: payload.Sector || "Market",
        market: payload.Exchange || "NIFTY 50",
        peers: [],
      };
    } catch {
      return null;
    }
  }

  async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; sector: string }>> {
    const text = query.trim();
    if (!text) return [];
    try {
      const payload = await this.request<{ "bestMatches"?: Array<Record<string, string>> }>({ function: "SYMBOL_SEARCH", keywords: text });
      const matches = payload["bestMatches"] || [];
      return matches.slice(0, 8).map((item) => ({
        symbol: item["1. symbol"] || "",
        name: item["2. name"] || item["1. symbol"] || "",
        sector: item["3. type"] || "Market",
      })).filter((item) => item.symbol);
    } catch {
      return [];
    }
  }
}

class FinnhubProvider implements MarketDataProvider {
  constructor(private readonly apiKey: string) {}

  private async request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`https://finnhub.io/api/v1/${path}`);
    Object.entries({ ...params, token: this.apiKey }).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) throw new Error(`Finnhub error: ${response.status}`);
    return (await response.json()) as T;
  }

  async getQuote(symbol: string): Promise<QuoteSnapshot | null> {
    try {
      const normalized = normalizeMarketSymbol(symbol);
      const quote = await this.request<{ c?: number; pc?: number; dp?: number; t?: number }>("quote", { symbol: normalized });
      if (!quote.c || !quote.pc) return null;
      const priceChangePct = Number.isFinite(quote.dp) ? quote.dp as number : ((quote.c - quote.pc) / quote.pc) * 100;
      return {
        symbol: normalized,
        price: quote.c,
        previousClose: quote.pc,
        priceChangePct,
        marketChangePct: 0,
        sectorChangePct: 0,
        peerChangePct: 0,
        volume: 0,
        averageVolume: 0,
        volumeRatio: 0,
        sector: "Market",
        marketIndex: "Market",
        lastUpdated: quote.t ? new Date(quote.t * 1000).toISOString() : new Date().toISOString(),
        source: "FINNHUB",
        freshness: "Live",
        status: "FRESH",
        historicalZScore: 0,
        eventSignal: 0,
        userRelevance: 0,
        peers: [],
        narrative: "Live market quote loaded from Finnhub.",
      };
    } catch {
      return null;
    }
  }

  async getHistoricalData(symbol: string, range: string): Promise<unknown[]> {
    try {
      const days = range === "1M" ? 30 : 10;
      const to = Math.floor(Date.now() / 1000);
      const from = to - days * 24 * 60 * 60;
      const payload = await this.request<{ s?: string; t?: number[]; c?: number[] }>("stock/candle", { symbol: normalizeMarketSymbol(symbol), resolution: "D", from: String(from), to: String(to) });
      if (payload.s !== "ok" || !payload.t || !payload.c) return [];
      return payload.t.map((timestamp, index) => ({ timestamp: new Date(timestamp * 1000).toISOString(), price: payload.c?.[index] ?? 0 }));
    } catch {
      return [];
    }
  }

  async getCompanyProfile(symbol: string): Promise<{ symbol: string; sector: string; market: string; peers: string[] } | null> {
    try {
      const profile = await this.request<{ ticker?: string; name?: string; finnhubIndustry?: string; exchange?: string }>("stock/profile2", { symbol: normalizeMarketSymbol(symbol) });
      if (!profile.ticker) return null;
      return { symbol: profile.ticker, sector: profile.finnhubIndustry || "Market", market: profile.exchange || "Market", peers: [] };
    } catch {
      return null;
    }
  }

  async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; sector: string }>> {
    try {
      const payload = await this.request<{ result?: Array<{ symbol?: string; description?: string; type?: string }> }>("search", { q: query.trim() });
      return (payload.result || []).slice(0, 8).map((item) => ({ symbol: item.symbol || "", name: item.description || item.symbol || "", sector: item.type || "Market" })).filter((item) => item.symbol);
    } catch {
      return [];
    }
  }
}

class CompositeMarketDataProvider implements MarketDataProvider {
  constructor(private readonly providers: MarketDataProvider[]) {}

  async getQuote(symbol: string) {
    for (const provider of this.providers) {
      const quote = await provider.getQuote(symbol);
      if (quote) return quote;
    }
    return null;
  }

  async getHistoricalData(symbol: string, range: string) {
    for (const provider of this.providers) {
      const history = await provider.getHistoricalData(symbol, range);
      if (history.length) return history;
    }
    return [];
  }

  async getCompanyProfile(symbol: string) {
    for (const provider of this.providers) {
      const profile = await provider.getCompanyProfile(symbol);
      if (profile) return profile;
    }
    return null;
  }

  async searchSymbols(query: string) {
    for (const provider of this.providers) {
      const results = await provider.searchSymbols(query);
      if (results.length) return results;
    }
    return [];
  }
}

export function createMarketDataProvider(): MarketDataProvider {
  const alphaKey = (process.env.ALPHAVANTAGE_API_KEY || process.env.MARKET_DATA_API_KEY || "").trim();
  const finnhubKey = (process.env.FINNHUB_API_KEY || process.env.FINHUB_API_KEY || "").trim();
  const providers: MarketDataProvider[] = [];
  if (finnhubKey) providers.push(new FinnhubProvider(finnhubKey));
  if (alphaKey) providers.push(new AlphaVantageProvider(alphaKey));
  providers.push(demoMarketProvider);
  return new CompositeMarketDataProvider(providers);
}
