"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ShieldCheck, Zap, Info } from "lucide-react";

export default function SignatureCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
        }
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="smart-changes" className="py-20 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5c9aff]/10 border border-[#5c9aff]/25 text-xs font-mono text-[#5c9aff]">
          <Zap size={13} />
          <span>SIGNATURE ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          From movement to meaning.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Raw price change is just one variable. SmartPilot examines sector divergence, volume anomalies, and broad index drag to compute real significance.
        </p>
      </div>

      <div
        ref={cardRef}
        className="relative rounded-3xl bg-gradient-to-b from-[#0d1322] to-[#07090f] border border-white/10 p-6 sm:p-10 shadow-2xl shadow-black/80 space-y-8 overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header & Price Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold">Energy Sector</span>
              <span className="text-slate-600">&bull;</span>
              <span className="font-mono text-xs text-slate-400">NSE: RELIANCE</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">RELIANCE</h3>
            <p className="text-xs text-slate-400 mt-0.5">Reliance Industries Limited</p>
          </div>

          <div className="sm:text-right">
            <div className="text-3xl sm:text-4xl font-mono font-black text-white">₹2,841.50</div>
            <div className="inline-flex items-center gap-1.5 font-mono text-base font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg mt-1">
              <ArrowDownRight size={17} />
              <span>-3.8%</span>
            </div>
          </div>
        </div>

        {/* Context Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 block font-mono">Market (NIFTY 50)</span>
            <strong className="text-base font-mono text-slate-300">-0.7%</strong>
            <small className="text-[10px] text-slate-500 block">Mild drift</small>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 block font-mono">Energy Sector</span>
            <strong className="text-base font-mono text-slate-300">-1.0%</strong>
            <small className="text-[10px] text-slate-500 block">Broad weakness</small>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 block font-mono">Volume Ratio</span>
            <strong className="text-base font-mono text-amber-400">2.6x</strong>
            <small className="text-[10px] text-slate-500 block">Unusual institutional flow</small>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <span className="text-[11px] text-rose-300 block font-mono">Significance</span>
            <strong className="text-base font-mono text-rose-400">HIGH</strong>
            <small className="text-[10px] text-rose-300/80 block">Actionable divergence</small>
          </div>
        </div>

        {/* Why this matters: Animated Evidence Bars */}
        <div className="space-y-4 pt-2 relative z-10">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Why this matters
            </h4>
            <div className="text-xs font-mono text-slate-400">
              Score: <strong className="text-white text-sm">87</strong> / 100
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Price movement */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Price movement</span>
                <span className="font-mono text-slate-400">80%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-1000 ease-out"
                  style={{ width: animated ? "80%" : "0%" }}
                />
              </div>
            </div>

            {/* Volume anomaly */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Volume anomaly</span>
                <span className="font-mono text-slate-400">90%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000 delay-100 ease-out"
                  style={{ width: animated ? "90%" : "0%" }}
                />
              </div>
            </div>

            {/* Market divergence */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Market divergence</span>
                <span className="font-mono text-slate-400">95%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#5c9aff] transition-all duration-1000 delay-200 ease-out"
                  style={{ width: animated ? "95%" : "0%" }}
                />
              </div>
            </div>

            {/* Sector divergence */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Sector divergence</span>
                <span className="font-mono text-slate-400">75%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-emerald-400 transition-all duration-1000 delay-300 ease-out"
                  style={{ width: animated ? "75%" : "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info size={13} />
            <span>Illustrative example</span>
          </div>
          <span className="text-[11px]">Calculated using multi-factor relative movement engine</span>
        </div>
      </div>
    </section>
  );
}
