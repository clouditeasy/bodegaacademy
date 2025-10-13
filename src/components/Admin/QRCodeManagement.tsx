import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Plus, Download, Trash2, AlertCircle, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { OnboardingQRCode } from '../../lib/supabase';
import { QROnboardingService } from '../../services/qrOnboardingService';
import { useAuth } from '../../hooks/useAuth';

interface QRCodeManagementProps {
  onBack: () => void;
}

export function QRCodeManagement({ onBack }: QRCodeManagementProps) {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<OnboardingQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [expiresInHours, setExpiresInHours] = useState<number>(72); // 3 days default
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const codes = await QROnboardingService.getAllQRCodes();
      setQrCodes(codes);
    } catch (err) {
      console.error('Error fetching QR codes:', err);
      setError('Erreur lors du chargement des codes QR');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQRCode = async () => {
    if (!user) return;

    setCreating(true);
    setError(null);

    try {
      await QROnboardingService.generateQRCode(user.id, {
        expiresInHours: expiresInHours || undefined,
        maxUses: maxUses || undefined,
        description: description || undefined,
      });

      // Reset form
      setExpiresInHours(72);
      setMaxUses(undefined);
      setDescription('');
      setShowCreateForm(false);

      // Refresh list
      await fetchQRCodes();
    } catch (err) {
      console.error('Error creating QR code:', err);
      setError('Erreur lors de la création du code QR');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (qrCodeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce code QR ?')) return;

    try {
      await QROnboardingService.deactivateQRCode(qrCodeId);
      await fetchQRCodes();
    } catch (err) {
      console.error('Error deactivating QR code:', err);
      setError('Erreur lors de la désactivation du code QR');
    }
  };

  const handleDelete = async (qrCodeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code QR ? Cette action est irréversible.')) return;

    try {
      await QROnboardingService.deleteQRCode(qrCodeId);
      await fetchQRCodes();
    } catch (err) {
      console.error('Error deleting QR code:', err);
      setError('Erreur lors de la suppression du code QR');
    }
  };

  const downloadQRCode = (code: string, description?: string) => {
    const svg = document.getElementById(`qr-${code}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-onboarding-${description || code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const getQRCodeURL = (code: string) => {
    return `${window.location.origin}/onboarding/${code}`;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxedOut = (qrCode: OnboardingQRCode) => {
    return qrCode.max_uses ? qrCode.current_uses >= qrCode.max_uses : false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des codes QR</h1>
            <p className="text-gray-600 mt-1">Créez et gérez les codes QR pour l'onboarding des employés</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouveau code QR
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Créer un nouveau code QR</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Session de formation Mars 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration (heures)
              </label>
              <input
                type="number"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Le code expirera dans {expiresInHours} heures ({Math.round(expiresInHours / 24)} jours)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum d'utilisations (optionnel)
              </label>
              <input
                type="number"
                value={maxUses || ''}
                onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : undefined)}
                min="1"
                placeholder="Illimité"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Laissez vide pour un nombre illimité d'utilisations
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateQRCode}
                disabled={creating}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Création...' : 'Créer le code QR'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Codes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode) => {
          const expired = isExpired(qrCode.expires_at);
          const maxedOut = isMaxedOut(qrCode);
          const isValid = qrCode.is_active && !expired && !maxedOut;

          return (
            <div
              key={qrCode.id}
              className={`bg-white rounded-lg shadow-lg p-6 ${
                !isValid ? 'opacity-60' : ''
              }`}
            >
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <QRCodeSVG
                    id={`qr-${qrCode.code}`}
                    value={getQRCodeURL(qrCode.code)}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mb-4">
                {isValid ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    <XCircle className="h-4 w-4" />
                    {expired ? 'Expiré' : maxedOut ? 'Limite atteinte' : 'Inactif'}
                  </span>
                )}
              </div>

              {/* Description */}
              {qrCode.description && (
                <p className="text-center text-gray-900 font-medium mb-3">
                  {qrCode.description}
                </p>
              )}

              {/* Code */}
              <p className="text-center text-sm text-gray-600 font-mono mb-4 break-all">
                {qrCode.code}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Créé le {new Date(qrCode.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {qrCode.expires_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expire le {new Date(qrCode.expires_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {qrCode.current_uses} utilisations
                    {qrCode.max_uses ? ` / ${qrCode.max_uses}` : ''}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadQRCode(qrCode.code, qrCode.description)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
                {qrCode.is_active && (
                  <button
                    onClick={() => handleDeactivate(qrCode.id)}
                    className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Désactiver
                  </button>
                )}
                <button
                  onClick={() => handleDelete(qrCode.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {qrCodes.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun code QR créé
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier code QR pour commencer à onboarder des employés
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Créer un code QR
          </button>
        </div>
      )}
    </div>
  );
}
