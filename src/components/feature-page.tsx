"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ArrowUpRight, BarChart3, Bell, BrainCircuit, ChevronRight, Clock3, Eye, LineChart, Sparkles, Target, Zap } from "lucide-react";
import StockSearch from "@/components/stock-search";
import SmartPilotDrawer from "@/components/smartpilot-drawer";
import InteractiveFeaturePage from "@/components/interactive-feature-page";

const pageData = {
  watchlist: { eyebrow: "YOUR UNIVERSE", title: "My watchlist", description: "Your tracked companies, organized by the signals that matter now.", icon: Eye, accent: "4 stocks tracked", cards: [["RELIANCE", "Energy", "-3.8%", "High significance"], ["TCS", "Technology", "+4.2%", "Company-specific"], ["INFY", "Technology", "-1.9%", "Sector aligned"]] },
  changes: { eyebrow: "ATTENTION ENGINE", title: "Smart changes", description: "The movements that earned your attention today, ranked by meaningfulness.", icon: Zap, accent: "4 meaningful changes", cards: [["RELIANCE", "Score 91", "-3.8%", "2.6x volume"], ["TCS", "Score 88", "+4.2%", "High isolation"], ["INFY", "Score 58", "-1.9%", "Moderate"]] },
  "market-map": { eyebrow: "MARKET INTELLIGENCE", title: "Market map", description: "See where meaningful signals are clustering across sectors and peers.", icon: BarChart3, accent: "3 active clusters", cards: [["Technology", "TCS leading", "+4.2%", "High activity"], ["Energy", "Reliance diverging", "-3.8%", "Company-specific"], ["Financials", "Broadly steady", "+0.6%", "Low significance"]] },
  "what-if": { eyebrow: "SIMULATION LAB", title: "What-if lab", description: "Explore scenarios around your watchlist without placing trades or making predictions.", icon: Target, accent: "Simulated · no orders", cards: [["Reliance falls 5%", "₹1,342", "Portfolio impact", "-₹8,240"], ["TCS rises 3%", "₹3,978", "Portfolio impact", "+₹4,930"], ["Sector stays flat", "Context", "Signal isolation", "Higher"]] },
  replay: { eyebrow: "CHANGE HISTORY", title: "Change replay", description: "Scrub through how a signal developed from market open to meaningful change.", icon: Clock3, accent: "Today · 09:15 to 14:32", cards: [["09:15", "Market opened", "Observed", "Fresh"], ["11:45", "Diverged from peers", "Signal", "Detected"], ["14:32", "Significance crossed", "Score 91", "High"]] },
  smartpilot: { eyebrow: "INTELLIGENCE LAYER", title: "SmartPilot", description: "Ask grounded questions about what changed, why it matters, and what deserves attention next.", icon: BrainCircuit, accent: "Grounded in 4 signals", cards: [["Top signal", "Reliance", "Score 91", "High attention"], ["Best context", "Peer movement", "Isolated", "Company-specific"], ["Next question", "What-if", "-5%", "Simulated"]] },
  portfolio: { eyebrow: "PERSONAL RELEVANCE", title: "Portfolio intelligence", description: "Separate market significance from the changes that matter most to your own exposure.", icon: Target, accent: "18% TCS exposure", cards: [["TCS", "Technology", "18%", "High relevance"], ["Reliance", "Energy", "0%", "No direct impact"], ["Total value", "Observed", "₹12,48,560", "+1.24%"]] },
  goals: { eyebrow: "GOAL INTELLIGENCE", title: "Goals", description: "Keep your attention profile aligned with what you are trying to learn and monitor.", icon: Sparkles, accent: "Long-term growth", cards: [["Primary goal", "Selected", "Growth", "Active"], ["Market significance", "TCS", "High", "Relevant"], ["Risk context", "Reliance", "Medium", "Explore"]] },
  patterns: { eyebrow: "BEHAVIORAL INTELLIGENCE", title: "Patterns", description: "Understand which signals you consistently open, compare, and return to.", icon: Activity, accent: "Profile updated today", cards: [["You open", "Company-specific", "Often", "Prioritized"], ["You ignore", "Market-wide", "Usually", "De-emphasized"], ["Blind spot", "Technology", "62%", "Diversify context"]] },
  alerts: { eyebrow: "ATTENTION SETTINGS", title: "Alerts", description: "Choose when SmartPilot should bring a meaningful change back to you.", icon: Bell, accent: "3 active rules", cards: [["Significance", "Threshold", "75+", "Enabled"], ["Volume", "Anomaly", "2x", "Enabled"], ["Data state", "Freshness", "8 min", "Enabled"]] },
} as const;

type FeatureKey = keyof typeof pageData;

export default function FeaturePage({ page }: { page: FeatureKey }) {
  if (page !== "watchlist") return <InteractiveFeaturePage page={page} />;
  return <LegacyFeaturePage page={page} />;
}

function LegacyFeaturePage({ page }: { page: FeatureKey }) {
  const router = useRouter();
  const [pilotOpen, setPilotOpen] = useState(false);
  const data = pageData[page];
  const Icon = data.icon;

  const logout = async () => { await fetch("/api/auth/session", { method: "DELETE" }); router.replace("/login"); };
  return <main className="feature-shell"><header className="feature-topbar"><button className="back-button" onClick={() => router.push("/dashboard")}><ArrowLeft size={17} /> Overview</button><StockSearch /><div className="feature-top-actions"><button className="feature-pilot" onClick={() => setPilotOpen(true)}><span className="pilot-fab-orb"><BrainCircuit size={16} /></span><span>Ask SmartPilot</span><small>AI agent</small></button><button className="icon-button" onClick={logout} aria-label="Log out" title="Log out">↪</button></div></header><section className="feature-content"><div className="feature-heading"><div><span className="eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p>{data.description}</p></div><div className="feature-icon"><Icon size={25} /></div></div><div className="feature-status"><span><span className="status-dot" /> Demo market data · observed 2m ago</span><strong>{data.accent}</strong></div><section className="feature-grid">{data.cards.map(([label, context, value, detail]) => <article className="feature-card" key={label}><div className="feature-card-top"><span className="eyebrow">{context}</span><ArrowUpRight size={16} /></div><h2>{label}</h2><div className="feature-value">{value}</div><p>{detail}</p><button onClick={() => router.push(page === "what-if" ? "/replay" : "/changes")}>Explore signal <ChevronRight size={15} /></button></article>)}</section><div className="feature-insight"><div className="feature-insight-icon"><LineChart size={19} /></div><div><span className="eyebrow">SMARTPILOT CONTEXT</span><h2>{page === "what-if" ? "Simulations stay separate from observed market data." : "Meaningful change is more than a price move."}</h2><p>{page === "replay" ? "Replay connects price, volume, market, sector and peer signals so you can see when significance crossed the threshold." : "SmartPilot compares market, sector, peer, volume and historical context before ranking what deserves your attention."}</p></div></div></section>{pilotOpen && <SmartPilotDrawer onClose={() => setPilotOpen(false)} />}</main>;
}