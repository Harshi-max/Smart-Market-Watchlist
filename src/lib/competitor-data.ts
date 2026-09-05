export type CompetitorMetric = {
  symbol: string;
  name: string;
  price: number;
  priceChangePct: number;
  volumeRatio: number;
  peRatio: number;
  marketCap: string;
  sector: string;
  divergencePct: number; // target move - competitor move
  status: "outperforming" | "lagging" | "in-line";
  summary: string;
};

export type StockCompetitorProfile = {
  symbol: string;
  name: string;
  price: number;
  priceChangePct: number;
  sector: string;
  sectorChangePct: number;
  marketIndex: string;
  marketChangePct: number;
  peerMedianChangePct: number;
  isolatedAlpha: number; // Target move - peer median
  isolationScore: number;
  isolationLevel: "High" | "Moderate" | "Low";
  volumeRatio: number;
  competitors: CompetitorMetric[];
  synthesis: {
    badge: string;
    verdict: string;
    detail: string;
    keyDriver: string;
  };
};

export const competitorDatabase: Record<string, StockCompetitorProfile> = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 1412.60,
    priceChangePct: -3.8,
    sector: "Energy",
    sectorChangePct: -1.0,
    marketIndex: "NIFTY 50",
    marketChangePct: -0.7,
    peerMedianChangePct: -1.2,
    isolatedAlpha: -2.6,
    isolationScore: 78,
    isolationLevel: "High",
    volumeRatio: 2.6,
    competitors: [
      {
        symbol: "BPCL",
        name: "Bharat Petroleum",
        price: 612.40,
        priceChangePct: -1.2,
        volumeRatio: 1.1,
        peRatio: 8.4,
        marketCap: "₹1.33L Cr",
        sector: "Energy",
        divergencePct: -2.6,
        status: "lagging",
        summary: "Down modestly with crude benchmark trends, unlike Reliance's sharp divergence.",
      },
      {
        symbol: "IOC",
        name: "Indian Oil Corp",
        price: 178.20,
        priceChangePct: -0.9,
        volumeRatio: 0.9,
        peRatio: 7.9,
        marketCap: "₹1.89L Cr",
        sector: "Energy",
        divergencePct: -2.9,
        status: "lagging",
        summary: "Normal trading volume with standard downstream refining margins.",
      },
      {
        symbol: "ONGC",
        name: "Oil & Natural Gas Corp",
        price: 294.60,
        priceChangePct: -1.5,
        volumeRatio: 1.3,
        peRatio: 6.8,
        marketCap: "₹3.21L Cr",
        sector: "Energy",
        divergencePct: -2.3,
        status: "lagging",
        summary: "Upstream exploration volume steady; crude realizations within expected band.",
      },
    ],
    synthesis: {
      badge: "IDIOSYNCRATIC SELL-OFF",
      verdict: "Sharp Company-Specific Pressure",
      detail: "Reliance dropped -3.8% on 2.6x anomalous volume, while peer Energy basket (BPCL, IOC, ONGC) declined only -1.2%. 78% of the move cannot be explained by sector beta.",
      keyDriver: "Company-specific volume surge & institutional portfolio rebalancing.",
    },
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 3862.40,
    priceChangePct: 4.2,
    sector: "Technology",
    sectorChangePct: 1.0,
    marketIndex: "NIFTY 50",
    marketChangePct: 0.4,
    peerMedianChangePct: -0.6,
    isolatedAlpha: 4.8,
    isolationScore: 84,
    isolationLevel: "High",
    volumeRatio: 1.8,
    competitors: [
      {
        symbol: "INFY",
        name: "Infosys",
        price: 1488.15,
        priceChangePct: -1.9,
        volumeRatio: 1.1,
        peRatio: 24.5,
        marketCap: "₹6.18L Cr",
        sector: "Technology",
        divergencePct: 6.1,
        status: "outperforming",
        summary: "Infosys faced pressure from client budget reviews, diverging sharply from TCS.",
      },
      {
        symbol: "HCLTECH",
        name: "HCL Technologies",
        price: 1782.50,
        priceChangePct: 0.4,
        volumeRatio: 1.0,
        peRatio: 23.8,
        marketCap: "₹4.24L Cr",
        sector: "Technology",
        divergencePct: 3.8,
        status: "outperforming",
        summary: "Modest gains driven by engineering services, but lagged TCS deal momentum.",
      },
      {
        symbol: "WIPRO",
        name: "Wipro",
        price: 492.30,
        priceChangePct: -0.6,
        volumeRatio: 0.8,
        peRatio: 19.2,
        marketCap: "₹2.41L Cr",
        sector: "Technology",
        divergencePct: 4.8,
        status: "outperforming",
        summary: "Subdued consulting bookings; trading in tight range below 20-day average.",
      },
    ],
    synthesis: {
      badge: "SUBSTANTIAL PEER OUTPERFORMANCE",
      verdict: "Strong Independent Momentum",
      detail: "TCS gained +4.2% on 1.8x volume while direct competitor INFY dropped -1.9% and Wipro dropped -0.6%. Generates an exceptional +4.8pp isolated alpha over peer median.",
      keyDriver: "Multi-year enterprise digital transformation contract wins and robust margin guidance.",
    },
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys",
    price: 1488.15,
    priceChangePct: -1.9,
    sector: "Technology",
    sectorChangePct: -1.6,
    marketIndex: "NIFTY 50",
    marketChangePct: -0.7,
    peerMedianChangePct: -0.1,
    isolatedAlpha: -1.8,
    isolationScore: 48,
    isolationLevel: "Moderate",
    volumeRatio: 1.1,
    competitors: [
      {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        price: 3862.40,
        priceChangePct: 4.2,
        volumeRatio: 1.8,
        peRatio: 29.1,
        marketCap: "₹13.98L Cr",
        sector: "Technology",
        divergencePct: -6.1,
        status: "lagging",
        summary: "TCS outperforming on major deal momentum while INFY digests discretionary cuts.",
      },
      {
        symbol: "HCLTECH",
        name: "HCL Technologies",
        price: 1782.50,
        priceChangePct: 0.4,
        volumeRatio: 1.0,
        peRatio: 23.8,
        marketCap: "₹4.24L Cr",
        sector: "Technology",
        divergencePct: -2.3,
        status: "lagging",
        summary: "HCLTech exhibiting defensive product revenue streams.",
      },
      {
        symbol: "WIPRO",
        name: "Wipro",
        price: 492.30,
        priceChangePct: -0.6,
        volumeRatio: 0.8,
        peRatio: 19.2,
        marketCap: "₹2.41L Cr",
        sector: "Technology",
        divergencePct: -1.3,
        status: "in-line",
        summary: "Moving closely with INFY under broad Tier-1 IT discretionary spending pause.",
      },
    ],
    synthesis: {
      badge: "SECTOR-ALIGNED DRAG",
      verdict: "Broad Industry Softness",
      detail: "Infosys -1.9% move is broadly aligned with the technology sector benchmark (-1.6%). With 1.1x normal volume, there is low idiosyncratic company risk.",
      keyDriver: "Macro-level discretionary tech spending moderation.",
    },
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    price: 1743.20,
    priceChangePct: 1.1,
    sector: "Financials",
    sectorChangePct: 0.7,
    marketIndex: "NIFTY 50",
    marketChangePct: 0.4,
    peerMedianChangePct: 0.6,
    isolatedAlpha: 0.5,
    isolationScore: 35,
    isolationLevel: "Low",
    volumeRatio: 0.9,
    competitors: [
      {
        symbol: "ICICIBANK",
        name: "ICICI Bank",
        price: 1234.80,
        priceChangePct: 1.4,
        volumeRatio: 1.1,
        peRatio: 17.5,
        marketCap: "₹8.68L Cr",
        sector: "Financials",
        divergencePct: -0.3,
        status: "in-line",
        summary: "Healthy retail loan disbursements with stable credit costs.",
      },
      {
        symbol: "AXISBANK",
        name: "Axis Bank",
        price: 1180.20,
        priceChangePct: 0.6,
        volumeRatio: 0.8,
        peRatio: 13.9,
        marketCap: "₹3.42L Cr",
        sector: "Financials",
        divergencePct: 0.5,
        status: "outperforming",
        summary: "Steady asset quality metrics in line with private banking basket.",
      },
      {
        symbol: "KOTAKBANK",
        name: "Kotak Mahindra Bank",
        price: 1795.00,
        priceChangePct: 0.2,
        volumeRatio: 0.7,
        peRatio: 20.1,
        marketCap: "₹3.56L Cr",
        sector: "Financials",
        divergencePct: 0.9,
        status: "outperforming",
        summary: "Slightly muted deposit growth pace vs HDFC Bank.",
      },
    ],
    synthesis: {
      badge: "BENCHMARK TRACKING",
      verdict: "Cohesive Banking Momentum",
      detail: "HDFC Bank (+1.1%) is moving in lockstep with private banking peers (+0.7%) and Nifty Bank. Low company-specific divergence observed.",
      keyDriver: "Credit cycle expansion and sector-wide net interest margin stability.",
    },
  },
};

export function getCompetitorProfile(symbol: string): StockCompetitorProfile {
  const cleanSymbol = symbol.toUpperCase().trim();
  if (competitorDatabase[cleanSymbol]) {
    return competitorDatabase[cleanSymbol];
  }

  // Fallback profile if an unindexed symbol is provided
  return {
    symbol: cleanSymbol,
    name: cleanSymbol,
    price: 1000,
    priceChangePct: 0.5,
    sector: "Diversified",
    sectorChangePct: 0.3,
    marketIndex: "NIFTY 50",
    marketChangePct: 0.4,
    peerMedianChangePct: 0.2,
    isolatedAlpha: 0.3,
    isolationScore: 50,
    isolationLevel: "Moderate",
    volumeRatio: 1.0,
    competitors: [
      {
        symbol: "NIFTY50",
        name: "Nifty 50 Index",
        price: 24412.40,
        priceChangePct: 0.4,
        volumeRatio: 1.0,
        peRatio: 22.4,
        marketCap: "₹180L Cr",
        sector: "Market",
        divergencePct: 0.1,
        status: "in-line",
        summary: "Broad market benchmark comparison.",
      },
    ],
    synthesis: {
      badge: "MARKET BENCHMARK",
      verdict: "Standard Market Tracking",
      detail: `${cleanSymbol} is tracking broad market metrics without anomalous deviation.`,
      keyDriver: "Benchmark correlation.",
    },
  };
}
