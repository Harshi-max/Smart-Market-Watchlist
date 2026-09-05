import { NextResponse } from "next/server";
import { LANGUAGE_CONFIG, supportedLanguages, type SupportedLanguage } from "@/lib/language-config";
import { createMarketDataProvider, type QuoteSnapshot } from "@/lib/market-data";
import { classifyChange, type ClassifiedChange } from "@/lib/meaningful-change-engine";
import { readWatchlists } from "@/lib/watchlist-store";

type Language = SupportedLanguage;
type PilotAnswer = { title: string; body: string };
type AnalysisSnapshot = { watchlist: string[]; quotes: QuoteSnapshot[]; changes: ClassifiedChange[]; lastVisit?: string; dataStatus: string; freshness: string };
const languageNames: Record<Language, string> = Object.fromEntries(supportedLanguages.map((code) => [code, LANGUAGE_CONFIG[code].name])) as Record<Language, string>;

function detectLanguage(question: string, requested?: string): Language {
  if (requested && supportedLanguages.includes(requested as Language)) return requested as Language;

  const text = question.trim();
  const marathiMarkers = /(कोणता|महत्त्वाचा|अलीकडील|सर्वात|आढळले|शेअर|स्टॉक|बाजार|किंमत|सदर)/u;
  const hindiMarkers = /(कौन|क्या|स्टॉक|शेयर|बाजार|महत्त्वपूर्ण|प्रमुख|सबसे|अभी|मूल्य)/u;

  if (marathiMarkers.test(text)) return "mr";
  if (hindiMarkers.test(text)) return "hi";
  if (/^[\u0900-\u097F\s.,!?0-9]+$/u.test(question) && /[\u0900-\u097F]/u.test(question)) return "hi";
  if (/^[\u0980-\u09FF\s.,!?0-9]+$/u.test(question) && /[\u0980-\u09FF]/u.test(question)) return "bn";
  if (/^[\u0B80-\u0BFF\s.,!?0-9]+$/u.test(question) && /[\u0B80-\u0BFF]/u.test(question)) return "ta";
  if (/^[\u0C00-\u0C7F\s.,!?0-9]+$/u.test(question) && /[\u0C00-\u0C7F]/u.test(question)) return "te";
  if (/^[\u0C80-\u0CFF\s.,!?0-9]+$/u.test(question) && /[\u0C80-\u0CFF]/u.test(question)) return "kn";
  if (/^[\u0D00-\u0D7F\s.,!?0-9]+$/u.test(question) && /[\u0D00-\u0D7F]/u.test(question)) return "ml";

  if (/^[\u0C00-\u0C7F]/.test(question)) return "te";
  if (/^[\u0900-\u097f]/.test(question)) return "hi";
  if (/^[\u0b80-\u0bff]/.test(question)) return "ta";
  if (/^[\u0c80-\u0cff]/.test(question)) return "kn";
  if (/^[\u0d00-\u0d7f]/.test(question)) return "ml";
  if (/^[\u0980-\u09ff]/.test(question)) return "bn";
  return "en";
}

function userId(request: Request) {
  const session = request.headers.get("cookie")?.match(/(?:^|;\s*)smartpilot_session=([^;]+)/)?.[1] || "";
  return session.startsWith("user:") ? session.slice(5) : "demo-user";
}

async function buildAnalysis(request: Request): Promise<AnalysisSnapshot> {
  const data = await readWatchlists(userId(request));
  const list = data.watchlists.find((watchlist) => watchlist.id === data.defaultWatchlistId) ?? data.watchlists[0];
  const symbols = list?.items.map((item) => item.symbol) || [];
  const provider = createMarketDataProvider();
  const quotes = (await Promise.all(symbols.map((symbol) => provider.getQuote(symbol)))).filter((quote): quote is QuoteSnapshot => quote !== null);
  const changes = quotes.map((quote) => classifyChange({ ...quote, hasData: true, isStale: quote.status === "STALE", isDelayed: quote.status === "DELAYED", hasConflict: quote.status === "PARTIAL" })).sort((left, right) => right.score - left.score);
  const firstQuote = quotes[0];
  return { watchlist: symbols, quotes, changes, lastVisit: data.lastViewedAt, dataStatus: quotes.length === symbols.length && quotes.length > 0 ? "AVAILABLE" : quotes.length ? "PARTIAL" : "UNAVAILABLE", freshness: firstQuote?.freshness || "Unavailable" };
}

function answerFor(question: string, analysis: AnalysisSnapshot): PilotAnswer {
  const text = question.toLowerCase();
  const target = analysis.quotes.find((quote) => text.includes(quote.symbol.toLowerCase()));
  const top = analysis.changes.find((change) => change.isMeaningful) || analysis.changes[0];
  const topQuote = top ? analysis.quotes.find((quote) => quote.symbol === top.symbol) : undefined;
  if (!analysis.quotes.length) return { title: "Live watchlist analysis is unavailable.", body: "No current provider observation could be confirmed for this watchlist." };
  if (target) return { title: `${target.symbol} signal analysis`, body: `${target.symbol} is ${target.priceChangePct >= 0 ? "up" : "down"} ${Math.abs(target.priceChangePct).toFixed(1)}% at ${target.price.toFixed(2)}. The computed significance score is ${analysis.changes.find((change) => change.symbol === target.symbol)?.score ?? 0}, with ${target.volumeRatio.toFixed(1)}x average volume. Source: ${target.source}; freshness: ${target.freshness}.` };
  if (/compare|peer/.test(text)) return { title: "Peer context from your watchlist", body: analysis.changes.slice(0, 2).map((change) => `${change.symbol} score ${change.score}`).join("; ") + ". Compare these computed signals with the market and sector-relative fields shown in the evidence." };
  if (/what if|fall|scenario/.test(text) && topQuote) return { title: `Scenario starting from ${topQuote.symbol}`, body: `This is simulated from the observed ${topQuote.symbol} price of ${topQuote.price.toFixed(2)}. A scenario is not a prediction or trade recommendation.` };
  if (/market|away|changed|attention|most|why/.test(text) && topQuote && top) return { title: `${top.symbol} deserves attention first`, body: `${top.symbol} has the highest computed score of ${top.score}. It moved ${topQuote.priceChangePct >= 0 ? "+" : "-"}${Math.abs(topQuote.priceChangePct).toFixed(1)}%, with ${topQuote.volumeRatio.toFixed(1)}x average volume. ${top.summary}` };
  return { title: "Watchlist analysis is ready", body: `${analysis.quotes.length} current observations were analyzed and ${analysis.changes.filter((change) => change.isMeaningful).length} meaningful changes were identified. Ask about a symbol, peers, a scenario, or what changed.` };
}

function localizeFallback(answer: ReturnType<typeof answerFor>, language: Language, analysis: AnalysisSnapshot) {
  if (language === "en") return answer;
  const top = analysis.changes.find((change) => change.isMeaningful) || analysis.changes[0];
  const symbol = top?.symbol || "RELIANCE";
  const score = top?.score || 0;
  const count = analysis.quotes.length;
  const copy: Record<Language, PilotAnswer> = {
    en: answer,
    hi: { title: `${symbol} पर पहले ध्यान दें।`, body: `आपकी वॉचलिस्ट के ${count} मौजूदा observations का विश्लेषण किया गया। ${symbol} का computed significance score ${score} है।` },
    te: { title: `${symbol} పై ముందుగా దృష్టి పెట్టండి.`, body: `మీ వాచ్‌లిస్ట్‌లోని ${count} ప్రస్తుత observations ను విశ్లేషించాం. ${symbol} computed significance score ${score} గా ఉంది.` },
    ta: { title: `${symbol} மீது முதலில் கவனம் செலுத்துங்கள்.`, body: `உங்கள் watchlist-இல் ${count} தற்போதைய observations பகுப்பாய்வு செய்யப்பட்டன. ${symbol} computed significance score ${score}.` },
    kn: { title: `${symbol} ಗೆ ಮೊದಲು ಗಮನ ನೀಡಿ.`, body: `ನಿಮ್ಮ watchlist ನ ${count} ಪ್ರಸ್ತುತ observations ಅನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ${symbol} computed significance score ${score}.` },
    ml: { title: `${symbol}-ന് ആദ്യം ശ്രദ്ധ നൽകുക.`, body: `നിങ്ങളുടെ watchlist-ലെ ${count} നിലവിലെ observations വിശകലനം ചെയ്തു. ${symbol} computed significance score ${score}.` },
    bn: { title: `প্রথমে ${symbol}-এর দিকে নজর দিন।`, body: `আপনার watchlist-এর ${count}টি বর্তমান observations বিশ্লেষণ করা হয়েছে। ${symbol}-এর computed significance score ${score}।` },
    mr: { title: `सर्वात आधी ${symbol} कडे लक्ष द्या.`, body: `तुमच्या watchlist मधील ${count} सध्याच्या observations चे विश्लेषण केले. ${symbol} चा computed significance score ${score} आहे.` },
  };
  return copy[language];
}

async function askGroq(question: string, language: Language, analysis: AnalysisSnapshot, signal: AbortSignal) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", temperature: 0.1, max_tokens: 220, messages: [{ role: "system", content: `You are SmartPilot Watch, a multilingual market-intelligence assistant. Respond entirely in ${languageNames[language]}. Preserve company names, symbols, percentages and numbers exactly. Use only the structured JSON observations below. Never invent causes, events, recommendations or missing values. Explain uncertainty when status is not FRESH.\nSTRUCTURED WATCHLIST ANALYSIS:\n${JSON.stringify(analysis)}` }, { role: "user", content: question }] }), signal });
  if (!response.ok) return null;
  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return result.choices?.[0]?.message?.content?.trim() || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const question = typeof body?.message === "string" ? body.message.trim().slice(0, 300) : typeof body?.question === "string" ? body.question.trim().slice(0, 300) : "";
  if (!question) return NextResponse.json({ error: "Question is required" }, { status: 400 });
  const language = detectLanguage(question, typeof body?.language === "string" ? body.language : undefined);
  const analysis = await buildAnalysis(request);
  const fallback = answerFor(question, analysis);
  let aiBody: string | null = null;
  try { aiBody = await askGroq(question, language, analysis, request.signal); } catch { aiBody = null; }
  const localized = localizeFallback(fallback, language, analysis);
  const responseBody = language === "en" ? aiBody || localized.body : localized.body;
  return NextResponse.json({ ...localized, body: responseBody, language, evidence: analysis, source: language === "en" && aiBody ? "groq-grounded-watchlist-tools" : "deterministic-watchlist-tools", aiStatus: aiBody ? "GROQ_CONFIGURED" : "UNAVAILABLE_FALLBACK" });
}
