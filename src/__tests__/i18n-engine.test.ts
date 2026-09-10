// ============================================================
// ORCA Phase 10 — Multi-lingual i18n & Voice Unit Test Suite
// ============================================================

import assert from 'node:assert/strict';
import { COASTAL_LANGUAGES, getLanguageBCP47, translateAdvisory } from '../lib/i18n-engine';

console.log('🧪 Running Phase 10 Multi-lingual Voice Unit Tests...\n');

// 1. Validate 9 Coastal Languages Supported
{
  assert.equal(COASTAL_LANGUAGES.length, 9, 'Must support 9 coastal Indian languages');
  const langNames = COASTAL_LANGUAGES.map(l => l.name);
  assert.ok(langNames.includes('English'), 'English must be supported');
  assert.ok(langNames.includes('Hindi'), 'Hindi must be supported');
  assert.ok(langNames.includes('Marathi'), 'Marathi must be supported');
  assert.ok(langNames.includes('Tamil'), 'Tamil must be supported');
  assert.ok(langNames.includes('Malayalam'), 'Malayalam must be supported');

  console.log('✅ PASS: 1. 9 Coastal Indian languages verified');
}

// 2. BCP 47 Language Code Mapping
{
  assert.equal(getLanguageBCP47('Hindi'), 'hi-IN');
  assert.equal(getLanguageBCP47('Marathi'), 'mr-IN');
  assert.equal(getLanguageBCP47('Tamil'), 'ta-IN');
  assert.equal(getLanguageBCP47('English'), 'en-IN');
  assert.equal(getLanguageBCP47('UnknownLang'), 'en-IN', 'Fallback for unknown lang should be en-IN');

  console.log('✅ PASS: 2. BCP 47 language code mapping verified');
}

// 3. Translation Engine Lookup & Vernacular Fallbacks
{
  const text = 'Fishing is safe with standard caution. Return before evening as wind speeds may increase.';
  const hindiTranslation = translateAdvisory(text, 'Hindi');
  assert.ok(hindiTranslation.includes('मछली पकड़ना सुरक्षित है'), 'Hindi translation must contain localized text');

  const englishTranslation = translateAdvisory(text, 'English');
  assert.equal(englishTranslation, text, 'English target should return original string');

  console.log('✅ PASS: 3. Advisory translation lookup verified');
}

console.log('\n🎉 ALL 3 MULTI-LINGUAL VOICE UNIT TESTS PASSED SUCCESSFULLY!');
