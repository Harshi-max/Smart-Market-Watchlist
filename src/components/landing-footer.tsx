import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Lock, Key, Database, EyeOff, ShieldAlert } from "lucide-react";

export default function LandingFooter() {
  const securityPoints = [
    { icon: Lock, title: "Secure authentication", desc: "Cryptographic OTP tokens and bcrypt-hashed password authentication." },
    { icon: Key, title: "Protected sessions", desc: "HttpOnly, SameSite, and SSL-encrypted cookie sessions." },
    { icon: Database, title: "Server-side API keys", desc: "Third-party market keys never exposed to client browsers." },
    { icon: ShieldCheck, title: "Encrypted communication", desc: "Full TLS encryption for all market queries and telemetry." },
    { icon: EyeOff, title: "Private watchlists", desc: "Watchlists and budget alerts stored strictly under user ownership." },
    { icon: ShieldAlert, title: "No automatic trades", desc: "Pure market context and intelligence without execution risk." },
  ];

  return (
    <footer className="relative bg-[#04060b] text-slate-400 border-t border-white/10 overflow-hidden select-none">
      {/* PART 15: Final CTA Section */}
      <div className="py-24 px-4 text-center max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5c9aff] to-[#38bdf8] mx-auto flex items-center justify-center text-white shadow-xl shadow-[#5c9aff]/30">
          <Sparkles size={24} />
        </div>

        <h2 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Stop checking everything.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5c9aff] to-[#38bdf8]">
            Start knowing what matters.
          </span>
        </h2>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SmartPilot Watch turns market noise into focused intelligence—showing what meaningfully changed, why it matters, and what deserves your attention.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#5c9aff] hover:bg-[#4a88ee] text-white font-bold text-sm shadow-xl shadow-[#5c9aff]/30 hover:shadow-[#5c9aff]/45 transition-all inline-flex items-center justify-center gap-2 group"
          >
            <span>Start Watching Smarter</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
          >
            Explore SmartPilot
          </Link>
        </div>
      </div>

      {/* PART 16: Trust & Security Grid */}
      <div className="py-16 px-4 max-w-6xl mx-auto border-t border-white/10 relative z-10">
        <div className="text-center space-y-2 mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Built for clarity. Designed with security in mind.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Enterprise-grade identity protection and zero-compromise watchlist confidentiality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPoints.map((pt) => {
            const Icon = pt.icon;
            return (
              <div key={pt.title} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#5c9aff]/10 border border-[#5c9aff]/20 flex items-center justify-center text-[#5c9aff] flex-shrink-0 mt-0.5">
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{pt.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{pt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PART 17: Multi-column Navigation Footer & Regulatory Disclaimer */}
      <div className="py-12 px-4 max-w-7xl mx-auto border-t border-white/10 relative z-10 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <span className="w-7 h-7 rounded-lg bg-[#5c9aff] flex items-center justify-center text-white">
                <Sparkles size={14} />
              </span>
              <span className="font-bold text-base">
                SmartPilot <b className="text-[#5c9aff]">Watch</b>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              &quot;Don’t just watch the market. Know what changed.&quot;
            </p>
            <p className="text-[11px] text-slate-500">
              The next-generation market intelligence and watchlist intelligence platform.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs font-mono uppercase tracking-wider">Product</div>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/watchlist" className="hover:text-white transition-colors">Watchlist</Link></li>
              <li><Link href="/changes" className="hover:text-white transition-colors">Smart Changes</Link></li>
              <li><Link href="/smartpilot" className="hover:text-white transition-colors">SmartPilot AI</Link></li>
              <li><Link href="/what-if" className="hover:text-white transition-colors">What-If Lab</Link></li>
              <li><Link href="/replay" className="hover:text-white transition-colors">Change Replay</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs font-mono uppercase tracking-wider">Company</div>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs font-mono uppercase tracking-wider">Security</div>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/login" className="hover:text-white transition-colors">Authentication</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Data Handling</Link></li>
              <li><span className="text-slate-500">Local Encryption</span></li>
              <li><span className="text-slate-500">OTP Verified</span></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer Box */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] leading-relaxed">
          <p className="max-w-3xl">
            <strong>Statutory Disclaimer:</strong> SmartPilot Watch provides market information and analytical tools for informational purposes only. It does not provide personalized investment advice or execute trades. Past performance and algorithmic significance estimates are not indicative of future market returns.
          </p>
          <div className="flex-shrink-0">
            &copy; {new Date().getFullYear()} SmartPilot Watch.
          </div>
        </div>
      </div>
    </footer>
  );
}
