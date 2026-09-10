// ============================================================
// ORCA Language Store — Shared language state & UI localization
// Persisted in localStorage so every page & audio player uses the same language
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { COASTAL_LANGUAGES, LanguageVoiceConfig } from '@/lib/i18n-engine';

const STORAGE_KEY = 'orca_selected_language';
export const DEFAULT_LANGUAGE = 'English';

/**
 * Returns the currently selected language name (e.g. 'English', 'Hindi', etc.).
 * Safe for both SSR and client execution.
 */
export function getSelectedLanguage(): string {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const match = COASTAL_LANGUAGES.find(l => l.name.toLowerCase() === stored.toLowerCase());
      if (match) return match.name;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Persists the selected language to localStorage and dispatches a global event.
 */
export function setSelectedLanguage(languageName: string): void {
  if (typeof window === 'undefined') return;
  try {
    const match = COASTAL_LANGUAGES.find(l => l.name.toLowerCase() === languageName.toLowerCase());
    const validName = match ? match.name : DEFAULT_LANGUAGE;
    localStorage.setItem(STORAGE_KEY, validName);
    window.dispatchEvent(new CustomEvent('orca-language-changed', { detail: validName }));
  } catch {
    // Ignore write errors
  }
}

/**
 * React hook that returns the active language and keeps in sync across components & tabs.
 */
export function useSelectedLanguage(): string {
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLanguage(getSelectedLanguage());

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setLanguage(customEvent.detail);
      } else {
        setLanguage(getSelectedLanguage());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setLanguage(e.newValue);
      }
    };

    window.addEventListener('orca-language-changed', handleCustomChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('orca-language-changed', handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return language;
}

/**
 * Common UI translations for 9 coastal Indian languages
 */
export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Navigation & General
  'Dashboard': {
    Hindi: 'डैशबोर्ड',
    Marathi: 'डॅशबोर्ड',
    Gujarati: 'ડેશબોર્ડ',
    Tamil: 'முகப்பு பலகை',
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
    Malayalam: 'AI സഹായി',
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
    Marathi: 'सुरक्षित मार्ग',
    Gujarati: 'સલામત માર્ગો',
    Tamil: 'பாதுகாப்பான வழிகள்',
    Telugu: 'సురక్షిత మార్గాలు',
    Kannada: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗಗಳು',
    Malayalam: 'സുരക്ഷിത പാതകൾ',
    Bengali: 'নিরাপদ রুট',
  },
  'Weather': {
    Hindi: 'मौसम पूर्वानुमान',
    Marathi: 'हवामान अंदाज',
    Gujarati: 'હવામાન',
    Tamil: 'வானிலை',
    Telugu: 'వాతావరణం',
    Kannada: 'ಹವಾಮಾನ',
    Malayalam: 'കാലാവസ്ഥ',
    Bengali: 'আবহাওয়া',
  },
  'Ocean Data': {
    Hindi: 'महासागर डेटा',
    Marathi: 'महासागर डेटा',
    Gujarati: 'મહાસાગર ડેટા',
    Tamil: 'பெருங்கடல் தரவு',
    Telugu: 'సముద్ర సమాచారం',
    Kannada: 'ಸಾಗರ ಮಾಹಿತಿ',
    Malayalam: 'സമുദ്ര ഡാറ്റ',
    Bengali: 'মহাসাগর তথ্য',
  },
  'Vessels': {
    Hindi: 'जहाज / नौकाएं',
    Marathi: 'बोटी आणि जहाजे',
    Gujarati: 'જહાજો',
    Tamil: 'படகு கலன்கள்',
    Telugu: 'నౌకలు',
    Kannada: 'ದೋಣಿಗಳು',
    Malayalam: 'യാനങ്ങൾ',
    Bengali: 'জলযান',
  },
  'Alerts': {
    Hindi: 'चेतावनी और अलर्ट',
    Marathi: 'इशारे आणि अलर्ट',
    Gujarati: 'ચેતવણીઓ',
    Tamil: 'எச்சரிக்கைகள்',
    Telugu: 'హెచ్చరికలు',
    Kannada: 'ಎಚ್ಚರಿಕೆಗಳು',
    Malayalam: 'മുന്നറിയിപ്പുകൾ',
    Bengali: 'সতর্কবার্তা',
  },
  'ORCA Intelligence': {
    Hindi: 'ओरका इंटेलिजेंस',
    Marathi: 'ओर्का इंटेलिजेंस',
    Gujarati: 'ઓર્કા ઇન્ટેલિજન્સ',
    Tamil: 'ORCA நுண்ணறிவு',
    Telugu: 'ORCA ఇంటెలిజెన్స్',
    Kannada: 'ORCA ಇಂಟೆಲಿಜೆನ್ಸ್',
    Malayalam: 'ഓർക്ക ഇന്റലിജൻസ്',
    Bengali: 'ওরকা ইন্টেলিজেন্স',
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
  'Customize your ORCA experience.': {
    Hindi: 'अपने ORCA अनुभव को अनुकूलित करें।',
    Marathi: 'तुमचा ORCA अनुभव सानुकूलित करा.',
    Gujarati: 'તમારા ORCA અનુભવને કસ્ટમાઇઝ કરો.',
    Tamil: 'உங்கள் ORCA அனுபவத்தைத் தனிப்பயனாக்குங்கள்.',
    Telugu: 'మీ ORCA అనుభవాన్ని అనుకూలీకరించుకోండి.',
    Kannada: 'ನಿಮ್ಮ ORCA ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.',
    Malayalam: 'നിങ്ങളുടെ ഓർക്ക അനുഭവം ക്രമീകരിക്കുക.',
    Bengali: 'আপনার ORCA অভিজ্ঞতা কাস্টমাইজ করুন।',
  },
  'Units': {
    Hindi: 'माप की इकाइयां',
    Marathi: 'मापन एकके',
    Gujarati: 'એકમો',
    Tamil: 'அளவீட்டு அலகுகள்',
    Telugu: 'కొలత యూనిట్లు',
    Kannada: 'ಮಾನದಂಡಗಳು',
    Malayalam: 'യൂണിറ്റുകൾ',
    Bengali: 'এককসমূহ',
  },
  'Default Map Layers': {
    Hindi: 'मानचित्र लेयर्स',
    Marathi: 'नकाशा स्तर',
    Gujarati: 'નકશા સ્તરો',
    Tamil: 'வரைபட அடுக்குகள்',
    Telugu: 'మ్యాప్ లేయర్‌లు',
    Kannada: 'ನಕ್ಷೆಯ ಪದರಗಳು',
    Malayalam: 'ഭൂപട ലെയറുകൾ',
    Bengali: 'ম্যাপ লেয়ার',
  },
  'Risk Sensitivity': {
    Hindi: 'जोखिम संवेदनशीलता',
    Marathi: 'धोका संवेदनशीलता',
    Gujarati: 'જોખમ સંવેદનશીલતા',
    Tamil: 'ஆபத்து உணர்திறன்',
    Telugu: 'ప్రమాద సున్నితత్వం',
    Kannada: 'ಅಪಾಯ ಸಂವೇದನೆ',
    Malayalam: 'അപകട സാധ്യത സൂചിക',
    Bengali: 'ঝুঁকি সংवेदनশীলতা',
  },
  'Notifications': {
    Hindi: 'सूचनाएं',
    Marathi: 'सूचना',
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
    Gujarati: 'રીઅલ-ટાઇમ ડેટા પાઇપલાઇન',
    Tamil: 'நேரலை தரவு கட்டமைப்பு',
    Telugu: 'రియల్ టైమ్ డేటా పైప్‌లైన్',
    Kannada: 'ನೈಜ-ಸಮಯದ ಡೇಟಾ ಪೈಪ್‌ಲೈನ್',
    Malayalam: 'തത്സമയ ഡാറ്റ പൈപ്പ്‌ലൈൻ',
    Bengali: 'রিয়েল-টাইম ডেটা পাইপলাইন',
  },
  'Location': {
    Hindi: 'स्थान',
    Marathi: 'स्थान',
    Gujarati: 'સ્થાન',
    Tamil: 'இருப்பிடம்',
    Telugu: 'ప్రాంతం',
    Kannada: 'ಸ್ಥಳ',
    Malayalam: 'സ്ഥലം',
    Bengali: 'অবস্থান',
  },
  'Speed': {
    Hindi: 'गति (Speed)',
    Marathi: 'वेग (Speed)',
    Gujarati: 'ઝડપ (Speed)',
    Tamil: 'வேகம் (Speed)',
    Telugu: 'వేగం (Speed)',
    Kannada: 'ವೇಗ (Speed)',
    Malayalam: 'വേഗത (Speed)',
    Bengali: 'গতি (Speed)',
  },
  'Distance': {
    Hindi: 'दूरी (Distance)',
    Marathi: 'अंतर (Distance)',
    Gujarati: 'અંતર (Distance)',
    Tamil: 'தூரம் (Distance)',
    Telugu: 'దూరం (Distance)',
    Kannada: 'ದೂರ (Distance)',
    Malayalam: 'ദൂരം (Distance)',
    Bengali: 'দূরত্ব (Distance)',
  },
  'Temperature': {
    Hindi: 'तापमान (Temperature)',
    Marathi: 'तापमान (Temperature)',
    Gujarati: 'તાપમાન (Temperature)',
    Tamil: 'வெப்பநிலை (Temperature)',
    Telugu: 'ఉష్ణోగ్రత (Temperature)',
    Kannada: 'ತಾಪಮಾನ (Temperature)',
    Malayalam: 'താപനില (Temperature)',
    Bengali: 'তাপমাত্রা (Temperature)',
  },
  'Waves': {
    Hindi: 'लहरें',
    Marathi: 'लाटा',
    Gujarati: 'મોજા',
    Tamil: 'அலைகள்',
    Telugu: 'తరంగాలు',
    Kannada: 'ಅಲೆಗಳು',
    Malayalam: 'തിരമാലകൾ',
    Bengali: 'ঢেউ',
  },
  'Currents': {
    Hindi: 'सागरी धाराएं',
    Marathi: 'सागरी प्रवाह',
    Gujarati: 'પ્રવાહો',
    Tamil: 'நீரோட்டங்கள்',
    Telugu: 'ప్రవాహాలు',
    Kannada: 'ಪ್ರವಾಹಗಳು',
    Malayalam: 'ഒഴുക്കുകൾ',
    Bengali: 'স্রোত',
  },
  'Fishing Activity': {
    Hindi: 'मत्स्य गतिविधि',
    Marathi: 'मासेमारी क्रियाकलाप',
    Gujarati: 'માછીમારી પ્રવૃત્તિ',
    Tamil: 'மீன்பிடி செயல்பாடு',
    Telugu: 'చేపల వేట కార్యకలాపాలు',
    Kannada: 'ಮೀನುಗಾರಿಕೆ ಚಟುವಟಿಕೆ',
    Malayalam: 'മത്സ്യബന്ധന പ്രവർത്തനം',
    Bengali: 'মাছ ধরার কার্যকলাপ',
  },
  'Routes': {
    Hindi: 'मार्ग',
    Marathi: 'मार्ग',
    Gujarati: 'માર્ગો',
    Tamil: 'வழிகள்',
    Telugu: 'మార్గాలు',
    Kannada: 'ಮಾರ್ಗಗಳು',
    Malayalam: 'പാതകൾ',
    Bengali: 'রুট',
  },
  'Depth': {
    Hindi: 'गहराई',
    Marathi: 'खोली',
    Gujarati: 'ઊંડાઈ',
    Tamil: 'ஆழம்',
    Telugu: 'లోతు',
    Kannada: 'ಆಳ',
    Malayalam: 'ആഴം',
    Bengali: 'গভীরতা',
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
    Marathi: 'जास्त',
    Gujarati: 'વધુ',
    Tamil: 'அதிக',
    Telugu: 'ఎక్కువ',
    Kannada: 'ಹೆಚ್ಚು',
    Malayalam: 'കൂടിയത്',
    Bengali: 'উচ্চ',
  },
  'Higher sensitivity triggers alerts at lower risk thresholds.': {
    Hindi: 'उच्च संवेदनशीलता कम जोखिम सीमा पर भी अलर्ट जारी करती है।',
    Marathi: 'उच्च संवेदनशीलता कमी धोक्याच्या मर्यादेवरही अलर्ट ट्रिगर करते.',
    Gujarati: 'વધુ સંવેદનશીલતા ઓછા જોખમના થ્રેશોલ્ડ પર પણ ચેતવણી આપે છે.',
    Tamil: 'அதிக உணர்திறன் குறைந்த ஆபத்து நிலைகளிலும் எச்சரிக்கைகளைத் தூண்டும்.',
    Telugu: 'ఎక్కువ సున్నితత్వం తక్కువ ప్రమాద స్థాయి వద్ద కూడా హెచ్చరికలను ఇస్తుంది.',
    Kannada: 'ಹೆಚ್ಚಿನ ಸಂವೇದನೆಯು ಕಡಿಮೆ ಅಪಾಯದ ಮಿತಿಯಲ್ಲೂ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪ್ರಚೋದಿಸುತ್ತದೆ.',
    Malayalam: 'ഉയർന്ന സംവേദനക്ഷമത കുറഞ്ഞ അപകടസാധ്യതയിലും മുന്നറിയിപ്പ് നൽകുന്നു.',
    Bengali: 'উচ্চ সংবেদনশীলতা কম ঝুঁকির মাত্রাতেও সতর্কতা জারি করে।',
  },
  'Stream live ISRO MOSDAC satellite and Open-Meteo weather data.': {
    Hindi: 'लाइव ISRO MOSDAC उपग्रह और Open-Meteo मौसम डेटा स्ट्रीम करें।',
    Marathi: 'थेट ISRO MOSDAC उपग्रह आणि Open-Meteo हवामान डेटा स्ट्रीम करा.',
    Gujarati: 'લાઇવ ISRO MOSDAC ઉપગ્રહ અને Open-Meteo હવામાન ડેટા સ્ટ્રીમ કરો.',
    Tamil: 'நேரலை ISRO MOSDAC செயற்கைக்கோள் மற்றும் Open-Meteo வானிலை தரவை ஸ்ட்ரீம் செய்க.',
    Telugu: 'లైవ్ ISRO MOSDAC ఉపగ్రహం మరియు Open-Meteo వాతావરણ సమాచారాన్ని పొందండి.',
    Kannada: 'ನೇರ ISRO MOSDAC ಉಪಗ್ರಹ ಮತ್ತು Open-Meteo ಹವಾಮಾನ ಡೇಟಾವನ್ನು ಸ್ಟ್ರೀಮ್ ಮಾಡಿ.',
    Malayalam: 'തത്സമയ ഐ.എസ്.ആർ.ഒ മൊസ്ഡാക് ഉപഗ്രഹ ഡാറ്റയും ഓപ്പൺ-മീറ്റിയോ വിവരങ്ങളും ലഭ്യമാക്കുക.',
    Bengali: 'লাইভ ISRO MOSDAC উপগ্রহ এবং Open-Meteo আবহাওয়া ডেটা স্ট্রিম করুন।',
  },
  'Latitude': {
    Hindi: 'अक्षांश (Latitude)',
    Marathi: 'अक्षांश (Latitude)',
    Gujarati: 'અક્ષાંશ (Latitude)',
    Tamil: 'அட்சரேகை (Latitude)',
    Telugu: 'అక్షాంశం (Latitude)',
    Kannada: 'ಅಕ್ಷಾಂಶ (Latitude)',
    Malayalam: 'അക്ഷാംശം (Latitude)',
    Bengali: 'অক্ষাংশ (Latitude)',
  },
  'Longitude': {
    Hindi: 'देशांतर (Longitude)',
    Marathi: 'रेखांश (Longitude)',
    Gujarati: 'રેખાંશ (Longitude)',
    Tamil: 'தீர்க்கரேகை (Longitude)',
    Telugu: 'రేఖాంశం (Longitude)',
    Kannada: 'ರೇಖಾಂಶ (Longitude)',
    Malayalam: 'രേഖാംശം (Longitude)',
    Bengali: 'দ্রাঘিমাংশ (Longitude)',
  },
  'Mumbai Coast, Arabian Sea': {
    Hindi: 'मुंबई तट, अरब सागर',
    Marathi: 'मुंबई किनारपट्टी, अरबी समुद्र',
    Gujarati: 'મુંબઈ તટ, અરબી સમુદ્ર',
    Tamil: 'மும்பை கடற்கரை, அரபிக்கடல்',
    Telugu: 'ముంబై తీరం, అరేబియా సముద్రం',
    Kannada: 'ಮುಂಬೈ ಕರಾವಳಿ, ಅರಬ್ಬಿ ಸಮುದ್ರ',
    Malayalam: 'മുംബൈ തീരം, അറബിക്കടൽ',
    Bengali: 'মুম্বাই উপকূল, আরব সাগর',
  },
};

/**
 * Returns localized string for a UI key given current language.
 */
export function t(key: string, lang?: string): string {
  const currentLang = lang || getSelectedLanguage();
  if (currentLang === 'English') return key;
  return UI_TRANSLATIONS[key]?.[currentLang] || key;
}
