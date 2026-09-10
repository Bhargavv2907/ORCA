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
    'EMERGENCY SOS & LIVE TELEMETRY': 'అత్యవసర SOS & లైవ్ టెలిమెట్రీ',
    'Indian Coast Guard & Maritime Distress Dispatch': 'భారతీయ తీర రక్షణ దళం & సముద్ర అత్యవసర విభాగం',
    'Vessel:': 'పడవ:',
    'Vessel': 'పడవ',
    'Refresh GPS': 'GPS తాజాకరించు',
    'Hardware GPS Active': 'హార్డ్‌వేర్ GPS యాక్టివ్',
    'Live Environmental Danger Metrics': 'లైవ్ పర్యావరణ ప్రమాద కొలతలు',
    'Safety Score': 'సురక్షిత స్కోరు',
    'SAFE': 'సురక్షితం',
    'CAUTION — MARGINAL': 'హెచ్చరిక — సాధారణ ప్రమాదం',
    'CRITICAL HAZARD': 'తీవ్రమైన ప్రమాదం',
    'Wave Swell': 'అలల ఎత్తు',
    'Wind Speed': 'గాలి వేగం',
    'Sea Temp': 'సముద్ర ఉష్ణోగ్రత',
    'Pressure': 'గాలి పీడనం',
    'High Swell': 'పెద్ద అలలు',
    'Moderate': 'సాధారణం',
    'Low Pressure': 'తక్కువ పీడనం',
    'Normal': 'సాధారణం',
    'ISRO Satellite': 'ఇస్రో శాటిలైట్',
    'Active Proactive Hazard Alerts': 'యాక్టివ్ ప్రమాద హెచ్చరికలు',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'మేడే అత్యవసర సిగ్నల్ పంపండి',
    'TRANSMITTING MAYDAY': 'మేడే పంపబడుతోంది',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'కోస్ట్ గార్డ్ MRCC మరియు సమీప పడవలకు లైవ్ GPS తో స్వయంచాలక మేడే సిగ్నల్ పంపుతుంది.',
    'MAYDAY DISTRESS BEACON ACTIVE': 'మేడే అత్యవసర సిగ్నల్ యాక్టివ్‌గా ఉంది',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'కోస్ట్ గార్డ్ MRCC & VHF ఛానెల్ 16 కి పంపబడింది. ప్రాంతీయ భాషలో వాయిస్ హెచ్చరిక.',
    'Replay Voice Distress Broadcast': 'వాయిస్ హెచ్చరికను మళ్లీ వినిపించు',
    'Fisherman Emergency Checklist at Sea': 'సముద్రంలో మత్స్యకారుల అత్యవసర తనిఖీ జాబితా',
    'Put on life jackets immediately.': 'వెంటనే లైఫ్ జాకెట్లు ధరించండి.',
    'Drop sea anchor to steady vessel.': 'పడవను స్థిరంగా ఉంచడానికి సీ యాంకర్ వేయండి.',
    'Set VHF radio to Channel 16.': 'VHF రేడియోను ఛానెల్ 16 కి సెట్ చేయండి.',
    'Turn on strobe beacon light.': 'స్ట్రోబ్ బీకన్ లైట్ ఆన్ చేయండి.',
    'Emergency Helplines': 'అత్యవసర హెల్ప్‌లైన్లు',
    'Indian Coast Guard': 'భారతీయ తీర రక్షణ దళం',
    'Coastal Police': 'తీర ప్రాంత పోలీస్',
    'Toll Free': 'టోల్ ఫ్రీ',
    'Coastal Waters': 'తీర ప్రాంత సముద్రం',
    'Live GPS Position': 'లైవ్ GPS స్థానం',
    'Dashboard': 'డాష్‌బోర్డ్',
    'AI Assistant': 'AI అసిస్టెంట్',
    'Marine Map': 'సముద్ర మ్యాప్',
    'Fishing Zones': 'చేపల వేట ప్రాంతాలు',
    'Safe Routes': 'సురక్షిత మార్గాలు',
    'Weather': 'వాతావరణం',
    'Ocean Data': 'సముద్ర సమాచారం',
    'Vessels': 'పడవలు',
    'Alerts': 'హెచ్చరికలు',
    'ORCA Intelligence': 'ORCA ఇంటెలిజెన్స్',
    'Data Sources': 'డేటా మూలాలు',
    'About': 'గురించి',
    'Settings': 'సెట్టింగ్‌లు',
    'Language': 'భాష',
    'SIH Pitch Deck': 'SIH పిచ్ డెక్',
    'CLEAR': 'సురక్షిత ప్రాంతం (CLEAR)',
    'Nearest restricted boundary': 'సమీప పరిమిత సరిహద్దు',
    'Position verified clear': 'స్థానం తనిఖీ చేయబడింది (సురక్షితం)',
    'Nearest restricted area': 'సమీప పరిమిత ప్రాంతం',
    'km away': 'కి.మీ దూరంలో',
    'Safe to Sail': 'సముద్ర ప్రయాణానికి సురక్షితం',
    'Best zone today': 'నేటి ఉత్తమ చేపల వేట ప్రాంతం',
    'MAYDAY MAYDAY MAYDAY': 'అత్యవసర మేడే అత్యవసర మేడే',
    'Emergency distress signal transmitted': 'అత్యవసర మోసకేంద్రీకృత సిగ్నల్ పంపబడింది',
    'Indian Coast Guard alerted': 'భారతీయ తీర రక్షణ దళం అలర్ట్ చేయబడింది',
  },
  Hindi: {
    'EMERGENCY SOS & LIVE TELEMETRY': 'आपातकालीन एसओएस और लाइव टेलीमेट्री',
    'Indian Coast Guard & Maritime Distress Dispatch': 'भारतीय तटरक्षक बल एवं समुद्री संकट प्रेषण',
    'Vessel:': 'पोत:',
    'Vessel': 'पोत',
    'Refresh GPS': 'जीपीएस रिफ्रेश करें',
    'Hardware GPS Active': 'हार्डवेयर जीपीएस सक्रिय',
    'Live Environmental Danger Metrics': 'लाइव पर्यावरण खतरा आंकड़े',
    'Safety Score': 'सुरक्षा स्कोर',
    'SAFE': 'सुरक्षित',
    'CAUTION — MARGINAL': 'सावधानी — मध्यम जोखिम',
    'CRITICAL HAZARD': 'गंभीर खतरा',
    'Wave Swell': 'समुद्री लहरें',
    'Wind Speed': 'हवा की गति',
    'Sea Temp': 'समुद्र का तापमान',
    'Pressure': 'वायुमंडलीय दबाव',
    'High Swell': 'ऊंची लहरें',
    'Moderate': 'मध्यम',
    'Low Pressure': 'कम दबाव',
    'Normal': 'सामान्य',
    'ISRO Satellite': 'इसरो सैटेलाइट',
    'Active Proactive Hazard Alerts': 'सक्रिय खतरा चेतावनियां',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'मेडे संकट बीकन प्रसारित करें',
    'TRANSMITTING MAYDAY': 'मेडे प्रसारित हो रहा है',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'तटरक्षक एमआरसीसी और नजदीकी एआईएस जहाजों को टेलीमेट्री और लाइव जीपीएस के साथ स्वचालित मेडे संदेश भेजता है।',
    'MAYDAY DISTRESS BEACON ACTIVE': 'मेडे संकट बीकन सक्रिय है',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'तटरक्षक बल एमआरसीसी मुंबई/चेन्नई और वीएचएफ चैनल 16 को भेजा गया। ऑडियो चेतावनी क्षेत्रीय भाषा में उपलब्ध।',
    'Replay Voice Distress Broadcast': 'ध्वनि चेतावनी पुनः चलाएं',
    'Fisherman Emergency Checklist at Sea': 'समुद्र में मछुआरों के लिए आपातकालीन जाँच सूची',
    'Put on life jackets immediately.': 'तुरंत लाइफ जैकेट पहनें।',
    'Drop sea anchor to steady vessel.': 'नाव को स्थिर करने के लिए सी एंकर गिराएं।',
    'Set VHF radio to Channel 16.': 'वीएचएफ रेडियो को चैनल 16 पर सेट करें।',
    'Turn on strobe beacon light.': 'स्ट्रोब बीकन लाइट चालू करें।',
    'Emergency Helplines': 'आपातकालीन हेल्पलाइन',
    'Indian Coast Guard': 'भारतीय तटरक्षक बल',
    'Coastal Police': 'तटीय पुलिस',
    'Toll Free': 'टोल फ्री',
    'Coastal Waters': 'तटीय जल क्षेत्र',
    'Live GPS Position': 'लाइव जीपीएस स्थिति',
    'Dashboard': 'डैशबोर्ड',
    'AI Assistant': 'एआई सहायक',
    'Marine Map': 'समुद्री नक्शा',
    'Fishing Zones': 'मछली पकड़ने के क्षेत्र',
    'Safe Routes': 'सुरक्षित मार्ग',
    'Weather': 'मौसम',
    'Ocean Data': 'समुद्र डेटा',
    'Vessels': 'जहाज / नौकाएं',
    'Alerts': 'चेतावनियां',
    'ORCA Intelligence': 'ओरका इंटेलिजेंस',
    'Data Sources': 'डेटा स्रोत',
    'About': 'हमारे बारे में',
    'Settings': 'सेटिंग्स',
    'Language': 'भाषा',
    'SIH Pitch Deck': 'एसआईएच पिच डेक',
    'CLEAR': 'सुरक्षित (CLEAR)',
    'Nearest restricted boundary': 'निकटतम प्रतिबंधित सीमा',
    'Position verified clear': 'स्थिति सत्यापित (सुरक्षित)',
    'Nearest restricted area': 'निकटतम प्रतिबंधित क्षेत्र',
    'km away': 'किमी दूर',
    'Safe to Sail': 'समुद्र में जाना सुरक्षित है',
    'Best zone today': 'आज का सर्वश्रेष्ठ मछली पकड़ने का क्षेत्र',
    'MAYDAY MAYDAY MAYDAY': 'आपातकालीन मईडे आपातकालीन मईडे',
    'Emergency distress signal transmitted': 'आपातकालीन डिस्ट्रेस सिग्नल भेजा गया',
    'Indian Coast Guard alerted': 'भारतीय तटरक्षक बल को सतर्क किया गया',
  },
  Tamil: {
    'EMERGENCY SOS & LIVE TELEMETRY': 'அவசர SOS & நேரடி தொலைநிலை அளவீடு',
    'Indian Coast Guard & Maritime Distress Dispatch': 'இந்திய கடலோர காவல்படை & கடல்சார் அவசர அனுப்பீடு',
    'Vessel:': 'படகின் பெயர்:',
    'Vessel': 'படகின் பெயர்',
    'Refresh GPS': 'ஜிபிஎஸ் புதுப்பி',
    'Hardware GPS Active': 'ஹார்டுவேர் ஜிபிஎஸ் இயங்குகிறது',
    'Live Environmental Danger Metrics': 'நேரடி சுற்றுச்சூழல் ஆபத்து அளவீடுகள்',
    'Safety Score': 'பாதுகாப்பு மதிப்பெண்',
    'SAFE': 'பாதுகாப்பானது',
    'CAUTION — MARGINAL': 'எச்சரிக்கை — மிதமான ஆபத்து',
    'CRITICAL HAZARD': 'கடுமையான ஆபத்து',
    'Wave Swell': 'அலைகளின் உயரம்',
    'Wind Speed': 'காற்றின் வேகம்',
    'Sea Temp': 'கடல் வெப்பநிலை',
    'Pressure': 'காற்றழுத்தம்',
    'High Swell': 'உயர்ந்த அலைகள்',
    'Moderate': 'மிதமான',
    'Low Pressure': 'குறைந்த அழுத்தம்',
    'Normal': 'இயல்பு',
    'ISRO Satellite': 'இஸ்ரோ செயற்கைக்கோள்',
    'Active Proactive Hazard Alerts': 'செயலில் உள்ள ஆபத்து எச்சரிக்கைகள்',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'மேடே அவசர சிக்னலை அனுப்புக',
    'TRANSMITTING MAYDAY': 'மேடே அனுப்பப்படுகிறது',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'கடலோர காவல்படை MRCC மற்றும் அருகிலுள்ள படகுகளுக்கு நேரடி ஜிபிஎஸ் உடன் தானியங்கி மேடே சிக்னல் அனுப்புகிறது.',
    'MAYDAY DISTRESS BEACON ACTIVE': 'மேடே அவசர சிக்னல் செயலில் உள்ளது',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'கடலோர காவல்படை MRCC மற்றும் VHF சேனல் 16க்கு அனுப்பப்பட்டது. வட்டார மொழியில் குரல் எச்சரிக்கை.',
    'Replay Voice Distress Broadcast': 'குரல் எச்சரிக்கையை மீண்டும் இயக்கு',
    'Fisherman Emergency Checklist at Sea': 'கடலில் மீனவர்களுக்கான அவசர சரிபார்ப்பு பட்டியல்',
    'Put on life jackets immediately.': 'உடனடியாக லைஃப் ஜாக்கெட் அணியுங்கள்.',
    'Drop sea anchor to steady vessel.': 'படகை நிலைநிறுத்த சீ ஆங்கர் போடுங்கள்.',
    'Set VHF radio to Channel 16.': 'VHF ரேடியோவை சேனல் 16க்கு மாற்றவும்.',
    'Turn on strobe beacon light.': 'ஸ்ட்ரோப் பீக்கன் விளக்கை ஒளிரச் செய்யுங்கள்.',
    'Emergency Helplines': 'அவசர உதவி எண்கள்',
    'Indian Coast Guard': 'இந்திய கடலோர காவல்படை',
    'Coastal Police': 'கடலோர காவல் துறை',
    'Toll Free': 'கட்டணமில்லா எண்',
    'Coastal Waters': 'கடலோர நீர் பகுதி',
    'Live GPS Position': 'நேரடி ஜிபிஎஸ் இருப்பிடம்',
    'Dashboard': 'டாஷ்போர்டு',
    'AI Assistant': 'AI உதவி',
    'Marine Map': 'கடல் வரைபடம்',
    'Fishing Zones': 'மீன்பிடி மண்டலங்கள்',
    'Safe Routes': 'பாதுகாப்பான பாதைகள்',
    'Weather': 'வானிலை',
    'Ocean Data': 'கடல் தரவு',
    'Vessels': 'படகுகள்',
    'Alerts': 'எச்சரிக்கைகள்',
    'ORCA Intelligence': 'ஆர்கா நுண்ணறிவு',
    'Data Sources': 'தரவு மூலங்கள்',
    'About': 'பற்றி',
    'Settings': 'அமைப்புகள்',
    'Language': 'மொழி',
    'SIH Pitch Deck': 'SIH பிராஜெட் விளக்கக் காட்சி',
    'CLEAR': 'பாதுகாப்பானது (CLEAR)',
    'Nearest restricted boundary': 'அருகிலுள்ள தடைசெய்யப்பட்ட எல்லை',
    'Position verified clear': 'நிலை சரிபார்க்கப்பட்டது (பாதுகாப்பானது)',
    'Nearest restricted area': 'அருகிலுள்ள தடைசெய்யப்பட்ட பகுதி',
    'km away': 'கி.மீ தொலைவில்',
    'Safe to Sail': 'கடலுக்கு செல்வது பாதுகாப்பானது',
    'Best zone today': 'இன்றைய சிறந்த மீன்பிடி பகுதி',
    'MAYDAY MAYDAY MAYDAY': 'அவசர மேடே அவசர மேடே',
    'Emergency distress signal transmitted': 'அவசர சமிக்ஞை அனுப்பப்பட்டது',
    'Indian Coast Guard alerted': 'இந்திய கடலோர காவல்படை எச்சரிக்கப்பட்டது',
  },
  Marathi: {
    'EMERGENCY SOS & LIVE TELEMETRY': 'आणीबाणी एसओएस आणि थेट टेलिमेट्री',
    'Indian Coast Guard & Maritime Distress Dispatch': 'भारतीय तटरक्षक दल आणि सागरी आणीबाणी सेवा',
    'Vessel:': 'जहाज:',
    'Vessel': 'जहाज',
    'Refresh GPS': 'जीपीएस रिफ्रेश करा',
    'Hardware GPS Active': 'हार्डवेअर जीपीएस सक्रिय',
    'Live Environmental Danger Metrics': 'थेट पर्यावरणीय धोका मापदंड',
    'Safety Score': 'सुरक्षा गुण',
    'SAFE': 'सुरक्षित',
    'CAUTION — MARGINAL': 'खबरदारी — मध्यम धोका',
    'CRITICAL HAZARD': 'गंभीर धोका',
    'Wave Swell': 'लाटांचा फुगवटा',
    'Wind Speed': 'वाऱ्याचा वेग',
    'Sea Temp': 'समुद्राचे तापमान',
    'Pressure': 'हवेचा दाब',
    'High Swell': 'मोठ्या लाटा',
    'Moderate': 'मध्यम',
    'Low Pressure': 'कमी दाब',
    'Normal': 'सामान्य',
    'ISRO Satellite': 'इस्रो उपग्रह',
    'Active Proactive Hazard Alerts': 'सक्रिय धोका इशारे',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'मेडे आणीबाणी सिग्नल पाठवा',
    'TRANSMITTING MAYDAY': 'मेडे पाठवले जात आहे',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'तटरक्षक एमआरसीसी आणि जवळच्या जहाजांना थेट जीपीएससह स्वयंचलित मेडे सिग्नल पाठवतो.',
    'MAYDAY DISTRESS BEACON ACTIVE': 'मेडे आणीबाणी सिग्नल सक्रिय आहे',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'कोस्ट गार्ड एमआरसीसी आणि व्हीएचएफ चॅनेल 16 वर पाठवले. प्रादेशिक भाषेत ध्वनी इशारा सुरु.',
    'Replay Voice Distress Broadcast': 'व्हॉइस अलर्ट पुन्हा ऐका',
    'Fisherman Emergency Checklist at Sea': 'समुद्रातील मच्छिमारांसाठी आणीबाणी तपाससूची',
    'Put on life jackets immediately.': 'तरंतू लाईफ जॅकेट घाला.',
    'Drop sea anchor to steady vessel.': 'नाव स्थिर करण्यासाठी सी अँकर टाका.',
    'Set VHF radio to Channel 16.': 'व्हीएचएफ रेडिओ चॅनेल 16 वर सेट करा.',
    'Turn on strobe beacon light.': 'स्ट्रोब बीकन लाईट चालू करा.',
    'Emergency Helplines': 'आणीबाणी हेल्पलाइन',
    'Indian Coast Guard': 'भारतीय तटरक्षक दल',
    'Coastal Police': 'कोस्टल पोलीस',
    'Toll Free': 'टोल फ्री',
    'Coastal Waters': 'किनारपट्टीचे पाणी',
    'Live GPS Position': 'थेट जीपीएस स्थान',
    'Dashboard': 'डॅशबोर्ड',
    'AI Assistant': 'एआय सहाय्यक',
    'Marine Map': 'सागरी नकाशा',
    'Fishing Zones': 'मासेमारी क्षेत्रे',
    'Safe Routes': 'सुरक्षित मार्ग',
    'Weather': 'हवामान',
    'Ocean Data': 'समुद्र डेटा',
    'Vessels': 'जहाजे',
    'Alerts': 'इशारे',
    'ORCA Intelligence': 'ओरका इंटेलिजन्स',
    'Data Sources': 'डेटा स्रोत',
    'About': 'बद्दल',
    'Settings': 'सेटिंग्ज',
    'Language': 'भाषा',
    'SIH Pitch Deck': 'एसआयएच पिच डेक',
    'CLEAR': 'सुरक्षित (CLEAR)',
    'Nearest restricted boundary': 'जवळची प्रतिबंधित सीमा',
    'Position verified clear': 'स्थान पडताळून पाहिले (सुरक्षित)',
    'Nearest restricted area': 'जवळचा प्रतिबंधित भाग',
    'km away': 'किमी अंतरावर',
    'Safe to Sail': 'समुद्रात जाणे सुरक्षित आहे',
    'Best zone today': 'आजचा सर्वोत्तम मासेमारी भाग',
    'MAYDAY MAYDAY MAYDAY': 'आणीबाणी मेडे आणीबाणी मेडे',
    'Emergency distress signal transmitted': 'आणीबाणी सिग्नल पाठवला गेला आहे',
    'Indian Coast Guard alerted': 'भारतीय तटरक्षक दलास अलर्ट केले आहे',
  },
  Gujarati: {
    'EMERGENCY SOS & LIVE TELEMETRY': 'ઈમરજન્સી SOS અને લાઈવ ટેલિમેટ્રી',
    'Indian Coast Guard & Maritime Distress Dispatch': 'ભારતીય કોસ્ટ ગાર્ડ અને દરિયાઈ મુશ્કેલી સેવા',
    'Vessel:': 'હોડી:',
    'Vessel': 'હોડી',
    'Refresh GPS': 'જીપીએસ રિફ્રેશ કરો',
    'Hardware GPS Active': 'હાર્ડવેર જીપીએસ સક્રિય',
    'Live Environmental Danger Metrics': 'લાઈવ પર્યાવરણીય જોખમ માપદંડ',
    'Safety Score': 'સુરક્ષા સ્કોર',
    'SAFE': 'સુરક્ષિત',
    'CAUTION — MARGINAL': 'સાવધાની — મધ્યમ જોખમ',
    'CRITICAL HAZARD': 'ગંભીર જોખમ',
    'Wave Swell': 'દરિયાઈ મોજાં',
    'Wind Speed': 'પવનની ઝડપ',
    'Sea Temp': 'દરિયાનું તાપમાન',
    'Pressure': 'હવાનું દબાણ',
    'High Swell': 'ઊંચા મોજાં',
    'Moderate': 'મધ્યમ',
    'Low Pressure': 'ઓછું દબાણ',
    'Normal': 'સામાન્ય',
    'ISRO Satellite': 'ઇસરો સેટેલાઇટ',
    'Active Proactive Hazard Alerts': 'સક્રિય જોખમ ચેતવણીઓ',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'મેડે ઇમરજન્સી સિગ્નલ મોકલો',
    'TRANSMITTING MAYDAY': 'મેડે મોકલાઈ રહ્યું છે',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'કોસ્ટ ગાર્ડ MRCC અને નજીકના જહાજોને લાઈવ જીપીએસ સાથે ઓટોમેટિક મેડે સિગ્નલ મોકલે છે.',
    'MAYDAY DISTRESS BEACON ACTIVE': 'મેડે ઇમરજન્સી સિગ્નલ સક્રિય છે',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'કોસ્ટ ગાર્ડ MRCC અને VHF ચેનલ 16 ને મોકલાયું. સ્થાનિક ભાષામાં ઓડિયો ચેતવણી.',
    'Replay Voice Distress Broadcast': 'ઓડિયો ચેતવણી ફરી સાંભળો',
    'Fisherman Emergency Checklist at Sea': 'દરિયામાં માછીમારો માટે ઇમરજન્સી ચેકલિસ્ટ',
    'Put on life jackets immediately.': 'તુરંત લાઈફ જેકેટ પહેરો.',
    'Drop sea anchor to steady vessel.': 'હોડીને સ્થિર કરવા સી એન્કર નાખો.',
    'Set VHF radio to Channel 16.': 'VHF રેડિયો ચેનલ 16 પર સેટ કરો.',
    'Turn on strobe beacon light.': 'સ્ટ્રોબ બીકન લાઈટ ચાલુ કરો.',
    'Emergency Helplines': 'ઇમરજન્સી હેલ્પલાઈન',
    'Indian Coast Guard': 'ભારતીય કોસ્ટ ગાર્ડ',
    'Coastal Police': 'કોસ્ટલ પોલીસ',
    'Toll Free': 'ટોલ ફ્રી',
    'Coastal Waters': 'કિનારાના પાણી',
    'Live GPS Position': 'લાઈવ જીપીએસ સ્થિતિ',
    'Dashboard': 'ડેશબોર્ડ',
    'AI Assistant': 'AI સહાયક',
    'Marine Map': 'દરિયાઈ નકશો',
    'Fishing Zones': 'માછીમારી વિસ્તારો',
    'Safe Routes': 'સુરક્ષિત માર્ગો',
    'Weather': 'હવામાન',
    'Ocean Data': 'ઓશન ડેટા',
    'Vessels': 'વાહનો',
    'Alerts': 'ચેતવણીઓ',
    'ORCA Intelligence': 'ઓરકા ઈન્ટેલિજન્સ',
    'Data Sources': 'ડેટા સ્ત્રોતો',
    'About': 'અંગે',
    'Settings': 'સેટિંગ્સ',
    'Language': 'ભાષા',
    'SIH Pitch Deck': 'SIH પિચ ડેક',
    'CLEAR': 'સુરક્ષિત (CLEAR)',
    'Nearest restricted boundary': 'સૌથી નજીકની પ્રતિબંધિત સીમા',
    'Position verified clear': 'સ્થિતિ ચકાસાયેલ છે (સુરક્ષિત)',
    'Nearest restricted area': 'સૌથી નજીકનો પ્રતિબંધિત વિસ્તાર',
    'km away': 'કિમી દૂર',
    'Safe to Sail': 'દરિયામાં જવું સલામત છે',
    'Best zone today': 'આજનો શ્રેષ્ઠ માછીમારી વિસ્તાર',
    'MAYDAY MAYDAY MAYDAY': 'ઇમરજન્સી મેડે ઇમરજન્સી મેડે',
    'Emergency distress signal transmitted': 'ઇમરજન્સી સિગ્નલ મોકલવામાં આવ્યું છે',
    'Indian Coast Guard alerted': 'ઇન્ડિયન કોસ્ટ ગાર્ડને ચેતવણી આપવામાં આવી છે',
  },
  Malayalam: {
    'EMERGENCY SOS & LIVE TELEMETRY': 'അടിയന്തര SOS, ലൈവ് ടെലിമെട്രി',
    'Indian Coast Guard & Maritime Distress Dispatch': 'ഇന്ത്യൻ കോസ്റ്റ് ഗാർഡും സമുദ്ര ദുരന്ത പ്രതികരണ വിഭാഗവും',
    'Vessel:': 'ബോട്ട്:',
    'Vessel': 'ബോട്ട്',
    'Refresh GPS': 'ജിപിഎസ് പുതുക്കുക',
    'Hardware GPS Active': 'ഹാർഡ്‌വെയർ ജിപിഎസ് സജീവം',
    'Live Environmental Danger Metrics': 'ലൈവ് പരിസ്ഥിതി അപകട അളവുകൾ',
    'Safety Score': 'സുരക്ഷാ സ്കോർ',
    'SAFE': 'സുരക്ഷിതം',
    'CAUTION — MARGINAL': 'ജാഗ്രത — മിതമായ അപകടം',
    'CRITICAL HAZARD': 'ഗുരുതരമായ അപകടം',
    'Wave Swell': 'തിരമാലകൾ',
    'Wind Speed': 'കാറ്റിന്റെ വേഗത',
    'Sea Temp': 'കടൽ താപനില',
    'Pressure': 'വായുസമ്മർദ്ദം',
    'High Swell': 'ഉയർന്ന തിരമാലകൾ',
    'Moderate': 'മിതമായ',
    'Low Pressure': 'ന്യൂനമർദ്ദം',
    'Normal': 'സാധാരണ',
    'ISRO Satellite': 'ഐഎസ്ആർഒ സാറ്റലൈറ്റ്',
    'Active Proactive Hazard Alerts': 'സജീവ അപകട മുന്നറിയിപ്പുകൾ',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'മേഡേ അടിയന്തിര സന്ദേശം അയക്കുക',
    'TRANSMITTING MAYDAY': 'മേഡേ അയക്കുന്നു',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'കോസ്റ്റ് ഗാർഡ് MRCC-യിലേക്കും അടുത്തുള്ള ബോട്ടുകളിലേക്കും ലൈവ് ജിപിഎസ് ഉപയോഗിച്ച് മേഡേ സന്ദേശം അയക്കുന്നു.',
    'MAYDAY DISTRESS BEACON ACTIVE': 'മേഡേ അടിയന്തിര സന്ദേശം സജീവമാണ്',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'കോസ്റ്റ് ഗാർഡ് MRCC-യിലേക്കും VHF ചാനൽ 16-ലേക്കും അയച്ചു. പ്രാദേശിക ഭാഷയിൽ ശബ്ദ മുന്നറിയിപ്പ്.',
    'Replay Voice Distress Broadcast': 'ശബ്ദ മുന്നറിയിപ്പ് വീണ്ടും കേൾക്കുക',
    'Fisherman Emergency Checklist at Sea': 'കടലിൽ മൽസ്യത്തൊഴിലാളികൾക്കുള്ള അടിയന്തിര ചെക്ക്‌ലിസ്റ്റ്',
    'Put on life jackets immediately.': 'ഉടൻ ലൈഫ് ജാക്കറ്റ് ധരിക്കുക.',
    'Drop sea anchor to steady vessel.': 'ബോട്ട് സ്ഥിരപ്പെടുത്താൻ ആങ്കർ താഴെയിടുക.',
    'Set VHF radio to Channel 16.': 'VHF റേഡിയോ ചാനൽ 16-ലേക്ക് മാറ്റുക.',
    'Turn on strobe beacon light.': 'സ്ട്രോബ് ബീക്കൺ ലൈറ്റ് ഓൺ ചെയ്യുക.',
    'Emergency Helplines': 'അടിയന്തിര ഹെൽപ്പ് ലൈനുകൾ',
    'Indian Coast Guard': 'ഇന്ത്യൻ കോസ്റ്റ് ഗാർഡ്',
    'Coastal Police': 'കോസ്റ്റൽ പോലീസ്',
    'Toll Free': 'ടോൾ ഫ്രീ',
    'Coastal Waters': 'തീരദേശ സമുദ്രം',
    'Live GPS Position': 'ലൈവ് ജിപിഎസ് സ്ഥാനം',
    'Dashboard': 'ഡാഷ്‌ബോർഡ്',
    'AI Assistant': 'AI അസിസ്റ്റന്റ്',
    'Marine Map': 'കടൽ മാപ്പ്',
    'Fishing Zones': 'മീൻപിടുത്ത മേഖലകൾ',
    'Safe Routes': 'സുരക്ഷിത പാതകൾ',
    'Weather': 'കാലാവസ്ഥ',
    'Ocean Data': 'കടൽ വിവരങ്ങൾ',
    'Vessels': 'ബോട്ടുകൾ',
    'Alerts': 'മുന്നറിയിപ്പുകൾ',
    'ORCA Intelligence': 'ഓർക്കാ ഇന്റലിജൻസ്',
    'Data Sources': 'ഡാറ്റ ഉറവിടങ്ങൾ',
    'About': 'കുറിച്ച്',
    'Settings': 'സെറ്റിംഗ്സുകൾ',
    'Language': 'ഭാഷ',
    'SIH Pitch Deck': 'SIH പിച്ച് ഡെക്ക്',
    'CLEAR': 'സുരക്ഷിതം (CLEAR)',
    'Nearest restricted boundary': 'അടുത്തുള്ള നിരോധിത അതിർത്തി',
    'Position verified clear': 'സ്ഥാനം സ്ഥിരീകരിച്ചു (സുരക്ഷിതം)',
    'Nearest restricted area': 'അടുത്തുള്ള നിരോധിത പ്രദേശം',
    'km away': 'കി.മീ അകലെ',
    'Safe to Sail': 'കടലിൽ പോകുന്നത് സുരക്ഷിതമാണ്',
    'Best zone today': 'ഇന്നത്തെ മികച്ച മീൻപിടുത്ത മേഖല',
    'MAYDAY MAYDAY MAYDAY': 'അടിയന്തിര മേഡേ അടിയന്തിര മേഡേ',
  },
  Kannada: {
    'EMERGENCY SOS & LIVE TELEMETRY': 'ತುರ್ತು SOS ಮತ್ತು ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ',
    'Indian Coast Guard & Maritime Distress Dispatch': 'ಭಾರತೀಯ ಕಾವಲುಪಡೆ ಮತ್ತು ಕಡಲ ತುರ್ತು ಸೇವೆ',
    'Vessel:': 'ದೋಣಿ:',
    'Vessel': 'ದೋಣಿ',
    'Refresh GPS': 'GPS ರಿಫ್ರೆಶ್ ಮಾಡಿ',
    'Hardware GPS Active': 'ಹಾರ್ಡ್‌ವೇರ್ GPS ಸಕ್ರಿಯ',
    'Live Environmental Danger Metrics': 'ಲೈವ್ ಪರಿಸರ ಅಪಾಯದ ಮಾಪನಗಳು',
    'Safety Score': 'ಸುರಕ್ಷತಾ ಸ್ಕೋರ್',
    'SAFE': 'ಸುರಕ್ಷಿತ',
    'CAUTION — MARGINAL': 'ಎಚ್ಚರಿಕೆ — ಸಾಧಾರಣ ಅಪಾಯ',
    'CRITICAL HAZARD': 'ತೀವ್ರ ಅಪಾಯ',
    'Wave Swell': 'ಅಲೆಗಳ ಎತ್ತರ',
    'Wind Speed': 'ಗಾಳಿಯ ವೇಗ',
    'Sea Temp': 'ಸಮುದ್ರದ ತಾಪಮಾನ',
    'Pressure': 'ವಾಯುಭಾರ ಒತ್ತಡ',
    'High Swell': 'ಹೆಚ್ಚಿನ ಅಲೆಗಳು',
    'Moderate': 'ಸಾಧಾರಣ',
    'Low Pressure': 'ಕಡಿಮೆ ಒತ್ತಡ',
    'Normal': 'ಸಾಮಾನ್ಯ',
    'ISRO Satellite': 'ಇಸ್ರೋ ಉಪಗ್ರಹ',
    'Active Proactive Hazard Alerts': 'ಸಕ್ರಿಯ ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಳು',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'ಮೇಡೇ ತುರ್ತು ಸಂಕೇತ ಕಳುಹಿಸಿ',
    'TRANSMITTING MAYDAY': 'ಮೇಡೇ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'ಕೋಸ್ಟ್ ಗಾರ್ಡ್ MRCC ಮತ್ತು ಹತ್ತಿರದ ದೋಣಿಗಳಿಗೆ ಲೈವ್ GPS ನೊಂದಿಗೆ ಸ್ವಯಂಚಾಲಿತ ಮೇಡೇ ಸಂಕೇತ ಕಳುಹಿಸುತ್ತದೆ.',
    'MAYDAY DISTRESS BEACON ACTIVE': 'ಮೇಡೇ ತುರ್ತು ಸಂಕೇತ ಸಕ್ರಿಯವಾಗಿದೆ',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'ಕೋಸ್ಟ್ ಗಾರ್ಡ್ MRCC ಮತ್ತು VHF ಚಾನೆಲ್ 16 ಗೆ ರವಾನಿಸಲಾಗಿದೆ. ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿ ಎಚ್ಚರಿಕೆ.',
    'Replay Voice Distress Broadcast': 'ಧ್ವನಿ ಎಚ್ಚರಿಕೆಯನ್ನು ಮತ್ತೆ ಪ್ಲೇ ಮಾಡಿ',
    'Fisherman Emergency Checklist at Sea': 'ಸಮುದ್ರದಲ್ಲಿ ಮೀನುಗಾರರ ತುರ್ತು ತಪಾಸಣಾ ಪಟ್ಟಿ',
    'Put on life jackets immediately.': 'ತಕ್ಷಣ ಲೈಫ್ ಜಾಕೆಟ್ ಧರಿಸಿ.',
    'Drop sea anchor to steady vessel.': 'ದೋಣಿಯನ್ನು ಸ್ಥಿರಗೊಳಿಸಲು ಆಂಕರ್ ಹಾಕಿ.',
    'Set VHF radio to Channel 16.': 'VHF ರೇಡಿಯೋವನ್ನು ಚಾನೆಲ್ 16 ಗೆ ಸೆಟ್ ಮಾಡಿ.',
    'Turn on strobe beacon light.': 'ಸ್ಟ್ರೋಬ್ ಬೀಕನ್ ದೀಪವನ್ನು ಆನ್ ಮಾಡಿ.',
    'Emergency Helplines': 'ತುರ್ತು ಸಹಾಯವಾಣಿ',
    'Indian Coast Guard': 'ಭಾರತೀಯ ಕಾವಲುಪಡೆ',
    'Coastal Police': 'ಕರಾವಳಿ ಪೊಲೀಸ್',
    'Toll Free': 'ಟೋಲ್ ಫ್ರೀ',
    'Coastal Waters': 'ಕರಾವಳಿ ಸಾಗರ',
    'Live GPS Position': 'ಲೈವ್ GPS ಸ್ಥಾನ',
    'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'AI Assistant': 'AI ಸಹಾಯಕ',
    'Marine Map': 'ಸಮುದ್ರ ನಕ್ಷೆ',
    'Fishing Zones': 'ಮೀನುಗಾರಿಕಾ ವಲಯಗಳು',
    'Safe Routes': 'ಸುರಕ್ಷಿತ ಮಾರ್ಗಗಳು',
    'Weather': 'ಹವಾಮಾನ',
    'Ocean Data': 'ಸಮುದ್ರ ಡೇಟಾ',
    'Vessels': 'ದೋಣಿಗಳು',
    'Alerts': 'ಎಚ್ಚರಿಕೆಗಳು',
    'ORCA Intelligence': 'ಆರ್ಕಾ ಇಂಟೆಲಿಜೆನ್ಸ್',
    'Data Sources': 'ಡೇಟಾ ಮೂಲಗಳು',
    'About': 'ಬಗ್ಗೆ',
    'Settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'Language': 'ಭಾಷೆ',
    'SIH Pitch Deck': 'SIH ಪಿಚ್ ಡೆಕ್',
    'CLEAR': 'ಸುರಕ್ಷಿತ (CLEAR)',
    'Nearest restricted boundary': 'ಸಮೀಪದ ನಿರ್ಬಂಧಿತ ಗಡಿ',
    'Position verified clear': 'ಸ್ಥಾನ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (ಸುರಕ್ಷಿತ)',
    'Nearest restricted area': 'ಸಮೀಪದ ನಿರ್ಬಂಧಿತ ಪ್ರದೇಶ',
    'km away': 'ಕಿಮೀ ದೂರದಲ್ಲಿ',
    'Safe to Sail': 'ಸಮುದ್ರ ಪ್ರಯಾಣ ಸುರಕ್ಷಿತ',
    'Best zone today': 'ಇಂದಿನ ಅತ್ಯುತ್ತಮ ಮೀನುಗಾರಿಕಾ ವಲಯ',
    'MAYDAY MAYDAY MAYDAY': 'ಅತ್ಯತುರ್ತು ಮೇಡೇ ಅತ್ಯತುರ್ತು ಮೇಡೇ',
  },
  Bengali: {
    'EMERGENCY SOS & LIVE TELEMETRY': 'জরুরী এসওএস এবং লাইভ টেলিমেট্রি',
    'Indian Coast Guard & Maritime Distress Dispatch': 'ভারতীয় কোস্ট গার্ড ও সামুদ্রিক বিপদ প্রতিক্রিয়া',
    'Vessel:': 'নৌযান:',
    'Vessel': 'নৌযান',
    'Refresh GPS': 'জিপিএস রিফ্রেশ করুন',
    'Hardware GPS Active': 'হার্ডওয়্যার জিপিএস সক্রিয়',
    'Live Environmental Danger Metrics': 'লাইভ পরিবেশগত ঝুঁকি পরিসংখ্যান',
    'Safety Score': 'সুরক্ষা স্কোর',
    'SAFE': 'নিরাপদ',
    'CAUTION — MARGINAL': 'সতর্কতা — মাঝারি ঝুঁকি',
    'CRITICAL HAZARD': 'সংকটজনক ঝুঁকি',
    'Wave Swell': 'ঢেউয়ের উচ্চতা',
    'Wind Speed': 'বাতাসের গতি',
    'Sea Temp': 'সমুদ্রের তাপমাত্রা',
    'Pressure': 'বায়ুমণ্ডলীয় চাপ',
    'High Swell': 'উঁচু ঢেউ',
    'Moderate': 'মাঝারি',
    'Low Pressure': 'নিম্নচাপ',
    'Normal': 'স্বাভাবিক',
    'ISRO Satellite': 'ইসরো স্যাটেলাইট',
    'Active Proactive Hazard Alerts': 'সক্রিয় ঝুঁকি সতর্কতা',
    'TRANSMIT MAYDAY DISTRESS BEACON': 'মেডে জরুরী সংকেত পাঠান',
    'TRANSMITTING MAYDAY': 'মেডে পাঠানো হচ্ছে',
    'Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.': 'কোস্ট গার্ড MRCC এবং নিকটবর্তী নৌযানগুলিতে লাইভ জিপিএস সহ স্বয়ংক্রিয় মেডে সংকেত পাঠায়।',
    'MAYDAY DISTRESS BEACON ACTIVE': 'মেডে জরুরী সংকেত সক্রিয়',
    'Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.': 'কোস্ট গার্ড MRCC এবং VHF চ্যানেল 16 এ প্রেরিত। স্থানীয় ভাষায় অডিও সতর্কতা।',
    'Replay Voice Distress Broadcast': 'অডিও সতর্কতা পুনরায় শুনুন',
    'Fisherman Emergency Checklist at Sea': 'সমুদ্রে জেলেদের জন্য জরুরী চেকলিস্ট',
    'Put on life jackets immediately.': 'অবিলম্বে লাইফ জ্যাকেট পরুন।',
    'Drop sea anchor to steady vessel.': 'নৌযান স্থির রাখতে সি অ্যাঙ্কর ফেলুন।',
    'Set VHF radio to Channel 16.': 'ভিএইচএফ রেডিও চ্যানেল ১৬ তে সেট করুন।',
    'Turn on strobe beacon light.': 'স্ট্রোক বিকন লাইট চালু করুন।',
    'Emergency Helplines': 'জরুরী হেল্পলাইন',
    'Indian Coast Guard': 'ভারতীয় কোস্ট গার্ড',
    'Coastal Police': 'উপকূলীয় পুলিশ',
    'Toll Free': 'টোল ফ্রি',
    'Coastal Waters': 'উপকূলীয় জলভাগ',
    'Live GPS Position': 'লাইভ জিপিএস অবস্থান',
    'Dashboard': 'ড্যাশবোর্ড',
    'AI Assistant': 'এআই সহকারী',
    'Marine Map': 'সামুদ্রিক মানচিত্র',
    'Fishing Zones': 'মাছ ধরার এলাকা',
    'Safe Routes': 'নিরাপদ পথ',
    'Weather': 'আবহাওয়া',
    'Ocean Data': 'সমুদ্রের তথ্য',
    'Vessels': 'নৌযান',
    'Alerts': 'সতর্কতা',
    'ORCA Intelligence': 'ওরকা ইন্টেলিজেন্স',
    'Data Sources': 'তথ্যের উৎস',
    'About': 'সম্পর্কে',
    'Settings': 'সেটিংস',
    'Language': 'ভাষা',
    'SIH Pitch Deck': 'এসআইএইচ পিচ ডেক',
    'CLEAR': 'নিরাপদ (CLEAR)',
    'Nearest restricted boundary': 'নিকটতম সংবেদনশীল এলাকা',
    'Position verified clear': 'অবস্থান নিশ্চিত করা হয়েছে (নিরাপদ)',
    'Nearest restricted area': 'নিকটতম সংবেদনশীল এলাকা',
    'km away': 'কিমি দূরে',
    'Safe to Sail': 'যাত্রা করা নিরাপদ',
    'Best zone today': 'আজকের সেরা মাছ ধরার এলাকা',
    'MAYDAY MAYDAY MAYDAY': 'জরুরী মেডে জরুরী মেডে',
    'Emergency distress signal transmitted': 'জরুরী সংকেত প্রেরিত হয়েছে',
    'Indian Coast Guard alerted': 'ভারতীয় কোস্ট গার্ড সতর্ক করা হয়েছে',
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
=======
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
