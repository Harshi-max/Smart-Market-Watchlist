"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Languages, Mic, Send, Sparkles, Square, Volume2, X } from "lucide-react";
import { LANGUAGE_CONFIG, supportedLanguages, type SupportedLanguage } from "@/lib/language-config";

type Language = SupportedLanguage;
type PilotAnswer = { title: string; body: string };
type SpeechResult = { results: Array<Array<{ transcript: string }>> };
type SpeechRecognizer = { lang: string; start: () => void; stop: () => void; onresult: (event: SpeechResult) => void; onerror: () => void; onend: () => void };
type SpeechWindow = Window & { SpeechRecognition?: new () => SpeechRecognizer; webkitSpeechRecognition?: new () => SpeechRecognizer };

const languages: Array<[Language, string, string]> = supportedLanguages.map((code) => [code, LANGUAGE_CONFIG[code].name, LANGUAGE_CONFIG[code].short]);
const prompts: Record<Language, string[]> = { en: ["What changed while I was away?", "Which stock matters most?", "Compare TCS with its peers"], hi: ["जब मैं दूर था तब क्या बदला?", "कौन सा स्टॉक महत्वपूर्ण है?", "TCS की तुलना peers से करें"], te: ["నేను లేనప్పుడు ఏమి మారింది?", "ఏ స్టాక్‌కు ఎక్కువ శ్రద్ధ అవసరం?", "TCS ను peers తో పోల్చండి"], ta: ["நான் இல்லாத போது என்ன மாறியது?", "எந்த பங்கு முக்கியமானது?", "TCS-ஐ peers உடன் ஒப்பிடுங்கள்"], kn: ["ನಾನು ದೂರವಿದ್ದಾಗ ಏನು ಬದಲಾಯಿತು?", "ಯಾವ ಸ್ಟಾಕ್ ಮುಖ್ಯ?", "TCS ಅನ್ನು peers ಜೊತೆ ಹೋಲಿಸಿ"], ml: ["ഞാൻ ഇല്ലാതിരുന്നപ്പോൾ എന്ത് മാറി?", "ഏത് സ്റ്റോക്കാണ് പ്രധാനപ്പെട്ടത്?", "TCS-നെ peers-മായി താരതമ്യം ചെയ്യുക"], bn: ["আমি দূরে থাকাকালীন কী পরিবর্তন হয়েছে?", "কোন স্টকটি গুরুত্বপূর্ণ?", "TCS-কে peers-এর সাথে তুলনা করুন"], mr: ["मी दूर असताना काय बदलले?", "कोणता स्टॉक महत्त्वाचा आहे?", "TCS ची peers सोबत तुलना करा"] };
const fallback: PilotAnswer = { title: "Reliance deserves your attention first.", body: "Four meaningful changes were found since your last visit. Reliance has the highest significance score at 91, followed by TCS at 88." };
const localizedVoiceLabels: Record<Language, string> = { en: "Ready to listen", hi: "सुनने के लिए तैयार", te: "శ్రవణానికి సిద్ధంగా", ta: "கேட்க தயாராக", kn: "ಕೇಳಲು ಸಿದ್ಧ", ml: "കാണാൻ തയ്യാറാണ്", bn: "শোনার জন্য প্রস্তুত", mr: "ऐकण्यासाठी तयार" };
const localizedSpeechLabels: Record<Language, string> = { en: "SmartPilot is speaking...", hi: "SmartPilot बोल रहा है...", te: "SmartPilot మాట్లాడుతోంది...", ta: "SmartPilot பேசுகிறது...", kn: "SmartPilot ಮಾತನಾಡುತ್ತಿದೆ...", ml: "SmartPilot മൊഴിഞ്ഞ് കൊണ്ടിരിക്കുന്നു...", bn: "SmartPilot কথা বলছে...", mr: "SmartPilot बोलत आहे..." };

function pickBestVoice(language: Language, voices: SpeechSynthesisVoice[]) {
  if (typeof window === "undefined") return null;
  if (!("speechSynthesis" in window)) return null;
  const locale = LANGUAGE_CONFIG[language].locale;
  const base = locale.split("-")[0].toLowerCase();

  const exact = voices.find((voice) => voice.lang.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;

  const regional = voices.find((voice) => voice.lang.toLowerCase().startsWith(base));
  if (regional) return regional;

  return null;
}

function loadSpeechVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([] as SpeechSynthesisVoice[]);
  const synthesis = window.speechSynthesis;
  const voices = synthesis.getVoices();
  if (voices.length) return Promise.resolve(voices);
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const finish = () => { synthesis.removeEventListener("voiceschanged", finish); resolve(synthesis.getVoices()); };
    synthesis.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 1200);
  });
}

export default function SmartPilotDrawer({ onClose }: { onClose: () => void }) {
  const [language, setLanguage] = useState<Language>("en");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<PilotAnswer>(fallback);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "speaking" | "stopped" | "error">("idle");
  const [languageOpen, setLanguageOpen] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognizer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void fetch("/api/preferences").then((response) => response.json()).then((data: { preferredLanguage?: Language }) => { if (data.preferredLanguage && supportedLanguages.includes(data.preferredLanguage)) setLanguage(data.preferredLanguage); }).catch(() => undefined); const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { controllerRef.current?.abort(); recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); setVoiceState("stopped"); } }; window.addEventListener("keydown", onKey); return () => { window.removeEventListener("keydown", onKey); controllerRef.current?.abort(); recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); }; }, []);
  const selectLanguage = (next: Language) => { setLanguage(next); setLanguageOpen(false); void fetch("/api/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferredLanguage: next }) }); };
  const speak = async (text: string, speechLanguage: Language = language) => { if (!("speechSynthesis" in window)) { setVoiceState("idle"); return; } window.speechSynthesis.cancel(); const voices = await loadSpeechVoices(); const preferredVoice = pickBestVoice(speechLanguage, voices); if (speechLanguage !== "en" && !preferredVoice) { setVoiceState("error"); return; } const utterance = new SpeechSynthesisUtterance(text); utterance.lang = LANGUAGE_CONFIG[speechLanguage].speechSynthesis; if (preferredVoice) utterance.voice = preferredVoice; utterance.onstart = () => setVoiceState("speaking"); utterance.onend = () => setVoiceState("idle"); utterance.onerror = () => setVoiceState("error"); window.speechSynthesis.speak(utterance); };
  const stopAll = () => { controllerRef.current?.abort(); controllerRef.current = null; recognitionRef.current?.stop(); recognitionRef.current = null; window.speechSynthesis?.cancel(); setVoiceState("stopped"); };
  const ask = async (value = question) => { if (!value.trim() || voiceState === "processing") return; controllerRef.current?.abort(); const controller = new AbortController(); controllerRef.current = controller; setQuestion(""); setVoiceState("processing"); try { const response = await fetch("/api/smartpilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: value, question: value, language, conversationId: "smartpilot-session", context: {} }), signal: controller.signal }); if (!response.ok) throw new Error("unavailable"); const result = await response.json() as { title: string; body: string; language?: Language }; const responseLanguage = result.language ?? language; setAnswer({ title: result.title, body: result.body }); if (result.language) setLanguage(result.language); speak(`${result.title}. ${result.body}`, responseLanguage); } catch (error) { if ((error as Error).name !== "AbortError") { setAnswer({ title: "SmartPilot is temporarily unavailable.", body: "Verified watchlist signals remain available. You can retry or continue in text mode." }); setVoiceState("error"); } } finally { if (!controller.signal.aborted) controllerRef.current = null; } };
  const listen = () => { const speechWindow = window as SpeechWindow; const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition; if (!Recognition) { setVoiceState("error"); setQuestion("Speech input is unavailable. Type your question instead."); inputRef.current?.focus(); return; } stopAll(); const recognition = new Recognition(); recognition.lang = LANGUAGE_CONFIG[language].speechRecognition; recognitionRef.current = recognition; recognition.onresult = (event) => { const value = event.results[0][0].transcript; setQuestion(value); void ask(value); }; recognition.onerror = () => setVoiceState("error"); recognition.onend = () => { recognitionRef.current = null; if (voiceState === "listening") setVoiceState("idle"); }; setVoiceState("listening"); recognition.start(); };
  const stateLabel = { idle: localizedVoiceLabels[language], listening: `Listening in ${languages.find(([code]) => code === language)?.[1]}...`, processing: "SmartPilot is thinking...", speaking: localizedSpeechLabels[language], stopped: "Voice stopped", error: "Voice unavailable · type instead" }[voiceState];
  const isBusy = voiceState === "listening" || voiceState === "processing" || voiceState === "speaking";

  return <div className="modal-backdrop" onClick={onClose}><aside className="pilot-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><div className="pilot-title"><span className="pilot-orb"><Sparkles size={15} /></span> SmartPilot</div><span>One market intelligence brain</span></div><div className="drawer-actions"><button className="chat-now-button" onClick={() => inputRef.current?.focus()}><Send size={14} /> Chat</button><button className="icon-button subtle" onClick={onClose} aria-label="Close SmartPilot"><X size={18} /></button></div></div><div className="language-control"><button onClick={() => setLanguageOpen(!languageOpen)}><Languages size={14} /> Language: <strong>{languages.find(([code]) => code === language)?.[1]}</strong><ChevronRight size={13} className={languageOpen ? "rotate-90" : ""} /></button>{languageOpen && <div className="language-menu">{languages.map(([code, name]) => <button key={code} className={language === code ? "selected" : ""} onClick={() => selectLanguage(code)}>{name}<span>{code.toUpperCase()}</span></button>)}</div>}</div><div className="pilot-answer"><span className="eyebrow">SMARTPILOT ANSWER · {languages.find(([code]) => code === language)?.[2]}</span><h2>{voiceState === "processing" ? "Checking your watchlist..." : answer.title}</h2><p>{voiceState === "processing" ? "Reading verified signal evidence." : answer.body}</p><div className="analysis-trace"><strong>Evidence used</strong><span>✓ Price and market-relative movement</span><span>✓ Sector and peer context</span><span>✓ Volume anomaly and last visit</span></div></div><div className="suggested-prompts"><span className="eyebrow">TRY ASKING</span>{prompts[language].map((prompt) => <button key={prompt} onClick={() => void ask(prompt)}>{prompt}<ChevronRight size={15} /></button>)}</div><div className="voice-status"><span className={isBusy ? "voice-pulse active" : "voice-pulse"} />{stateLabel}{isBusy && <button onClick={stopAll} aria-label={voiceState === "processing" ? "Stop SmartPilot response" : "Stop voice"}><Square size={11} fill="currentColor" /> Stop</button>}</div><div className="pilot-input"><input ref={inputRef} aria-label="Chat with SmartPilot" placeholder="Ask in your language..." value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void ask(); }} /><button onClick={() => void ask()} aria-label="Send question" disabled={!question.trim() || voiceState === "processing"}><Send size={15} /></button><button className={voiceState === "listening" ? "listening" : ""} onClick={voiceState === "listening" ? stopAll : listen} aria-label={voiceState === "listening" ? "Stop voice" : "Use voice"}><Mic size={16} /></button></div><div className="voice-actions"><button onClick={() => speak(`${answer.title}. ${answer.body}`)} disabled={voiceState === "speaking"}> <Volume2 size={14} /> {voiceState === "speaking" ? "Speaking..." : "Speak"}</button>{voiceState === "speaking" && <button onClick={stopAll} aria-label="Stop voice"><Square size={11} fill="currentColor" /> Stop</button>}</div><small>{voiceState === "error" ? "Microphone or AI unavailable. You can always type your question." : "Demo market data · answers are context, not investment advice."}</small></aside></div>;
}
