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

// Dynamic marine report phrase maps for authentic vernacular translation
const MARATHI_REPLACEMENTS: [string | RegExp, string][] = [
  ['Ask me about fishing zones, routes, weather alerts, or sea conditions.', 'मासेमारी क्षेत्र, सुरक्षित मार्ग, हवामान इशारे किंवा समुद्राच्या स्थितीबद्दल मला विचारा.'],
  ['Return before evening as wind speeds may increase.', 'वाऱ्याचा वेग वाढू शकत असल्याने संध्याकाळपूर्वी परत या.'],
  ['Return before evening.', 'संध्याकाळपूर्वी किनाऱ्यावर परत या.'],
  ['Stay ashore.', 'किनाऱ्यावरच सुरक्षित राहा.'],
  ['Safe to go out.', 'समुद्रात जाणे सुरक्षित आहे.'],
  ['Do NOT go out — hazardous conditions.', 'समुद्रात जाऊ नका — अत्यंत धोकादायक परिस्थिती आहे.'],
  ['Marine conditions are hazardous. Remaining onshore or returning to harbor is advised.', 'समुद्रातील परिस्थिती धोकादायक आहे. किनाऱ्यावर राहणे किंवा बंदरात परतणे योग्य आहे.'],
  ['Fishing is safe with standard caution. Return before evening as wind speeds may increase.', 'सामान्य खबरदारी बाळगून मासेमारी सुरक्षित आहे. वाऱ्याचा वेग वाढू शकत असल्याने संध्याकाळपूर्वी परत या.'],
  ['Stable conditions for daytime fishing.', 'दिवसा मासेमारीसाठी अनुकूल परिस्थिती आहे.'],
  ['Strong winds — small crafts should avoid open sea.', 'वेगवान वारे — लहान नौकांनी खुल्या समुद्रात जाणे टाळावे.'],
  ['Take Route B (38 km, 96% safety).', 'मार्ग ब (३८ किमी, ९६% सुरक्षा) वापरा.'],
  ['Take Route B', 'मार्ग ब वापरा'],
  ['Route B (Coastal Path) recommended', 'मार्ग ब (किनारपट्टी मार्ग) शिफारस केला आहे'],
  ['Route B avoids high swell and shipping lanes.', 'मार्ग ब मुळे उंच लाटा व व्यापारी जहाजांचे मार्ग टाळता येतात.'],
  ['Conditions are marginal — sail with caution.', 'परिस्थिती बेताची आहे — सावधगिरीने प्रवास करा.'],
  ['Good conditions for the trip.', 'प्रवासासाठी उत्तम परिस्थिती आहे.'],
  ['Rough sea — exercise caution.', 'खवळलेला समुद्र — दक्षता बाळगा.'],
  ['Sea state manageable for fishing vessels.', 'मासेमारी नौकांसाठी समुद्राची स्थिती आटोक्यात आहे.'],
  ['High chlorophyll — good fishing nearby.', 'भरपूर क्लोरोफिल — जवळच उत्तम मासेमारी शक्य.'],
  ['Moderate phytoplankton — check PFZ advisory.', 'मध्यम फायटोप्लँक्टन — पीएफझेड सल्ला तपासा.'],
  ['Early departure strongly recommended.', 'सकाळी लवकर निघण्याची जोरदार शिफारस केली जाते.'],
  ['Marginal difference — conditions are similar either way.', 'फारसा फरक नाही — दोन्ही वेळी परिस्थिती सारखीच आहे.'],
  ['Safe to navigate.', 'जलप्रवास सुरक्षित आहे.'],
  ['Nearest restricted boundary:', 'जवळची प्रतिबंधित सीमा:'],

  ['(Safe to Sail)', '(समुद्रात जाणे सुरक्षित आहे)'],
  ['Safe to Sail', 'समुद्रात जाणे सुरक्षित आहे'],
  ['(Moderate Risk)', '(मध्यम धोका)'],
  ['Moderate Risk', 'मध्यम धोका'],
  ['(Dangerous / Unsafe)', '(धोकादायक / असुरक्षित)'],
  ['Dangerous / Unsafe', 'धोकादायक / असुरक्षित'],
  ['Safety score:', 'सुरक्षा गुण:'],
  ['Safety', 'सुरक्षा'],

  ['right now:', 'सद्यस्थिती:'],
  ['right now —', 'सद्यस्थिती —'],
  ['right now', 'सद्यस्थिती'],
  ['Current waves:', 'सध्याच्या लाटा:'],
  ['Current waves', 'सध्याच्या लाटा'],
  ['Ocean data:', 'महासागराची माहिती:'],
  ['Ocean data', 'महासागराची माहिती'],
  ['Best zone today:', 'आजचे सर्वोत्तम मासेमारी क्षेत्र:'],
  ['Best zone today', 'आजचे सर्वोत्तम मासेमारी क्षेत्र'],
  ['offshore, suitability', 'किनाऱ्यापासून दूर, अनुकूलता'],
  ['offshore', 'किनाऱ्यापासून दूर'],
  ['suitability', 'अनुकूलता'],
  ['Sea temp', 'समुद्राचे तापमान'],
  ['chlorophyll-a', 'क्लोरोफिल-ए'],
  ['chlorophyll', 'क्लोरोफिल'],
  ['Waves:', 'लाटा:'],
  ['Waves', 'लाटा'],
  ['Wind:', 'वारा:'],
  ['Wind', 'वारा'],
  ['Temp:', 'हवेचे तापमान:'],
  ['Temp', 'हवेचे तापमान'],
  ['SST:', 'समुद्र पृष्ठभाग तापमान:'],
  ['SST', 'समुद्र पृष्ठभाग तापमान'],
  ['Humidity:', 'आर्द्रता:'],
  ['Humidity', 'आर्द्रता'],
  ['Pressure:', 'हवेचा दाब:'],
  ['Pressure', 'हवेचा दाब'],
  ['Visibility:', 'दृश्यमानता:'],
  ['Visibility', 'दृश्यमानता'],
  ['height', 'उंची'],
  ['Period', 'कालावधी'],
  ['Swell', 'लाटांचा प्रवाह'],
  ['Current', 'प्रवाह'],
  ['knots', 'नॉट्स'],
  ['Leaving at 5 AM vs now:', 'सकाळी ५ वाजता निघणे विरुद्ध आत्ता:'],
  ['calmer than current', 'सध्यापेक्षा शांत'],
  ['Safety improves', 'सुरक्षा सुधारते'],
  ['pts', 'गुण'],
  ['away', 'अंतरावर'],

  ['Mumbai, Maharashtra', 'मुंबई, महाराष्ट्र'],
  ['Mumbai Coast', 'मुंबई किनारपट्टी'],
  ['Goa Coast', 'गोवा किनारपट्टी'],
  ['Kochi Coast', 'कोची किनारपट्टी'],
  ['Chennai Coast', 'चेन्नई किनारपट्टी'],
  ['Visakhapatnam Coast', 'विशाखापट्टणम किनारपट्टी'],
  ['Kolkata / Sundarbans', 'कोलकाता / सुंदरबन'],
  ['Porbandar Coast', 'पोरबंदर किनारपट्टी'],
  ['Mangalore Coast', 'मंगळूर किनारपट्टी'],

  [/\bfrom W\b/gi, 'पश्चिमेकडून'],
  [/\bfrom E\b/gi, 'पूर्वेकडून'],
  [/\bfrom N\b/gi, 'उत्तरेकडून'],
  [/\bfrom S\b/gi, 'दक्षिणेकडून'],
  [/\bfrom NW\b/gi, 'वायव्येकडून'],
  [/\bfrom SW\b/gi, 'नैऋत्येकडून'],
  [/\bfrom NE\b/gi, 'ईशान्येकडून'],
  [/\bfrom SE\b/gi, 'आग्नेयेकडून'],
  [/\bW\b/g, 'पश्चिम'],
  [/\bE\b/g, 'पूर्व'],
  [/\bN\b/g, 'उत्तर'],
  [/\bS\b/g, 'दक्षिण'],
  [/\bNW\b/g, 'वायव्य'],
  [/\bSW\b/g, 'नैऋत्य'],
  [/\bNE\b/g, 'ईशान्य'],
  [/\bSE\b/g, 'आग्नेय'],

  [/\bkm\/h\b/gi, 'किमी/तास'],
  [/°C/g, '°से'],
  [/\bhPa\b/gi, 'हेक्टोपास्कल'],
  [/\b(\d+(?:\.\d+)?)m\b/g, '$1 मीटर'],
  [/\b(\d+(?:\.\d+)?)s\b/g, '$1 सेकंद'],
  [/\bkm\b/gi, 'किमी'],
];

const HINDI_REPLACEMENTS: [string | RegExp, string][] = [
  ['Ask me about fishing zones, routes, weather alerts, or sea conditions.', 'मछली पकड़ने के क्षेत्र, सुरक्षित मार्ग, मौसम चेतावनी या समुद्र की स्थिति के बारे में पूछें।'],
  ['Return before evening as wind speeds may increase.', 'शाम से पहले लौट आएं क्योंकि हवा की गति बढ़ सकती है।'],
  ['Return before evening.', 'शाम से पहले लौट आएं।'],
  ['Stay ashore.', 'किनारे पर ही सुरक्षित रहें।'],
  ['Safe to go out.', 'समुद्र में जाना सुरक्षित है।'],
  ['Do NOT go out — hazardous conditions.', 'समुद्र में न जाएं — अत्यंत खतरनाक स्थिति है।'],
  ['Marine conditions are hazardous. Remaining onshore or returning to harbor is advised.', 'समुद्री स्थितियां खतरनाक हैं। किनारे पर रहना या बंदरगाह पर लौटना उचित है।'],
  ['Fishing is safe with standard caution. Return before evening as wind speeds may increase.', 'सामान्य सावधानी के साथ मछली पकड़ना सुरक्षित है। शाम से पहले लौट आएं क्योंकि हवा की गति बढ़ सकती है।'],
  ['Stable conditions for daytime fishing.', 'दिन में मछली पकड़ने के लिए अनुकूल स्थिति।'],
  ['Strong winds — small crafts should avoid open sea.', 'तेज हवाएं — छोटी नौकाएं खुले समुद्र में जाने से बचें।'],
  ['Take Route B (38 km, 96% safety).', 'मार्ग बी (३८ किमी, ९६% सुरक्षा) लें।'],
  ['Take Route B', 'मार्ग बी लें'],
  ['Route B (Coastal Path) recommended', 'मार्ग बी (तटीय मार्ग) की सिफारिश की जाती है'],
  ['Route B avoids high swell and shipping lanes.', 'मार्ग बी ऊंची लहरों और शिपिंग लेन से बचाता है।'],
  ['Conditions are marginal — sail with caution.', 'स्थिति सीमांत है — सावधानी से आगे बढ़ें।'],
  ['Good conditions for the trip.', 'यात्रा के लिए अच्छी स्थिति है।'],
  ['Rough sea — exercise caution.', 'खराब समुद्र — सावधानी बरतें।'],
  ['Sea state manageable for fishing vessels.', 'मछली पकड़ने वाली नौकाओं के लिए समुद्र की स्थिति सामान्य है।'],
  ['High chlorophyll — good fishing nearby.', 'अधिक क्लोरोफिल — पास में अच्छी मछली पकड़ने की संभावना।'],
  ['Moderate phytoplankton — check PFZ advisory.', 'मध्यम फाइटोप्लांकटन — पीएफजेड सलाह जांचें।'],
  ['Early departure strongly recommended.', 'जल्दी प्रस्थान करने की अत्यधिक अनुशंसा की जाती है।'],
  ['Safe to navigate.', 'यात्रा सुरक्षित है।'],
  ['Nearest restricted boundary:', 'निकटतम प्रतिबंधित सीमा:'],

  ['(Safe to Sail)', '(समुद्र में जाना सुरक्षित है)'],
  ['Safe to Sail', 'समुद्र में जाना सुरक्षित है'],
  ['(Moderate Risk)', '(मध्यम जोखिम)'],
  ['Moderate Risk', 'मध्यम जोखिम'],
  ['(Dangerous / Unsafe)', '(खतरनाक / असुरक्षित)'],
  ['Dangerous / Unsafe', 'खतरनाक / असुरक्षित'],
  ['Safety score:', 'सुरक्षा स्कोर:'],
  ['Safety', 'सुरक्षा'],

  ['right now:', 'सद्य स्थिति:'],
  ['right now —', 'सद्य स्थिति —'],
  ['right now', 'सद्य स्थिति'],
  ['Current waves:', 'वर्तमान लहरें:'],
  ['Current waves', 'वर्तमान लहरें'],
  ['Ocean data:', 'महासागर डेटा:'],
  ['Ocean data', 'महासागर डेटा'],
  ['Best zone today:', 'आज का सर्वोत्तम क्षेत्र:'],
  ['Best zone today', 'आज का सर्वोत्तम क्षेत्र'],
  ['offshore, suitability', 'तट से दूर, उपयुक्तता'],
  ['offshore', 'तट से दूर'],
  ['suitability', 'उपयुक्तता'],
  ['Sea temp', 'समुद्र का तापमान'],
  ['chlorophyll-a', 'क्लोरोफिल-ए'],
  ['chlorophyll', 'क्लोरोफिल'],
  ['Waves:', 'लहरें:'],
  ['Waves', 'लहरें'],
  ['Wind:', 'हवा:'],
  ['Wind', 'हवा'],
  ['Temp:', 'तापमान:'],
  ['Temp', 'तापमान'],
  ['SST:', 'समुद्री सतह तापमान:'],
  ['SST', 'समुद्री सतह तापमान'],
  ['Humidity:', 'आर्द्रता:'],
  ['Humidity', 'आर्द्रता'],
  ['Pressure:', 'हवा का दबाव:'],
  ['Pressure', 'हवा का दबाव'],
  ['Visibility:', 'दृश्यता:'],
  ['Visibility', 'दृश्यता'],

  ['Mumbai, Maharashtra', 'मुंबई, महाराष्ट्र'],
  ['Mumbai Coast', 'मुंबई तटीय क्षेत्र'],
  ['Goa Coast', 'गोवा तटीय क्षेत्र'],
  ['Kochi Coast', 'कोच्चि तटीय क्षेत्र'],
  ['Chennai Coast', 'चेन्नई तटीय क्षेत्र'],

  [/\bfrom W\b/gi, 'पश्चिम से'],
  [/\bfrom E\b/gi, 'पूर्व से'],
  [/\bfrom N\b/gi, 'उत्तर से'],
  [/\bfrom S\b/gi, 'दक्षिण से'],
  [/\bfrom NW\b/gi, 'उत्तर-पश्चिम से'],
  [/\bfrom SW\b/gi, 'दक्षिण-पश्चिम से'],
  [/\bfrom NE\b/gi, 'उत्तर-पूर्व से'],
  [/\bfrom SE\b/gi, 'दक्षिण-पूर्व से'],
  [/\bW\b/g, 'पश्चिम'],
  [/\bE\b/g, 'पूर्व'],
  [/\bN\b/g, 'उत्तर'],
  [/\bS\b/g, 'दक्षिण'],
  [/\bNW\b/g, 'उत्तर-पश्चिम'],
  [/\bSW\b/g, 'दक्षिण-पश्चिम'],
  [/\bNE\b/g, 'उत्तर-पूर्व'],
  [/\bSE\b/g, 'दक्षिण-पूर्व'],

  [/\bkm\/h\b/gi, 'किमी/घंटा'],
  [/°C/g, '°से'],
  [/\bhPa\b/gi, 'हेक्टोपास्कल'],
  [/\b(\d+(?:\.\d+)?)m\b/g, '$1 मीटर'],
  [/\b(\d+(?:\.\d+)?)s\b/g, '$1 सेकंड'],
  [/\bkm\b/gi, 'किमी'],
];

/**
 * Translates dynamic marine telemetry & weather reports into authentic vernacular language.
 */
export function translateDynamicMarineReport(text: string, targetLanguage: string): string {
  if (targetLanguage === 'English' || !text) return text;

  let result = text;
  let replacements: [string | RegExp, string][] = [];

  if (targetLanguage === 'Marathi') {
    replacements = MARATHI_REPLACEMENTS;
  } else if (targetLanguage === 'Hindi') {
    replacements = HINDI_REPLACEMENTS;
  }

  for (const [pattern, replacement] of replacements) {
    if (typeof pattern === 'string') {
      result = result.replaceAll(pattern, replacement);
    } else {
      result = result.replace(pattern, replacement);
    }
  }

  return result;
}

/**
 * Returns translated text for target language, falling back to original English if missing.
 */
export function translateAdvisory(text: string, targetLanguage: string): string {
  if (targetLanguage === 'English' || !text) return text;
  const match = TRANSLATIONS[text]?.[targetLanguage];
  if (match) return match;

  // Dynamic marine telemetry translation
  const dynamic = translateDynamicMarineReport(text, targetLanguage);
  if (dynamic && dynamic !== text) {
    return dynamic;
  }

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
    return safeWordMap[targetLanguage] || text;
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

/**
 * Prepares text for Web Speech API by removing emojis (which screen readers read as English words)
 * and converting symbols/abbreviations into natural spoken vernacular phrases.
 */
export function prepareSpeechText(text: string, languageName: string): string {
  if (!text) return '';

  // 1. Remove all emojis so speech synthesis does not pronounce Unicode names in English
  let clean = text.replace(
    /[\u{1F300}-\u{1FAD6}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu,
    ''
  );

  // 2. Remove markdown symbols
  clean = clean.replace(/[*#"`~]/g, '');

  // 3. Replace middle dot and em dash with comma for natural breathing pause in TTS
  clean = clean.replace(/[·—]/g, ', ');

  // 4. Expand abbreviations and symbols to spoken vernacular words
  if (languageName === 'Marathi') {
    clean = clean.replace(/किमी\/तास/g, ' किलोमीटर प्रति तास ');
    clean = clean.replace(/°से/g, ' अंश सेल्सिअस ');
    clean = clean.replace(/(\d+)\/100/g, '$1 पैकी १००');
    clean = clean.replace(/%/g, ' टक्के ');
    clean = clean.replace(/(\d+(?:\.\d+)?)m\b/g, '$1 मीटर');
    clean = clean.replace(/(\d+(?:\.\d+)?)km\b/g, '$1 किलोमीटर');
  } else if (languageName === 'Hindi') {
    clean = clean.replace(/किमी\/घंटा/g, ' किलोमीटर प्रति घंटा ');
    clean = clean.replace(/°से/g, ' डिग्री सेल्सियस ');
    clean = clean.replace(/(\d+)\/100/g, '$1 में से १००');
    clean = clean.replace(/%/g, ' प्रतिशत ');
    clean = clean.replace(/(\d+(?:\.\d+)?)m\b/g, '$1 मीटर');
    clean = clean.replace(/(\d+(?:\.\d+)?)km\b/g, '$1 किलोमीटर');
  } else {
    clean = clean.replace(/km\/h/gi, ' kilometers per hour ');
    clean = clean.replace(/°C/g, ' degrees Celsius ');
    clean = clean.replace(/(\d+)\/100/g, '$1 out of 100');
  }

  // 5. Clean up redundant spaces and commas
  clean = clean.replace(/,\s*,+/g, ',').replace(/\s+/g, ' ').trim();

  return clean;
}

/**
 * Selects the optimal TTS voice for the target language.
 * If Marathi (mr-IN) is not installed on the user's OS, falls back to Hindi (hi-IN)
 * which shares the Devanagari script and Indian phonetics, preventing fallback to US English.
 */
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  bcp47: string,
  languageName: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetCode = bcp47.toLowerCase();
  const targetPrefix = bcp47.split('-')[0].toLowerCase();

  // 1. Exact match (e.g. mr-IN, hi-IN)
  let voice = voices.find(v => v.lang.toLowerCase() === targetCode);
  if (voice) return voice;

  // 2. Language prefix match (e.g. starts with 'mr')
  voice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
  if (voice) return voice;

  // 3. Name match (e.g. voice name contains "Marathi" or "Swara" or "Madhur")
  voice = voices.find(v => v.name.toLowerCase().includes(languageName.toLowerCase()));
  if (voice) return voice;

  // 4. Marathi Devanagari acoustic fallback to Hindi:
  // Marathi uses the Devanagari script with the same phonetic sound system.
  // Standard Windows/browsers rarely include native mr-IN TTS, but bundle hi-IN
  // (Microsoft Hemant, Microsoft Kalpana, Google हिन्दी).
  // A Hindi voice synthesizes Devanagari phonetically with native Indian pronunciation,
  // preventing fallback to US English (David/Zira).
  if (languageName.toLowerCase() === 'marathi') {
    const hindiVoice = voices.find(
      v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hindiVoice) return hindiVoice;
  }

  // 5. Fallback to any Indian voice (e.g. en-IN, ta-IN, te-IN)
  const indianVoice = voices.find(
    v => v.lang.toLowerCase().includes('in') || v.name.toLowerCase().includes('india')
  );
  if (indianVoice) return indianVoice;

  // 6. Default voice as last resort
  return voices.find(v => v.default) || voices[0] || null;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speaks advisory text aloud using Web Speech API synthesis in target language.
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
  const speechText = prepareSpeechText(translatedText, languageName);

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = findBestVoice(voices, bcp47, languageName);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
    // Set utterance.lang to matched voice language so browser synthesis routes properly
    utterance.lang = matchedVoice.lang;
  } else {
    utterance.lang = bcp47;
  }

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    onEnd?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
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

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Navigation
  'Dashboard': {
    Hindi: 'डैशबोर्ड',
    Marathi: 'डॅशबोर्ड',
    Gujarati: 'ડેશબોર્ડ',
    Tamil: 'முகப்பலகை',
    Telugu: 'డ్యాష్‌బోర్డ్',
    Kannada: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    Malayalam: 'ഡാഷ്‌ബോർഡ്',
    Bengali: 'ড্যাশবোর্ড',
  },
  'AI Assistant': {
    Hindi: 'एआई सहायक',
    Marathi: 'एआय सहाय्यक',
    Gujarati: 'એઆઈ સહાયક',
    Tamil: 'AI உதவியாளர்',
    Telugu: 'AI సహాయకుడు',
    Kannada: 'AI ಸಹಾಯಕ',
    Malayalam: 'AI അസിസ്റ്റന്റ്',
    Bengali: 'এআই সহকারী',
  },
  'Marine Map': {
    Hindi: 'समुद्री नक्शा',
    Marathi: 'सागरी नकाशा',
    Gujarati: 'દરિયાઈ નકશો',
    Tamil: 'கடல் வரைபடம்',
    Telugu: 'సముద్ర పటం',
    Kannada: 'ಸಾಗರ ನಕ್ಷೆ',
    Malayalam: 'സമുദ്ര ഭൂപടം',
    Bengali: 'সামুদ্রিক মানচিত্র',
  },
  'Fishing Zones': {
    Hindi: 'मत्स्य पालन क्षेत्र (PFZ)',
    Marathi: 'मासेमारी क्षेत्र (PFZ)',
    Gujarati: 'માછીમારી ઝોન (PFZ)',
    Tamil: 'மீன்பிடி மண்டலங்கள் (PFZ)',
    Telugu: 'చేపల వేట ప్రాంతాలు (PFZ)',
    Kannada: 'ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು (PFZ)',
    Malayalam: 'മത്സ്യബന്ധന മേഖലകൾ (PFZ)',
    Bengali: 'মৎস্য শিকার অঞ্চল (PFZ)',
  },
  'Safe Routes': {
    Hindi: 'सुरक्षित समुद्री मार्ग',
    Marathi: 'सुरक्षित सागरी मार्ग',
    Gujarati: 'સલામત માર્ગો',
    Tamil: 'பாதுகாப்பான வழிகள்',
    Telugu: 'సురక్షిత మార్గాలు',
    Kannada: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗಗಳು',
    Malayalam: 'സുരക്ഷിത റൂട്ടുകൾ',
    Bengali: 'নিরাপদ রুট',
  },
  'Weather': {
    Hindi: 'मौसम और हवा',
    Marathi: 'हवामान आणि वारे',
    Gujarati: 'હવામાન',
    Tamil: 'வானிலை',
    Telugu: 'వాతావరణం',
    Kannada: 'ಹವಾಮಾನ',
    Malayalam: 'കാലാവസ്ഥ',
    Bengali: 'আবহাওয়া',
  },
  'Ocean Data': {
    Hindi: 'समुद्र डेटा',
    Marathi: 'सागर डेटा',
    Gujarati: 'સાગર ડેટા',
    Tamil: 'கடல் தரவு',
    Telugu: 'సముద్ర డేటా',
    Kannada: 'ಸಾಗರ ಡೇಟಾ',
    Malayalam: 'സമുദ്ര ഡാറ്റ',
    Bengali: 'মহাসাগর তথ্য',
  },
  'Vessels': {
    Hindi: 'जहाज और नावें',
    Marathi: 'बोटी आणि जहाजे',
    Gujarati: 'વહાણો',
    Tamil: 'படகு விவரங்கள்',
    Telugu: 'ఓడలు',
    Kannada: 'ಹಡಗುಗಳು',
    Malayalam: 'ബോട്ടുകൾ',
    Bengali: 'জাহাজ ও নৌকা',
  },
  'Alerts': {
    Hindi: 'चेतावनी और खतरे',
    Marathi: 'सावधानता आणि इशारे',
    Gujarati: 'ચેતવણીઓ',
    Tamil: 'எச்சரிக்கைகள்',
    Telugu: 'హెచ్చరికలు',
    Kannada: 'ಎಚ್ಚರಿಕೆಗಳು',
    Malayalam: 'മുന്നറിയിപ്പുകൾ',
    Bengali: 'সতর্কবার্তা',
  },
  'Settings': {
    Hindi: 'सेटिंग्स',
    Marathi: 'सेटिंग्ज',
    Gujarati: 'સેટિંગ્સ',
    Tamil: 'அமைப்புகள்',
    Telugu: 'సెట్టింగ్‌లు',
    Kannada: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    Malayalam: 'ക്രമീകരണങ്ങൾ',
    Bengali: 'সেটিংস',
  },
  'About': {
    Hindi: 'जानकारी',
    Marathi: 'माहिती',
    Gujarati: 'વિશે',
    Tamil: 'பற்றி',
    Telugu: 'గురించి',
    Kannada: 'ಬಗ್ಗೆ',
    Malayalam: 'വിവരം',
    Bengali: 'সম্পর্কে',
  },
  'Account / Firebase': {
    Hindi: 'खाता / प्रोफ़ाइल',
    Marathi: 'खाते / प्रोफाईल',
    Gujarati: 'ખાતું',
    Tamil: 'கணக்கு',
    Telugu: 'ఖాతా',
    Kannada: 'ಖಾತೆ',
    Malayalam: 'അക്കൗണ്ട്',
    Bengali: 'অ্যাকাউন্ট',
  },
  'Data Sources': {
    Hindi: 'डेटा स्रोत',
    Marathi: 'डेटा स्रोत',
    Gujarati: 'ડેટા સ્ત્રોત',
    Tamil: 'தரவு மூலங்கள்',
    Telugu: 'డేటా వనరులు',
    Kannada: 'ಡೇಟಾ ಮೂಲಗಳು',
    Malayalam: 'ഡാറ്റ ഉറവിടങ്ങൾ',
    Bengali: 'উপাত্ত উৎস',
  },
  'ORCA Intelligence': {
    Hindi: 'ओरका इंटेलिजेंस',
    Marathi: 'ऑर्का इंटेलिजन्स',
    Gujarati: 'ઓર્કા ઇન્ટેલિજન્સ',
    Tamil: 'ஆர்கா நுண்ணறிவு',
    Telugu: 'ఓర్కా ఇంటెలిజెన్స్',
    Kannada: 'ಓರ್ಕಾ ಇಂಟೆಲಿಜೆನ್ಸ್',
    Malayalam: 'ഓർക്ക ഇന്റലിജൻസ്',
    Bengali: 'ওরকা ইন্টেলিজেন্স',
  },
  'Language': {
    Hindi: 'भाषा',
    Marathi: 'भाषा',
    Gujarati: 'ભાષા',
    Tamil: 'மொழி',
    Telugu: 'భాష',
    Kannada: 'ಭಾಷೆ',
    Malayalam: 'ഭാഷ',
    Bengali: 'ভাষা',
  },
  'Units': {
    Hindi: 'इकाइयाँ',
    Marathi: 'एकके',
    Gujarati: 'એકમો',
    Tamil: 'அலகுகள்',
    Telugu: 'ప్రమాణాలు',
    Kannada: 'ಘಟಕಗಳು',
    Malayalam: 'യൂണിറ്റുകൾ',
    Bengali: 'একক',
  },
  'Speed': {
    Hindi: 'गति / हवा की रफ्तार',
    Marathi: 'गती / वाऱ्याचा वेग',
    Gujarati: 'ઝડપ',
    Tamil: 'வேகம்',
    Telugu: 'వేగం',
    Kannada: 'ವೇಗ',
    Malayalam: 'വേഗത',
    Bengali: 'গতিবেগ',
  },
  'Distance': {
    Hindi: 'दूरी',
    Marathi: 'अंतर',
    Gujarati: 'અંતર',
    Tamil: 'தூரம்',
    Telugu: 'దూరం',
    Kannada: 'ದೂರ',
    Malayalam: 'ദൂരം',
    Bengali: 'দূরত্ব',
  },
  'Temperature': {
    Hindi: 'तापमान',
    Marathi: 'तापमान',
    Gujarati: 'તાપમાન',
    Tamil: 'வெப்பநிலை',
    Telugu: 'ఉష్ణోగ్రత',
    Kannada: 'ತಾಪಮಾನ',
    Malayalam: 'താപനില',
    Bengali: 'তাপমাত্রা',
  },
  'Customize your ORCA experience.': {
    Hindi: 'अपने ओर्का अनुभव को अनुकूलित करें।',
    Marathi: 'तुमचा ऑर्का अनुभव सानुकूलित करा.',
    Gujarati: 'તમારા ઓર્કા અનુભવને કસ્ટમાઇઝ કરો.',
    Tamil: 'உங்கள் ஆர்கா அனுபவத்தை விருப்பமைக்கவும்.',
    Telugu: 'మీ ఓర్కా అనుభవాన్ని అనుకూలీకరించండి.',
    Kannada: 'ನಿಮ್ಮ ಓರ್ಕಾ ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.',
    Malayalam: 'നിങ്ങളുടെ ഓർക്ക അനുഭവം ക്രമീകരിക്കുക.',
    Bengali: 'আপনার ওরকা অভিজ্ঞতা কাস্টমাইজ করুন।',
  },
  'Default Map Layers': {
    Hindi: 'डिफ़ॉल्ट मैप लेयर्स',
    Marathi: 'डीफॉल्ट नकाशा थर',
    Gujarati: 'ડિફૉલ્ટ નકશા સ્તરો',
    Tamil: 'இயல்புநிலை வரைபட அடுக்குகள்',
    Telugu: 'డిఫాల్ట్ మ్యాప్ లేయర్లు',
    Kannada: 'ಡೀಫಾಲ್ಟ್ ನಕ್ಷೆ ಪದರಗಳು',
    Malayalam: 'ഡിഫോൾട്ട് മാപ്പ് പാളികൾ',
    Bengali: 'ডিফল্ট মানচিত্র স্তর',
  },
  'Waves': {
    Hindi: 'लहरें',
    Marathi: 'लाटा',
    Gujarati: 'મોજા',
    Tamil: 'அலைகள்',
    Telugu: 'అలలు',
    Kannada: 'ಅಲೆಗಳು',
    Malayalam: 'തിരമാലകൾ',
    Bengali: 'ঢেউ',
  },
  'Currents': {
    Hindi: 'समुद्री धाराएं',
    Marathi: 'सागरी प्रवाह',
    Gujarati: 'પ્રવાહો',
    Tamil: 'நீரோட்டங்கள்',
    Telugu: 'ప్రవాహాలు',
    Kannada: 'ಪ್ರವಾಹಗಳು',
    Malayalam: 'പ്രവാഹങ്ങൾ',
    Bengali: 'স্রোত',
  },
  'Fishing Activity': {
    Hindi: 'मत्स्य पालन गतिविधि',
    Marathi: 'मासेमारी क्रियाकलाप',
    Gujarati: 'માછીમારી પ્રવૃત્તિ',
    Tamil: 'மீன்பிடி செயல்பாடு',
    Telugu: 'చేపల వేట చర్యలు',
    Kannada: 'ಮೀನುಗಾರಿಕೆ ಚಟುವಟಿಕೆ',
    Malayalam: 'മത്സ്യബന്ധന പ്രവർത്തനം',
    Bengali: 'মাছ ধরার কার্যকলাপ',
  },
  'Depth': {
    Hindi: 'गहराई (बाथिमेट्री)',
    Marathi: 'खोली (बाथिमीट्री)',
    Gujarati: 'ઊંડાઈ',
    Tamil: 'ஆழம்',
    Telugu: 'లోతు',
    Kannada: 'ಆಳ',
    Malayalam: 'ആഴം',
    Bengali: 'গভীরতা',
  },
  'Risk Sensitivity': {
    Hindi: 'जोखिम संवेदनशीलता',
    Marathi: 'धोका संवेदनशीलता',
    Gujarati: 'જોખમ સંવેદનશીલતા',
    Tamil: 'இடர் உணர்திறன்',
    Telugu: 'ప్రమాద సున్నితత్వం',
    Kannada: 'ಅಪಾಯ ಸಂವೇದನೆ',
    Malayalam: 'അപകട സാധ്യത സംവേദനക്ഷമത',
    Bengali: 'ঝুঁকি সংবেদনশীলতা',
  },
  'Low': {
    Hindi: 'कम',
    Marathi: 'कमी',
    Gujarati: 'ઓછું',
    Tamil: 'குறைந்த',
    Telugu: 'తక్కువ',
    Kannada: 'ಕಡಿಮೆ',
    Malayalam: 'കുറഞ്ഞത്',
    Bengali: 'কম',
  },
  'Medium': {
    Hindi: 'मध्यम',
    Marathi: 'मध्यम',
    Gujarati: 'મધ્યમ',
    Tamil: 'நடுத்தர',
    Telugu: 'మధ్యస్థం',
    Kannada: 'ಮಧ್ಯಮ',
    Malayalam: 'ഇടത്തരം',
    Bengali: 'মাঝারি',
  },
  'High': {
    Hindi: 'उच्च',
    Marathi: 'उच्च',
    Gujarati: 'ઉચ્ચ',
    Tamil: 'அதிக',
    Telugu: 'ఎక్కువ',
    Kannada: 'ಹೆಚ್ಚು',
    Malayalam: 'ഉയർന്നത്',
    Bengali: 'উচ্চ',
  },
  'Higher sensitivity triggers marine advisories and cyclone alerts at lower thresholds.': {
    Hindi: 'उच्च संवेदनशीलता कम सीमा पर समुद्री सलाह और चक्रवात अलर्ट सक्रिय करती है।',
    Marathi: 'उच्च संवेदनशीलता कमी मर्यादेवर सागरी सूचना आणि चक्रीवादळाचे इशारे सक्रिय करते.',
    Gujarati: 'ઉચ્ચ સંવેદનશીલતા નીચા થ્રેશોલ્ડ પર દરિયાઈ સલાહ અને ચક્રવાત ચેતવણીઓ સક્રિય કરે છે.',
    Tamil: 'அதிக உணர்திறன் குறைந்த வரம்புகளில் கடல் ஆலோசனைகள் மற்றும் சூறாவளி எச்சரிக்கைகளைத் தூண்டுகிறது.',
    Telugu: 'అధిక సున్నితత్వం తక్కువ పరిమితుల్లో సముద్ర సలహాలు మరియు తుఫాను హెచ్చరికలను ప్రేరేపిస్తుంది.',
    Kannada: 'ಹೆಚ್ಚಿನ ಸಂವೇದನೆ ಕಡಿಮೆ ಮಿತಿಯಲ್ಲಿ ಸಾಗರ ಸಲಹೆಗಳು ಮತ್ತು ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪ್ರಚೋದಿಸುತ್ತದೆ.',
    Malayalam: 'ഉയർന്ന സംവേദനക്ഷമത കുറഞ്ഞ പരിധിയിൽ സമുദ്ര ഉപദേശങ്ങളും ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പുകളും നൽകുന്നു.',
    Bengali: 'উচ্চ সংবেদনশীলতা কম থ্রেশহোল্ডে সামুদ্রিক পরামর্শ এবং ঘূর্ণিঝড় সতর্কতা ট্রিগার করে।',
  },
  'Notifications': {
    Hindi: 'सूचनाएं (नोटिफिकेशन)',
    Marathi: 'सूचना (नोटिफिकेशन्स)',
    Gujarati: 'સૂચનાઓ',
    Tamil: 'அறிவிப்புகள்',
    Telugu: 'నోటిఫికేషన్‌లు',
    Kannada: 'ಅಧಿಸೂಚನೆಗಳು',
    Malayalam: 'അറിയിപ്പുകൾ',
    Bengali: 'বিজ্ঞপ্তি',
  },
  'Real-Time Data Pipeline': {
    Hindi: 'रीयल-टाइम डेटा पाइपलाइन',
    Marathi: 'रिअल-टाइम डेटा पाइपलाइन',
    Gujarati: 'રીયલ-ટાઇમ ડેટા પાઇપલાઇન',
    Tamil: 'நிகழ்நேர தரவு பைப்லைன்',
    Telugu: 'రియల్-టైమ్ డేటా పైప్‌లైన్',
    Kannada: 'ನೈಜ-ಸಮಯದ ಡೇಟಾ ಪೈಪ್‌ಲೈನ್',
    Malayalam: 'തത്സമയ ഡാറ്റ പൈപ്പ്‌ലൈൻ',
    Bengali: 'রিয়েল-টাইম ডেটা পাইপলাইন',
  },
  'Location': {
    Hindi: 'स्थान',
    Marathi: 'स्थान',
    Gujarati: 'સ્થાન',
    Tamil: 'இருப்பிடம்',
    Telugu: 'ప్రదేశం',
    Kannada: 'ಸ್ಥಳ',
    Malayalam: 'സ്ഥലം',
    Bengali: 'অবস্থান',
  },
  'Collapse': {
    Hindi: 'छोटा करें',
    Marathi: 'संक्षिप्त करा',
    Gujarati: 'સંકેલો',
    Tamil: 'மடக்கு',
    Telugu: 'కుదించు',
    Kannada: 'ಕುಗ್ಗಿಸಿ',
    Malayalam: 'ചുരുക്കുക',
    Bengali: 'সংকুচিত করুন',
  },
  'SIH Pitch Deck': {
    Hindi: 'SIH पिच डेक',
    Marathi: 'SIH पिच डेक',
    Gujarati: 'SIH પિચ ડેક',
    Tamil: 'SIH பிட்ச் டெக்',
    Telugu: 'SIH పిచ్ డెక్',
    Kannada: 'SIH ಪಿಚ್ ಡೆಕ್',
    Malayalam: 'SIH പിച്ച് ഡെക്ക്',
    Bengali: 'SIH পিচ ডেক',
  },
  'Fisherman': {
    Hindi: 'मछुआरा',
    Marathi: 'मच्छिमार',
    Gujarati: 'માછીમાર',
    Tamil: 'மீனவர்',
    Telugu: 'మత్స్యకారుడు',
    Kannada: 'ಮೀನುಗಾರ',
    Malayalam: 'മത്സ്യത്തൊഴിലാളി',
    Bengali: 'মৎসজীবী',
  },
  'Current Conditions': {
    Hindi: 'वर्तमान स्थितियां',
    Marathi: 'सध्याची परिस्थिती',
    Gujarati: 'વર્તમાન પરિસ્થિતિ',
    Tamil: 'தற்போதைய நிலைமைகள்',
    Telugu: 'ప్రస్తుత పరిస్థితులు',
    Kannada: 'ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಗಳು',
    Malayalam: 'നിലവിലെ അവസ്ഥകൾ',
    Bengali: 'বর্তমান পরিস্থিতি',
  },
  'Ask ORCA Intelligence': {
    Hindi: 'ओर्का इंटेलिजेंस से पूछें',
    Marathi: 'ऑर्का इंटेलिजन्सला विचारा',
    Gujarati: 'ઓર્કા ઇન્ટેલિજન્સને પૂછો',
    Tamil: 'ஆர்கா நுண்ணறிவிடம் கேளுங்கள்',
    Telugu: 'ఓర్కా ఇంటెలిజెన్స్‌ను అడగండి',
    Kannada: 'ಓರ್ಕಾ ಇಂಟೆಲಿಜೆನ್ಸ್ ಅನ್ನು ಕೇಳಿ',
    Malayalam: 'ഓർക്ക ഇന്റലിജൻസിനോട് ചോദിക്കുക',
    Bengali: 'ওরকা ইন্টেলিজেন্সকে জিজ্ঞাসা করুন',
  },
  'Quick Actions': {
    Hindi: 'त्वरित क्रियाएं',
    Marathi: 'त्वरित कृती',
    Gujarati: 'ઝડપી ક્રિયાઓ',
    Tamil: 'விரைவு நடவடிக்கைகள்',
    Telugu: 'త్వరిత చర్యలు',
    Kannada: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    Malayalam: 'ദ്രുത പ്രവർത്തനങ്ങൾ',
    Bengali: 'দ্রুত কর্ম',
  },
  'Active Alerts': {
    Hindi: 'सक्रिय अलर्ट',
    Marathi: 'सक्रिय इशारे',
    Gujarati: 'સક્રિય ચેતવણીઓ',
    Tamil: 'செயலில் உள்ள எச்சரிக்கைகள்',
    Telugu: 'క్రియాశీల హెచ్చరికలు',
    Kannada: 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು',
    Malayalam: 'സജീവ അലേർട്ടുകൾ',
    Bengali: 'সক্রিয় সতর্কতা',
  },
};

/**
 * Returns translated UI label for target language or English fallback.
 */
export function t(key: string, targetLanguage: string = 'English'): string {
  if (targetLanguage === 'English') return key;
  return UI_TRANSLATIONS[key]?.[targetLanguage] || key;
}

