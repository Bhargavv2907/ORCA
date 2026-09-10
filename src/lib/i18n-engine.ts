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
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN', flag: '🌊' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', flag: '🌴' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN', flag: '🐟' },
];

const FULL_TRANSLATIONS: Record<string, Record<string, string>> = {
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

/** Dictionary for multi-lingual phrase replacement */
const PHRASE_DICTIONARY: Record<string, Record<string, string>> = {
  Telugu: {
    'CLEAR': 'సురక్షిత ప్రాంతం (CLEAR)',
    'Nearest restricted boundary': 'సమీప పరిమిత సరిహద్దు',
    'Position verified clear': 'స్థానం తనిਖీ చేయబడింది (సురక్షితం)',
    'Nearest restricted area': 'సమీప పరిమిత ప్రాంతం',
    'km away': 'కి.మీ దూరంలో',
    'Safe to Sail': 'సముద్ర ప్రయాణానికి సురక్షితం',
    'Best zone today': 'నేటి ఉత్తమ చేపల వేట ప్రాంతం',
    'Safety score': 'సురక్షిత స్కోరు',
    'Waves': 'అలలు',
    'Wind': 'గాలి',
    'Temperature': 'ఉష్ణోగ్రత',
    'MAYDAY MAYDAY MAYDAY': 'అత్యవసర మేడే అత్యవసర మేడే',
    'Emergency distress signal transmitted': 'అత్యవసర మోసకేంద్రీకృత సిగ్నల్ పంపబడింది',
    'Indian Coast Guard alerted': 'భారతీయ తీర రక్షణ దళం అలర్ట్ చేయబడింది',
  },
  Bengali: {
    'CLEAR': 'নিরাপদ (CLEAR)',
    'Nearest restricted boundary': 'নিকটতম সংবেদনশীল এলাকা',
    'Position verified clear': 'অবস্থান নিশ্চিত করা হয়েছে (নিরাপদ)',
    'Nearest restricted area': 'নিকটতম সংবেদনশীল এলাকা',
    'km away': 'কিমি দূরে',
    'Safe to Sail': 'যাত্রা করা নিরাপদ',
    'Best zone today': 'আজকের সেরা মাছ ধরার এলাকা',
    'Safety score': 'সুরক্ষা স্কোর',
    'Waves': 'ঢেউ',
    'Wind': 'বাতাস',
    'Temperature': 'তাপমাত্রা',
    'MAYDAY MAYDAY MAYDAY': 'জরুরী মেডে জরুরী মেডে',
    'Emergency distress signal transmitted': 'জরুরী সংকেত প্রেরিত হয়েছে',
    'Indian Coast Guard alerted': 'ভারতীয় কোস্ট গার্ড সতর্ক করা হয়েছে',
  },
  Gujarati: {
    'CLEAR': 'સુરક્ષિત (CLEAR)',
    'Nearest restricted boundary': 'સૌથી નજીકની પ્રતિબંધિત સીમા',
    'Position verified clear': 'સ્થિતિ ચકાસાયેલ છે (સુરક્ષિત)',
    'Nearest restricted area': 'સૌથી નજીકનો પ્રતિબંધિત વિસ્તાર',
    'km away': 'કિમી દૂર',
    'Safe to Sail': 'દરિયામાં જવું સલામત છે',
    'Best zone today': 'આજનો શ્રેષ્ઠ માછીમારી વિસ્તાર',
    'Safety score': 'સુરક્ષા સ્કોર',
    'Waves': 'મોજાં',
    'Wind': 'પવન',
    'Temperature': 'તાપમાન',
    'MAYDAY MAYDAY MAYDAY': 'ઇમરજન્સી મેડે ઇમરજન્સી મેડે',
    'Emergency distress signal transmitted': 'ઇમરજન્સી સિગ્નલ મોકલવામાં આવ્યું છે',
    'Indian Coast Guard alerted': 'ઇન્ડિયન કોસ્ટ ગાર્ડને ચેતવણી આપવામાં આવી છે',
  },
  Marathi: {
    'right now:': 'याक्षणी:',
    'Ask me about fishing zones, routes, weather alerts, or sea conditions.': 'मासेमारी क्षेत्रे, मार्ग, हवामान इशारे किंवा समुद्राच्या परिस्थितीबद्दल मला विचारा.',
    'CLEAR': 'सुरक्षित (CLEAR)',
    'Nearest restricted boundary': 'जवळची प्रतिबंधित सीमा',
    'Position verified clear': 'स्थान पडताळून पाहिले (सुरक्षित)',
    'Nearest restricted area': 'जवळचा प्रतिबंधित भाग',
    'km away': 'किमी अंतरावर',
    'Safe to Sail': 'समुद्रात जाणे सुरक्षित आहे',
    'Best zone today': 'आजचा सर्वोत्तम मासेमारी भाग',
    'Safety score': 'सुरक्षा गुण',
    'Safety': 'सुरक्षा गुण',
    'Waves': 'लाटा',
    'Wind': 'वारा',
    'Temperature': 'तापमान',
    'MAYDAY MAYDAY MAYDAY': 'आणीबाणी मेडे आणीबाणी मेडे',
    'Emergency distress signal transmitted': 'आणीबाणी सिग्नल पाठवला गेला आहे',
    'Indian Coast Guard alerted': 'भारतीय तटरक्षक दलास अलर्ट केले आहे',
  },
  Tamil: {
    'CLEAR': 'பாதுகாப்பானது (CLEAR)',
    'Nearest restricted boundary': 'அருகிலுள்ள தடைசெய்யப்பட்ட எல்லை',
    'Position verified clear': 'நிலை சரிபார்க்கப்பட்டது (பாதுகாப்பானது)',
    'Nearest restricted area': 'அருகிலுள்ள தடைசெய்யப்பட்ட பகுதி',
    'km away': 'கி.மீ தொலைவில்',
    'Safe to Sail': 'கடலுக்கு செல்வது பாதுகாப்பானது',
    'Best zone today': 'இன்றைய சிறந்த மீன்பிடி பகுதி',
    'Safety score': 'பாதுகாப்பு மதிப்பெண்',
    'Waves': 'அலைகள்',
    'Wind': 'காற்று',
    'Temperature': 'வெப்பநிலை',
    'MAYDAY MAYDAY MAYDAY': 'அவசர மேடே அவசர மேடே',
    'Emergency distress signal transmitted': 'அவசர சமிக்ஞை அனுப்பப்பட்டது',
    'Indian Coast Guard alerted': 'இந்திய கடலோர காவல்படை எச்சரிக்கப்பட்டது',
  },
  Hindi: {
    'CLEAR': 'सुरक्षित (CLEAR)',
    'Nearest restricted boundary': 'निकटतम प्रतिबंधित सीमा',
    'Position verified clear': 'स्थिति सत्यापित (सुरक्षित)',
    'Nearest restricted area': 'निकटतम प्रतिबंधित क्षेत्र',
    'km away': 'किमी दूर',
    'Safe to Sail': 'समुद्र में जाना सुरक्षित है',
    'Best zone today': 'आज का सर्वश्रेष्ठ मछली पकड़ने का क्षेत्र',
    'Safety score': 'सुरक्षा स्कोर',
    'Waves': 'लहरें',
    'Wind': 'हवा',
    'Temperature': 'तापमान',
    'MAYDAY MAYDAY MAYDAY': 'आपातकालीन मईडे आपातकालीन मईडे',
    'Emergency distress signal transmitted': 'आपातकालीन डिस्ट्रेस सिग्नल भेजा गया',
    'Indian Coast Guard alerted': 'भारतीय तटरक्षक बल को सतर्क किया गया',
  },
  Kannada: {
    'CLEAR': 'ಸುರಕ್ಷಿತ (CLEAR)',
    'Nearest restricted boundary': 'ಸಮೀಪದ ನಿರ್ಬಂಧಿತ ಗಡಿ',
    'Position verified clear': 'ಸ್ಥಾನ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (ಸುರಕ್ಷಿತ)',
    'Nearest restricted area': 'ಸಮೀಪದ ನಿರ್ಬಂಧಿತ ಪ್ರದೇಶ',
    'km away': 'ಕಿಮೀ ದೂರದಲ್ಲಿ',
    'Safe to Sail': 'ಸಮುದ್ರ ಪ್ರಯಾಣ ಸುರಕ್ಷಿತ',
    'Best zone today': 'ಇಂದಿನ ಅತ್ಯುತ್ತಮ ಮೀನುಗಾರಿಕಾ ವಲಯ',
    'Safety score': 'ಸುರಕ್ಷತಾ ಸ್ಕೋರ್',
    'Waves': 'ಅಲೆಗಳು',
    'Wind': 'ಗಾಳಿ',
    'MAYDAY MAYDAY MAYDAY': 'ಅತ್ಯತುರ್ತು ಮೇಡೇ ಅತ್ಯತುರ್ತು ಮೇಡೇ',
  },
  Malayalam: {
    'CLEAR': 'സുരക്ഷിതം (CLEAR)',
    'Nearest restricted boundary': 'അടുത്തുള്ള നിരോധിത അതിർത്തി',
    'Position verified clear': 'സ്ഥാനം സ്ഥിരീകരിച്ചു (സുരക്ഷിതം)',
    'Nearest restricted area': 'അടുത്തുള്ള നിരോധിത പ്രദേശം',
    'km away': 'കി.മീ അകലെ',
    'Safe to Sail': 'കടലിൽ പോകുന്നത് സുരക്ഷിതമാണ്',
    'Best zone today': 'ഇന്നത്തെ മികച്ച മീൻപിടുത്ത മേഖല',
    'Safety score': 'സുരക്ഷാ സ്കോർ',
    'Waves': 'തിരമാലകൾ',
    'Wind': 'കാറ്റ്',
    'MAYDAY MAYDAY MAYDAY': 'അടിയന്തിര മേഡേ അടിയന്തിര മേഡേ',
  },
};

/**
 * Returns translated text for target language, dynamically substituting maritime phrases.
 */
export function translateAdvisory(text: string, targetLanguage: string): string {
  if (!text || targetLanguage === 'English') return text;

  // 1. Direct full string lookup
  const exact = FULL_TRANSLATIONS[text]?.[targetLanguage];
  if (exact) return exact;

  // 2. Phrase substitution dictionary
  const dict = PHRASE_DICTIONARY[targetLanguage];
  if (!dict) return text;

  let result = text;
  for (const [englishPhrase, translatedPhrase] of Object.entries(dict)) {
    if (result.includes(englishPhrase)) {
      result = result.replaceAll(englishPhrase, translatedPhrase);
    }
  }

  return result;
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
