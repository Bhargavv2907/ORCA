// ============================================================
// ORCA — Multi-lingual Vernacular Translation & Voice Engine
// Supporting 9 Coastal Indian Languages with Web Speech API & HTML5 Audio TTS Fallback
// ============================================================

export interface LanguageVoiceConfig {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
  shortLang: string;
  flag: string;
}

export const COASTAL_LANGUAGES: LanguageVoiceConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-IN', shortLang: 'en', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', bcp47: 'hi-IN', shortLang: 'hi', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN', shortLang: 'mr', flag: '🚩' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN', shortLang: 'gu', flag: '🌊' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN', shortLang: 'ta', flag: '⛵' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN', shortLang: 'te', flag: '⚓' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN', shortLang: 'kn', flag: '🌊' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', shortLang: 'ml', flag: '🌴' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN', shortLang: 'bn', flag: '🐟' },
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

/**
 * Returns translated text for target language, dynamically handling dynamic marine advisories.
 */
export function translateAdvisory(text: string, targetLanguage: string): string {
  if (targetLanguage === 'English') return text;
  const match = FULL_TRANSLATIONS[text]?.[targetLanguage];
  if (match) return match;

  // Dynamic sentence translation mapping for marine dashboard & safe route advisories
  let translated = text;

  // Key phrase translations for all 9 languages
  const keyPhrases: Record<string, Record<string, string>> = {
    'Best zone today:': {
      Hindi: 'आज का सर्वोत्तम क्षेत्र:',
      Marathi: 'आजचे सर्वोत्तम क्षेत्र:',
      Gujarati: 'આજનો શ્રેષ્ઠ વિસ્તાર:',
      Tamil: 'இன்றைய சிறந்த பகுதி:',
      Telugu: 'నేటి ఉత్తమ ప్రాంతం:',
      Kannada: 'ಇಂದಿನ ಅತ್ಯುತ್ತಮ ವಲಯ:',
      Malayalam: 'ഇന്നത്തെ മികച്ച പ്രദേശം:',
      Bengali: 'আজকের সেরা অঞ্চল:',
    },
    'Fishing Zone A — Mumbai High Shelf': {
      Hindi: 'फिशिंग ज़ोन ए - मुंबई हाई शेल्फ',
      Marathi: 'फिशिंग झोन ए - मुंबई हाय शेल्फ',
      Gujarati: 'ફિશિંગ ઝોન એ - મુંબઈ હાઈ શેલ્ફ',
      Tamil: 'மீன்பிடி மண்டலம் ஏ - மும்பை உயர் அலமாரி',
      Telugu: 'ఫిషింగ్ జోన్ ఎ - ముంబై హై షెల్ఫ్',
      Kannada: 'ಫಿಶಿಂಗ್ ಝೋನ್ ಎ - ಮುಂಬೈ ಹೈ ಶೆಲ್ಫ್',
      Malayalam: 'ഫിഷിംഗ് സോൺ എ - മുംബൈ ഹൈ ഷെൽഫ്',
      Bengali: 'ফিশিং জোন এ - মুম্বাই হাই শেলফ',
    },
    'suitability': {
      Hindi: 'उपयुक्तता',
      Marathi: 'योग्यतेचे प्रमाण',
      Gujarati: 'અનુકૂળતા',
      Tamil: 'பொருத்தம்',
      Telugu: 'అనుకూలత',
      Kannada: 'ಸೂಕ್ತತೆ',
      Malayalam: 'അനുയോജ്യത',
      Bengali: 'উপযোগিতা',
    },
    'Sea temp': {
      Hindi: 'समुद्र का तापमान',
      Marathi: 'समुद्राचे तापमान',
      Gujarati: 'દરિયાઈ તાપમાન',
      Tamil: 'கடல் வெப்பநிலை',
      Telugu: 'సముద్ర ఉష్ణోగ్రత',
      Kannada: 'ಸಮುದ್ರದ ತಾಪಮಾನ',
      Malayalam: 'കടൽ താപനില',
      Bengali: 'সমুদ্রের তাপমাত্রা',
    },
    'chlorophyll': {
      Hindi: 'क्लोरोफिल',
      Marathi: 'क्लोरोफिल',
      Gujarati: 'ક્લોરોફિલ',
      Tamil: 'குளோரோபில்',
      Telugu: 'క్లోరోఫిల్',
      Kannada: 'ಕ್ಲೋರೊಫಿಲ್',
      Malayalam: 'ക്ലോറോഫിൽ',
      Bengali: 'ক্লোরোফিল',
    },
    'Waves': {
      Hindi: 'लहरें',
      Marathi: 'लाटा',
      Gujarati: 'મોજા',
      Tamil: 'அலைகள்',
      Telugu: 'అలలు',
      Kannada: 'ಅಲೆಗಳು',
      Malayalam: 'തിരമാലകൾ',
      Bengali: 'তরঙ্গ',
    },
    'Wind': {
      Hindi: 'हवा की गति',
      Marathi: 'वाऱ्याचा वेग',
      Gujarati: 'પવનની ગતિ',
      Tamil: 'காற்றின் வேகம்',
      Telugu: 'గాలి వేగం',
      Kannada: 'ಗಾಳಿಯ ವೇಗ',
      Malayalam: 'കാറ്റിന്റെ വേഗത',
      Bengali: 'বাতাসের গতি',
    },
    'Safe to Sail': {
      Hindi: 'नौकायन के लिए सुरक्षित',
      Marathi: 'प्रवासासाठी सुरक्षित',
      Gujarati: 'મુસાફરી માટે સલામત',
      Tamil: 'பயணத்திற்கு பாதுகாப்பானது',
      Telugu: 'ప్రయాణానికి సురక్షితం',
      Kannada: 'ಪ್ರಯಾಣಕ್ಕೆ ಸುರಕ್ಷಿತ',
      Malayalam: 'യാത്രയ്ക്ക് സുരക്ഷിതം',
      Bengali: 'ভ্রমণের জন্য নিরাপদ',
    },
    'Take Route B': {
      Hindi: 'रूट बी लें',
      Marathi: 'मार्ग बी घ्या',
      Gujarati: 'રૂટ બી લો',
      Tamil: 'வழி பி எடுக்கவும்',
      Telugu: 'రూట్ బి తీసుకోండి',
      Kannada: 'ರೂಟ್ ಬಿ ತೆಗೆದುಕೊಳ್ಳಿ',
      Malayalam: 'റൂട്ട് ബി തിരഞ്ഞെടുക്കുക',
      Bengali: 'রুট বি নিন',
    },
    'safety': {
      Hindi: 'सुरक्षा',
      Marathi: 'सुरक्षितता',
      Gujarati: 'સલામતી',
      Tamil: 'பாதுகாப்பு',
      Telugu: 'భద్రత',
      Kannada: 'ಸುರಕ್ಷತೆ',
      Malayalam: 'സുരക്ഷ',
      Bengali: 'নিরাপত্তা',
    },
  };

  // Replace phrases with target language equivalents
  Object.entries(keyPhrases).forEach(([enKey, langMap]) => {
    if (langMap[targetLanguage]) {
      translated = translated.replaceAll(enKey, langMap[targetLanguage]);
    }
  });

  // Prepend safe navigation statement for vernacular clarity if safe
  if (text.includes('Safe') || text.includes('safe') || text.includes('Best zone')) {
    const safePreamble: Record<string, string> = {
      Hindi: 'समुद्र में नौकायन सुरक्षित है।',
      Marathi: 'समुद्रात जाणे सुरक्षित आहे.',
      Gujarati: 'દરિયામાં જવું સલામત છે.',
      Tamil: 'கடலுக்குச் செல்வது பாதுகாப்பானது.',
      Telugu: 'సముద్రంలోనికి వెళ్లడం సురక్షితం.',
      Kannada: 'ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತ.',
      Malayalam: 'കടലിൽ പോകുന്നത് സുരക്ഷിതമാണ്.',
      Bengali: 'সমুদ্রে যাওয়া নিরাপদ।',
    };

    if (safePreamble[targetLanguage] && !translated.startsWith(safePreamble[targetLanguage])) {
      translated = `${safePreamble[targetLanguage]} ${translated}`;
    }
  }

  return translated;
}

export function getLanguageBCP47(languageName: string): string {
  const found = COASTAL_LANGUAGES.find(l => l.name.toLowerCase() === languageName.toLowerCase());
  return found ? found.bcp47 : 'en-IN';
}

export function getLanguageShortCode(languageName: string): string {
  const found = COASTAL_LANGUAGES.find(l => l.name.toLowerCase() === languageName.toLowerCase());
  return found ? found.shortLang : 'en';
}

let activeSpeechUtterance: SpeechSynthesisUtterance | null = null;
let activeAudioFallback: HTMLAudioElement | null = null;

/**
 * Stops any active vernacular speech synthesis or audio fallback.
 */
export function stopVernacularAdvisory(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
  if (activeAudioFallback) {
    try {
      activeAudioFallback.pause();
      activeAudioFallback.currentTime = 0;
    } catch (_) {}
    activeAudioFallback = null;
  }
  activeSpeechUtterance = null;
}

/**
 * Speaks advisory text aloud using Web Speech API synthesis with HTML5 Audio TTS stream fallback.
 */
export function speakVernacularAdvisory(
  text: string,
  languageName: string,
  rate: number = 1.0,
  onEnd?: () => void
): boolean {
  stopVernacularAdvisory();

  const bcp47 = getLanguageBCP47(languageName);
  const shortLang = getLanguageShortCode(languageName);
  const translatedText = translateAdvisory(text, languageName);

  let nativeSpeechSuccess = false;

  // 1. TRY NATIVE BROWSER WEB SPEECH SYNTHESIS API FIRST
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      // Resume synthesis if browser paused audio context
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        v => v.lang === bcp47 || v.lang.startsWith(shortLang) || v.lang.includes(shortLang)
      );

      // If a matching native voice exists for the language, use Web Speech API
      if (matchedVoice || shortLang === 'en' || shortLang === 'hi') {
        const utterance = new SpeechSynthesisUtterance(translatedText);
        utterance.lang = bcp47;
        utterance.rate = rate;

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onend = () => {
          activeSpeechUtterance = null;
          onEnd?.();
        };

        utterance.onerror = (e) => {
          console.warn('[ORCA TTS] WebSpeech error, falling back to Audio Stream:', e);
          activeSpeechUtterance = null;
          playHtml5AudioFallback(translatedText, shortLang, rate, onEnd);
        };

        activeSpeechUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        nativeSpeechSuccess = true;
        return true;
      }
    } catch (err) {
      console.warn('[ORCA TTS] Native speech failed, triggering Audio Stream fallback:', err);
    }
  }

  // 2. HTML5 AUDIO TTS FALLBACK FOR REGIONAL LANGUAGES WITHOUT INSTALLED SYSTEM VOICES
  if (!nativeSpeechSuccess) {
    return playHtml5AudioFallback(translatedText, shortLang, rate, onEnd);
  }

  return true;
}

/**
 * Plays speech audio via Google Translate TTS API Stream fallback when native voices are missing.
 */
function playHtml5AudioFallback(
  text: string,
  langCode: string,
  rate: number,
  onEnd?: () => void
): boolean {
  try {
    const cleanText = encodeURIComponent(text.slice(0, 200));
    // Public Google Translate TTS API audio stream
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${cleanText}&tl=${langCode}&client=tw-ob`;

    const audio = new Audio(ttsUrl);
    audio.playbackRate = rate;

    audio.onended = () => {
      activeAudioFallback = null;
      onEnd?.();
    };

    audio.onerror = (err) => {
      console.warn('[ORCA TTS] Audio fallback playback error, using backup English speech:', err);
      activeAudioFallback = null;
      // Ultimate fallback: Speak text in English voice so audio NEVER fails silently
      fallbackToEnglishSpeech(text, rate, onEnd);
    };

    activeAudioFallback = audio;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        fallbackToEnglishSpeech(text, rate, onEnd);
      });
    }
    return true;
  } catch (err) {
    console.error('[ORCA TTS] Audio creation error:', err);
    return fallbackToEnglishSpeech(text, rate, onEnd);
  }
}

/**
 * Ultimate Fallback: Speaks text in standard English voice if system has zero regional TTS engines.
 */
function fallbackToEnglishSpeech(text: string, rate: number, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = rate;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (_) {
    onEnd?.();
    return false;
  }
}
