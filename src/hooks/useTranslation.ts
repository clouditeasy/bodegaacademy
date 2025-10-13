import { useLanguage } from '../contexts/LanguageContext';
import translations from '../i18n/translations.json';

type Language = 'fr' | 'ar';
type TranslationKey = string;

/**
 * Custom hook to access translations
 * Supports nested keys with dot notation (e.g., 'module_form.back_to_list')
 */
export function useTranslation() {
  const { language, setLanguage } = useLanguage();

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language as Language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to French if translation not found
        value = translations['fr' as Language];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language, setLanguage };
}
