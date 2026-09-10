// ============================================================
// ORCA — Multi-lingual Vernacular Translation & Voice Engine (Phase 10)
// Supporting 9 Coastal Indian Languages with Web Speech API
// ============================================================

export interface LanguageVoiceConfig {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
  flag: string;
}

export const COASTAL_LANGUAGES: LanguageVoiceConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', bcp47: 'hi-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN', flag: '🚩' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN', flag: '🌊' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN', flag: '⛵' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN', flag: '⚓' },
  { code: 'kn', name: 'Kannada', nativeName: 'கன்னட / ಕನ್ನಡ', bcp47: 'kn-IN', flag: '🌊' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', flag: '🌴' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN', flag: '🐟' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  'Fishing is safe with standard caution. Return before evening as wind speeds may increase.': {
    Hindi: 'सामान्य सावधानी के साथ मछली पकड़ना सुरक्षित है। शाम से पहले लौट आएं क्योंकि हवा की गति बढ़ सकती है।',
    Marathi: 'सामान्य खबरदारी बाळगून मासेमारी सुरक्षित आहे. वाऱ्याचा वेग वाढू शकत असल्याने संध्याकाळपूर्वी परत या.',
    Gujarati: 'સામાન્ય સાવચેતી સાથે માછીમારી સલામત છે. સાંજે પવનની ઝડપ વધી શકે છે માટે તે પહેલા પાછા ફરો.',
    Tamil: 'சாதாரண எச்சரிக்கையுடன் மீன்பிடித்தல் பாதுகாப்பானது. மாலை வேளையில் காற்றின் வேகம் அதிகரிக்கக்கூடும் என்பதால் அதற்குள் திரும்புங்கள்.',
    Telugu: 'సాధారణ జాగ్రత్తలతో చేపల వేట సురక్షితం. సాయంత్రానికి గాలి వేగం పెరిగే అవకాశం ఉన్నందున అంతకుముందే తిరిగి రండి.',
    Kannada: 'ಸಾಮಾನ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆಯೊಂದಿಗೆ ಮೀನುಗಾರಿಕೆ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಸಂಜೆ ಗಾಳಿಯ ವೇಗ ಹೆಚ್ಚಾಗಬಹುದು ಆದ್ದರಿಂದ ಸಂಜೆಯ ಮೊದಲು ಹಿಂತಿರುಗಿ.',
    Malayalam: 'സാധാരണ ജാഗ്രതയോടെ മീൻപിടുത്തം സുരക്ഷിതമാണ്. വൈകുന്നേരത്തിന് മുമ്പ് മടങ്ങിയെത്തുക, കാറ്റിന്റെ വേഗത വർദ്ധിച്ചേക്കാം.',
    Bengali: 'সাধারণ সতর্কতা সহ মাছ ধরা নিরাপদ। সন্ধ্যার আগে ফিরে আসুন কারণ বাতাসের গতি বাড়তে পারে।',
  },
  'Marine conditions are hazardous. Remaining onshore or returning to harbor is advised.': {
    Hindi: 'समुद्री स्थितियां खतरनाक हैं। किनारे पर रहना या बंदरगाह पर लौटना उचित है।',
    Marathi: 'समुद्रातील परिस्थिती धोकादायक आहे. किनाऱ्यावर राहणे किंवा बंदरात परतणे योग्य आहे.',
    Gujarati: 'દરિયાઈ પરિસ્થિતિ જોખમી છે. કિનારા પર રહેવું અથવા બંદરે પાછા ફરવાની સલાહ આપવામાં આવે છે.',
    Tamil: 'கடல் நிலைமைகள் அபாயகரமானவை. கரையில் இருப்பது அல்லது துறைமுகத்திற்கு திரும்புவது அறிவுறுத்தப்படுகிறது.',
    Telugu: 'సముద్ర పరిస్థితులు ప్రమాదకరంగా ఉన్నాయి. ఒడ్డునే ఉండటం లేదా రేవుకు తిరిగి రావడం శ్రేయస్కరం.',
    Kannada: 'ಸಮುದ್ರದ ಪರಿಸ್ಥಿತಿ ಅಪಾಯಕಾರಿಯಾಗಿದೆ. ದಂಡೆಯಲ್ಲೇ ಇರುವುದು ಅಥವಾ ಬಂದರಿಗೆ ಹಿಂತಿರುಗುವುದು ಸೂಕ್ತ.',
    Malayalam: 'കടൽ സ്ഥിതി അപകടകരമാണ്. തീരത്ത് തുടരാനോ തുറമുഖത്തേക്ക് മടങ്ങാനോ നിർദ്ദേശിക്കുന്നു.',
    Bengali: 'সামুদ্রিক পরিস্থিতি আশঙ্কাজনক। তীরে থাকা বা বন্দরে ফিরে আসার পরামর্শ দেওয়া হচ্ছে।',
  },
};

/**
 * Returns translated text for target language, falling back to original English if missing.
 */
export function translateAdvisory(text: string, targetLanguage: string): string {
  if (targetLanguage === 'English') return text;
  const match = TRANSLATIONS[text]?.[targetLanguage];
  if (match) return match;

  // Fallback pattern translations
  if (text.includes('safe') || text.includes('Safe')) {
    const safeWordMap: Record<string, string> = {
      Hindi: 'समुद्र में जाना सुरक्षित है।',
      Marathi: 'समुद्रात जाणे सुरक्षित आहे.',
      Gujarati: 'દરિયામાં જવું સલામત છે.',
      Tamil: 'கடலுக்கு செல்வது பாதுகாப்பானது.',
      Telugu: 'సముద్రంలోనికి వెళ్లడం సురక్షితం.',
      Kannada: 'ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತ.',
      Malayalam: 'കടലിൽ പോകുന്നത് സുരക്ഷിതമാണ്.',
      Bengali: 'সমুদ্রে যাওয়া নিরাপদ।',
    };
    return safeWordMap[targetLanguage] ? `${safeWordMap[targetLanguage]} ${text}` : text;
  }

  return text;
}

/**
 * Returns the BCP 47 language code for a language name.
 */
export function getLanguageBCP47(languageName: string): string {
  const found = COASTAL_LANGUAGES.find(l => l.name.toLowerCase() === languageName.toLowerCase());
  return found ? found.bcp47 : 'en-IN';
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Returns voices, waiting for the voiceschanged event if the list is empty.
 * The Web Speech API loads voices asynchronously on first page load.
 */
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Voices not yet loaded — wait for the event (fires once on Chrome/Edge)
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // Fallback: resolve after 1 s even if event never fires (Firefox, Safari)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

/**
 * Speaks advisory text aloud using Web Speech API synthesis in target language.
 * Voices are loaded asynchronously before speaking to avoid empty voice list.
 */
export function speakVernacularAdvisory(
  text: string,
  languageName: string,
  rate: number = 1.0,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopVernacularAdvisory();

  const bcp47 = getLanguageBCP47(languageName);
  const translatedText = translateAdvisory(text, languageName);

  const utterance = new SpeechSynthesisUtterance(translatedText);
  utterance.lang = bcp47;
  utterance.rate = rate;

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    // Ignore 'interrupted' errors caused by stopVernacularAdvisory() cancelling
    if ((e as SpeechSynthesisErrorEvent).error !== 'interrupted') {
      activeUtterance = null;
      onEnd?.();
    }
  };

  activeUtterance = utterance;

  // Load voices asynchronously then speak
  getVoicesAsync().then((voices) => {
    // Try exact BCP-47 match first, then language-code prefix match
    const matched =
      voices.find(v => v.lang === bcp47) ||
      voices.find(v => v.lang.startsWith(bcp47.slice(0, 2)));
    if (matched) {
      utterance.voice = matched;
    }
    // Cancel any speech that may have been queued while waiting
    if (activeUtterance === utterance) {
      window.speechSynthesis.speak(utterance);
    }
  });

  return true;
}

/**
 * Stops any active vernacular speech synthesis.
 */
export function stopVernacularAdvisory(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}
