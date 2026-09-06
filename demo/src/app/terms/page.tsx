import Link from "next/link";
import { Sparkles, ArrowLeft, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SmartPilot Watch",
  description: "Terms and conditions for using the SmartPilot Watch market intelligence platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-[#cbd5e1] p-6 sm:p-12 font-sans selection:bg-[#5c9aff]/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-semibold text-lg hover:opacity-90">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5c9aff] to-[#38bdf8] flex items-center justify-center text-white">
              <Sparkles size={16} />
            </span>
            <span>SmartPilot <b className="font-bold text-[#5c9aff]">Watch</b></span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#5c9aff]">
            <AlertCircle size={13} /> TERMS & DISCLAIMERS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-400">Effective Date: September 2026</p>
        </div>

        <article className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-300">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">1. Informational & Analytical Purposes Only</h2>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
              <strong>Statutory & Regulatory Notice:</strong> SmartPilot Watch provides market visualization, relative movement calculation, and analytical data tools solely for informational purposes. It does not provide personalized investment advice, financial planning, or broker-dealer trade execution.
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">2. Relative Movement & Significance Indicators</h2>
            <p>
              Calculations such as &quot;Signal Isolation&quot;, &quot;Significance Score&quot;, and &quot;Sector Divergence&quot; are algorithmic estimates based on public mathematical models and market feeds. They do not constitute guarantees of future price performance or causal explanations of market movements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">3. User Responsibilities & Account Security</h2>
            <p>
              Users are responsible for safeguarding their login credentials and OTP one-time codes. SmartPilot Watch will never solicit your one-time passwords via phone or unsolicited emails.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">4. Modifications to the Service</h2>
            <p>
              We may continuously update analytics models, features, and algorithms to improve market signal clarity. We reserve the right to deprecate or alter features with reasonable advance notice.
            </p>
          </section>
        </article>

        <div className="border-t border-white/10 pt-6 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SmartPilot Watch. All rights reserved.
        </div>
      </div>
    </main>
  );
}
