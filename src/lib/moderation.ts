// ============================================================
// ORCA Content Moderation & Profanity Shield
// Filters vulgar, abusive, and offensive words in English and vernacular languages
// ============================================================

const VULGAR_PATTERNS: string[] = [
  // English vulgarities / profanities
  'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
  'pussy', 'whore', 'slut', 'cock', 'motherfucker', 'bullshit', 'dumbass', 'jackass',
  'nigga', 'nigger', 'fag', 'faggot', 'retard', 'blowjob',

  // Hindi / Urdu / Hinglish abuses
  'chutiya', 'chutiye', 'chutya', 'bhenchod', 'behenchod', 'bc', 'mc', 'madarchod',
  'bhosdike', 'bhosadi', 'bhosadike', 'gandu', 'gaand', 'gand', 'lodu', 'laude',
  'lavde', 'harami', 'kamina', 'kaminey', 'saala', 'saale', 'kutte', 'kutta',
  'randi', 'choot', 'jhaatu', 'jhatu', 'lund', 'tatte',

  // Marathi abuses (Latin transliteration)
  'jhavadya', 'zavadya', 'aai ghalya', 'aaighalya', 'bhadva', 'bhadvya', 'lavdya',
  'chutmaricha', 'raand', 'bokachya', 'melya', 'heejra', 'gandit',
];

// Devanagari script profanities (Marathi & Hindi)
const DEVANAGARI_VULGAR_PATTERNS: string[] = [
  'चूतिया', 'चुतिया', 'चुत्या', 'मादरचोद', 'मादरचोत', 'बहनचोद', 'बहेनचोद',
  'गांडू', 'गांड', 'लवडे', 'लवड्या', 'लवडा', 'भडव्या', 'भडवा', 'झावड्या',
  'आईघाल्या', 'आई घाल्या', 'बोक्याच्या', 'रांड', 'हरामी', 'कमीना', 'छिनाल',
  'कुत्ते', 'कुत्ता', 'तट्टे', 'झातू', 'झाटू', 'लोडू'
];

// Compiled regex for word-boundary matching for Latin characters
const LATIN_VULGAR_REGEX = new RegExp(
  `\\b(${VULGAR_PATTERNS.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'i'
);

// Regex for Devanagari profanity matching
const DEVANAGARI_VULGAR_REGEX = new RegExp(
  `(${DEVANAGARI_VULGAR_PATTERNS.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'iu'
);

export interface ModerationResult {
  isVulgar: boolean;
  flaggedWord?: string;
  warningText: string;
}

export function checkVulgarity(text: string, language: string = 'English'): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { isVulgar: false, warningText: '' };
  }

  const normalized = text.toLowerCase().trim();
  const latinMatch = normalized.match(LATIN_VULGAR_REGEX);
  const devanagariMatch = normalized.match(DEVANAGARI_VULGAR_REGEX);
  const match = latinMatch || devanagariMatch;

  if (!match) {
    return { isVulgar: false, warningText: '' };
  }

  const flagged = match[0];

  const warningMap: Record<string, string> = {
    Marathi:
      '⚠️ इशारा: आक्षेपार्ह / अपशब्द भाषा आढळली आहे. ORCA हे मच्छिमार आणि सागरी सुरक्षेसाठी समर्पित अधिकृत व्यासपीठ आहे. कृपया सन्मानपूर्वक संवाद साधा आणि समुद्र, हवामान किंवा नेव्हिगेशन संबंधित प्रश्न विचारा.',
    Hindi:
      '⚠️ चेतावनी: अनुचित या अपमानजनक भाषा का पता चला है। ORCA मछुआरों और समुद्री सुरक्षा के लिए एक समर्पित मंच है। कृपया सम्मानपूर्वक संवाद करें और समुद्र, मौसम या नेविगेशन से संबंधित प्रश्न पूछें।',
    Gujarati:
      '⚠️ ચેતવણી: અયોગ્ય અથવા અપમાનજનક ભાષા મળી આવી છે. ORCA માછીમારો અને દરિયાઈ સુરક્ષા માટેનું પ્લેટફોર્મ છે. કૃપા કરીને આદરપૂર્વક વાતચીત કરો.',
    Tamil:
      '⚠️ எச்சரிக்கை: தகாத வார்த்தைகள் கண்டறியப்பட்டுள்ளன. ORCA என்பது கடல் பாதுகாப்புக்கான ஒரு தளம். தயவுசெய்து மரியாதையுடன் தொடர்பு கொள்ளவும்.',
    Telugu:
      '⚠️ హెచ్చరిక: అనుచితమైన భాష గుర్తించబడింది. ORCA సముద్ర భద్రత కోసం ఒక వేదిక. దయచేసి గౌరవంగా మాట్లాడండి.',
    Kannada:
      '⚠️ ಎಚ್ಚರಿಕೆ: ಅನುಚಿತ ಭಾಷೆ ಪತ್ತೆಯಾಗಿದೆ. ORCA ಸಾಗರ ಸುರಕ್ಷತೆಗಾಗಿ ಇರುವ ವೇದಿಕೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಗೌರವಯುತವಾಗಿ ಸಂವಹನ ನಡೆಸಿ.',
    Malayalam:
      '⚠️ മുന്നറിയിപ്പ്: അനുചിതമായ ഭാഷ കണ്ടെത്തി. ദയവായി സമുദ്ര സുരക്ഷയുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ ചോദിക്കുക.',
    Bengali:
      '⚠️ সতর্কতা: অনুপযুক্ত বা আপত্তিকর ভাষা সনাক্ত হয়েছে। ORCA সামুদ্রিক নিরাপত্তার জন্য একটি প্ল্যাটফর্ম। দয়া করে সম্মানজনকভাবে কথা বলুন।',
    English:
      '⚠️ Warning: Inappropriate or offensive language detected. ORCA is an AI safety platform for fishermen and maritime operators. Please communicate respectfully and ask questions related to the sea, weather, or navigation.',
  };

  const warningText = warningMap[language] || warningMap.English;

  return {
    isVulgar: true,
    flaggedWord: flagged,
    warningText,
  };
}
