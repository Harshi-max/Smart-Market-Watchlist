"use client";

import { Target, AlertTriangle, ArrowRight, ShieldCheck, PieChart } from "lucide-react";
import Link from "next/link";

export default function PortfolioBlindspotsDemo() {
  return (
    <section className="py-24 px-4 max-w-6xl mx-auto space-y-24">
      {/* PART 13: Portfolio Relevance */}
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
            <Target size={13} />
            <span>PERSONAL CONTEXT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Market significance isn’t personal significance.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            A small move in a stock that makes up 25% of your portfolio matters more to you than a 10% move in a stock you don’t own.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Market Significance Card */}
          <div className="rounded-3xl bg-[#090e1a] border border-white/10 p-6 sm:p-8 space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                MARKET SIGNIFICANCE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 font-mono text-xs text-slate-300">
                NSE BENCHMARK
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-white">TCS</h3>
              <span className="text-emerald-400 font-mono font-bold text-lg">+4.2%</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 block font-mono">Significance Rating</span>
              <strong className="text-base text-rose-400 font-bold">HIGH (88/100)</strong>
              <p className="text-xs text-slate-400">Significant relative outperformance vs NIFTY IT peers.</p>
            </div>
          </div>

          {/* Personal Relevance Card */}
          <div className="rounded-3xl bg-gradient-to-b from-[#0e172e] to-[#0a0f1d] border border-[#5c9aff]/30 p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5c9aff] font-bold">
                PERSONAL RELEVANCE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#5c9aff]/10 border border-[#5c9aff]/30 font-mono text-xs text-[#5c9aff] font-semibold">
                YOUR PORTFOLIO
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-white">TCS</h3>
              <span className="text-[#38bdf8] font-mono font-bold text-sm">18% Portfolio Exposure</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#5c9aff]/5 border border-[#5c9aff]/20 space-y-1">
              <span className="text-xs text-slate-300 block font-mono">Priority Weighting</span>
              <strong className="text-base text-emerald-400 font-bold">HIGH RELEVANCE</strong>
              <p className="text-xs text-slate-300">Directly impacts your Long-Term Growth goal allocation.</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          SmartPilot connects broad market context with your own watchlist and portfolio weights without making investment recommendations.
        </div>
      </div>

      {/* PART 14: Watchlist Blind Spots */}
      <div className="space-y-12 pt-12 border-t border-white/10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400">
            <AlertTriangle size={13} />
            <span>CONCENTRATION DETECTION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Your watchlist can have blind spots.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            When multiple stocks in your list belong to the same sector, a single macro event can trigger 5 separate alerts that are actually just one common signal.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-3xl bg-[#090e1b] border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="space-y-5">
            {/* Sector Bar 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white font-semibold">Technology</span>
                <span className="text-[#38bdf8]">5 stocks (62% concentration)</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-[#38bdf8] w-[62%] rounded-full" />
              </div>
            </div>

            {/* Sector Bar 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white font-semibold">Banking</span>
                <span className="text-indigo-400">2 stocks (25%)</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-indigo-500 w-[25%] rounded-full" />
              </div>
            </div>

            {/* Sector Bar 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white font-semibold">Energy</span>
                <span className="text-amber-400">1 stock (13%)</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-amber-500 w-[13%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>High Cross-Correlation Detected:</strong> Your 5 technology stocks frequently move together with 0.84 correlation. SmartPilot automatically groups them so you aren&apos;t overwhelmed by duplicate signals.
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold tracking-wide transition-all group"
            >
              <span>Find my blind spots in SmartPilot</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
