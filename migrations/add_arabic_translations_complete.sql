-- Migration: Add Arabic translations for training paths and modules
-- Date: 2025-10-10
-- Description: Add name_ar, description_ar, title_ar, and content_ar columns for complete bilingual support

BEGIN;

-- ========================================
-- 1. Add Arabic columns to training_paths
-- ========================================
ALTER TABLE training_paths
ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- ========================================
-- 2. Add Arabic columns to modules
-- ========================================
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- ========================================
-- 3. Update training_paths with Arabic translations
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
        -- Fallback for old training paths if they still exist
        WHEN 'employe-salle-comptoir' THEN 'مسار موظف القاعة / الكاونتر'
        WHEN 'commis-cuisine' THEN 'مسار مساعد الطبخ'
        WHEN 'chef-cuisine' THEN 'مسار رئيس الطهاة'
        WHEN 'assistant-manager' THEN 'مسار مساعد المدير'
        WHEN 'manager' THEN 'مسار المدير'
        ELSE name_ar
    END,
    description_ar = CASE id
        WHEN 'tronc-commun' THEN 'تدريبات إلزامية لجميع موظفي أكاديمية بوديجا'
        WHEN 'operations-magasin' THEN 'تدريب لموظفي المتجر وخدمة العملاء'
        WHEN 'operations-entrepot' THEN 'تدريب لموظفي المستودع والخدمات اللوجستية'
        WHEN 'management' THEN 'تدريب متقدم للمدراء والمشرفين'
        WHEN 'fonctions-support' THEN 'تدريب للفرق الإدارية والدعم'
        WHEN 'securite-qualite' THEN 'تدريب شامل على السلامة والجودة'
        -- Fallback for old training paths
        WHEN 'employe-salle-comptoir' THEN 'تدريب متخصص لموظفي القاعة والكاونتر'
        WHEN 'commis-cuisine' THEN 'تدريب لمساعدي المطبخ'
        WHEN 'chef-cuisine' THEN 'تدريب متقدم لرؤساء الطهاة'
        WHEN 'assistant-manager' THEN 'تدريب إداري لمساعدي المدراء'
        WHEN 'manager' THEN 'تدريب شامل في القيادة وإدارة الفريق'
        ELSE description_ar
    END
WHERE id IN ('tronc-commun', 'operations-magasin', 'operations-entrepot', 'management', 'fonctions-support', 'securite-qualite',
             'employe-salle-comptoir', 'commis-cuisine', 'chef-cuisine', 'assistant-manager', 'manager');

-- ========================================
-- 4. Update modules with Arabic translations
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
WHERE title ILIKE '%bienvenido%' OR title ILIKE '%bienvenue%' OR title ILIKE '%welcome%';

-- Update "ONBOARDING" module if it exists
UPDATE modules
SET
    title_ar = 'الانضمام',
    description_ar = 'عملية الانضمام للموظفين الجدد',
    content_ar = '<h2>مرحباً بك في أكاديمية بوديجا</h2>
<p>يغطي هذا الوحدة جميع المعلومات الأساسية التي تحتاج إلى معرفتها عند الانضمام.</p>'
WHERE title ILIKE '%onboarding%';

-- Update modules related to customer service
UPDATE modules
SET
    title_ar = 'خدمة العملاء المتميزة',
    description_ar = 'تعلم كيفية تقديم خدمة عملاء استثنائية',
    content_ar = '<h2>خدمة العملاء</h2>
<p>خدمة العملاء هي قلب عملنا في بوديجا.</p>
<h3>المبادئ الأساسية:</h3>
<ul>
<li>الترحيب بكل عميل بابتسامة</li>
<li>الاستماع بنشاط لاحتياجاتهم</li>
<li>تقديم حلول سريعة وفعالة</li>
<li>المتابعة لضمان الرضا</li>
</ul>'
WHERE title ILIKE '%service client%' OR title ILIKE '%customer service%';

-- Update modules related to safety
UPDATE modules
SET
    title_ar = 'السلامة في مكان العمل',
    description_ar = 'إجراءات ومعايير السلامة الأساسية',
    content_ar = '<h2>السلامة أولاً</h2>
<p>سلامتك وسلامة زملائك هي أولويتنا القصوى.</p>
<h3>قواعد السلامة:</h3>
<ul>
<li>ارتداء معدات الحماية الشخصية المناسبة</li>
<li>الإبلاغ عن المخاطر فوراً</li>
<li>اتباع إجراءات السلامة</li>
<li>الحفاظ على نظافة بيئة العمل</li>
</ul>'
WHERE title ILIKE '%sécurité%' OR title ILIKE '%sûreté%' OR title ILIKE '%safety%';

-- Update modules related to quality
UPDATE modules
SET
    title_ar = 'إدارة الجودة',
    description_ar = 'معايير وإجراءات الجودة',
    content_ar = '<h2>ضمان الجودة</h2>
<p>الحفاظ على معايير عالية من الجودة في جميع عملياتنا.</p>
<h3>معايير الجودة:</h3>
<ul>
<li>فحص المنتجات بانتظام</li>
<li>اتباع الإجراءات المعتمدة</li>
<li>توثيق المشاكل والحلول</li>
<li>التحسين المستمر</li>
</ul>'
WHERE title ILIKE '%qualité%' OR title ILIKE '%quality%';

-- Update modules related to inventory/warehouse
UPDATE modules
SET
    title_ar = 'إدارة المخزون والمستودع',
    description_ar = 'تقنيات فعالة لإدارة المخزون والتخزين',
    content_ar = '<h2>إدارة المخزون</h2>
<p>تعلم كيفية إدارة المخزون بكفاءة.</p>
<h3>المواضيع الرئيسية:</h3>
<ul>
<li>نظام FIFO (الأول في الأول خارج)</li>
<li>تنظيم المستودع</li>
<li>استلام وفحص البضائع</li>
<li>الجرد والتتبع</li>
</ul>'
WHERE title ILIKE '%stock%' OR title ILIKE '%entrepôt%' OR title ILIKE '%inventory%' OR title ILIKE '%warehouse%';

-- Update modules related to store operations
UPDATE modules
SET
    title_ar = 'عمليات المتجر',
    description_ar = 'الإجراءات اليومية لعمليات المتجر',
    content_ar = '<h2>العمليات اليومية للمتجر</h2>
<p>تعلم الإجراءات الأساسية لعمليات المتجر الفعالة.</p>
<h3>المسؤوليات الرئيسية:</h3>
<ul>
<li>افتتاح وإغلاق المتجر</li>
<li>إدارة الكاشير</li>
<li>تجديد البضائع</li>
<li>الحفاظ على النظافة والتنظيم</li>
</ul>'
WHERE title ILIKE '%magasin%' OR title ILIKE '%store operations%' OR title ILIKE '%opérations%';

-- Update modules related to sales
UPDATE modules
SET
    title_ar = 'تقنيات البيع',
    description_ar = 'تعلم كيفية البيع بفعالية وزيادة الإيرادات',
    content_ar = '<h2>تقنيات البيع الفعالة</h2>
<p>طور مهاراتك في البيع وساعد العملاء على إيجاد ما يحتاجون إليه.</p>
<h3>مهارات البيع:</h3>
<ul>
<li>فهم احتياجات العميل</li>
<li>عرض المنتجات بفعالية</li>
<li>البيع التكميلي والبيع المتقاطع</li>
<li>إتمام الصفقة</li>
</ul>'
WHERE title ILIKE '%vente%' OR title ILIKE '%sales%';

-- Update modules related to management/leadership
UPDATE modules
SET
    title_ar = 'المهارات القيادية',
    description_ar = 'تطوير مهارات القيادة وإدارة الفريق',
    content_ar = '<h2>القيادة والإدارة</h2>
<p>تعلم كيف تصبح قائداً فعالاً وتحفز فريقك.</p>
<h3>مبادئ القيادة:</h3>
<ul>
<li>التواصل الفعال</li>
<li>تحفيز الفريق</li>
<li>حل النزاعات</li>
<li>اتخاذ القرارات</li>
<li>التدريب والتطوير</li>
</ul>'
WHERE title ILIKE '%management%' OR title ILIKE '%leadership%' OR title ILIKE '%gestion%';

-- Update modules related to hygiene
UPDATE modules
SET
    title_ar = 'النظافة والصحة',
    description_ar = 'معايير النظافة والصحة في العمل',
    content_ar = '<h2>معايير النظافة</h2>
<p>الحفاظ على بيئة عمل نظيفة وصحية.</p>
<h3>ممارسات النظافة:</h3>
<ul>
<li>غسل اليدين بانتظام</li>
<li>تنظيف مناطق العمل</li>
<li>التخزين السليم للمنتجات</li>
<li>إدارة النفايات</li>
</ul>'
WHERE title ILIKE '%hygiène%' OR title ILIKE '%hygiene%' OR title ILIKE '%propreté%';

-- Update modules related to cash handling
UPDATE modules
SET
    title_ar = 'إدارة الكاشير والنقد',
    description_ar = 'إجراءات التعامل مع النقد والكاشير',
    content_ar = '<h2>إدارة الكاشير</h2>
<p>تعلم كيفية التعامل مع المعاملات النقدية بدقة وأمان.</p>
<h3>إجراءات الكاشير:</h3>
<ul>
<li>افتتاح وإغلاق الكاشير</li>
<li>التعامل مع المدفوعات</li>
<li>إصدار الفواتير</li>
<li>إدارة التناقضات</li>
</ul>'
WHERE title ILIKE '%caisse%' OR title ILIKE '%cash%' OR title ILIKE '%cashier%';

-- Update modules related to product knowledge
UPDATE modules
SET
    title_ar = 'معرفة المنتجات',
    description_ar = 'فهم عميق لمجموعة منتجاتنا',
    content_ar = '<h2>معرفة المنتجات</h2>
<p>تعرف على منتجاتنا لخدمة العملاء بشكل أفضل.</p>
<h3>ما يجب معرفته:</h3>
<ul>
<li>ميزات وفوائد المنتج</li>
<li>التسعير والعروض الترويجية</li>
<li>إرشادات الاستخدام</li>
<li>البدائل والمنتجات التكميلية</li>
</ul>'
WHERE title ILIKE '%produit%' OR title ILIKE '%product%';

-- ========================================
-- 5. Add comments for documentation
-- ========================================
COMMENT ON COLUMN training_paths.name_ar IS 'Arabic translation of the training path name';
COMMENT ON COLUMN training_paths.description_ar IS 'Arabic translation of the training path description';
COMMENT ON COLUMN modules.title_ar IS 'Arabic translation of the module title';
COMMENT ON COLUMN modules.description_ar IS 'Arabic translation of the module description';
COMMENT ON COLUMN modules.content_ar IS 'Arabic translation of the module content (HTML)';

COMMIT;

-- ========================================
-- Migration completed successfully
-- ========================================
-- Note: This migration adds Arabic language support to the entire platform.
-- After running this script:
-- 1. All training paths will have Arabic translations
-- 2. All existing modules will have placeholder Arabic content
-- 3. You can customize the translations through the admin interface
-- 4. New modules should include both French and Arabic content
