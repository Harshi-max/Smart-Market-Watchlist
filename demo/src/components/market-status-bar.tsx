"use client";

import { Activity, RefreshCw } from "lucide-react";
import type { MarketIntelligence } from "@/hooks/use-market-intelligence";

export default function MarketStatusBar({ data, loading, onRefresh }: { data: MarketIntelligence | null; loading?: boolean; onRefresh?: () => void }) {
  const quote = data?.quotes[0];
  const status = quote?.status || (loading ? "LOADING" : "UNAVAILABLE");
  const updated = data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Waiting for data";
  const isLive = status === "FRESH" || status === "OBSERVED";

  return <div className="market-status-bar"><div className="market-status-title"><Activity size={15} /><strong>LIVE MARKET</strong><span className={isLive ? "status-dot" : "status-dot muted"} />{status}</div><div className="market-status-metrics">{data?.quotes.slice(0, 3).map((item) => <span key={item.symbol}><b>{item.symbol}</b> <em className={item.priceChangePct >= 0 ? "positive" : "negative"}>{item.priceChangePct >= 0 ? "+" : ""}{item.priceChangePct.toFixed(1)}%</em></span>) || <span>Live market data unavailable</span>}</div><div className="market-status-meta"><span>{quote?.source || "No provider"} · updated {updated}</span><button className="icon-button subtle" onClick={onRefresh} disabled={!onRefresh || loading} aria-label="Refresh market data" title="Refresh market data"><RefreshCw size={14} /></button></div></div>;
}
