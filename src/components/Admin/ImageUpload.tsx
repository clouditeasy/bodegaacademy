import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { azureStorage } from '../../lib/azureStorage';
import { useTranslation } from '../../hooks/useTranslation';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  onRemoveImage: () => void;
}

export function ImageUpload({ onImageUploaded, currentImageUrl, onRemoveImage }: ImageUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAzureConfigured = azureStorage.isConfigured();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = allowedTypes.includes(file.type) || file.type.startsWith('image/');

    if (!hasValidExtension && !hasValidType) {
      setError('Format de fichier non supporté. Utilisez: JPG, PNG, GIF, WebP, SVG');
      return;
    }

    // Check if Azure is configured
    if (!isAzureConfigured) {
      setError('Azure Blob Storage n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      return;
    }

    // Validate file size (5MB max for images)
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    const maxSizeMB = 5;
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
      const extension = fileName.substring(fileName.lastIndexOf('.'));
      const filename = `image_${timestamp}${extension}`;

      console.log('Starting Azure image upload:', filename);

      // Upload to Azure with progress tracking
      const publicUrl = await azureStorage.uploadFile(
        file,
        filename,
        (progress) => setUploadProgress(progress)
      );

      console.log('Azure image upload successful:', publicUrl);

      onImageUploaded(publicUrl);

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
    if (!currentImageUrl) return;

    console.log('[ImageUpload] Suppression de l\'image:', currentImageUrl);
    onRemoveImage();

    // Only attempt to delete Azure blob files
    const isAzureBlob = currentImageUrl.includes('blob.core.windows.net');

    if (!isAzureBlob) {
      console.log('URL externe détectée (non Azure), suppression terminée');
      return;
    }

    // Delete from Azure in background (non-blocking)
    try {
      const cleanUrl = currentImageUrl.split('?')[0];
      const fileName = azureStorage.extractFileNameFromUrl(cleanUrl);

      if (!fileName) {
        console.warn('Impossible d\'extraire le nom de fichier de l\'URL:', currentImageUrl);
        return;
      }

      await azureStorage.deleteFile(fileName);
      console.log('Fichier Azure supprimé avec succès:', fileName);
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.code === 'BlobNotFound') {
        console.warn('Fichier non trouvé dans Azure - probablement déjà supprimé:', currentImageUrl);
      } else {
        console.error('Erreur lors de la suppression Azure:', err);
        setError('Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue'));
      }
    }
  };

  if (currentImageUrl && !uploading) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
          <img
            src={currentImageUrl}
            alt="Aperçu de l'image"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white hover:bg-red-700 rounded-full transition-colors shadow-lg"
            title={t('upload.remove_image') || 'Supprimer l\'image'}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Image téléchargée</p>
            </div>
          </div>
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
            <p className="text-sm font-medium text-red-800">Azure Blob Storage n'est pas configuré</p>
            <p className="text-xs text-red-600 mt-1">
              Configurez VITE_AZURE_STORAGE_ACCOUNT et VITE_AZURE_SAS_TOKEN dans votre fichier .env
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
          accept="image/*"
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
                <ImageIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Télécharger une image</p>
                <p className="text-xs text-gray-500 mt-1">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG, GIF, WebP, SVG • Max 5MB
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
          <p className="font-medium">Formats supportés</p>
          <p>JPG, PNG, GIF, WebP, SVG</p>
          <p className="mt-1">Taille maximale: 5MB</p>
        </div>

        <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-200">
          <p className="font-medium text-blue-800">Recommandations</p>
          <ul className="text-blue-700 mt-1 list-disc list-inside space-y-1">
            <li>Résolution recommandée: 800x600 pixels</li>
            <li>Format recommandé: JPG ou PNG</li>
            <li>L'image sera affichée sur les cartes de parcours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
