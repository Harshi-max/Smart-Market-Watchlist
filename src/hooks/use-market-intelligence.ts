"use client";

import { useCallback, useEffect, useState } from "react";

type Quote = {
  symbol: string;
  price: number;
  previousClose: number;
  priceChangePct: number;
  marketChangePct: number;
  sectorChangePct: number;
  peerChangePct: number;
  volumeRatio: number;
  sector: string;
  lastUpdated: string;
  source: string;
  freshness: string;
  status: string;
  peers: string[];
  narrative: string;
};

type Change = {
  symbol: string;
  score: number;
  level: string;
  isMeaningful: boolean;
  status: string;
  summary: string;
};

export type MarketIntelligence = {
  quotes: Quote[];
  changes: Change[];
  watchlists: Array<{ id: string; name: string; items: Array<{ symbol: string }> }>;
  selectedWatchlistId: string;
  lastViewedAt?: string;
  dataState: string;
  updatedAt: string;
};

export function useMarketIntelligence(intervalMs = 30_000) {
  const [data, setData] = useState<MarketIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/watchlist", { cache: "no-store" });
      const result = await response.json() as MarketIntelligence & { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to load market intelligence.");
      setData(result);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load market intelligence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, intervalMs);
    const onVisibilityChange = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibilityChange); };
  }, [intervalMs, refresh]);

  return { data, loading, error, refresh };
}
