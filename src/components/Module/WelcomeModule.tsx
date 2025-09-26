import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, ArrowRight, Play } from 'lucide-react';
import { supabase, UserProgress } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface WelcomeModuleProps {
  onComplete: () => void;
  userProfile: any;
}

export function WelcomeModule({ onComplete, userProfile }: WelcomeModuleProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      // First, find the welcome module ID
      const { data: welcomeModule, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('category', 'welcome')
        .eq('is_mandatory', true)
        .single();

      if (moduleError || !welcomeModule) {
        console.log('Welcome module not found, will create progress when needed');
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', welcomeModule.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgress(data);
        // Si le module est déjà en cours, reprendre à l'étape suivante
        if (data.status === 'in_progress') {
          setCurrentStep(2);
        }
      }
    } catch (error) {
      console.error('Error fetching welcome module progress:', error);
    }
  };

  const updateProgress = async (step: number, completed: boolean = false) => {
    if (!user) return;

    setLoading(true);
    try {
      // First, find the welcome module ID
      const { data: welcomeModule, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('category', 'welcome')
        .eq('is_mandatory', true)
        .single();

      if (moduleError || !welcomeModule) {
        console.error('Welcome module not found:', moduleError);
        onComplete(); // Continue anyway
        return;
      }

      const status = completed ? 'completed' : 'in_progress';
      const score = completed ? 100 : null;

      const progressData = {
        user_id: user.id,
        module_id: welcomeModule.id,
        status,
        score,
        attempts: 1,
        updated_at: new Date().toISOString(),
        ...(completed && { completed_at: new Date().toISOString() })
      };

      if (progress) {
        const { error } = await supabase
          .from('user_progress')
          .update(progressData)
          .eq('id', progress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            ...progressData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      if (completed) {
        // Mark welcome module as completed locally
        localStorage.setItem(`welcome_completed_${user.id}`, 'true');
        onComplete();
      } else {
        setCurrentStep(step + 1);
      }
    } catch (error) {
      console.error('Error updating welcome module progress:', error);
      // Mark as completed locally even if DB update failed
      if (completed) {
        localStorage.setItem(`welcome_completed_${user.id}`, 'true');
      }
      // Continue anyway to not block the user
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const getJobRoleDisplayName = (jobRole: string) => {
    const jobRoles: Record<string, string> = {
      // Store Operations
      'manager': 'Manager',
      'supervisor': 'Supervisor',
      'cashier': 'Cashier',
      'sales_associate': 'Sales Associate',
      'customer_service': 'Customer Service',
      // Warehouse
      'warehouse_manager': 'Warehouse Manager',
      'inventory_specialist': 'Inventory Specialist',
      'picker_packer': 'Picker/Packer',
      'receiving_clerk': 'Receiving Clerk',
      'shipping_clerk': 'Shipping Clerk',
      // Corporate
      'hr': 'Human Resources',
      'admin': 'Administration',
      'finance': 'Finance',
      'marketing': 'Marketing',
      'it_support': 'IT Support'
    };
    return jobRoles[jobRole] || jobRole;
  };

  const getJobRoleWelcomeMessage = (jobRole: string) => {
    const messages: Record<string, string> = {
      // Store Operations
      'manager': 'As a Store Manager, you lead by example and ensure exceptional customer experiences. Explore our modules on leadership, operations management, and team development.',

      'supervisor': 'Your supervisory role is key to daily operations success. Access our training on team coordination, process optimization, and quality assurance.',

      'cashier': 'You\'re the final touchpoint in our customer journey. Discover our modules on customer service excellence, payment processing, and upselling techniques.',

      'sales_associate': 'You help customers find exactly what they need. Learn about product knowledge, sales techniques, and building lasting customer relationships.',

      'customer_service': 'You solve problems and create positive experiences. Access training on conflict resolution, communication skills, and service recovery.',

      // Warehouse
      'warehouse_manager': 'You optimize our supply chain efficiency. Explore modules on warehouse operations, team management, and safety protocols.',

      'inventory_specialist': 'Your accuracy keeps our operations flowing smoothly. Learn about inventory management systems, cycle counting, and demand forecasting.',

      'picker_packer': 'You ensure orders are fulfilled accurately and efficiently. Access training on picking accuracy, packaging standards, and safety procedures.',

      'receiving_clerk': 'You\'re the first line in our supply chain. Learn about receiving procedures, quality inspection, and inventory tracking.',

      'shipping_clerk': 'You ensure orders reach customers on time. Discover modules on shipping procedures, carrier management, and delivery tracking.',

      // Corporate
      'hr': 'You shape our company culture and develop our people. Explore training on talent management, employee relations, and HR best practices.',

      'admin': 'Your administrative support keeps everything running smoothly. Access modules on office management, communication tools, and process efficiency.',

      'finance': 'Your financial expertise guides our strategic decisions. Learn about budgeting, financial analysis, and reporting standards.',

      'marketing': 'You build our brand and attract customers. Discover modules on marketing strategy, digital marketing, and customer engagement.',

      'it_support': 'You keep our technology infrastructure running. Access training on system maintenance, user support, and security protocols.'
    };
    return messages[jobRole] || 'We\'re excited to welcome you to the Bodega Academy family and support you on your personalized learning journey.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">BA</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Module
          </h1>
          <p className="text-gray-600">
            Your first step towards excellence
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
            <span className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome {userProfile?.full_name}!
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                We're excited to welcome you to the Bodega Academy family.
                This welcome module will introduce you to our training approach
                and guide you to the resources best suited for your role.
              </p>
              <div className="bg-orange-50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Your profile:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <p className="font-medium text-gray-900">
                      {getJobRoleDisplayName(userProfile?.job_role)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <p className="font-medium text-gray-900">
                      {userProfile?.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Your Personalized Journey
              </h2>
              <div className="mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-3">
                    {getJobRoleDisplayName(userProfile?.job_role)}
                  </h3>
                  <p className="text-orange-100">
                    {getJobRoleWelcomeMessage(userProfile?.job_role)}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Required Modules</h4>
                    <p className="text-sm text-gray-600">Essential training for everyone</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Role-Specific Modules</h4>
                    <p className="text-sm text-gray-600">Specialized for your position</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Play className="h-6 w-6 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Optional Modules</h4>
                    <p className="text-sm text-gray-600">To expand your skills</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How It Works
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Follow your recommended modules</h3>
                    <p className="text-gray-600">
                      Your dashboard shows priority training based on your profile.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Learn at your own pace</h3>
                    <p className="text-gray-600">
                      Each module combines videos, documents, and interactive quizzes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Validate your knowledge</h3>
                    <p className="text-gray-600">
                      Earn certificates and track your progress in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Congratulations!
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                You've completed your welcome module.
                You're now ready to begin your personalized training journey.
              </p>
              <div className="bg-orange-50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">Next steps:</h3>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Access your personalized dashboard</li>
                  <li>✓ Discover your recommended modules</li>
                  <li>✓ Start with priority training</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center mt-8">
            {currentStep < totalSteps ? (
              <button
                onClick={() => updateProgress(currentStep)}
                disabled={loading}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => updateProgress(currentStep, true)}
                disabled={loading}
                className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Complete Module
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}