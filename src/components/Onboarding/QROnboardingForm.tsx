import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { QROnboardingService } from '../../services/qrOnboardingService';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  jobRole: string;
  password: string;
  confirmPassword: string;
}

const jobRoleOptions = [
  { id: 'manager', label: 'Manager' },
  { id: 'service', label: 'Service' },
  { id: 'bar', label: 'Bar' },
  { id: 'cuisine', label: 'Cuisine' },
];

export function QROnboardingForm() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [validating, setValidating] = useState(true);
  const [qrCodeValid, setQrCodeValid] = useState(false);
  const [qrCodeId, setQrCodeId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    jobRole: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    validateQRCode();
  }, [code]);

  const validateQRCode = async () => {
    if (!code) {
      setError('Code QR manquant');
      setValidating(false);
      return;
    }

    try {
      const result = await QROnboardingService.validateQRCode(code);

      if (result.valid && result.qrCode) {
        setQrCodeValid(true);
        setQrCodeId(result.qrCode.id);
      } else {
        setError(result.reason || 'Code QR invalide');
      }
    } catch (err) {
      console.error('Error validating QR code:', err);
      setError('Erreur lors de la validation du code QR');
    } finally {
      setValidating(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'Le prénom est requis';
    if (!formData.lastName.trim()) return 'Le nom est requis';
    if (!formData.email.trim()) return 'L\'email est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Email invalide';
    if (!formData.birthDate) return 'La date de naissance est requise';
    if (!formData.jobRole) return 'Le poste est requis';
    if (formData.password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    if (formData.password !== formData.confirmPassword) return 'Les mots de passe ne correspondent pas';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Create user account with auto-confirm
      // NOTE: Requires "Enable email confirmations" to be DISABLED in Supabase Dashboard
      // (Authentication → Providers → Email → uncheck "Confirm email")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // With auto-confirm enabled, the user should be automatically signed in
      if (!authData.session) {
        throw new Error('La session n\'a pas été créée automatiquement. Vérifiez que la confirmation email est désactivée dans les paramètres Supabase.');
      }

      // Create or update user profile with onboarding data
      // Use upsert to handle case where profile is auto-created by Supabase trigger
      const { error: profileError } = await supabase.from('user_profiles')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`,
          role: 'employee',
          job_role: formData.jobRole,
          birth_date: formData.birthDate,
          onboarded_via_qr: true,
          has_completed_onboarding: false, // Will be completed after assessment
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Increment QR code usage
      if (qrCodeId) {
        await QROnboardingService.incrementQRCodeUsage(qrCodeId);
      }

      // Redirect to assessment
      navigate(`/onboarding/${code}/assessment`, {
        state: {
          userId: authData.user.id,
          jobRole: formData.jobRole,
          qrCodeId
        }
      });
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message || 'Erreur lors de la création du compte');
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Validation du code QR...</p>
        </div>
      </div>
    );
  }

  if (!qrCodeValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Code QR invalide
          </h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <p className="text-sm text-gray-500 text-center">
            Veuillez contacter votre administrateur pour obtenir un nouveau code QR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-4">
            <img
              src="/logo-bodega.jpg"
              alt="Bodega Academy"
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain rounded-lg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Bienvenue chez Bodega Academy
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Créez votre compte pour commencer votre parcours de formation
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de naissance *
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poste *
            </label>
            <select
              value={formData.jobRole}
              onChange={(e) => handleInputChange('jobRole', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-base"
              required
            >
              <option value="">Sélectionnez un poste</option>
              {jobRoleOptions.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Création du compte...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Créer mon compte et continuer
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            En créant votre compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </form>
      </div>
    </div>
  );
}
