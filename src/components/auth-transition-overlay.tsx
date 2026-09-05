"use client";

import { useEffect, useState } from "react";
import { Sparkles, BrainCircuit, CheckCircle2 } from "lucide-react";

export default function AuthTransitionOverlay({
  userName = "Harshitha Arava",
  onComplete,
}: {
  userName?: string;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Step 1: "Welcome back, {name}" (400ms)
    // Step 2: "Preparing your market intelligence..." (700ms)
    // Step 3: Dissolve into dashboard
    const t1 = setTimeout(() => setStep(2), 500);
    const t2 = setTimeout(() => {
      setStep(3);
      setFading(true);
    }, 1300);
    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#050811] flex flex-col items-center justify-center p-6 text-center select-none transition-opacity duration-300 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Brand Orb */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#5c9aff] to-[#38bdf8] animate-spin-slow opacity-30 blur-xl" />
          <div className="relative w-16 h-16 rounded-2xl bg-[#0d1527] border border-[#5c9aff]/40 flex items-center justify-center text-[#5c9aff] shadow-2xl">
            <BrainCircuit size={32} className="animate-pulse" />
          </div>
        </div>

        {/* Step Text */}
        <div className="space-y-2">
          {step === 1 && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <span className="text-xs font-mono text-[#5c9aff] tracking-wider uppercase">AUTHENTICATION SUCCESS</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {userName}.
              </h2>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase flex items-center justify-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>SESSION INITIALIZED</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-200">
                Preparing your market intelligence...
              </h2>
              <p className="text-xs text-slate-400">Loading live stock nodes and sector divergence matrix</p>
            </div>
          )}
        </div>

        {/* Subtle Progress Bar */}
        <div className="w-48 mx-auto h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#5c9aff] to-[#38bdf8] rounded-full transition-all duration-700 ease-out"
            style={{ width: step === 1 ? "40%" : "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
