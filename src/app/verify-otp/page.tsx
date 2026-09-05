"use client";

import { FormEvent, useState, useEffect, useRef, Suspense } from "react";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck, Sparkles, AlertCircle, RotateCcw, Activity } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthTransitionOverlay from "@/components/auth-transition-overlay";

// 6-box OTP input
function OtpBoxInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = digits.map((d, j) => (j === i ? "" : d)).join("");
        onChange(next.replace(/\s/g, ""));
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, j) => (j === i ? digit : d)).join("").replace(/\s/g, "");
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    if (pasted.length > 0) refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 text-center text-xl font-bold font-mono rounded-xl border transition-all duration-200 outline-none ${digits[i]
            ? "bg-[#5c9aff]/15 border-[#5c9aff]/60 text-white"
            : "bg-white/[0.04] border-white/[0.1] text-white focus:border-[#5c9aff]/60 focus:bg-white/[0.07]"
            }`}
        />
      ))}
    </div>
  );
}

// Live signal preview on left side
const PREVIEW_STOCKS = [
  { symbol: "TCS", change: "+4.2%", score: 88, up: true },
  { symbol: "RELIANCE", change: "-3.8%", score: 91, up: false },
  { symbol: "HDFCBANK", change: "+1.1%", score: 43, up: true },
];

function SignalPreview() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % PREVIEW_STOCKS.length), 3000);
    return () => clearInterval(timer);
  }, []);
  const s = PREVIEW_STOCKS[active];

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] transition-all duration-500">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE SIGNAL
        </div>
        <span className="text-[10px] font-mono text-slate-600">Score</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-white">{s.symbol}</div>
          <div className={`text-xs font-mono mt-0.5 ${s.up ? "text-emerald-400" : "text-rose-400"}`}>{s.change}</div>
        </div>
        <div className={`text-2xl font-black font-mono ${s.up ? "text-emerald-400" : "text-rose-400"}`}>{s.score}</div>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${s.up ? "bg-emerald-500" : "bg-rose-500"}`}
          style={{ width: `${s.score}%` }}
        />
      </div>
    </div>
  );
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const identifier = searchParams.get("identifier") || "";
  const devCode = searchParams.get("devCode") || "";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const [currentDevCode, setCurrentDevCode] = useState(devCode);
  // Removed transition overlay state; navigation is handled directly
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setLiveTime(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) + " IST");
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      void (async () => {
        setLoading(true);
        setMessage("");
        try {
          const res = await fetch("/api/auth/otp", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ identifier: identifier.trim().toLowerCase(), type: "email", code: otp }),
          });
          const data = (await res.json().catch(() => null)) as {
            authenticated?: boolean;
            user?: { name?: string };
            error?: string;
          } | null;
          if (res.ok && data?.authenticated) {
            // Directly navigate to dashboard after successful authentication
            router.replace("/dashboard");
          } else {
            setMessage(data?.error || "Verification failed. Check your code and try again.");
          }
        } catch {
          setMessage("Network error verifying code. Please try again.");
        }
        setLoading(false);
      })();
    }
  }, [otp, identifier]);

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ identifier: identifier.trim().toLowerCase(), type: "email" }),
      });
      const data = (await res.json().catch(() => null)) as { developmentCode?: string; error?: string } | null;
      if (res.ok) {
        setCountdown(60);
        setOtp("");
        if (data?.developmentCode) setCurrentDevCode(data.developmentCode);
        setMessage("✓ A new verification code has been sent to your email.");
      } else {
        setMessage(data?.error || "Unable to resend OTP. Please try again shortly.");
      }
    } catch {
      setMessage("Network error resending code.");
    }
    setResending(false);
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter the complete 6-digit code.");
      return;
    }
  };

  return (
    <>
      {/* Transition overlay removed – direct navigation now occurs after OTP verification */}
      <main className="min-h-screen bg-[#04060d] text-[#cbd5e1] flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-gradient-to-br from-[#080e1f] via-[#060c1a] to-[#030508]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5c9aff]/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

          <div className="relative z-10 p-12 flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity"
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5c9aff] to-[#3b78e7] flex items-center justify-center text-white shadow-lg shadow-[#5c9aff]/30">
                <Sparkles size={17} />
              </span>
              <span className="text-base font-bold tracking-tight">
                SmartPilot <b className="text-[#5c9aff]">Watch</b>
              </span>
            </button>
            {liveTime && (
              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {liveTime}
              </div>
            )}
          </div>

          <div className="relative z-10 px-12 flex-1 flex flex-col justify-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5c9aff]/10 border border-[#5c9aff]/20 text-[10px] font-mono text-[#5c9aff]">
              <Activity size={11} />
              <span>CRYPTOGRAPHIC 2FA VERIFICATION</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                Almost there.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5c9aff] to-emerald-300">
                  Verify to continue.
                </span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                A 6-digit verification code was sent to <strong className="text-white font-mono">{identifier}</strong>. Enter it to access your market intelligence dashboard.
              </p>
            </div>

            <SignalPreview />

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Code Expiry", value: "5 min" },
                { label: "Max Attempts", value: "5" },
                { label: "Encryption", value: "SHA-256" },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-sm font-black text-white font-mono">{value}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 p-12 pt-0 flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck size={13} className="text-[#5c9aff]" />
            <span>Single-use token · Rate limited · TLS encrypted</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 lg:max-w-[480px] flex items-center justify-center p-6 sm:p-10 bg-[#04060d] lg:border-l lg:border-white/[0.06]">
          <div className="w-full max-w-md space-y-7">
            {/* Mobile header */}
            <div className="lg:hidden flex items-center justify-between pb-5 border-b border-white/[0.06]">
              <button onClick={() => router.push("/")} className="inline-flex items-center gap-2 text-white">
                <span className="w-7 h-7 rounded-lg bg-[#5c9aff] flex items-center justify-center"><Sparkles size={13} /></span>
                <span className="font-bold text-sm">SmartPilot Watch</span>
              </button>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />MARKET LIVE
              </span>
            </div>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} /> Back to Sign in
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#5c9aff] uppercase tracking-widest font-semibold">
                <Mail size={11} />
                <span>VERIFY EMAIL ADDRESS</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Enter your code.</h2>
              <p className="text-xs text-slate-500">
                We sent a 6-digit code to{" "}
                <strong className="text-slate-300 font-mono">{identifier || "your email"}</strong>.
                {" "}It expires in 5 minutes.
              </p>
            </div>

            {/* Dev code display */}
            {currentDevCode && (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                <span className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-wider font-bold block">
                  DEVELOPMENT OTP CODE
                </span>
                <strong className="text-2xl font-mono text-white tracking-[0.3em] block">{currentDevCode}</strong>
                <small className="text-[10px] text-slate-400 block">
                  Generated server-side for testing. Valid for 5 minutes.
                </small>
              </div>
            )}

            {/* OTP input boxes */}
            <form onSubmit={verify} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-medium block text-center">
                  6-Digit Verification Code
                </label>
                <OtpBoxInput value={otp} onChange={setOtp} />
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#5c9aff]">
                    <div className="w-3 h-3 border border-[#5c9aff] border-t-transparent rounded-full animate-spin" />
                    Verifying securely...
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5c9aff] to-[#3b78e7] hover:from-[#6aa5ff] hover:to-[#4a88f0] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5c9aff]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>Verify and Continue</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Error / success message */}
            {message && (
              <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${message.startsWith("✓")
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                }`}>
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {/* Resend */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="text-[#5c9aff] disabled:text-slate-600 font-medium inline-flex items-center gap-1 transition-colors hover:text-[#6aa5ff] disabled:cursor-not-allowed"
              >
                <RotateCcw size={11} className={resending ? "animate-spin" : ""} />
                <span>{countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}</span>
              </button>
              <span>Max 5 attempts</span>
            </div>

            <div className="pt-4 border-t border-white/[0.06] text-center text-[10px] text-slate-600 flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Protected session · Rate limited · TLS encrypted</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#04060d]" />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
