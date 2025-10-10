-- Migration: Complete schema update for Bodega Academy
-- Date: 2025-10-10
-- Description: Add all missing columns for Arabic translations and multi-page support

BEGIN;

-- ========================================
-- 1. Add Arabic translation columns to training_paths
-- ========================================
ALTER TABLE training_paths
ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- ========================================
-- 2. Add Arabic translation columns to modules
-- ========================================
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- ========================================
-- 3. Add multi-page support columns to modules
-- ========================================
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS has_multiple_pages BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pages JSONB DEFAULT NULL;

-- ========================================
-- 4. Set default values for existing modules
-- ========================================
UPDATE modules
SET has_multiple_pages = false
WHERE has_multiple_pages IS NULL;

-- ========================================
-- 5. Update training_paths with Arabic translations
-- ========================================
UPDATE training_paths
SET
    name_ar = CASE id
        WHEN 'tronc-commun' THEN 'الجذع المشترك'
        WHEN 'operations-magasin' THEN 'عمليات المتجر'
        WHEN 'operations-entrepot' THEN 'عمليات المستودع'
        WHEN 'management' THEN 'الإدارة والقيادة'
        WHEN 'fonctions-support' THEN 'وظائف الدعم'
        WHEN 'securite-qualite' THEN 'السلامة والجودة'
        ELSE name_ar
    END,
    description_ar = CASE id
        WHEN 'tronc-commun' THEN 'تدريبات إلزامية لجميع موظفي أكاديمية بوديجا'
        WHEN 'operations-magasin' THEN 'تدريب لموظفي المتجر وخدمة العملاء'
        WHEN 'operations-entrepot' THEN 'تدريب لموظفي المستودع والخدمات اللوجستية'
        WHEN 'management' THEN 'تدريب متقدم للمدراء والمشرفين'
        WHEN 'fonctions-support' THEN 'تدريب للفرق الإدارية والدعم'
        WHEN 'securite-qualite' THEN 'تدريب شامل على السلامة والجودة'
        ELSE description_ar
    END
WHERE id IN ('tronc-commun', 'operations-magasin', 'operations-entrepot', 'management', 'fonctions-support', 'securite-qualite');

-- ========================================
-- 6. Update modules with Arabic translations
-- ========================================

-- Update "Hola Bienvenido" / Welcome module
UPDATE modules
SET
    title_ar = 'مرحباً بك',
    description_ar = 'مقدمة إلى أكاديمية بوديجا - قيمنا ومهمتنا وثقافتنا',
    content_ar = '<h2>مرحباً بك في أكاديمية بوديجا!</h2>
<p>نحن سعداء بانضمامك إلى فريقنا. ستساعدك هذه المنصة على تطوير مهاراتك والنجاح في دورك.</p>
<h3>قيمنا</h3>
<ul>
<li><strong>الجودة</strong> - نسعى للتميز في كل ما نقوم به</li>
<li><strong>الخدمة</strong> - عملاؤنا هم أولويتنا</li>
<li><strong>الابتكار</strong> - نحن نتحسن باستمرار</li>
<li><strong>العمل الجماعي</strong> - النجاح معاً</li>
</ul>
<p>استمتع برحلة التدريب الخاصة بك!</p>'
WHERE (title ILIKE '%bienvenido%' OR title ILIKE '%bienvenue%' OR title ILIKE '%welcome%')
AND title_ar IS NULL;

-- Update "ONBOARDING" module if it exists
UPDATE modules
SET
    title_ar = 'الانضمام',
    description_ar = 'عملية الانضمام للموظفين الجدد',
    content_ar = '<h2>مرحباً بك في أكاديمية بوديجا</h2>
<p>يغطي هذا الوحدة جميع المعلومات الأساسية التي تحتاج إلى معرفتها عند الانضمام.</p>'
WHERE title ILIKE '%onboarding%'
AND title_ar IS NULL;

-- ========================================
-- 7. Create indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_modules_has_multiple_pages ON modules(has_multiple_pages);
CREATE INDEX IF NOT EXISTS idx_training_paths_name_ar ON training_paths(name_ar);
CREATE INDEX IF NOT EXISTS idx_modules_title_ar ON modules(title_ar);

-- ========================================
-- 8. Add comments for documentation
-- ========================================
COMMENT ON COLUMN training_paths.name_ar IS 'Arabic translation of the training path name';
COMMENT ON COLUMN training_paths.description_ar IS 'Arabic translation of the training path description';
COMMENT ON COLUMN modules.title_ar IS 'Arabic translation of the module title';
COMMENT ON COLUMN modules.description_ar IS 'Arabic translation of the module description';
COMMENT ON COLUMN modules.content_ar IS 'Arabic translation of the module content (HTML)';
COMMENT ON COLUMN modules.has_multiple_pages IS 'Indicates if the module uses multiple pages instead of single content';
COMMENT ON COLUMN modules.pages IS 'JSON array of pages for multi-page modules. Structure: [{order_index, title, title_ar, content, content_ar, video_url, pdf_url, presentation_url, presentation_type, quiz_questions}]';

COMMIT;

-- ========================================
-- Migration completed successfully
-- ========================================
-- Instructions après migration :
-- 1. Toutes les colonnes nécessaires ont été ajoutées
-- 2. Les parcours de formation ont leurs traductions arabes
-- 3. Les modules existants ont été traduits (bienvenue et onboarding)
-- 4. Le support multi-pages est activé pour les modules
-- 5. Vous pouvez maintenant créer et modifier des modules sans erreur
