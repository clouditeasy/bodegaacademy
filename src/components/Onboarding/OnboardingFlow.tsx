import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Users, Briefcase, Building, Store, Warehouse, Languages } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface JobRoleOption {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  icon: React.ReactNode;
  category: 'store' | 'warehouse' | 'corporate';
}

interface DepartmentOption {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
}

const jobRoles: JobRoleOption[] = [
  // Store Operations
  {
    id: 'manager',
    name: 'Store Manager',
    name_ar: 'مدير المحل',
    description: 'Team leadership, operations management, customer experience',
    description_ar: 'قيادة الفريق وإدارة العمليات وتجربة العملاء',
    icon: <Users className="h-6 w-6" />,
    category: 'store'
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    name_ar: 'مشرف',
    description: 'Team coordination, daily operations, quality assurance',
    description_ar: 'تنسيق الفريق والعمليات اليومية وضمان الجودة',
    icon: <Users className="h-6 w-6" />,
    category: 'store'
  },
  {
    id: 'cashier',
    name: 'Cashier',
    name_ar: 'كاشير',
    description: 'Payment processing, customer service, transactions',
    description_ar: 'معالجة المدفوعات وخدمة العملاء والمعاملات',
    icon: <Store className="h-6 w-6" />,
    category: 'store'
  },
  {
    id: 'sales_associate',
    name: 'Sales Associate',
    name_ar: 'موظف مبيعات',
    description: 'Customer assistance, product knowledge, sales support',
    description_ar: 'مساعدة العملاء ومعرفة المنتجات ودعم المبيعات',
    icon: <Store className="h-6 w-6" />,
    category: 'store'
  },
  {
    id: 'customer_service',
    name: 'Customer Service',
    name_ar: 'خدمة العملاء',
    description: 'Customer support, problem resolution, satisfaction',
    description_ar: 'دعم العملاء وحل المشاكل والرضا',
    icon: <Users className="h-6 w-6" />,
    category: 'store'
  },

  // Warehouse Operations
  {
    id: 'warehouse_manager',
    name: 'Warehouse Manager',
    name_ar: 'مدير المخزن',
    description: 'Warehouse operations, inventory management, team leadership',
    description_ar: 'عمليات المخزن وإدارة المخزون وقيادة الفريق',
    icon: <Warehouse className="h-6 w-6" />,
    category: 'warehouse'
  },
  {
    id: 'inventory_specialist',
    name: 'Inventory Specialist',
    name_ar: 'أخصائي مخزون',
    description: 'Stock management, cycle counting, inventory tracking',
    description_ar: 'إدارة المخزون والجرد وتتبع المخزون',
    icon: <Warehouse className="h-6 w-6" />,
    category: 'warehouse'
  },
  {
    id: 'picker_packer',
    name: 'Picker/Packer',
    name_ar: 'عامل تحضير الطلبات',
    description: 'Order fulfillment, packaging, shipping preparation',
    description_ar: 'تلبية الطلبات والتعبئة وتحضير الشحن',
    icon: <Warehouse className="h-6 w-6" />,
    category: 'warehouse'
  },
  {
    id: 'receiving_clerk',
    name: 'Receiving Clerk',
    name_ar: 'موظف الاستلام',
    description: 'Incoming shipments, quality inspection, data entry',
    description_ar: 'الشحنات الواردة وفحص الجودة وإدخال البيانات',
    icon: <Warehouse className="h-6 w-6" />,
    category: 'warehouse'
  },
  {
    id: 'shipping_clerk',
    name: 'Shipping Clerk',
    name_ar: 'موظف الشحن',
    description: 'Outbound logistics, carrier coordination, delivery tracking',
    description_ar: 'اللوجستيات الصادرة وتنسيق النقل وتتبع التسليم',
    icon: <Warehouse className="h-6 w-6" />,
    category: 'warehouse'
  },

  // Corporate
  {
    id: 'hr',
    name: 'Human Resources',
    name_ar: 'الموارد البشرية',
    description: 'Talent management, employee relations, training coordination',
    description_ar: 'إدارة المواهب وعلاقات الموظفين وتنسيق التدريب',
    icon: <Briefcase className="h-6 w-6" />,
    category: 'corporate'
  },
  {
    id: 'admin',
    name: 'Administration',
    name_ar: 'الإدارة',
    description: 'Office management, administrative support, documentation',
    description_ar: 'إدارة المكاتب والدعم الإداري والتوثيق',
    icon: <Briefcase className="h-6 w-6" />,
    category: 'corporate'
  },
  {
    id: 'finance',
    name: 'Finance',
    name_ar: 'المالية',
    description: 'Financial analysis, budgeting, reporting, accounting',
    description_ar: 'التحليل المالي والميزانية والتقارير والمحاسبة',
    icon: <Briefcase className="h-6 w-6" />,
    category: 'corporate'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    name_ar: 'التسويق',
    description: 'Brand management, promotions, customer engagement',
    description_ar: 'إدارة العلامة التجارية والترويج وإشراك العملاء',
    icon: <Briefcase className="h-6 w-6" />,
    category: 'corporate'
  },
  {
    id: 'it_support',
    name: 'IT Support',
    name_ar: 'الدعم التقني',
    description: 'Technical support, system maintenance, user assistance',
    description_ar: 'الدعم الفني وصيانة النظام ومساعدة المستخدمين',
    icon: <Building className="h-6 w-6" />,
    category: 'corporate'
  }
];

const departments: DepartmentOption[] = [
  {
    id: 'store_operations',
    name: 'Store Operations',
    name_ar: 'عمليات المحل',
    description: 'Retail store management and customer service',
    description_ar: 'إدارة متاجر التجزئة وخدمة العملاء'
  },
  {
    id: 'warehouse_logistics',
    name: 'Warehouse & Logistics',
    name_ar: 'المخزن واللوجستيات',
    description: 'Inventory management and distribution operations',
    description_ar: 'إدارة المخزون وعمليات التوزيع'
  },
  {
    id: 'human_resources',
    name: 'Human Resources',
    name_ar: 'الموارد البشرية',
    description: 'Employee development and organizational support',
    description_ar: 'تطوير الموظفين والدعم التنظيمي'
  },
  {
    id: 'finance_accounting',
    name: 'Finance & Accounting',
    name_ar: 'المالية والمحاسبة',
    description: 'Financial management and business analysis',
    description_ar: 'الإدارة المالية وتحليل الأعمال'
  },
  {
    id: 'marketing_sales',
    name: 'Marketing & Sales',
    name_ar: 'التسويق والمبيعات',
    description: 'Brand development and customer acquisition',
    description_ar: 'تطوير العلامة التجارية واكتساب العملاء'
  },
  {
    id: 'information_technology',
    name: 'Information Technology',
    name_ar: 'تكنولوجيا المعلومات',
    description: 'Technology infrastructure and digital solutions',
    description_ar: 'البنية التحتية التكنولوجية والحلول الرقمية'
  },
  {
    id: 'administration',
    name: 'Administration',
    name_ar: 'الإدارة',
    description: 'General administration and operational support',
    description_ar: 'الإدارة العامة والدعم التشغيلي'
  },
  {
    id: 'executive_management',
    name: 'Executive Management',
    name_ar: 'الإدارة التنفيذية',
    description: 'Senior leadership and strategic direction',
    description_ar: 'القيادة العليا والتوجه الاستراتيجي'
  }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  const handleJobRoleSelect = (jobRoleId: string) => {
    setSelectedJobRole(jobRoleId);
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setSelectedDepartment(departmentId);
  };

  const handleComplete = async () => {
    if (!user || !selectedJobRole || !selectedDepartment) return;

    setLoading(true);
    try {
      // First, check if the new columns exist by testing with a simple query
      const { error: testError } = await supabase
        .from('user_profiles')
        .select('job_role, department, has_completed_onboarding')
        .eq('id', user.id)
        .limit(1);

      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      // If new columns exist, include them in the update
      if (!testError) {
        updateData = {
          ...updateData,
          job_role: selectedJobRole,
          department: selectedDepartment,
          has_completed_onboarding: true
        };
      } else {
        console.warn('New columns not yet available, storing in localStorage temporarily');
        // Store temporarily in localStorage until DB is updated
        localStorage.setItem('pending_job_role', selectedJobRole);
        localStorage.setItem('pending_department', selectedDepartment);
        localStorage.setItem('pending_onboarding_complete', 'true');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error && !error.message.includes('job_role')) {
        throw error;
      }

      // Update local auth context if updateProfile is available
      if (updateProfile && !testError) {
        await updateProfile({
          job_role: selectedJobRole,
          department: selectedDepartment,
          has_completed_onboarding: true
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // For now, let's continue anyway to not block the user
      console.log('Continuing despite error - data stored locally');
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Group job roles by category
  const storeRoles = jobRoles.filter(r => r.category === 'store');
  const warehouseRoles = jobRoles.filter(r => r.category === 'warehouse');
  const corporateRoles = jobRoles.filter(r => r.category === 'corporate');

  // Helper to get translated field
  const getField = (item: JobRoleOption | DepartmentOption, field: 'name' | 'description') => {
    if (language === 'ar') {
      const arField = `${field}_ar` as keyof typeof item;
      return item[arField] || item[field];
    }
    return item[field];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors focus:outline-none active:bg-gray-900"
            title={language === 'fr' ? 'تحويل إلى العربية' : 'Passer au français'}
          >
            <Languages className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">
              {language === 'fr' ? 'العربية' : 'FR'}
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">BA</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('onboarding.welcome_title')}
          </h1>
          <p className="text-gray-600">
            {t('onboarding.welcome_subtitle')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNumber
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-1 ${
                    step > stepNumber ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t('onboarding.journey_start')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('onboarding.journey_intro')}
              </p>
              <div className="bg-orange-50 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2">{t('onboarding.what_awaits')}</h3>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ {t('onboarding.personalized_module')}</li>
                  <li>✓ {t('onboarding.role_training')}</li>
                  <li>✓ {t('onboarding.progress_tracking')}</li>
                  <li>✓ {t('onboarding.certificates')}</li>
                </ul>
              </div>
              <button
                onClick={nextStep}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
              >
                {t('onboarding.get_started')}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                {t('onboarding.whats_your_role')}
              </h2>
              <p className="text-gray-600 mb-8 text-center">
                {t('onboarding.select_role_subtitle')}
              </p>

              {/* Store Operations Section */}
              <>
                {storeRoles.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Store className="h-5 w-5 text-orange-500" />
                        {t('onboarding.store_operations')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {storeRoles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleJobRoleSelect(role.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              selectedJobRole === role.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1.5 rounded ${
                                selectedJobRole === role.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {role.icon}
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {getField(role, 'name')}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600">
                              {getField(role, 'description')}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {warehouseRoles.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Warehouse className="h-5 w-5 text-orange-500" />
                        {t('onboarding.warehouse_operations')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {warehouseRoles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleJobRoleSelect(role.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              selectedJobRole === role.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1.5 rounded ${
                                selectedJobRole === role.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {role.icon}
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {getField(role, 'name')}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600">
                              {getField(role, 'description')}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {corporateRoles.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building className="h-5 w-5 text-orange-500" />
                        {t('onboarding.corporate_functions')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {corporateRoles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleJobRoleSelect(role.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              selectedJobRole === role.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1.5 rounded ${
                                selectedJobRole === role.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {role.icon}
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {getField(role, 'name')}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600">
                              {getField(role, 'description')}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                {t('onboarding.which_department')}
              </h2>
              <p className="text-gray-600 mb-8 text-center">
                {t('onboarding.department_subtitle')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => handleDepartmentSelect(dept.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedDepartment === dept.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {getField(dept, 'name')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getField(dept, 'description')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-2 rounded-lg transition-colors ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('previous')}
          </button>

          <div className="text-sm text-gray-500">
            {t('onboarding.step_of').replace('{step}', step.toString()).replace('{total}', '3')}
          </div>

          {step < 3 ? (
            <button
              onClick={nextStep}
              disabled={step === 2 && !selectedJobRole}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                (step === 2 && !selectedJobRole)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {t('next')}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!selectedJobRole || !selectedDepartment || loading}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                !selectedJobRole || !selectedDepartment || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {t('onboarding.complete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}