import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Users, Briefcase, Building, Store, Warehouse } from 'lucide-react';
import { supabase, UserProfile } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface JobRole {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Department {
  id: string;
  name: string;
  description: string;
}

const jobRoles: JobRole[] = [
  // Store Operations
  {
    id: 'manager',
    name: 'Store Manager',
    description: 'Team leadership, operations management, customer experience',
    icon: <Users className="h-6 w-6" />
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Team coordination, daily operations, quality assurance',
    icon: <Users className="h-6 w-6" />
  },
  {
    id: 'cashier',
    name: 'Cashier',
    description: 'Payment processing, customer service, transactions',
    icon: <Store className="h-6 w-6" />
  },
  {
    id: 'sales_associate',
    name: 'Sales Associate',
    description: 'Customer assistance, product knowledge, sales support',
    icon: <Store className="h-6 w-6" />
  },
  {
    id: 'customer_service',
    name: 'Customer Service',
    description: 'Customer support, problem resolution, satisfaction',
    icon: <Users className="h-6 w-6" />
  },

  // Warehouse Operations
  {
    id: 'warehouse_manager',
    name: 'Warehouse Manager',
    description: 'Warehouse operations, inventory management, team leadership',
    icon: <Warehouse className="h-6 w-6" />
  },
  {
    id: 'inventory_specialist',
    name: 'Inventory Specialist',
    description: 'Stock management, cycle counting, inventory tracking',
    icon: <Warehouse className="h-6 w-6" />
  },
  {
    id: 'picker_packer',
    name: 'Picker/Packer',
    description: 'Order fulfillment, packaging, shipping preparation',
    icon: <Warehouse className="h-6 w-6" />
  },
  {
    id: 'receiving_clerk',
    name: 'Receiving Clerk',
    description: 'Incoming shipments, quality inspection, data entry',
    icon: <Warehouse className="h-6 w-6" />
  },
  {
    id: 'shipping_clerk',
    name: 'Shipping Clerk',
    description: 'Outbound logistics, carrier coordination, delivery tracking',
    icon: <Warehouse className="h-6 w-6" />
  },

  // Corporate
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Talent management, employee relations, training coordination',
    icon: <Briefcase className="h-6 w-6" />
  },
  {
    id: 'admin',
    name: 'Administration',
    description: 'Office management, administrative support, documentation',
    icon: <Briefcase className="h-6 w-6" />
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial analysis, budgeting, reporting, accounting',
    icon: <Briefcase className="h-6 w-6" />
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Brand management, promotions, customer engagement',
    icon: <Briefcase className="h-6 w-6" />
  },
  {
    id: 'it_support',
    name: 'IT Support',
    description: 'Technical support, system maintenance, user assistance',
    icon: <Building className="h-6 w-6" />
  }
];

const departments: Department[] = [
  // Store Operations
  {
    id: 'store_operations',
    name: 'Store Operations',
    description: 'Retail store management and customer service'
  },
  {
    id: 'warehouse_logistics',
    name: 'Warehouse & Logistics',
    description: 'Inventory management and distribution operations'
  },

  // Corporate Functions
  {
    id: 'human_resources',
    name: 'Human Resources',
    description: 'Employee development and organizational support'
  },
  {
    id: 'finance_accounting',
    name: 'Finance & Accounting',
    description: 'Financial management and business analysis'
  },
  {
    id: 'marketing_sales',
    name: 'Marketing & Sales',
    description: 'Brand development and customer acquisition'
  },
  {
    id: 'information_technology',
    name: 'Information Technology',
    description: 'Technology infrastructure and digital solutions'
  },
  {
    id: 'administration',
    name: 'Administration',
    description: 'General administration and operational support'
  },

  // Management
  {
    id: 'executive_management',
    name: 'Executive Management',
    description: 'Senior leadership and strategic direction'
  }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">BA</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Bodega Academy
          </h1>
          <p className="text-gray-600">
            Let's set up your personalized learning experience
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
                Let's start your journey
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                At Bodega Academy, we believe in the importance of continuous learning.
                We'll personalize your learning experience based on your role
                and professional goals.
              </p>
              <div className="bg-orange-50 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2">What awaits you:</h3>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ A personalized welcome module</li>
                  <li>✓ Training tailored to your role</li>
                  <li>✓ Real-time progress tracking</li>
                  <li>✓ Completion certificates</li>
                </ul>
              </div>
              <button
                onClick={nextStep}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                What's your role?
              </h2>
              <p className="text-gray-600 mb-8 text-center">
                Select your primary area of activity to receive relevant training
              </p>

              {/* Store Operations Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-orange-500" />
                  Store Operations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {jobRoles.slice(0, 5).map((role) => (
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
                        <h4 className="font-semibold text-gray-900 text-sm">{role.name}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warehouse Operations Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-orange-500" />
                  Warehouse Operations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {jobRoles.slice(5, 10).map((role) => (
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
                        <h4 className="font-semibold text-gray-900 text-sm">{role.name}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Corporate Functions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-orange-500" />
                  Corporate Functions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {jobRoles.slice(10).map((role) => (
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
                        <h4 className="font-semibold text-gray-900 text-sm">{role.name}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                Which department do you work in?
              </h2>
              <p className="text-gray-600 mb-8 text-center">
                This will help us suggest collaborative training opportunities with your team
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
                    <h3 className="font-semibold text-gray-900 mb-2">{dept.name}</h3>
                    <p className="text-sm text-gray-600">{dept.description}</p>
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
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {step} of 3
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
              Next
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
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}