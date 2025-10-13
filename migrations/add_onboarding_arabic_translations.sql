-- Migration: Add Arabic translation columns for onboarding
-- This migration adds Arabic (_ar) columns to support bilingual onboarding

-- 1. Add Arabic columns to user_profiles for job roles and departments
-- Note: job_role and department store keys, translations are in the app

-- 2. Create job_roles reference table with translations
CREATE TABLE IF NOT EXISTS job_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  category TEXT NOT NULL, -- 'store', 'warehouse', 'corporate'
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create departments reference table with translations
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Insert job roles with Arabic translations

-- Store Operations
INSERT INTO job_roles (id, name, name_ar, description, description_ar, category, icon) VALUES
  ('manager', 'Store Manager', 'مدير المحل', 'Team leadership, operations management, customer experience', 'قيادة الفريق، إدارة العمليات، تجربة العملاء', 'store', 'Users'),
  ('supervisor', 'Supervisor', 'المشرف', 'Team coordination, daily operations, quality assurance', 'تنسيق الفريق، العمليات اليومية، ضمان الجودة', 'store', 'Users'),
  ('cashier', 'Cashier', 'الكاشير', 'Payment processing, customer service, transactions', 'معالجة المدفوعات، خدمة العملاء، المعاملات', 'store', 'Store'),
  ('sales_associate', 'Sales Associate', 'مساعد المبيعات', 'Customer assistance, product knowledge, sales support', 'مساعدة العملاء، معرفة المنتجات، دعم المبيعات', 'store', 'Store'),
  ('customer_service', 'Customer Service', 'خدمة العملاء', 'Customer support, problem resolution, satisfaction', 'دعم العملاء، حل المشاكل، الرضا', 'store', 'Users')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  category = EXCLUDED.category;

-- Warehouse Operations
INSERT INTO job_roles (id, name, name_ar, description, description_ar, category, icon) VALUES
  ('warehouse_manager', 'Warehouse Manager', 'مدير المخزن', 'Warehouse operations, inventory management, team leadership', 'عمليات المخزن، إدارة المخزون، قيادة الفريق', 'warehouse', 'Warehouse'),
  ('inventory_specialist', 'Inventory Specialist', 'أخصائي المخزون', 'Stock management, cycle counting, inventory tracking', 'إدارة المخزون، الجرد الدوري، تتبع المخزون', 'warehouse', 'Warehouse'),
  ('picker_packer', 'Picker/Packer', 'التجميع والتعبئة', 'Order fulfillment, packaging, shipping preparation', 'تنفيذ الطلبات، التعبئة، الإعداد للشحن', 'warehouse', 'Warehouse'),
  ('receiving_clerk', 'Receiving Clerk', 'موظف الاستلام', 'Incoming shipments, quality inspection, data entry', 'الشحنات الواردة، فحص الجودة، إدخال البيانات', 'warehouse', 'Warehouse'),
  ('shipping_clerk', 'Shipping Clerk', 'موظف الشحن', 'Outbound logistics, carrier coordination, delivery tracking', 'اللوجستيات الصادرة، تنسيق الناقل، تتبع التسليم', 'warehouse', 'Warehouse')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  category = EXCLUDED.category;

-- Corporate Functions
INSERT INTO job_roles (id, name, name_ar, description, description_ar, category, icon) VALUES
  ('hr', 'Human Resources', 'الموارد البشرية', 'Talent management, employee relations, training coordination', 'إدارة المواهب، علاقات الموظفين، تنسيق التدريب', 'corporate', 'Briefcase'),
  ('admin', 'Administration', 'الإدارة', 'Office management, administrative support, documentation', 'إدارة المكتب، الدعم الإداري، التوثيق', 'corporate', 'Briefcase'),
  ('finance', 'Finance', 'المالية', 'Financial analysis, budgeting, reporting, accounting', 'التحليل المالي، الميزانية، التقارير، المحاسبة', 'corporate', 'Briefcase'),
  ('marketing', 'Marketing', 'التسويق', 'Brand management, promotions, customer engagement', 'إدارة العلامة التجارية، الترويج، التفاعل مع العملاء', 'corporate', 'Briefcase'),
  ('it_support', 'IT Support', 'الدعم التقني', 'Technical support, system maintenance, user assistance', 'الدعم الفني، صيانة النظام، مساعدة المستخدم', 'corporate', 'Building')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  category = EXCLUDED.category;

-- 5. Insert departments with Arabic translations

-- Store Operations
INSERT INTO departments (id, name, name_ar, description, description_ar) VALUES
  ('store_operations', 'Store Operations', 'عمليات المحل', 'Retail store management and customer service', 'إدارة متاجر التجزئة وخدمة العملاء')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar;

-- Warehouse & Logistics
INSERT INTO departments (id, name, name_ar, description, description_ar) VALUES
  ('warehouse_logistics', 'Warehouse & Logistics', 'المخزن واللوجستيات', 'Inventory management and distribution operations', 'إدارة المخزون وعمليات التوزيع')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar;

-- Corporate Functions
INSERT INTO departments (id, name, name_ar, description, description_ar) VALUES
  ('human_resources', 'Human Resources', 'الموارد البشرية', 'Employee development and organizational support', 'تطوير الموظفين والدعم التنظيمي'),
  ('finance_accounting', 'Finance & Accounting', 'المالية والمحاسبة', 'Financial management and business analysis', 'الإدارة المالية وتحليل الأعمال'),
  ('marketing_sales', 'Marketing & Sales', 'التسويق والمبيعات', 'Brand development and customer acquisition', 'تطوير العلامة التجارية واكتساب العملاء'),
  ('information_technology', 'Information Technology', 'تكنولوجيا المعلومات', 'Technology infrastructure and digital solutions', 'البنية التحتية التكنولوجية والحلول الرقمية'),
  ('administration', 'Administration', 'الإدارة', 'General administration and operational support', 'الإدارة العامة والدعم التشغيلي'),
  ('executive_management', 'Executive Management', 'الإدارة التنفيذية', 'Senior leadership and strategic direction', 'القيادة العليا والتوجه الاستراتيجي')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar;

-- 6. Enable RLS on new tables
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for read access (anyone can read reference data)
CREATE POLICY "Job roles are viewable by everyone" ON job_roles
  FOR SELECT USING (true);

CREATE POLICY "Departments are viewable by everyone" ON departments
  FOR SELECT USING (true);

-- 8. Create policies for admin write access
CREATE POLICY "Job roles are editable by admins" ON job_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Departments are editable by admins" ON departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 9. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_roles_category ON job_roles(category);
CREATE INDEX IF NOT EXISTS idx_departments_id ON departments(id);

COMMENT ON TABLE job_roles IS 'Reference table for job roles with French and Arabic translations';
COMMENT ON TABLE departments IS 'Reference table for departments with French and Arabic translations';
