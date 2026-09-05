"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LandingPage from "@/components/landing-page";
import StockSearch from "@/components/stock-search";
import SmartPilotDrawer from "@/components/smartpilot-drawer";
import { useMarketIntelligence } from "@/hooks/use-market-intelligence";
import MarketStatusBar from "@/components/market-status-bar";
import AuthTransitionOverlay from "@/components/auth-transition-overlay";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  BarChart3,
  Bell,
  BrainCircuit,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  LayoutDashboard,
  Menu,
  Mic,
  MoreHorizontal,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Table2,
  Zap,
} from "lucide-react";

type Stock = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  score: number;
  tone: "positive" | "negative";
  sector: string;
  volume: string;
  reason: string;
};

const stocks: Stock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: "1,412.60", change: "-3.8%", score: 91, tone: "negative", sector: "Energy", volume: "2.6x", reason: "Outpaced the sector decline with unusual volume and a new event signal." },
  { symbol: "TCS", name: "Tata Consultancy Services", price: "3,862.40", change: "+4.2%", score: 88, tone: "positive", sector: "Technology", volume: "1.8x", reason: "Substantially outperforming the broader market, sector and peer group." },
  { symbol: "INFY", name: "Infosys", price: "1,488.15", change: "-1.9%", score: 58, tone: "negative", sector: "Technology", volume: "1.1x", reason: "Movement is broadly aligned with the technology sector today." },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: "1,743.20", change: "+1.1%", score: 43, tone: "positive", sector: "Financials", volume: "0.9x", reason: "A modest move with no unusual activity detected." },
];

const navItems = [
  ["Overview", LayoutDashboard], ["My watchlist", Eye], ["Smart changes", Zap],
  ["Market map", Activity], ["SmartPilot", BrainCircuit], ["What-if lab", BarChart3], ["Replay", Clock3],
  ["Portfolio", Target], ["Goals", Sparkles], ["Patterns", Activity], ["Alerts", Bell],
];

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06080d]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [budget, setBudget] = useState("5 min");
  const [traceOpen, setTraceOpen] = useState(false);
  const [pilotOpen, setPilotOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "Harshitha Arava", email: "" });
  const [transitioning, setTransitioning] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState("");
  const [dataFreshness, setDataFreshness] = useState(0);
  const { data: intelligence, loading: intelligenceLoading, refresh: refreshIntelligence } = useMarketIntelligence();

  useEffect(() => {
    if (searchParams.get("auth") === "success") {
      setTransitioning(true);
    }
    const nameParam = searchParams.get("name");
    if (nameParam) {
      setCurrentUser((prev) => ({ ...prev, name: decodeURIComponent(nameParam) }));
    }
  }, [searchParams]);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { user?: { name?: string; email?: string } } | null) => {
        if (result?.user?.name) {
          setCurrentUser({
            name: result.user.name,
            email: result.user.email || "",
          });
        }
      })
      .catch(() => undefined);
  }, []);

  // Live timestamp ticker
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const dateStr = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();
      const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
      setLiveTimestamp(`${dateStr} · ${timeStr} IST`);
      setDataFreshness((prev) => (prev + 1) % 60);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/login");
  };

  const liveStocks = useMemo(() => {
    if (!intelligence?.quotes.length) return stocks;
    return intelligence.quotes.map((quote) => {
      const change = intelligence.changes.find((item) => item.symbol === quote.symbol);
      return {
        symbol: quote.symbol,
        name: quote.symbol,
        price: quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        change: `${quote.priceChangePct >= 0 ? "+" : ""}${quote.priceChangePct.toFixed(1)}%`,
        score: change?.score ?? 0,
        tone: quote.priceChangePct >= 0 ? ("positive" as const) : ("negative" as const),
        sector: quote.sector,
        volume: `${quote.volumeRatio.toFixed(1)}x`,
        reason: change?.summary ?? quote.narrative,
      };
    });
  }, [intelligence]);
  const selected = liveStocks.find((stock) => stock.symbol === selectedSymbol) ?? liveStocks[0];
  const visibleStocks = useMemo(
    () => (budget === "30 sec" ? liveStocks.slice(0, 1) : budget === "2 min" ? liveStocks.slice(0, 3) : liveStocks),
    [budget, liveStocks]
  );
  const navigateTo = (label: string) => {
    const routes: Record<string, string> = {
      Overview: "/dashboard",
      "My watchlist": "/watchlist",
      "Smart changes": "/changes",
      "Market map": "/market-map",
      SmartPilot: "/smartpilot",
      "What-if lab": "/what-if",
      Replay: "/replay",
      Portfolio: "/portfolio",
      Goals: "/goals",
      Patterns: "/patterns",
      Alerts: "/alerts",
    };
    router.push(routes[label] ?? "/dashboard");
  };

  if (pathname === "/") return <LandingPage />;

  return (
    <>
      {transitioning && (
        <AuthTransitionOverlay
          userName={currentUser.name}
          onComplete={() => {
            setTransitioning(false);
            router.replace("/dashboard");
          }}
        />
      )}
      <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>SmartPilot <b>Watch</b></span></div>
        <div className="workspace-switcher"><div className="avatar">{currentUser.name.slice(0, 2).toUpperCase()}</div><div><span className="eyebrow">WORKSPACE</span><strong>{currentUser.name}&apos;s watchlist</strong></div><ChevronRight size={15} /></div>
        <nav className="primary-nav">{navItems.map(([label, Icon]) => <button className={label === "Overview" ? "active" : ""} key={label as string} onClick={() => navigateTo(label as string)}><Icon size={17} /><span>{label as string}</span>{label === "Smart changes" && <i>4</i>}</button>)}</nav>
        <div className="sidebar-bottom"><button className="signal-card" onClick={() => setPilotOpen(true)}><div className="signal-icon"><BrainCircuit size={16} /></div><div><strong>SmartPilot</strong><span>Ask your market agent</span></div><ChevronRight size={15} /></button><button><Settings2 size={17} /><span>Settings</span></button><div className="sidebar-status"><span className="status-dot" /> Live data · {dataFreshness < 30 ? "fresh" : "updating"}</div></div>
      </aside>

      <section className="main-content">
        <header className="topbar"><button className="mobile-menu"><Menu size={19} /></button><StockSearch /><div className="top-actions"><button className="market-status"><span className="status-dot" /> Market open</button><button className="icon-button"><Bell size={18} /><span className="notification-dot" /></button><div className="top-avatar">AR</div><button className="icon-button" onClick={logout} aria-label="Log out" title="Log out">↪</button></div></header>
        <MarketStatusBar data={intelligence} loading={intelligenceLoading} onRefresh={refreshIntelligence} />
        <div className="content-wrap" id="top">
          <div className="page-heading"><div><div className="eyebrow heading-eyebrow"><span className="status-dot" /> {liveTimestamp || "LOADING..."}</div><h1>Welcome back, {currentUser.name}.</h1><p>Here&apos;s what meaningfully changed while you were away.</p></div><button className="primary-button" onClick={() => setPilotOpen(true)}><BrainCircuit size={17} /> Ask SmartPilot</button></div>

          <section className="attention-banner"><div className="attention-copy"><div className="attention-icon"><Zap size={19} /></div><div><span className="eyebrow">YOUR ATTENTION BUDGET</span><strong>{intelligence?.changes.filter((change) => change.isMeaningful).length ?? 0} meaningful changes found</strong><p>{intelligence ? `${intelligence.quotes.length} movements checked · ${intelligence.quotes.length - intelligence.changes.filter((change) => change.isMeaningful).length} minor movements ignored` : "Checking your watchlist context..."}</p></div></div><div className="budget-pills">{["30 sec", "2 min", "5 min", "Deep dive"].map((item) => <button key={item} className={budget === item ? "selected" : ""} onClick={() => setBudget(item)}>{item}</button>)}</div></section>
          <div className="section-heading" id="changes"><div><span className="eyebrow">SIGNAL PRIORITY</span><h2>Worth your attention</h2></div><button className="text-button" onClick={() => navigateTo("Smart changes")}>View all changes <ChevronRight size={15} /></button></div>
          <section className="changes-grid">{visibleStocks.slice(0, 3).map((stock, index) => <button className={`change-card ${selectedSymbol === stock.symbol ? "selected-card" : ""}`} key={stock.symbol} onClick={() => setSelectedSymbol(stock.symbol)}><div className="card-top"><span className="rank">0{index + 1}</span><span className={`significance ${stock.score > 75 ? "high" : "moderate"}`}>{stock.score > 75 ? "HIGH" : "MODERATE"} SIGNIFICANCE</span><MoreHorizontal size={17} /></div><div className="stock-line"><div className={`ticker-logo ${stock.tone}`}>{stock.symbol.slice(0, 2)}</div><div><strong>{stock.symbol}</strong><span>{stock.name}</span></div></div><div className="price-line"><strong>₹{stock.price}</strong><span className={stock.tone}><ArrowDownRight size={14} />{stock.change}</span></div><p>{stock.reason}</p><div className="card-footer"><span><Activity size={13} /> {stock.volume} volume</span><span>Score {stock.score}</span></div></button>)}</section>
          <section className="watchlist-panel"><div className="watchlist-title"><div><span className="eyebrow">MY WATCHLIST · 4</span><h2>Tracked stocks</h2></div><div className="table-actions"><button className="table-filter active">All</button><button className="table-filter">High</button><button className="table-filter">Moderate</button><button className="icon-button"><Table2 size={15} /></button><button className="add-stock" onClick={() => setAdded(true)}><Plus size={14} /> Add stock</button></div></div><div className="watchlist-table"><div className="table-row table-head"><span>Name</span><span>Price</span><span>Change</span><span>Vs market</span><span>Significance</span><span>Trend</span><span>Action</span></div>{stocks.map((stock) => <button className="table-row" key={stock.symbol} onClick={() => setSelectedSymbol(stock.symbol)}><span className="table-stock"><span className={`mini-logo ${stock.tone}`}>{stock.symbol.slice(0, 1)}</span><span><strong>{stock.name}</strong><small>{stock.symbol}</small></span></span><span>₹{stock.price}</span><span className={stock.tone}>{stock.change}</span><span className={stock.tone}>{stock.tone === "negative" ? "-3.1%" : "+3.8%"}</span><span><b className={`table-significance ${stock.score > 75 ? "high" : "moderate"}`}>{stock.score > 75 ? "HIGH" : "MOD"}</b></span><span className={`trend ${stock.tone}`}>{stock.tone === "negative" ? "⌁⌁⌁" : "⌁⌁⌁"}</span><span><MoreHorizontal size={15} /></span></button>)}</div><button className="view-watchlist" onClick={() => navigateTo("My watchlist")}>View all 4 stocks <ChevronRight size={14} /></button></section>

          <div className="dashboard-grid">
            <section className="panel trace-panel"><div className="panel-heading"><div><span className="eyebrow">WHY IT MATTERS</span><h2>Insight Trace <span className="live-pill"><span className="status-dot" /> Live</span></h2></div><button className="icon-button subtle"><MoreHorizontal size={18} /></button></div><div className="trace-stock"><div className="ticker-logo negative">RE</div><div><strong>{selected.symbol}</strong><span>{selected.name} · {selected.sector}</span></div><div className="trace-price"><strong className={selected.tone}>{selected.change}</strong><span>₹{selected.price}</span></div></div><div className="trace-flow"><TraceItem label="Price movement" value={selected.change} note="Compared to previous close" tone={selected.tone} /><TraceItem label="Market-relative" value={selected.symbol === "RELIANCE" ? "-3.1%" : "+3.8%"} note="NIFTY 50 · -0.7%" tone="negative" /><TraceItem label="Sector-relative" value={selected.symbol === "RELIANCE" ? "-2.8%" : "+3.2%"} note={`${selected.sector} sector`} tone="negative" /><TraceItem label="Volume anomaly" value={selected.volume} note="vs. 20-day average" tone="warning" /></div><button className="expand-trace" onClick={() => setTraceOpen(!traceOpen)}>{traceOpen ? "Hide evidence details" : "Expand evidence details"}<ChevronRight size={15} className={traceOpen ? "rotate-90" : ""} /></button>{traceOpen && <div className="evidence-detail"><div><ShieldCheck size={16} /><span><strong>Data confidence 92%</strong> · preferred source confirmed</span></div><p>{selected.reason} This is a relative movement estimate, not a causal conclusion.</p></div>}<div className="significance-result"><div className="result-score">{selected.score}</div><div><span className="eyebrow">SIGNIFICANCE</span><strong>{selected.score > 75 ? "High" : "Moderate"}</strong><p>{selected.reason}</p></div></div></section>

            <section className="panel isolation-panel" id="isolation"><div className="panel-heading"><div><span className="eyebrow">SIGNAL ISOLATION</span><h2>Company-specific signal</h2></div><CircleHelp size={16} className="muted-icon" /></div><p className="panel-intro">Would this movement still look meaningful if the market and sector had not moved?</p><div className="isolation-score"><div className="ring"><span>78</span><small>/ 100</small></div><div><strong>High isolation</strong><span>Relative movement estimate</span></div></div><div className="compare-bars"><CompareBar label="{selected.symbol}" value={selected.tone === "negative" ? 92 : 88} color="teal" /><CompareBar label="Sector" value={selected.tone === "negative" ? 34 : 41} color="slate" /><CompareBar label="Market" value={selected.tone === "negative" ? 22 : 18} color="slate" /></div><div className="isolation-callout"><Zap size={15} /><span>Most of the move cannot be explained by broad market or peer movement.</span></div><button className="outline-button" onClick={() => setSelectedSymbol(selected.symbol === "RELIANCE" ? "TCS" : "RELIANCE")}>Compare with competitors <ChevronRight size={15} /></button></section>
          </div>

          <div className="lower-grid"><section className="panel replay-panel" id="replay"><div className="panel-heading"><div><span className="eyebrow">CHANGE REPLAY</span><h2>How it developed</h2></div><button className="text-button" onClick={() => navigateTo("Replay")}>Open replay <ChevronRight size={15} /></button></div><div className="replay-chart"><div className="chart-grid"><span /><span /><span /><span /></div><svg viewBox="0 0 600 150" preserveAspectRatio="none" aria-label="Intraday movement chart"><path d="M0 112 C55 111 68 100 105 106 S150 84 198 92 S255 89 300 65 S350 83 385 55 S430 54 468 69 S520 44 600 18" fill="none" stroke="#d66b52" strokeWidth="3" /><path d="M0 112 C55 111 68 100 105 106 S150 84 198 92 S255 89 300 65 S350 83 385 55 S430 54 468 69 S520 44 600 18 V150 H0Z" fill="url(#area)" opacity=".35" /><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d66b52" /><stop offset="1" stopColor="#d66b52" stopOpacity="0" /></linearGradient></defs></svg><div className="chart-labels"><span>09:15</span><span>10:30</span><span>11:45</span><span>13:20</span><span>14:32</span></div></div><div className="timeline"><TimelineItem time="09:15" text="Market opened" /><TimelineItem time="11:45" text="Diverged from peers" active /><TimelineItem time="13:20" text="Event detected" /><TimelineItem time="14:32" text="Significance crossed" /></div></section><section className="panel blindspot-panel" id="market-map"><div className="panel-heading"><div><span className="eyebrow">WATCHLIST INTELLIGENCE</span><h2>One blind spot</h2></div><AlertTriangle size={18} className="warning-icon" /></div><div className="blindspot-stat"><strong>62%</strong><span>of your tracked stocks belong to just two sectors.</span></div><div className="sector-bars"><div><span>Technology</span><b>38%</b><i style={{ width: "78%" }} /></div><div><span>Financials</span><b>24%</b><i style={{ width: "49%" }} /></div><div><span>Energy</span><b>18%</b><i style={{ width: "37%" }} /></div></div><p className="muted-copy">You have 5 technology stocks that frequently move together. This can make separate changes feel like one signal.</p><button className="text-button" onClick={() => navigateTo("Market map")}>Explore patterns <ChevronRight size={15} /></button></section></div>

          <section className="portfolio-strip"><div className="portfolio-icon"><Target size={18} /></div><div><span className="eyebrow">PERSONAL RELEVANCE</span><strong>Market significance ≠ personal significance</strong><p>TCS is highly relevant to your long-term growth goal · 18% portfolio exposure</p></div><div className="portfolio-score"><span>Goal relevance</span><strong>High</strong></div><button className="icon-button subtle"><ChevronRight size={18} /></button></section>
          <footer className="data-footer"><span><span className="status-dot" /> All market data is demo data · observed 2m ago</span><span>Data states: FRESH · OBSERVED · ESTIMATED</span></footer>
        </div>
        <aside className="right-rail">
          <section className="rail-card pilot-rail"><div className="rail-heading"><div><span className="eyebrow">SMARTPILOT</span><h2>Hi Arjun!</h2></div><span className="beta-pill">BETA</span><button className="rail-close">×</button></div><div className="pilot-orb-large"><BrainCircuit size={28} /></div><p>How can I help you today?</p><div className="rail-prompts"><button onClick={() => setPilotOpen(true)}>What changed while I was away?</button><button onClick={() => setPilotOpen(true)}>Which stock needs my attention?</button><button onClick={() => setPilotOpen(true)}>Why did Reliance fall today?</button><button onClick={() => setPilotOpen(true)}>Compare TCS with its peers</button></div><button className="voice-button" onClick={() => setPilotOpen(true)}><Mic size={15} /> Tap to speak</button></section>
          <section className="rail-card map-rail"><div className="rail-heading"><div><span className="eyebrow">MARKET INTELLIGENCE MAP</span><h2>Market clusters</h2></div><span className="map-badge">3D</span></div><div className="mini-map"><div className="map-line line-one" /><div className="map-line line-two" /><span className="map-node node-tcs">TCS <b>+4.2%</b></span><span className="map-node node-infy">INFY <b>-1.9%</b></span><span className="map-node node-rel">RELIANCE <b>-3.8%</b></span><span className="map-node node-hdfc">HDFCBANK <b>+0.8%</b></span><span className="map-node node-hcl">HCL <b>+0.4%</b></span></div><div className="map-legend"><span><i className="legend-high" /> High</span><span><i className="legend-med" /> Moderate</span><span><i className="legend-low" /> Low</span><span><i className="legend-up" /> Positive</span></div><button className="rail-action" onClick={() => navigateTo("Market map")}>Open market map <ChevronRight size={14} /></button></section>
          <section className="rail-card summary-rail"><div className="rail-heading"><div><span className="eyebrow">MARKET SUMMARY</span><h2>Today so far</h2></div><span className="live-pill"><span className="status-dot" /> Live</span></div><div className="index-row"><div><strong>NIFTY 50</strong><span>24,412.40</span></div><b className="positive">+0.43%</b><div className="sparkline up" /></div><div className="index-row"><div><strong>SENSEX</strong><span>80,109.85</span></div><b className="positive">+0.36%</b><div className="sparkline up" /></div><div className="index-row"><div><strong>India VIX</strong><span>12.45</span></div><b className="negative">-2.31%</b><div className="sparkline down" /></div><button className="rail-action" onClick={() => navigateTo("Market map")}>View market <ChevronRight size={14} /></button></section>
        </aside>
      </section>
      <button className="pilot-fab" onClick={() => setPilotOpen(true)}><span className="pilot-fab-orb"><BrainCircuit size={18} /></span> <span>Ask SmartPilot</span></button>
      {pilotOpen && <SmartPilotDrawer onClose={() => setPilotOpen(false)} />}
      {added && <div className="toast"><Plus size={15} /> TCS added to your watchlist <button onClick={() => setAdded(false)}>Dismiss</button></div>}
    </main>
    </>
  );
}

function TraceItem({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) { return <div className="trace-item"><div className="trace-bullet"><span /></div><div><span>{label}</span><small>{note}</small></div><strong className={tone}>{value}</strong></div>; }
function CompareBar({ label, value, color }: { label: string; value: number; color: string }) { return <div className="compare-row"><div><span>{label}</span><b>{value}%</b></div><div className="bar-track"><i className={color} style={{ width: `${value}%` }} /></div></div>; }
function TimelineItem({ time, text, active }: { time: string; text: string; active?: boolean }) { return <div className={active ? "timeline-item active" : "timeline-item"}><span>{time}</span><i /><strong>{text}</strong></div>; }


