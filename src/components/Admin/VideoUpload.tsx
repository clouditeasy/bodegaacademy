import React, { useState, useRef } from 'react';
import { Upload, X, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { azureStorage } from '../../lib/azureStorage';

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void;
  currentVideoUrl?: string;
  onRemoveVideo: () => void;
}

export function VideoUpload({ onVideoUploaded, currentVideoUrl, onRemoveVideo }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAzureConfigured = azureStorage.isConfigured();

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

    try {
      // Always try to delete, but handle 404 gracefully
      const fileName = azureStorage.extractFileNameFromUrl(currentVideoUrl);
      console.log('Tentative de suppression du fichier:', fileName);

      await azureStorage.deleteFile(fileName);
      console.log('Fichier supprimé avec succès:', fileName);

      // Always call onRemoveVideo to update the UI
      onRemoveVideo();
    } catch (err: any) {
      // If it's a 404 (file not found), it's normal - just log it and continue
      if (err?.statusCode === 404 || err?.code === 'BlobNotFound') {
        console.warn('Fichier non trouvé - probablement de l\'ancien Storage Account:', currentVideoUrl);
        onRemoveVideo(); // Still update UI
      } else {
        console.error('Delete error:', err);
        setError('Erreur lors de la suppression');
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
              <p className="text-sm font-medium text-green-800">Vidéo téléchargée sur Azure</p>
              <p className="text-xs text-green-600">Fichier prêt pour l'intégration</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
            title="Supprimer la vidéo"
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
            <p className="text-sm font-medium text-red-800">Azure Blob Storage non configuré</p>
            <p className="text-xs text-red-600 mt-1">
              Ajoutez les variables VITE_AZURE_STORAGE_ACCOUNT et VITE_AZURE_SAS_TOKEN à votre fichier .env
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
                <p className="text-sm font-medium text-orange-900">Téléchargement en cours...</p>
                <p className="text-xs text-orange-700">{uploadProgress}% terminé</p>
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
                <p className="text-sm font-medium text-gray-900">Télécharger une vidéo</p>
                <p className="text-xs text-gray-500 mt-1">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  MP4, AVI, MOV, WMV, MKV, WebM • Max 4GB
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
          <p className="font-medium">Formats supportés:</p>
          <p>MP4 (recommandé), AVI, MOV, WMV, MKV, WebM</p>
          <p className="mt-1">Taille maximale: 4GB (Azure Blob Storage)</p>
        </div>

        <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-200">
          <p className="font-medium text-blue-800">💡 Conseils d'optimisation :</p>
          <ul className="text-blue-700 mt-1 list-disc list-inside space-y-1">
            <li>Résolution recommandée : 1080p (1920x1080)</li>
            <li>Codec recommandé : H.264 pour une compatibilité maximale</li>
            <li>Bitrate : 2-8 Mbps selon la qualité souhaitée</li>
            <li>Les fichiers volumineux sont supportés (jusqu'à 4GB)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}