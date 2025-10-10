// Helper functions for dynamic content translation

type Language = 'fr' | 'ar';

interface TranslatableContent {
  [key: string]: any;
}

/**
 * Get translated field from object
 * @param obj - Object with translatable fields
 * @param field - Base field name (e.g., 'title', 'description')
 * @param language - Current language ('fr' or 'ar')
 * @returns Translated content or fallback to French
 */
export function getTranslatedField<T extends TranslatableContent>(
  obj: T,
  field: keyof T,
  language: Language
): string {
  if (language === 'ar') {
    const arField = `${String(field)}_ar` as keyof T;
    const arValue = obj[arField];
    // Return Arabic if exists and not empty, otherwise fallback to French
    if (arValue && typeof arValue === 'string' && arValue.trim() !== '') {
      return arValue;
    }
  }

  // Fallback to French (default)
  const frValue = obj[field];
  return typeof frValue === 'string' ? frValue : '';
}

/**
 * Create a translated object with all translatable fields
 * @param obj - Original object
 * @param fields - Array of field names to translate
 * @param language - Current language
 * @returns New object with translated fields
 */
export function translateObject<T extends TranslatableContent>(
  obj: T,
  fields: (keyof T)[],
  language: Language
): T {
  const translated = { ...obj };

  fields.forEach(field => {
    const translatedValue = getTranslatedField(obj, field, language);
    (translated as any)[field] = translatedValue;
  });

  return translated;
}

/**
 * Translate an array of objects
 * @param array - Array of objects to translate
 * @param fields - Fields to translate in each object
 * @param language - Current language
 * @returns Array with translated objects
 */
export function translateArray<T extends TranslatableContent>(
  array: T[],
  fields: (keyof T)[],
  language: Language
): T[] {
  return array.map(item => translateObject(item, fields, language));
}
