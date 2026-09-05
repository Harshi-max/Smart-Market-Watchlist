"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Filter,
  Users,
  BrainCircuit,
  Sliders,
  Clock,
  ArrowUpRight,
} from "lucide-react";

type FeatureCard = {
  id: string;
  title: string;
  tag: string;
  desc: string;
  icon: typeof Zap;
  chartType: "divergence" | "isolation" | "peers" | "dialogue" | "simulation" | "timeline";
  color: string;
};

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: "changes",
    title: "Meaningful Changes",
    tag: "PRIORITY RANKING",
    desc: "Ranks watchlist movements by divergence, statistical rarity, and volume anomaly instead of raw percentage.",
    icon: Zap,
    chartType: "divergence",
    color: "#ff5252",
  },
  {
    id: "isolation",
    title: "Signal Isolation",
    tag: "ALPHA DECOMPOSITION",
    desc: "Deconstructs company movement against broad market and sector indices to expose idiosyncratic pressure.",
    icon: Filter,
    chartType: "isolation",
    color: "#38bdf8",
  },
  {
    id: "peers",
    title: "Competitive Intelligence",
    tag: "PEER CLUSTERING",
    desc: "Side-by-side performance divergence across industry competitors in Technology, Banking, Energy, and Auto.",
    icon: Users,
    chartType: "peers",
    color: "#818cf8",
  },
  {
    id: "pilot",
    title: "SmartPilot AI",
    tag: "CONTEXT AGENT",
    desc: "Ask contextual questions: 'Why did Reliance decline while peers rallied?' with instant multi-factor evidence.",
    icon: BrainCircuit,
    chartType: "dialogue",
    color: "#5c9aff",
  },
  {
    id: "what-if",
    title: "What-If Lab",
    tag: "SCENARIO STRESS TEST",
    desc: "Simulate interest rate cuts, oil shocks, or market sell-offs across your personalized watchlist exposure.",
    icon: Sliders,
    chartType: "simulation",
    color: "#10b981",
  },
  {
    id: "replay",
    title: "Change Replay",
    tag: "INTRADAY TIMELINE",
    desc: "Replay how quiet morning trading evolved into an unusual volume anomaly and breached significance thresholds.",
    icon: Clock,
    chartType: "timeline",
    color: "#f59e0b",
  },
];

export default function SwipeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = 340;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  return (
    <section id="features" className="py-24 px-4 max-w-7xl mx-auto space-y-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5c9aff]" />
            <span>INTERACTIVE PRODUCT SUITE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            One market.<br />Different ways to understand it.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl">
            Swipe through the 6 core intelligence lenses built into SmartPilot Watch.
          </p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Draggable / Touch Swipeable Horizontal Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: "none" }}
      >
        {FEATURE_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="flex-shrink-0 w-[300px] sm:w-[340px] snap-start rounded-3xl bg-gradient-to-b from-[#0c1220] to-[#070a12] border border-white/10 p-6 shadow-xl hover:border-[#5c9aff]/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${card.color}20`, border: `1px solid ${card.color}40` }}
                  >
                    <Icon size={18} style={{ color: card.color }} />
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold tracking-wider">
                    0{idx + 1} / 06
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    {card.tag}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#5c9aff] transition-colors">
                    {card.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
              </div>

              {/* Visual Illustration Mini-Chart */}
              <div className="mt-6 pt-4 border-t border-white/5">
                {card.chartType === "divergence" && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">TCS vs Sector</span>
                      <span className="text-emerald-400 font-bold">+5.2pp</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[78%]" />
                    </div>
                  </div>
                )}

                {card.chartType === "isolation" && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Move</span>
                      <span className="text-rose-400 font-bold">-3.8%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Isolated Alpha</span>
                      <span className="text-[#38bdf8] font-bold">≈ -2.1pp</span>
                    </div>
                  </div>
                )}

                {card.chartType === "peers" && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400">HDFC +1.1%</span>
                    <span className="text-slate-500">vs</span>
                    <span className="text-rose-400">SBI -0.5%</span>
                  </div>
                )}

                {card.chartType === "dialogue" && (
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 italic truncate">
                    &quot;Why did Reliance diverge?&quot; &rarr; 2.6x volume spike.
                  </div>
                )}

                {card.chartType === "simulation" && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Crude +5% Stress</span>
                      <span className="text-amber-400">Portfolio -0.8%</span>
                    </div>
                  </div>
                )}

                {card.chartType === "timeline" && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>10:14 Clean</span>
                    <span>&bull;</span>
                    <span className="text-rose-400 font-bold">12:20 Volume</span>
                    <span>&bull;</span>
                    <span className="text-white">14:10 High</span>
                  </div>
                )}

                <a
                  href="/login"
                  className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5c9aff] hover:underline"
                >
                  Explore in app <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
