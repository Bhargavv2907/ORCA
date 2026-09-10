// ============================================================
// JalSaathi — Multi-lingual Vernacular Translation & Voice Engine
// Supporting 9 Coastal Indian Languages with Web Speech API & Server-Proxied TTS Fallback
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

// ==============================================================================
// TRANSLATION ENGINE
// ==============================================================================

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

// ==============================================================================
// TTS ENGINE — Robust multilingual speech with 3-tier fallback
// ==============================================================================

let activeAudioElement: HTMLAudioElement | null = null;
let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Pre-loads Web Speech voices. Must be called early (e.g. on page mount).
 * Voices load asynchronously in most browsers — calling getVoices() once isn't enough.
 */
export function preloadVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    if (cachedVoices.length > 0) {
      voicesLoaded = true;
      console.log(`[JalSaathi TTS] Loaded ${cachedVoices.length} voices`);
    }
  };

  // Load immediately (works in Firefox)
  loadVoices();

  // Chrome/Edge fire this event when voices are ready
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Safety: poll once after 500ms in case event never fires
  setTimeout(loadVoices, 500);
}

/**
 * Stops any active speech or audio playback.
 */
export function stopVernacularAdvisory(): void {
  // Stop Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
  // Stop HTML5 Audio
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.removeAttribute('src');
      activeAudioElement.load(); // release the resource
    } catch (_) {}
    activeAudioElement = null;
  }
}

/**
 * Find a matching voice for the given language from cached voices.
 */
function findVoiceForLanguage(bcp47: string, shortLang: string): SpeechSynthesisVoice | null {
  // Re-fetch voices if not loaded yet
  if (!voicesLoaded && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (cachedVoices.length > 0) voicesLoaded = true;
  }

  // Priority 1: Exact BCP47 match (e.g., "hi-IN")
  const exact = cachedVoices.find(v => v.lang === bcp47);
  if (exact) return exact;

  // Priority 2: Short code prefix match (e.g., "hi" matches "hi-IN")
  const prefixMatch = cachedVoices.find(v => v.lang.startsWith(shortLang + '-') || v.lang === shortLang);
  if (prefixMatch) return prefixMatch;

  // Priority 3: Loose match (lang contains the short code)
  const looseMatch = cachedVoices.find(v => v.lang.toLowerCase().includes(shortLang.toLowerCase()));
  if (looseMatch) return looseMatch;

  return null;
}

/**
 * TIER 1: Attempt native Web Speech API synthesis.
 * Returns true if speech was successfully started, false otherwise.
 */
function tryNativeSpeech(
  text: string,
  bcp47: string,
  shortLang: string,
  rate: number,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

  try {
    // Cancel any pending speech
    window.speechSynthesis.cancel();

    // Resume if browser has paused the audio context
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const voice = findVoiceForLanguage(bcp47, shortLang);

    // Only attempt native speech if we have a matching voice
    // (otherwise it will speak in the wrong language or stay silent)
    if (!voice && shortLang !== 'en') {
      console.log(`[JalSaathi TTS] No native voice found for ${bcp47}, skipping to fallback`);
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = rate;
    if (voice) utterance.voice = voice;

    let ended = false;
    const markEnd = () => {
      if (!ended) {
        ended = true;
        onEnd?.();
      }
    };

    utterance.onend = markEnd;
    utterance.onerror = (e) => {
      console.warn('[JalSaathi TTS] Native speech error:', e.error);
      markEnd();
    };

    window.speechSynthesis.speak(utterance);

    // Chrome bug: speechSynthesis pauses after ~15s. Workaround: keep it alive.
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);

    utterance.onend = () => {
      clearInterval(keepAlive);
      markEnd();
    };

    return true;
  } catch (err) {
    console.warn('[JalSaathi TTS] Native speech threw:', err);
    return false;
  }
}

/**
 * TIER 2: Play TTS audio from our server-side proxy (bypasses CORS).
 * Returns true if audio playback was initiated.
 */
function tryProxiedAudio(
  text: string,
  langCode: string,
  rate: number,
  onEnd?: () => void
): boolean {
  try {
    // Use our Next.js API route proxy that fetches from Google Translate server-side
    const truncated = text.slice(0, 200);
    const ttsUrl = `/api/tts?text=${encodeURIComponent(truncated)}&lang=${langCode}`;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.src = ttsUrl;

    let ended = false;
    const markEnd = () => {
      if (!ended) {
        ended = true;
        activeAudioElement = null;
        onEnd?.();
      }
    };

    audio.onended = markEnd;
    audio.onerror = (err) => {
      console.warn('[JalSaathi TTS] Proxied audio error:', err);
      markEnd();
    };

    // Stop any previous audio
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement = null;
    }

    activeAudioElement = audio;

    // Wait for enough data to play
    audio.oncanplaythrough = () => {
      audio.playbackRate = rate;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((e) => {
          console.warn('[JalSaathi TTS] Proxied audio play blocked:', e);
          markEnd();
        });
      }
    };

    // If canplaythrough doesn't fire fast enough, try playing anyway after loading
    audio.onloadeddata = () => {
      audio.playbackRate = rate;
    };

    audio.load();

    return true;
  } catch (err) {
    console.error('[JalSaathi TTS] Proxied audio creation error:', err);
    return false;
  }
}

/**
 * TIER 3: Ultimate fallback — speak in English using Web Speech API.
 * This should always work since every browser has at least one English voice.
 */
function fallbackEnglishSpeech(text: string, rate: number, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = rate;

    // Find an English voice
    const enVoice = cachedVoices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (_) {
    onEnd?.();
    return false;
  }
}

/**
 * Main entry point: Speaks advisory text aloud with 3-tier fallback:
 * 1. Native Web Speech API (if system has voice for the language)
 * 2. Server-proxied Google Translate TTS audio (bypasses CORS)
 * 3. English Web Speech API (always available)
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

  console.log(`[JalSaathi TTS] Speaking in ${languageName} (${bcp47}/${shortLang}), text: "${translatedText.slice(0, 60)}..."`);

  // TIER 1: Try native Web Speech API
  const nativeSuccess = tryNativeSpeech(translatedText, bcp47, shortLang, rate, onEnd);
  if (nativeSuccess) {
    console.log('[JalSaathi TTS] ✓ Using native Web Speech API');
    return true;
  }

  // TIER 2: Try server-proxied Google Translate TTS
  const proxySuccess = tryProxiedAudio(translatedText, shortLang, rate, () => {
    // If proxy audio fails during playback, try English fallback
    console.log('[JalSaathi TTS] Proxy audio ended');
    onEnd?.();
  });
  if (proxySuccess) {
    console.log('[JalSaathi TTS] ✓ Using server-proxied TTS audio');
    return true;
  }

  // TIER 3: English fallback
  console.log('[JalSaathi TTS] ✓ Using English fallback');
  return fallbackEnglishSpeech(text, rate, onEnd);
}
