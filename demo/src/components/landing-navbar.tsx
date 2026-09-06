"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

// Live market indices ticker for nav
const NAV_INDICES = [
  { label: "NIFTY 50", value: "24,412", change: "+0.43%", up: true },
  { label: "SENSEX", value: "80,109", change: "+0.36%", up: true },
  { label: "INDIA VIX", value: "12.45", change: "-2.31%", up: false },
];

function LiveNavTicker() {
  const [ticking, setTicking] = useState(false);
  const [vals, setVals] = useState(NAV_INDICES);

  useEffect(() => {
    // Simulate minor price drift every 8s
    const timer = setInterval(() => {
      setTicking(true);
      setVals((prev) =>
        prev.map((item) => {
          const drift = (Math.random() - 0.5) * 0.04;
          const base = parseFloat(item.value.replace(/,/g, ""));
          const newVal = (base + drift).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return { ...item, value: newVal };
        })
      );
      setTimeout(() => setTicking(false), 600);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-5">
      {vals.map((item) => (
        <div key={item.label} className={`flex items-center gap-1.5 text-[10px] font-mono transition-all duration-500 ${ticking ? "opacity-60" : "opacity-100"}`}>
          <span className="text-slate-500">{item.label}</span>
          <span className="text-slate-200 font-semibold">{item.value}</span>
          <span className={item.up ? "text-emerald-400" : "text-rose-400"}>{item.change}</span>
        </div>
      ))}
    </div>
  );
}

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setLiveTime(
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) + " IST"
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-[#04060d]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/40"
            : "py-5 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 text-white group flex-shrink-0">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5c9aff] to-[#3b78e7] flex items-center justify-center text-white shadow-lg shadow-[#5c9aff]/30 group-hover:shadow-[#5c9aff]/50 group-hover:scale-105 transition-all">
              <Sparkles size={16} />
            </span>
            <span className="text-base font-bold tracking-tight">
              SmartPilot <b className="font-extrabold text-[#5c9aff]">Watch</b>
            </span>
          </Link>

          {/* Live indices (desktop only, center) */}
          <LiveNavTicker />

          {/* Right side: Time + links */}
          <div className="hidden md:flex items-center gap-4">
            {liveTime && (
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {liveTime}
              </span>
            )}
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-xs font-bold text-white bg-gradient-to-r from-[#5c9aff] to-[#3b78e7] hover:from-[#6aa5ff] hover:to-[#4a88f0] px-4 py-2 rounded-xl shadow-lg shadow-[#5c9aff]/20 hover:shadow-[#5c9aff]/35 transition-all inline-flex items-center gap-1.5 group"
            >
              <span>Get Started</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#04060d]/95 backdrop-blur-xl md:hidden pt-20 px-6 space-y-6 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-200 border-b border-white/10 pb-6">
            {[
              ["How It Works", "how-it-works"],
              ["Smart Changes", "smart-changes"],
              ["SmartPilot AI", "smartpilot"],
              ["Features", "features"],
              ["Market Map", "market-map"],
            ].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left py-2 hover:text-[#5c9aff] transition-colors">
                {label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-xl border border-white/10 text-center text-sm font-semibold text-white hover:bg-white/5 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5c9aff] to-[#3b78e7] text-center text-sm font-bold text-white shadow-lg shadow-[#5c9aff]/25"
            >
              Start Watching Smarter
            </Link>
          </div>

          {/* Mobile live indices */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {NAV_INDICES.map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <div className="text-[9px] font-mono text-slate-500">{item.label}</div>
                <div className="text-xs font-bold text-white mt-0.5">{item.value}</div>
                <div className={`text-[10px] font-mono mt-0.5 ${item.up ? "text-emerald-400" : "text-rose-400"}`}>{item.change}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
