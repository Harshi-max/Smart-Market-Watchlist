"use client";

import { useState } from "react";
import { BrainCircuit, Sparkles, Sliders, Clock, Users, ArrowRight, Globe } from "lucide-react";

export default function SmartPilotAiDemo() {
  const [activeLang, setActiveLang] = useState<"EN" | "HI" | "TE" | "TA">("EN");
  const [dialogueStep, setDialogueStep] = useState<number>(2); // 1 = first pair, 2 = second pair

  const translations = {
    EN: {
      q1: "What changed while I was away?",
      a1: "4 meaningful changes occurred. Reliance's move is the most unusual relative to the market and its energy sector peers.",
      q2: "Why?",
      a2: "Reliance is down 3.8%, while the broader NIFTY 50 is down 0.7% and its sector is down 1.0%. Volume is also 2.6× its 20-day average.",
    },
    HI: {
      q1: "जब मैं दूर था तब क्या बदलाव हुआ?",
      a1: "4 सार्थक बदलाव हुए। रिलायंस की चाल व्यापक बाजार और ऊर्जा क्षेत्र के मुकाबले सबसे असामान्य है।",
      q2: "क्यों?",
      a2: "रिलायंस 3.8% नीचे है, जबकि निफ्टी 50 केवल 0.7% और सेक्टर 1.0% गिरा है। वॉल्यूम भी इसके 20-दिवसीय औसत का 2.6 गुना है।",
    },
    TE: {
      q1: "నేను లేనప్పుడు మార్కెట్లో ఏం మారింది?",
      a1: "4 ముఖ్యమైన మార్పులు జరిగాయి. మార్కెట్ మరియు రంగంతో పోల్చితే రిలయన్స్ కదలిక అత్యంత అసాధారణమైనది.",
      q2: "ఎందుకు?",
      a2: "రిలయన్స్ 3.8% తగ్గింది, కానీ నిఫ్టీ 50 కేవలం 0.7% మరియు రంగం 1.0% పడిపోయింది. ట్రేడింగ్ వాల్యూమ్ కూడా 2.6 రెట్లు అధికంగా ఉంది.",
    },
    TA: {
      q1: "நான் இல்லாத நேரத்தில் என்ன மாற்றங்கள் நிகழ்ந்தன?",
      a1: "4 குறிப்பிடத்தக்க மாற்றங்கள் ஏற்பட்டுள்ளன. சந்தை மற்றும் துறை தோழர்களுடன் ஒப்பிடும்போது ரிலையன்ஸ் நகர்வு மிகவும் அசாதாரணமானது.",
      q2: "ஏன்?",
      a2: "ரிலையன்ஸ் 3.8% சரிந்துள்ளது, ஆனால் நிஃப்டி 50 வெறும் 0.7% மட்டுமே குறைந்துள்ளது. வர்த்தக அளவு சராசரியை விட 2.6 மடங்கு அதிகம்.",
    },
  }[activeLang];

  return (
    <section id="smartpilot" className="py-24 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5c9aff]/10 border border-[#5c9aff]/20 text-xs font-mono text-[#5c9aff]">
          <BrainCircuit size={13} />
          <span>MARKET INTELLIGENCE AGENT</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ask your market watchlist anything.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Not generic chatbot chit-chat. SmartPilot connects mathematical divergence algorithms directly to conversational synthesis.
        </p>

        {/* Multi-language selection */}
        <div className="inline-flex items-center gap-2 pt-2">
          <Globe size={14} className="text-slate-500" />
          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            {(["EN", "HI", "TE", "TA"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeLang === lang ? "bg-[#5c9aff] text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {lang === "EN" ? "English" : lang === "HI" ? "हिंदी" : lang === "TE" ? "తెలుగు" : "தமிழ்"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Specialized Market Terminal Dialogue Interface */}
      <div className="rounded-3xl bg-[#080d19] border border-white/15 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">SmartPilot Agent</span>
            <span className="text-slate-600">&bull;</span>
            <span>Intraday Watchlist Context Active</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-500">Model: Groq Llama 3.3 70B &bull; 94% Confidence</span>
        </div>

        {/* Chat Stream */}
        <div className="space-y-6">
          {/* User Message 1 */}
          <div className="flex justify-end">
            <div className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm bg-white/10 border border-white/10 text-white text-sm">
              {translations.q1}
            </div>
          </div>

          {/* Agent Response 1 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#5c9aff]/20 border border-[#5c9aff]/40 flex items-center justify-center text-[#5c9aff] flex-shrink-0 mt-0.5">
              <BrainCircuit size={16} />
            </div>
            <div className="max-w-xl space-y-2">
              <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-[#0e1628] border border-white/10 text-slate-200 text-sm leading-relaxed shadow-lg">
                {translations.a1}
              </div>
            </div>
          </div>

          {/* User Message 2 */}
          {dialogueStep >= 2 && (
            <div className="flex justify-end animate-in fade-in duration-300">
              <div className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm bg-white/10 border border-white/10 text-white text-sm">
                {translations.q2}
              </div>
            </div>
          )}

          {/* Agent Response 2 */}
          {dialogueStep >= 2 && (
            <div className="flex items-start gap-3 animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-xl bg-[#5c9aff]/20 border border-[#5c9aff]/40 flex items-center justify-center text-[#5c9aff] flex-shrink-0 mt-0.5">
                <BrainCircuit size={16} />
              </div>
              <div className="max-w-xl space-y-4">
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-[#0e1628] border border-white/10 text-slate-200 text-sm leading-relaxed shadow-lg">
                  {translations.a2}
                </div>

                {/* Context Action Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
                  >
                    <Users size={13} className="text-[#38bdf8]" />
                    <span>[Compare Peers]</span>
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
                  >
                    <Sliders size={13} className="text-emerald-400" />
                    <span>[What If?]</span>
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
                  >
                    <Clock size={13} className="text-amber-400" />
                    <span>[Replay Timeline]</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar Showcase */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Ask anything about your portfolio or market changes...</span>
            <span className="hidden sm:inline-block text-[10px] text-slate-600 font-mono">Press ↵</span>
          </div>
          <a
            href="/login"
            className="px-4 py-3 rounded-xl bg-[#5c9aff] hover:bg-[#4a88ee] text-white font-semibold text-xs inline-flex items-center gap-1 shadow-md transition-colors"
          >
            <span>Try SmartPilot</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
