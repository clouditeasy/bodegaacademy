import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Presentation, AlertCircle, CheckCircle } from 'lucide-react';
import { azureStorage } from '../../lib/azureStorage';
import { useTranslation } from '../../hooks/useTranslation';

interface PresentationUploadProps {
  onPresentationUploaded: (url: string, type: 'pdf' | 'powerpoint') => void;
  currentPresentationUrl?: string;
  currentPresentationType?: 'pdf' | 'powerpoint';
  onRemovePresentation: () => void;
}

export function PresentationUpload({
  onPresentationUploaded,
  currentPresentationUrl,
  currentPresentationType,
  onRemovePresentation
}: PresentationUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAzureConfigured = azureStorage.isConfigured();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type by extension
    const fileName = file.name.toLowerCase();
    const pdfExtensions = ['.pdf'];
    const powerpointExtensions = ['.ppt', '.pptx'];
    const allExtensions = [...pdfExtensions, ...powerpointExtensions];

    const hasValidExtension = allExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      setError('Format de fichier non supporté. Utilisez: PDF, PPT, PPTX');
      return;
    }

    // Determine presentation type
    const isPdf = pdfExtensions.some(ext => fileName.endsWith(ext));
    const presentationType: 'pdf' | 'powerpoint' = isPdf ? 'pdf' : 'powerpoint';

    // Check if Azure is configured
    if (!isAzureConfigured) {
      setError('Azure Blob Storage n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      return;
    }

    // Validate file size (100MB max for presentations)
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    const maxSizeMB = 100;
    const maxSize = maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux (${fileSizeMB}MB). Taille maximale: ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create unique filename
      const timestamp = new Date().getTime();
      const filename = `presentation_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      console.log('Starting Azure upload:', filename);

      // Upload to Azure with progress tracking
      const publicUrl = await azureStorage.uploadFile(
        file,
        filename,
        (progress) => setUploadProgress(progress)
      );

      console.log('Azure upload successful:', publicUrl);

      onPresentationUploaded(publicUrl, presentationType);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!currentPresentationUrl) return;

    try {
      // Always try to delete, but handle 404 gracefully
      const fileName = azureStorage.extractFileNameFromUrl(currentPresentationUrl);
      console.log('Tentative de suppression du fichier:', fileName);

      await azureStorage.deleteFile(fileName);
      console.log('Fichier supprimé avec succès:', fileName);

      // Always call onRemovePresentation to update the UI
      onRemovePresentation();
    } catch (err: any) {
      // If it's a 404 (file not found), it's normal - just log it and continue
      if (err?.statusCode === 404 || err?.code === 'BlobNotFound') {
        console.warn('Fichier non trouvé - probablement de l\'ancien Storage Account:', currentPresentationUrl);
        onRemovePresentation(); // Still update UI
      } else {
        console.error('Delete error:', err);
        setError('Erreur lors de la suppression');
      }
    }
  };

  const getPresentationIcon = () => {
    if (currentPresentationType === 'pdf') {
      return <FileText className="h-5 w-5 text-green-600" />;
    }
    return <Presentation className="h-5 w-5 text-green-600" />;
  };

  const getPresentationTypeName = () => {
    if (currentPresentationType === 'pdf') {
      return 'PDF';
    }
    return 'PowerPoint';
  };

  if (currentPresentationUrl && !uploading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {t('upload.presentation_uploaded')} ({getPresentationTypeName()})
              </p>
              <p className="text-xs text-green-600">{t('upload.presentation_ready')}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
            title={t('upload.remove_presentation')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Show configuration error if Azure is not configured
  if (!isAzureConfigured) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">{t('upload.azure_not_configured')}</p>
            <p className="text-xs text-red-600 mt-1">
              {t('upload.azure_config_help')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          uploading
            ? 'border-orange-300 bg-orange-50'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
        }`}>
          {uploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-orange-600 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">{t('upload.upload_in_progress')}</p>
                <p className="text-xs text-orange-700">{uploadProgress}% {t('upload.percent_complete')}</p>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Presentation className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('upload.upload_presentation')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('upload.drag_drop_or_click')}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  PDF, PPT, PPTX • Max 100MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-2">
        <div>
          <p className="font-medium">{t('upload.supported_formats')}</p>
          <p>{t('upload.presentation_formats')}</p>
        </div>
      </div>
    </div>
  );
}