"use client";

import { useState } from "react";
import { Clock, Play, Pause, RotateCcw, Info, ArrowDownRight } from "lucide-react";

const TIMELINE_STEPS = [
  {
    time: "10:14",
    title: "Last viewed",
    status: "Quiet session",
    desc: "Stock trading at ₹2,940.00. Normal morning spread, zero divergence detected.",
    score: 12,
    badge: "BASELINE",
    badgeColor: "text-slate-400 bg-white/5",
  },
  {
    time: "11:05",
    title: "Market opens momentum",
    status: "Broad market test",
    desc: "NIFTY 50 drifts lower by 0.3%. Reliance tracks market beta synchronously.",
    score: 24,
    badge: "NORMAL BETA",
    badgeColor: "text-slate-300 bg-white/5",
  },
  {
    time: "12:20",
    title: "Volume anomaly",
    status: "Institutional burst",
    desc: "15-minute block trade volume spikes to 2.4× standard interval. Volatility breaks 20-day envelope.",
    score: 56,
    badge: "ANOMALY",
    badgeColor: "text-amber-400 bg-amber-500/10",
  },
  {
    time: "13:05",
    title: "Peer divergence",
    status: "Sector decoupling",
    desc: "Energy peers (ONGC, BPCL) stabilize at -0.4%, while Reliance extends sell-off to -2.3%.",
    score: 74,
    badge: "DIVERGENT",
    badgeColor: "text-sky-400 bg-sky-500/10",
  },
  {
    time: "13:42",
    title: "Relevant event signal",
    status: "News & institutional note",
    desc: "Global refining margin forecast downgraded; heavy institutional selling detected.",
    score: 83,
    badge: "EVENT CONFIRMED",
    badgeColor: "text-indigo-400 bg-indigo-500/10",
  },
  {
    time: "14:10",
    title: "Significance crossed HIGH",
    status: "Alert threshold triggered",
    desc: "Relative drop reaches -3.8% with 2.6x daily volume. Multi-factor score hits 91 / 100.",
    score: 91,
    badge: "HIGH SIGNIFICANCE",
    badgeColor: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
  },
];

export default function ChangeReplayDemo() {
  const [activeIdx, setActiveIdx] = useState(5);

  const step = TIMELINE_STEPS[activeIdx];

  return (
    <section className="py-24 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400">
          <Clock size={13} />
          <span>INTRADAY RECONSTRUCTION</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          See how a move became meaningful.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Moves don’t happen in a vacuum. Replay the timeline to see exactly which catalyst crossed the threshold from noise to critical signal.
        </p>
      </div>

      <div className="rounded-3xl bg-[#090d18] border border-white/15 p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Timeline Slider / Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TIMELINE_STEPS.map((item, idx) => (
            <button
              key={item.time}
              onClick={() => setActiveIdx(idx)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeIdx === idx
                  ? "bg-[#5c9aff]/20 border-[#5c9aff] shadow-lg shadow-[#5c9aff]/20"
                  : "bg-white/[0.02] border-white/5 hover:border-white/20"
              }`}
            >
              <div className="font-mono text-xs text-slate-400 font-semibold">{item.time}</div>
              <div className="text-xs font-bold text-white truncate mt-1">{item.title}</div>
            </button>
          ))}
        </div>

        {/* Selected Step Replay Display Card */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-white">{step.time} IST</span>
                <span className="text-slate-600">&bull;</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${step.badgeColor}`}>
                  {step.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-slate-400 block">Significance Score</span>
              <strong className={`text-2xl font-black ${step.score > 75 ? "text-rose-400" : "text-sky-400"}`}>
                {step.score} <small className="text-xs font-normal text-slate-500">/ 100</small>
              </strong>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{step.desc}</p>
        </div>

        {/* Footer Disclaimer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info size={13} />
            <span>Illustrative replay &bull; RELIANCE Intraday Reconstruction</span>
          </div>
          <a href="/login" className="text-[#5c9aff] hover:underline font-semibold">
            Open full Replay engine in dashboard &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
