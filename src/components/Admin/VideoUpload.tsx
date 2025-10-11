import React, { useState, useRef } from 'react';
import { Upload, X, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { azureStorage } from '../../lib/azureStorage';
import { useTranslation } from '../../hooks/useTranslation';

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void;
  currentVideoUrl?: string;
  onRemoveVideo: () => void;
}

export function VideoUpload({ onVideoUploaded, currentVideoUrl, onRemoveVideo }: VideoUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAzureConfigured = azureStorage.isConfigured();

  console.log('[VideoUpload] Render - currentVideoUrl:', currentVideoUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type by extension (more reliable than MIME type)
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'];
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/wmv', 'video/mkv', 'video/webm', 'video/x-msvideo'];

    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = allowedTypes.includes(file.type) || file.type.startsWith('video/');

    if (!hasValidExtension && !hasValidType) {
      setError('Format de fichier non supporté. Utilisez: MP4, AVI, MOV, WMV, MKV, WebM');
      return;
    }

    // Check if Azure is configured
    if (!isAzureConfigured) {
      setError('Azure Blob Storage n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      return;
    }

    // Validate file size for Azure (4GB max)
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    const maxSizeMB = 4096; // 4GB for Azure
    const maxSize = maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux (${fileSizeMB}MB). Taille maximale: 4GB.`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create unique filename
      const timestamp = new Date().getTime();
      const filename = `video_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      console.log('Starting Azure upload:', filename);

      // Upload to Azure with real progress tracking
      const publicUrl = await azureStorage.uploadFile(
        file,
        filename,
        (progress) => setUploadProgress(progress)
      );

      console.log('Azure upload successful:', publicUrl);

      onVideoUploaded(publicUrl);

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
    if (!currentVideoUrl) return;

    // Update UI immediately first
    console.log('[VideoUpload] Suppression de la vidéo:', currentVideoUrl);
    onRemoveVideo();

    // Only attempt to delete Azure blob files, not YouTube or other URLs
    const isAzureBlob = currentVideoUrl.includes('blob.core.windows.net');

    if (!isAzureBlob) {
      // For YouTube or other external URLs, just remove from UI/database (already done above)
      console.log('URL externe détectée (non Azure), suppression terminée');
      return;
    }

    // Delete from Azure in background (non-blocking)
    try {
      // Clean URL: remove any SAS token or query parameters first
      const cleanUrl = currentVideoUrl.split('?')[0];
      console.log('URL nettoyée:', cleanUrl);

      const fileName = azureStorage.extractFileNameFromUrl(cleanUrl);
      console.log('Nom de fichier extrait:', fileName);

      if (!fileName) {
        console.warn('Impossible d\'extraire le nom de fichier de l\'URL:', currentVideoUrl);
        return;
      }

      await azureStorage.deleteFile(fileName);
      console.log('Fichier Azure supprimé avec succès:', fileName);
    } catch (err: any) {
      // If it's a 404 (file not found), it's normal - just log it
      if (err?.statusCode === 404 || err?.code === 'BlobNotFound') {
        console.warn('Fichier non trouvé dans Azure - probablement déjà supprimé:', currentVideoUrl);
      } else {
        console.error('Erreur lors de la suppression Azure:', err);
        setError('Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue'));
      }
    }
  };

  if (currentVideoUrl && !uploading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{t('upload.video_uploaded')}</p>
              <p className="text-xs text-green-600">{t('upload.video_ready')}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
            title={t('upload.remove_video')}
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
          accept="video/*"
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
                <Video className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('upload.upload_video')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('upload.drag_drop_or_click')}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  MP4, AVI, MOV, WMV, MKV, WebM • {t('upload.max_file_size')}
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
          <p>MP4 (recommandé), AVI, MOV, WMV, MKV, WebM</p>
          <p className="mt-1">{t('upload.max_size')}</p>
        </div>

        <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-200">
          <p className="font-medium text-blue-800">{t('upload.optimization_tips')}</p>
          <ul className="text-blue-700 mt-1 list-disc list-inside space-y-1">
            <li>{t('upload.recommended_resolution')}</li>
            <li>{t('upload.recommended_codec')}</li>
            <li>{t('upload.bitrate_tip')}</li>
            <li>{t('upload.large_files_supported')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}