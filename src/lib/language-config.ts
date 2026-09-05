export const LANGUAGE_CONFIG = {
  en: { name: "English", locale: "en-IN", speechRecognition: "en-IN", speechSynthesis: "en-IN", short: "EN" },
  hi: { name: "हिन्दी", locale: "hi-IN", speechRecognition: "hi-IN", speechSynthesis: "hi-IN", short: "हिं" },
  te: { name: "తెలుగు", locale: "te-IN", speechRecognition: "te-IN", speechSynthesis: "te-IN", short: "తె" },
  ta: { name: "தமிழ்", locale: "ta-IN", speechRecognition: "ta-IN", speechSynthesis: "ta-IN", short: "த" },
  kn: { name: "ಕನ್ನಡ", locale: "kn-IN", speechRecognition: "kn-IN", speechSynthesis: "kn-IN", short: "ಕ" },
  ml: { name: "മലയാളം", locale: "ml-IN", speechRecognition: "ml-IN", speechSynthesis: "ml-IN", short: "മ" },
  bn: { name: "বাংলা", locale: "bn-IN", speechRecognition: "bn-IN", speechSynthesis: "bn-IN", short: "ব" },
  mr: { name: "मराठी", locale: "mr-IN", speechRecognition: "mr-IN", speechSynthesis: "mr-IN", short: "म" },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_CONFIG;
export const supportedLanguages = Object.keys(LANGUAGE_CONFIG) as SupportedLanguage[];

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return value in LANGUAGE_CONFIG;
}
