"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles, AlertCircle, Eye, EyeOff, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthTransitionOverlay from "@/components/auth-transition-overlay";

// ─── Live Ticker ────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { symbol: "NIFTY 50", value: "24,412", change: "+0.43%", up: true },
  { symbol: "SENSEX", value: "80,109", change: "+0.36%", up: true },
  { symbol: "TCS", value: "₹3,862", change: "+4.2%", up: true },
  { symbol: "RELIANCE", value: "₹1,412", change: "-3.8%", up: false },
  { symbol: "INFY", value: "₹1,488", change: "-1.9%", up: false },
  { symbol: "HDFCBANK", value: "₹1,743", change: "+1.1%", up: true },
  { symbol: "ITC", value: "₹468", change: "+2.1%", up: true },
  { symbol: "BAJFINANCE", value: "₹7,234", change: "-0.8%", up: false },
];

function LiveTicker() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setOffset((prev) => prev - 1), 30);
    return () => clearInterval(timer);
  }, []);

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  const totalWidth = items.length * 180;
  const adjustedOffset = ((offset % totalWidth) + totalWidth) % totalWidth;

  return (
    <div className="overflow-hidden border-y border-white/[0.06] py-2.5 mb-8 relative">
      <div
        className="flex gap-0 whitespace-nowrap will-change-transform"
        style={{ transform: `translateX(-${adjustedOffset}px)`, width: `${totalWidth}px` }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-xs font-mono border-r border-white/[0.06]" style={{ minWidth: 180 }}>
            <span className="text-slate-400">{item.symbol}</span>
            <span className="text-white font-semibold">{item.value}</span>
            <span className={`flex items-center gap-0.5 ${item.up ? "text-emerald-400" : "text-rose-400"}`}>
              {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Signal Feed ─────────────────────────────────────────────────────────────
const SIGNALS = [
  { symbol: "TCS", score: 88, text: "Substantially outperforming sector peers", level: "HIGH", up: true },
  { symbol: "RELIANCE", score: 91, text: "2.6x volume spike with sector decoupling", level: "HIGH", up: false },
  { symbol: "INFY", score: 58, text: "Broadly aligned with technology sector", level: "MOD", up: false },
  { symbol: "HDFCBANK", score: 43, text: "No unusual activity detected", level: "LOW", up: true },
];

function SignalFeed() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive((prev) => (prev + 1) % SIGNALS.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const sig = SIGNALS[active];
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center ${sig.up ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
            {sig.symbol.slice(0, 2)}
          </div>
          <span className="font-mono text-xs text-slate-300">{sig.symbol}</span>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${sig.level === "HIGH" ? "bg-rose-500/15 text-rose-400" :
            sig.level === "MOD" ? "bg-amber-500/15 text-amber-400" :
              "bg-slate-500/15 text-slate-400"
          }`}>{sig.level} · {sig.score}/100</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">{sig.text}</p>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${sig.up ? "bg-emerald-500" : "bg-rose-500"}`}
          style={{ width: `${sig.score}%` }}
        />
      </div>
      <div className="flex items-center gap-3">
        {SIGNALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === active ? "bg-[#5c9aff] w-6" : "bg-white/10 w-2"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Auth Panel Content ───────────────────────────────────────────────────────
function AuthPanelContent({ mode = "login" }: { mode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const method = "password"; // fixed method for demo
  // Demo credentials handler
  const handleDemoLogin = () => {
    setEmail("demo@example.com");
    setPassword("demo123");
    setName("Demo User");
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [authenticatedName, setAuthenticatedName] = useState("Investor");
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMap: Record<string, string> = {
        cancelled: "Sign-in was cancelled.",
        invalid_csrf_state: "Security verification failed. Please try again.",
        oauth_token_exchange_failed: "Could not complete authentication. Please try again.",
      };
      setMessage(errorMap[errorParam] || `Sign in issue: ${errorParam.replace(/_/g, " ")}`);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((result: { authenticated?: boolean }) => {
        if (result.authenticated) router.replace("/dashboard");
      })
      .catch(() => undefined);
  }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    // Password credentials
    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setMessage("Please enter your password.");
      return;
    }
    setLoading(true);
    if (mode === "login") {
      // Mock credentials for demo
      const MOCK_EMAIL = "demo@example.com";
      const MOCK_PASSWORD = "demo123";
      if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
        setAuthenticatedName(name || email.split("@")[0] || "Investor");
        router.replace("/dashboard");
        setLoading(false);
        return;
      } else {
        setMessage("Invalid demo credentials. Use demo@example.com / demo123.");
        setLoading(false);
        return;
      }
    }
    // Fallback to real API for signup or other actions
    const res = await fetch("/api/auth/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: mode, email, password, name }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string; name?: string } | null;
    if (res.ok) {
      setAuthenticatedName(data?.name || name || email.split("@")[0] || "Investor");
      router.replace("/dashboard?auth=success");
    } else {
      setMessage(data?.error || "Authentication service temporarily unavailable. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      {showTransition && (
        <AuthTransitionOverlay
          userName={authenticatedName}
          onComplete={() => router.replace("/dashboard")}
        />
      )}

      <main className="min-h-screen bg-[#04060d] text-[#cbd5e1] flex flex-col lg:flex-row overflow-hidden">
        {/* ── Left Panel ──────────────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-gradient-to-br from-[#080e1f] via-[#060c1a] to-[#030508]">
          {/* Ambient orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5c9aff]/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-20 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

          {/* Brand header */}
          <div className="relative z-10 p-12 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3 text-white group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5c9aff] to-[#3b78e7] flex items-center justify-center shadow-lg shadow-[#5c9aff]/30 group-hover:shadow-[#5c9aff]/50 transition-shadow">
                <Sparkles size={17} />
              </span>
              <span className="text-lg font-bold tracking-tight">
                SmartPilot <b className="text-[#5c9aff]">Watch</b>
              </span>
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MARKET OPEN · {now || "—"} IST</span>
            </div>
          </div>

          {/* Live Ticker */}
          <div className="relative z-10">
            <LiveTicker />
          </div>

          {/* Main visual content */}
          <div className="relative z-10 px-12 flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                <Activity size={11} className="text-emerald-400" />
                <span>REAL-TIME MARKET INTELLIGENCE</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.08] tracking-tight">
                Don't just watch<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5c9aff] via-[#38bdf8] to-emerald-300">
                  the market.
                </span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                Know what meaningfully changed. SmartPilot Watch contextualizes every movement against the market, sector, and your personal goals.
              </p>
            </div>

            {/* Live Signal Feed */}
            <SignalFeed />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Signals Processed", value: "4.2M+", sub: "Today" },
                { label: "Stocks Tracked", value: "2,000+", sub: "NSE + BSE" },
                { label: "Avg Signal Latency", value: "<30s", sub: "Real-time" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-lg font-black text-white font-mono">{value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                  <div className="text-[9px] font-mono text-[#5c9aff] mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 p-12 pt-0 flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={13} className="text-[#5c9aff]" />
            <span>End-to-end encrypted · Private watchlist data · No trade execution</span>
          </div>
        </div>

        {/* ── Right Panel (Auth Form) ──────────────────────────────────── */}
        <div className="flex-1 lg:max-w-[480px] flex items-center justify-center p-6 sm:p-10 bg-[#04060d] lg:border-l lg:border-white/[0.06]">
          <div className="w-full max-w-md space-y-7">

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between pb-5 border-b border-white/[0.06]">
              <Link href="/" className="inline-flex items-center gap-2 text-white">
                <span className="w-7 h-7 rounded-lg bg-[#5c9aff] flex items-center justify-center text-white">
                  <Sparkles size={13} />
                </span>
                <span className="font-bold text-sm">SmartPilot Watch</span>
              </Link>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                MARKET LIVE
              </span>
            </div>

            {/* Page heading */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#5c9aff] uppercase tracking-widest font-semibold">
                {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {/* Method Tabs removed for demo: only password login is supported */}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === "login"
                  ? "Your market intelligence is waiting."
                  : "Join thousands of investors tracking smarter."}
              </p>
            </div>


            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              {/* Full Name — signup + password only */}
              {mode === "signup" && method === "password" && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs text-slate-400 font-medium block">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Harshitha Arava"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-700 focus:outline-none focus:border-[#5c9aff]/60 focus:bg-white/[0.06] text-sm transition-all"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs text-slate-400 font-medium block">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-700 focus:outline-none focus:border-[#5c9aff]/60 focus:bg-white/[0.06] text-sm transition-all"
                />
              </div>

              {/* Password */}
              {method === "password" && (
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs text-slate-400 font-medium block">
                    Password
                  </label>
                  <div className="relative">
      {/* Demo credentials button */}
      <div className="text-center mt-2 mb-2">
        <button type="button" onClick={handleDemoLogin} className="text-[#5c9aff] underline">
          Use demo credentials
        </button>
      </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-700 focus:outline-none focus:border-[#5c9aff]/60 focus:bg-white/[0.06] text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5c9aff] to-[#3b78e7] hover:from-[#6aa5ff] hover:to-[#4a88f0] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5c9aff]/20 transition-all disabled:opacity-50 disabled:cursor-wait group"
              >
                <span>
                  {loading
                    ? method === "password" ? "Signing in..." : "Sending OTP..."
                    : method === "password"
                      ? mode === "login" ? "Sign In" : "Create Account"
                      : "Send 6-Digit OTP"}
                </span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Error */}
            {message && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {/* Toggle mode */}
            <div className="text-center text-xs text-slate-500">
              {mode === "login" ? (
                <span>
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-[#5c9aff] hover:underline font-semibold">
                    Sign up free
                  </Link>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#5c9aff] hover:underline font-semibold">
                    Log in
                  </Link>
                </span>
              )}
            </div>

            {/* Trust footer */}
            <div className="pt-4 border-t border-white/[0.06] text-center text-[10px] text-slate-600 flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Protected session · Encrypted communication · No investment advice</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function AuthPanel({ mode = "login" }: { mode?: "login" | "signup" }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#04060d]" />}>
      <AuthPanelContent mode={mode} />
    </Suspense>
  );
}