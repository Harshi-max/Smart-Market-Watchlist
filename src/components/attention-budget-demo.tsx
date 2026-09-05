"use client";

import { useState } from "react";
import { Clock, CheckCircle2, ChevronRight, Zap, Shield, ArrowDownRight, ArrowUpRight } from "lucide-react";

type BudgetTier = "30 SEC" | "2 MIN" | "5 MIN" | "DEEP DIVE";

export default function AttentionBudgetDemo() {
  const [budget, setBudget] = useState<BudgetTier>("2 MIN");

  const tierContent: Record<
    BudgetTier,
    {
      kicker: string;
      heading: string;
      desc: string;
      items: { symbol: string; change: string; tone: "pos" | "neg"; score: number; reason: string }[];
      features: string[];
    }
  > = {
    "30 SEC": {
      kicker: "MICRO SCAN",
      heading: "1 thing deserves your attention",
      desc: "Instant clarity on the single most significant anomaly in your watchlist today.",
      items: [
        {
          symbol: "RELIANCE",
          change: "-3.8%",
          tone: "neg",
          score: 91,
          reason: "2.6x volume spike with sector divergence. Clear priority alert.",
        },
      ],
      features: ["Single critical anomaly highlight", "10-word summary", "No noise or low-impact moves"],
    },
    "2 MIN": {
      kicker: "EXECUTIVE BRIEF",
      heading: "Top 3 meaningful changes",
      desc: "Fast digest of the 3 highest divergence moves with key drivers across your watchlist.",
      items: [
        {
          symbol: "RELIANCE",
          change: "-3.8%",
          tone: "neg",
          score: 91,
          reason: "Diverged from energy sector with 2.6x volume spike.",
        },
        {
          symbol: "TCS",
          change: "+4.2%",
          tone: "pos",
          score: 88,
          reason: "Leading technology peers on contract wins announcement.",
        },
        {
          symbol: "TATAMOTORS",
          change: "+2.7%",
          tone: "pos",
          score: 72,
          reason: "Commercial vehicle volume data triggered peer outperformance.",
        },
      ],
      features: ["Top 3 ranked anomalies", "Primary driver rationale", "Sector context snapshot"],
    },
    "5 MIN": {
      kicker: "TACTICAL BRIEF",
      heading: "Top 5 + context",
      desc: "Complete contextual breakdown including sector correlation and relative movement estimates.",
      items: [
        { symbol: "RELIANCE", change: "-3.8%", tone: "neg", score: 91, reason: "Energy divergence, 2.6x volume" },
        { symbol: "TCS", change: "+4.2%", tone: "pos", score: 88, reason: "Peer outperformance +5.2pp" },
        { symbol: "TATAMOTORS", change: "+2.7%", tone: "pos", score: 72, reason: "Commercial auto momentum" },
        { symbol: "INFY", change: "-1.9%", tone: "neg", score: 58, reason: "Aligned with sector index" },
        { symbol: "HDFCBANK", change: "+1.1%", tone: "pos", score: 43, reason: "Normal banking session drift" },
      ],
      features: ["Top 5 ranked stocks", "Relative movement decomposition", "Peer comparison matrix", "Historical significance context"],
    },
    "DEEP DIVE": {
      kicker: "COMPREHENSIVE LAB",
      heading: "Full evidence + peers + replay + what-if",
      desc: "The complete institutional research terminal with timeline replay and scenario simulation.",
      items: [
        { symbol: "RELIANCE", change: "-3.8%", tone: "neg", score: 91, reason: "Full intraday replay available" },
        { symbol: "TCS", change: "+4.2%", tone: "pos", score: 88, reason: "Peer correlation models active" },
        { symbol: "TATAMOTORS", change: "+2.7%", tone: "pos", score: 72, reason: "Scenario stress testing linked" },
      ],
      features: [
        "Intraday Change Replay timeline",
        "What-If scenario simulation lab",
        "Cross-sector blind spot analysis",
        "SmartPilot AI interactive research agent",
      ],
    },
  };

  const current = tierContent[budget];

  return (
    <section className="py-24 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <Clock size={13} />
          <span>ATTENTION OPTIMIZER</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How much time do you have?
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Configure SmartPilot to match your schedule—from a 30-second morning check to an institutional deep dive.
        </p>

        {/* The 4 Time Pills */}
        <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono gap-1">
          {(["30 SEC", "2 MIN", "5 MIN", "DEEP DIVE"] as BudgetTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setBudget(tier)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all ${
                budget === tier
                  ? "bg-[#5c9aff] text-white shadow-lg shadow-[#5c9aff]/30 scale-105"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic UI Preview Card with Smooth Transition */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0c1220] to-[#070a12] border border-white/15 p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-[11px] font-mono text-[#5c9aff] uppercase tracking-wider font-semibold">
              {current.kicker}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{current.heading}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{current.desc}</p>
          </div>
          <div className="flex-shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              Active Mode: <strong className="text-white">{budget}</strong>
            </span>
          </div>
        </div>

        {/* Live List Items */}
        <div className="space-y-3">
          {current.items.map((item, idx) => (
            <div
              key={`${item.symbol}-${idx}`}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 w-5">0{idx + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-base">{item.symbol}</strong>
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        item.tone === "pos" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                      }`}
                    >
                      {item.tone === "pos" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {item.change}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{item.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs text-slate-400 font-mono">
                  Significance: <strong className={item.score > 75 ? "text-rose-400" : "text-sky-400"}>{item.score}</strong>
                </span>
                <a
                  href="/login"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  aria-label="Inspect change"
                >
                  <ChevronRight size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Tier Capabilities Badges */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2.5">
          {current.features.map((feat, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[11px] text-slate-300"
            >
              <CheckCircle2 size={13} className="text-[#5c9aff]" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
