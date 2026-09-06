"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Eye, Zap, Shield, ChevronDown,
  TrendingUp, TrendingDown, Activity, BrainCircuit, Target,
  Clock, BarChart3, Bell, RefreshCw
} from "lucide-react";
import LandingNavbar from "@/components/landing-navbar";
import ProblemSection from "@/components/problem-section";
import SignatureCard from "@/components/signature-card";
import SwipeCarousel from "@/components/swipe-carousel";
import SignalIsolationDemo from "@/components/signal-isolation-demo";
import AttentionBudgetDemo from "@/components/attention-budget-demo";
import SmartPilotAiDemo from "@/components/smartpilot-ai-demo";
import ChangeReplayDemo from "@/components/change-replay-demo";
import PortfolioBlindspotsDemo from "@/components/portfolio-blindspots-demo";
import LandingFooter from "@/components/landing-footer";

// Lazy load heavy 3D components
const Hero3D = dynamic(() => import("@/components/Hero3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] lg:h-[620px] rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <span className="w-2 h-2 rounded-full bg-[#5c9aff] animate-ping" />
        <span>Initializing 3D Interactive Showcase...</span>
      </div>
    </div>
  ),
});

const MarketUniverse3D = dynamic(() => import("@/components/market-universe-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] lg:h-[620px] rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <span className="w-2 h-2 rounded-full bg-[#5c9aff] animate-ping" />
        <span>Initializing 3D Market Universe...</span>
      </div>
    </div>
  ),
});

const MarketMap3D = dynamic(() => import("@/components/market-map-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <span className="w-2 h-2 rounded-full bg-[#5c9aff] animate-ping" />
        <span>Loading Living Market System...</span>
      </div>
    </div>
  ),
});

// ─── Live Market Ticker ──────────────────────────────────────────────────────
const INITIAL_STOCKS = [
  { symbol: "RELIANCE", price: 1412.60, change: -3.8, up: false, sector: "Energy" },
  { symbol: "TCS", price: 3862.40, change: +4.2, up: true, sector: "IT" },
  { symbol: "INFY", price: 1488.15, change: -1.9, up: false, sector: "IT" },
  { symbol: "HDFCBANK", price: 1743.20, change: +1.1, up: true, sector: "Banking" },
  { symbol: "WIPRO", price: 524.30, change: +2.7, up: true, sector: "IT" },
  { symbol: "BAJFINANCE", price: 7234.50, change: -0.8, up: false, sector: "NBFC" },
  { symbol: "ITC", price: 468.90, change: +2.1, up: true, sector: "FMCG" },
  { symbol: "TATAMOTORS", price: 792.15, change: +1.4, up: true, sector: "Auto" },
];

function HeroLiveTicker() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const idx = Math.floor(Math.random() * stocks.length);
      setFlashIdx(idx);
      setStocks((prev) =>
        prev.map((s, i) => {
          if (i !== idx) return s;
          const drift = (Math.random() - 0.48) * 0.5;
          const newChange = parseFloat((s.change + drift * 0.1).toFixed(2));
          return { ...s, change: newChange, up: newChange >= 0, price: parseFloat((s.price + drift).toFixed(2)) };
        })
      );
      setTimeout(() => setFlashIdx(null), 500);
    }, 2000);
    return () => clearInterval(timer);
  }, [stocks]);

  return (
    <div className="w-full overflow-hidden relative">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {stocks.map((stock, i) => (
          <div
            key={stock.symbol}
            className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all duration-300 ${
              flashIdx === i
                ? stock.up
                  ? "bg-emerald-500/15 border-emerald-500/40"
                  : "bg-rose-500/15 border-rose-500/40"
                : "bg-white/[0.03] border-white/[0.07]"
            }`}
          >
            <div className="text-[10px] font-mono text-slate-500">{stock.symbol}</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-0.5 text-[10px] font-mono mt-0.5 ${stock.up ? "text-emerald-400" : "text-rose-400"}`}>
              {stock.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {stock.change > 0 ? "+" : ""}{stock.change.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#050811] to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Real-time Change Feed ────────────────────────────────────────────────────
const CHANGE_FEED = [
  { symbol: "TCS", score: 88, change: "+4.2%", reason: "Outperforming sector peers significantly", significant: true, up: true, ago: "2m ago" },
  { symbol: "RELIANCE", score: 91, change: "-3.8%", reason: "2.6x volume spike with sector decoupling", significant: true, up: false, ago: "5m ago" },
  { symbol: "WIPRO", score: 72, change: "+2.7%", reason: "Positive earnings revision by analysts", significant: true, up: true, ago: "11m ago" },
  { symbol: "INFY", score: 58, change: "-1.9%", reason: "Tracking technology sector movement", significant: false, up: false, ago: "14m ago" },
];

function LiveChangeFeed() {
  const [feed, setFeed] = useState(CHANGE_FEED);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(true);
      setFeed((prev) => {
        const updated = [...prev];
        const idx = Math.floor(Math.random() * updated.length);
        const drift = Math.floor((Math.random() - 0.5) * 4);
        updated[idx] = { ...updated[idx], score: Math.max(20, Math.min(100, updated[idx].score + drift)), ago: "just now" };
        return updated;
      });
      setTimeout(() => {
        setPulse(false);
        setFeed((prev) => prev.map((item) => ({ ...item, ago: item.ago === "just now" ? "1m ago" : item.ago })));
      }, 1200);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${pulse ? "bg-[#5c9aff] animate-ping" : "bg-emerald-400 animate-pulse"}`} />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Live Signal Feed</span>
        </div>
        <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
          <RefreshCw size={9} className={pulse ? "animate-spin" : ""} />
          Auto-updating
        </span>
      </div>
      {feed.map((item) => (
        <div
          key={item.symbol}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-mono font-bold flex-shrink-0 ${item.up ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
            {item.symbol.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{item.symbol}</span>
              <span className={`text-[10px] font-mono ${item.up ? "text-emerald-400" : "text-rose-400"}`}>{item.change}</span>
              {item.significant && (
                <span className="text-[8px] font-mono bg-[#5c9aff]/15 text-[#5c9aff] px-1.5 py-0.5 rounded">
                  SIGNAL
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.reason}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[9px] font-mono text-[#5c9aff] font-bold">{item.score}</div>
            <div className="text-[8px] font-mono text-slate-600">{item.ago}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Feature Highlight Cards ──────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    icon: Zap,
    color: "from-[#5c9aff]/20 to-[#38bdf8]/10",
    border: "border-[#5c9aff]/20",
    iconColor: "text-[#5c9aff]",
    title: "Signal Isolation",
    desc: "Separate company-specific signals from broader market and sector noise. Know if a move is unique.",
    stat: "78% avg isolation score",
    pulse: "#5c9aff",
  },
  {
    icon: Clock,
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    title: "Attention Budget",
    desc: "Get a 30-second summary or deep-dive in 5 minutes. Intelligence adapts to your available time.",
    stat: "4 time formats",
    pulse: "#10b981",
  },
  {
    icon: BrainCircuit,
    color: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
    title: "SmartPilot AI",
    desc: "Ask natural language questions about your watchlist. Get contextualized answers, not raw data.",
    stat: "Context-aware responses",
    pulse: "#8b5cf6",
  },
  {
    icon: BarChart3,
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    title: "Change Replay",
    desc: "Replay any market event with full temporal context. Understand how significance developed over time.",
    stat: "Intraday event timeline",
    pulse: "#f59e0b",
  },
  {
    icon: Target,
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
    title: "Portfolio Relevance",
    desc: "Market significance doesn't equal personal significance. Get intelligence relative to your goals.",
    stat: "Goal-weighted signals",
    pulse: "#f43f5e",
  },
  {
    icon: Bell,
    color: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    title: "Smart Alerts",
    desc: "Alerts that fire only when there is a meaningful signal. No noise. No irrelevant notifications.",
    stat: "Significance-threshold alerts",
    pulse: "#06b6d4",
  },
];

function FeatureCard({ card, index }: { card: typeof FEATURE_CARDS[0]; index: number }) {
  const { ref, inView } = useInView();
  const Icon = card.icon;

  return (
    <div
      ref={ref}
      className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.iconColor} bg-white/5`}>
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{card.desc}</p>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: card.pulse }} />
        <span className="text-[10px] font-mono text-slate-500">{card.stat}</span>
      </div>
    </div>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { ref, inView } = useInView();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroVisualMode, setHeroVisualMode] = useState<"showcase" | "universe">("showcase");
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setLiveTime(
        d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) +
        " IST"
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const statsRef = useInView(0.2);

  return (
    <div className="min-h-screen bg-[#050811] text-[#cbd5e1] selection:bg-[#5c9aff]/30 selection:text-white overflow-x-hidden font-sans">
      <LandingNavbar />

      <main className="space-y-0">
        {/* ══════════════════════════════════════════════════════════
            HERO SECTION
            ══════════════════════════════════════════════════════════ */}
        <section className="relative pt-28 sm:pt-36 pb-20 px-4 overflow-hidden">
          {/* Ambient background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#5c9aff]/12 via-[#38bdf8]/6 to-transparent blur-3xl rounded-full" />
            <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
          </div>

          <div
            ref={heroRef}
            className={`max-w-7xl mx-auto transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Live timestamp */}
            {liveTime && (
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{liveTime}</span>
                </div>
              </div>
            )}

            {/* Kicker pill */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5c9aff]/10 border border-[#5c9aff]/25 text-xs font-mono text-[#5c9aff]">
                <Activity size={12} />
                <span>SMART MARKET INTELLIGENCE · REAL-TIME WATCHLIST SYSTEM</span>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-center text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.04] max-w-5xl mx-auto mb-6">
              Don't just watch<br />the market.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5c9aff] via-[#38bdf8] to-emerald-300">
                Know what changed.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-center text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              SmartPilot Watch turns your watchlist into a real-time market intelligence system—showing what meaningfully changed, why it matters, and what deserves your attention right now.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#5c9aff] to-[#3b78e7] hover:from-[#6aa5ff] hover:to-[#4a88f0] text-white font-bold text-sm shadow-xl shadow-[#5c9aff]/25 hover:shadow-[#5c9aff]/40 transition-all inline-flex items-center justify-center gap-2 group"
              >
                <span>Start Watching Smarter</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => scrollTo("how-it-works")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold text-sm transition-colors"
              >
                See How It Works
              </button>
            </div>

            {/* Live ticker strip */}
            <div className="max-w-5xl mx-auto mb-12">
              <div className="text-center text-[10px] font-mono text-slate-600 mb-3 uppercase tracking-widest">
                Live Market Prices · Auto-updating
              </div>
              <HeroLiveTicker />
            </div>

            {/* Hero Visual: 3D Showcase / 3D Market Universe */}
            <div className="w-full max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <button
                    onClick={() => setHeroVisualMode("showcase")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      heroVisualMode === "showcase"
                        ? "bg-[#5c9aff] text-white font-bold shadow-lg shadow-[#5c9aff]/25"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    3D Dashboard Showcase
                  </button>
                  <button
                    onClick={() => setHeroVisualMode("universe")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      heroVisualMode === "universe"
                        ? "bg-[#5c9aff] text-white font-bold shadow-lg shadow-[#5c9aff]/25"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    3D Market Universe
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interactive Glassmorphism Cards · Floating Stock Chips</span>
                </div>
              </div>

              {heroVisualMode === "showcase" ? <Hero3D /> : <MarketUniverse3D />}
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center mt-10">
              <button
                onClick={() => scrollTo("how-it-works")}
                className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors text-[10px] font-mono uppercase tracking-widest"
                aria-label="Scroll to discover"
              >
                <span>Discover the difference</span>
                <ChevronDown size={16} className="animate-bounce" />
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            LIVE CHANGE FEED SECTION
            ══════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1e]/50 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Explanation */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5c9aff]/10 border border-[#5c9aff]/20 text-[10px] font-mono text-[#5c9aff]">
                  <Zap size={11} />
                  <span>SIGNAL INTELLIGENCE</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Not all market<br />movement is equal.
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Traditional watchlists show you prices. SmartPilot Watch shows you <em>significance</em>. Every movement is scored against the broader market, sector peers, and your personal watchlist context—so you always know if a signal is real or just noise.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Eye, text: "Isolates company-specific signals from market noise" },
                    { icon: Zap, text: "Scores significance 0–100 with real contextual data" },
                    { icon: Shield, text: "Timestamps every observation for full auditability" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-7 h-7 rounded-lg bg-[#5c9aff]/10 border border-[#5c9aff]/20 flex items-center justify-center text-[#5c9aff] flex-shrink-0">
                        <Icon size={13} />
                      </div>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#5c9aff] hover:text-[#6aa5ff] group"
                >
                  <span>Start tracking for free</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right: Live Feed */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-sm">
                <LiveChangeFeed />
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <ProblemSection />

        {/* SIGNATURE CARD */}
        <SignatureCard />

        {/* ══════════════════════════════════════════════════════════
            STATS SECTION
            ══════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 border-y border-white/[0.06] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#5c9aff]/3 via-transparent to-emerald-500/3 pointer-events-none" />
          <div
            ref={statsRef.ref}
            className={`max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 ${statsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <StatCounter value={2000} label="Stocks Tracked" suffix="+" />
            <StatCounter value={4} label="Million Signals/Day" suffix="M+" />
            <StatCounter value={30} label="Second Signal Latency" suffix="s" />
            <StatCounter value={99} label="Uptime SLA" suffix="%" />
          </div>
        </section>

        {/* SWIPE CAROUSEL */}
        <SwipeCarousel />

        {/* SIGNAL ISOLATION DEMO */}
        <SignalIsolationDemo />

        {/* ATTENTION BUDGET */}
        <AttentionBudgetDemo />

        {/* SMARTPILOT AI DEMO */}
        <SmartPilotAiDemo />

        {/* ══════════════════════════════════════════════════════════
            FEATURES GRID
            ══════════════════════════════════════════════════════════ */}
        <section id="features" className="py-20 px-4 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <Sparkles size={11} />
              <span>INTELLIGENCE FEATURES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Every feature has a purpose.
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Built specifically for investors who value signal over noise. No dashboards for dashboards' sake.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_CARDS.map((card, i) => (
              <FeatureCard key={card.title} card={card} index={i} />
            ))}
          </div>
        </section>

        {/* 3D MARKET MAP */}
        <section id="market-map" className="py-20 px-4 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-[#06b6d4]">
              <Sparkles size={11} />
              <span>MACRO CLUSTER TOPOLOGY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              See the market as a living system.
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Technology, Banking, Energy, Healthcare, Consumer, and Auto sectors interconnect dynamically. Drag and inspect cluster interlocks.
            </p>
          </div>
          <MarketMap3D />
        </section>

        {/* CHANGE REPLAY */}
        <ChangeReplayDemo />

        {/* PORTFOLIO BLINDSPOTS */}
        <PortfolioBlindspotsDemo />
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
