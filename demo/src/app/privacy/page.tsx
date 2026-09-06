import Link from "next/link";
import { Sparkles, ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SmartPilot Watch",
  description: "Learn how SmartPilot Watch protects your personal information and market watchlists.",
};

export default function PrivacyPage() {
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
            <Shield size={13} /> SECURITY & PRIVACY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Effective Date: September 2026</p>
        </div>

        <article className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-300">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">1. Principles of Data Clarity & Privacy</h2>
            <p>
              SmartPilot Watch is built to deliver market context, not monetize personal surveillance. We respect your attention and your privacy. We collect only the data necessary to provide intelligent watchlist tracking, meaningful change alerts, and secure session management.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-slate-200">Account Information:</strong> Name, email address, phone number (for OTP verification), and authentication provider identifiers.</li>
              <li><strong className="text-slate-200">Watchlist Preferences:</strong> The symbols, alert sensitivities, and attention budget intervals you configure.</li>
              <li><strong className="text-slate-200">Session & Security Telemetry:</strong> Encrypted session cookies, IP access timestamps, and authentication attempt logs to protect your account against unauthorized access.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">3. Third-Party Authentication & Services</h2>
            <p>
              When you sign in with Google OAuth, we receive your email and basic profile name from Google to verify your identity. We never post on your behalf or request access to your private Google Drive or external files.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">4. No Automatic Trading or Broker Access</h2>
            <p>
              SmartPilot Watch does not link to brokerage transaction accounts, cannot execute buy/sell orders, and does not hold custody of funds. Your trading accounts remain completely isolated and private.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or your personal data rights, please contact our data team at <span className="text-[#5c9aff]">security@smartpilot.watch</span>.
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
