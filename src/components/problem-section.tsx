"use client";

import { useEffect, useState, useRef } from "react";
import { Zap, Sparkles } from "lucide-react";

const NOISY_NUMBERS = [
  { val: "+4.8%", top: "12%", left: "15%", color: "text-emerald-400" },
  { val: "-3.2%", top: "25%", left: "75%", color: "text-rose-400" },
  { val: "+2.1%", top: "65%", left: "20%", color: "text-emerald-400" },
  { val: "-1.7%", top: "75%", left: "80%", color: "text-rose-400" },
  { val: "+5.4%", top: "35%", left: "45%", color: "text-emerald-400" },
  { val: "-0.9%", top: "85%", left: "40%", color: "text-rose-400" },
  { val: "+1.3%", top: "18%", left: "60%", color: "text-emerald-400" },
  { val: "-4.1%", top: "50%", left: "10%", color: "text-rose-400" },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"noise" | "fading" | "focus">("noise");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger cycle: noise -> fade -> focus
          setPhase("noise");
          const t1 = setTimeout(() => setPhase("fading"), 2200);
          const t2 = setTimeout(() => setPhase("focus"), 3800);
          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative min-h-[560px] py-24 px-4 flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-b from-transparent via-[#080d1a]/40 to-transparent select-none"
    >
      {/* Background Floating Noisy Numbers */}
      <div
        className={`absolute inset-0 max-w-4xl mx-auto pointer-events-none transition-opacity duration-1000 ${
          phase === "focus" ? "opacity-0 scale-95" : phase === "fading" ? "opacity-20 blur-sm scale-105" : "opacity-75"
        }`}
      >
        {NOISY_NUMBERS.map((item, idx) => (
          <span
            key={idx}
            className={`absolute font-mono text-xl sm:text-3xl font-extrabold tracking-wider transition-all duration-700 animate-pulse ${item.color}`}
            style={{
              top: item.top,
              left: item.left,
              animationDelay: `${idx * 0.2}s`,
            }}
          >
            {item.val}
          </span>
        ))}
      </div>

      {/* Main Copy Transition */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>SIGNAL OVER NOISE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Your watchlist tells you what moved.
        </h2>

        {/* Phase Transition Message */}
        <div className="min-h-[110px] flex flex-col items-center justify-center">
          {phase === "noise" && (
            <p className="text-base sm:text-xl text-slate-400 max-w-xl transition-opacity duration-500">
              Thousands of price updates, flashing green and red tickers, alerts firing on random noise...
            </p>
          )}

          {phase === "fading" && (
            <p className="text-xl sm:text-2xl font-bold text-amber-300 transition-all duration-500 scale-105">
              But what actually matters?
            </p>
          )}

          {phase === "focus" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-700">
              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#5c9aff] via-[#38bdf8] to-emerald-400">
                SmartPilot finds the meaningful changes.
              </p>
              <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                By comparing individual moves against broader market, sector peers, volume anomalies, and event context—isolating the true signal.
              </p>
            </div>
          )}
        </div>

        {/* Interaction hint button */}
        <button
          onClick={() => {
            setPhase((prev) => (prev === "focus" ? "noise" : prev === "noise" ? "fading" : "focus"));
          }}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
        >
          {phase === "focus" ? "Replay noise transition" : "Skip to signal"}
        </button>
      </div>
    </section>
  );
}
