"use client";

import { useState } from "react";
import { Filter, Info, ArrowDownRight, Layers, Sparkles } from "lucide-react";

export default function SignalIsolationDemo() {
  const [activeStock, setActiveStock] = useState<"RELIANCE" | "TCS">("RELIANCE");

  const data = {
    RELIANCE: {
      symbol: "RELIANCE",
      sector: "Energy",
      grossMove: "-3.8%",
      marketDrag: "-0.7%",
      sectorDrag: "-1.0%",
      isolatedAlpha: "≈ -2.1pp",
      isolationScore: "78 / 100",
      description: "Most of the move cannot be explained by broad market or peer movement.",
      verdict: "High Company-Specific Pressure",
    },
    TCS: {
      symbol: "TCS",
      sector: "Technology",
      grossMove: "+4.2%",
      marketDrag: "+0.4%",
      sectorDrag: "+0.9%",
      isolatedAlpha: "≈ +2.9pp",
      isolationScore: "84 / 100",
      description: "Substantial idiosyncratic outperformance against both Nifty IT and broad market.",
      verdict: "Strong Independent Momentum",
    },
  }[activeStock];

  return (
    <section className="py-24 px-4 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-[#38bdf8]">
          <Filter size={13} />
          <span>DECOMPOSITION ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Was it the company?<br />Or was everything moving?
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          When the whole market is falling 2%, an individual drop may just be market beta. SmartPilot isolates the company-specific delta.
        </p>

        {/* Stock Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveStock("RELIANCE")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeStock === "RELIANCE" ? "bg-[#5c9aff] text-white font-bold shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            RELIANCE (Downside Isolation)
          </button>
          <button
            onClick={() => setActiveStock("TCS")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeStock === "TCS" ? "bg-[#5c9aff] text-white font-bold shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            TCS (Upside Isolation)
          </button>
        </div>
      </div>

      {/* Analytical Instrument Panel */}
      <div className="rounded-3xl bg-[#090e1b] border border-white/15 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-10">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
          <div>
            <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
              ISOLATION MATRIX &bull; {data.sector} SECTOR
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">{data.symbol} Decomposition</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-slate-300">
              Isolation Index: <strong className="text-[#38bdf8]">{data.isolationScore}</strong>
            </span>
          </div>
        </div>

        {/* The 3 Comparative Movement Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Layer 1: Market Drag */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">1. MARKET BETA</span>
              <span className="text-xs font-mono text-slate-500">NIFTY 50</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-300">{data.marketDrag}</div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-slate-500 w-[25%]" />
            </div>
            <p className="text-[11px] text-slate-400">Broad benchmark index pull</p>
          </div>

          {/* Layer 2: Sector Drag */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">2. SECTOR FACTOR</span>
              <span className="text-xs font-mono text-slate-500">{data.sector} Index</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-300">{data.sectorDrag}</div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-slate-400 w-[35%]" />
            </div>
            <p className="text-[11px] text-slate-400">Industry-wide headwinds/tailwinds</p>
          </div>

          {/* Layer 3: Gross Stock Move */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">3. GROSS OBSERVED</span>
              <span className="text-xs font-mono text-slate-500">{data.symbol}</span>
            </div>
            <div
              className={`text-2xl font-mono font-bold ${
                data.grossMove.startsWith("-") ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {data.grossMove}
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full ${
                  data.grossMove.startsWith("-") ? "bg-rose-500 w-[85%]" : "bg-emerald-500 w-[85%]"
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400">Observed price change on exchange</p>
          </div>
        </div>

        {/* Animated Connector Visual */}
        <div className="relative z-10 p-6 rounded-2xl bg-gradient-to-r from-[#0d162b] via-[#101b33] to-[#0d162b] border border-[#5c9aff]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#5c9aff] font-bold">
              ISOLATED COMPANY-RELATIVE MOVE
            </span>
            <div className="text-4xl font-mono font-extrabold text-white tracking-tight">
              {data.isolatedAlpha}
            </div>
            <p className="text-xs text-slate-300 max-w-md">{data.description}</p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-white">
              {data.verdict}
            </div>
            <span className="text-[11px] text-slate-400">Residual after removing market &amp; sector beta</span>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-white/10 relative z-10">
          <Info size={14} className="flex-shrink-0" />
          <span>Relative movement estimate — not causal attribution. Designed for signal prioritization.</span>
        </div>
      </div>
    </section>
  );
}
