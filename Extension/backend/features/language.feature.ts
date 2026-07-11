export interface LanguageInfo {
  code: string;
  name: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' }
];

export class LanguageFeature {
  /**
   * Automatically detects the webpage language using high-performance character-range and word heuristics.
   * Completely offline, robust, and supports all 21 target languages.
   */
  public static detect(text: string): LanguageInfo {
    if (!text || text.trim().length === 0) {
      return { code: 'en', name: 'English', native: 'English' };
    }

    const sample = text.substring(0, 8000);
    const len = sample.length;

    const counts: Record<string, number> = {
      gu: 0, // Gujarati: 0A80-0AFF
      hi: 0, // Hindi/Marathi: 0900-097F
      bn: 0, // Bengali: 0980-09FF
      ta: 0, // Tamil: 0B80-0BFF
      te: 0, // Telugu: 0C00-0C7F
      kn: 0, // Kannada: 0C80-0CFF
      ml: 0, // Malayalam: 0D00-0D7F
      pa: 0, // Punjabi (Gurmukhi): 0A00-0A7F
      ar: 0, // Arabic/Urdu: 0600-06FF
      ru: 0, // Russian (Cyrillic): 0400-04FF
      zh: 0, // Chinese (Han): 4E00-9FFF
      ja: 0, // Japanese (Hiragana/Katakana): 3040-30FF
      ko: 0, // Korean (Hangul): AC00-D7AF
      lat: 0 // Latin script
    };

    for (let i = 0; i < len; i++) {
      const code = sample.charCodeAt(i);
      if (code >= 0x0A80 && code <= 0x0AFF) counts.gu++;
      else if (code >= 0x0900 && code <= 0x097F) counts.hi++; // Devnagari (Hindi, Marathi)
      else if (code >= 0x0980 && code <= 0x09FF) counts.bn++; // Bengali
      else if (code >= 0x0B80 && code <= 0x0BFF) counts.ta++; // Tamil
      else if (code >= 0x0C00 && code <= 0x0C7F) counts.te++; // Telugu
      else if (code >= 0x0C80 && code <= 0x0CFF) counts.kn++; // Kannada
      else if (code >= 0x0D00 && code <= 0x0D7F) counts.ml++; // Malayalam
      else if (code >= 0x0A00 && code <= 0x0A7F) counts.pa++; // Punjabi
      else if (code >= 0x0600 && code <= 0x06FF) counts.ar++; // Arabic/Urdu (Arabic letters)
      else if (code >= 0x0400 && code <= 0x04FF) counts.ru++; // Cyrillic (Russian)
      else if (code >= 0x4E00 && code <= 0x9FFF) counts.zh++; // Chinese Han
      else if ((code >= 0x3040 && code <= 0x30FF) || (code >= 0x31F0 && code <= 0x31FF)) counts.ja++; // Hiragana & Katakana
      else if (code >= 0xAC00 && code <= 0xD7AF) counts.ko++; // Korean Hangul
      else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) counts.lat++;
    }

    // Find script with highest count
    let bestScript = 'lat';
    let maxCount = 0;
    for (const [script, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestScript = script;
      }
    }

    // If script isn't detected or has very few matches, default to English
    if (maxCount < 5) {
      return { code: 'en', name: 'English', native: 'English' };
    }

    // Distinguish Devnagari-based languages (Hindi vs Marathi)
    if (bestScript === 'hi') {
      const marathiKeywords = /आहे|आणि|हे|तर|ळ|च्या|साठी|केले|होते|कडून|मधे|पण|मध्ये/;
      if (marathiKeywords.test(sample)) {
        return { code: 'mr', name: 'Marathi', native: 'मराठी' };
      }
      return { code: 'hi', name: 'Hindi', native: 'हिन्दी' };
    }

    // Distinguish Arabic-based languages (Arabic vs Urdu)
    if (bestScript === 'ar') {
      const urduKeywords = /ہیں|تھا|ہے|اور|ٹ|ڈ|ڑ|کيا|ہوں|گی|گا|سے|نے|کو/;
      if (urduKeywords.test(sample)) {
        return { code: 'ur', name: 'Urdu', native: 'اردو' };
      }
      return { code: 'ar', name: 'Arabic', native: 'العربية' };
    }

    // Map script counts directly to their corresponding language objects
    if (bestScript === 'gu') return { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' };
    if (bestScript === 'bn') return { code: 'bn', name: 'Bengali', native: 'বাংলা' };
    if (bestScript === 'ta') return { code: 'ta', name: 'Tamil', native: 'தமிழ்' };
    if (bestScript === 'te') return { code: 'te', name: 'Telugu', native: 'తెలుగు' };
    if (bestScript === 'kn') return { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' };
    if (bestScript === 'ml') return { code: 'ml', name: 'Malayalam', native: 'മലയാളം' };
    if (bestScript === 'pa') return { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬी' };
    if (bestScript === 'ru') return { code: 'ru', name: 'Russian', native: 'Русский' };
    if (bestScript === 'zh') return { code: 'zh', name: 'Chinese', native: '中文' };
    if (bestScript === 'ja') return { code: 'ja', name: 'Japanese', native: '日本語' };
    if (bestScript === 'ko') return { code: 'ko', name: 'Korean', native: '한국어' };

    // Distinguish Latin-script European languages: English, French, Spanish, German, Portuguese, Italian
    if (bestScript === 'lat') {
      const lower = sample.toLowerCase();
      
      const french = /\b(le|la|les|et|est|un|une|des|dans|en|pour|qui|que|dans)\b/g;
      const german = /\b(der|die|das|und|ist|ein|eine|in|zu|mit|von|für|dass|nicht)\b/g;
      const spanish = /\b(el|la|los|las|y|es|un|una|en|para|con|por|que|del|al)\b/g;
      const portuguese = /\b(o|a|os|as|e|é|um|uma|em|para|com|por|que|do|da)\b/g;
      const italian = /\b(il|la|i|gli|le|e|è|un|una|in|per|con|di|da|che)\b/g;

      const frCount = (lower.match(french) || []).length;
      const deCount = (lower.match(german) || []).length;
      const esCount = (lower.match(spanish) || []).length;
      const ptCount = (lower.match(portuguese) || []).length;
      const itCount = (lower.match(italian) || []).length;

      const max = Math.max(frCount, deCount, esCount, ptCount, itCount);
      if (max > 2) {
        if (max === frCount) return { code: 'fr', name: 'French', native: 'Français' };
        if (max === deCount) return { code: 'de', name: 'German', native: 'Deutsch' };
        if (max === esCount) return { code: 'es', name: 'Spanish', native: 'Español' };
        if (max === ptCount) return { code: 'pt', name: 'Portuguese', native: 'Português' };
        if (max === itCount) return { code: 'it', name: 'Italian', native: 'Italiano' };
      }
    }

    return { code: 'en', name: 'English', native: 'English' };
  }
}
