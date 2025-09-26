import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

// Configuration Azure Storage
interface AzureConfig {
  accountName: string;
  containerName: string;
  sasToken: string; // Shared Access Signature token
}

class AzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerClient: ContainerClient | null = null;
  private config: AzureConfig | null = null;

  // Initialiser avec la configuration Azure
  initialize(config: AzureConfig) {
    this.config = config;
    const blobServiceUrl = `https://${config.accountName}.blob.core.windows.net`;

    // Créer le client avec SAS token
    this.blobServiceClient = new BlobServiceClient(`${blobServiceUrl}?${config.sasToken}`);
    this.containerClient = this.blobServiceClient.getContainerClient(config.containerName);
  }

  // Vérifier si Azure est configuré
  isConfigured(): boolean {
    return this.config !== null && this.containerClient !== null;
  }

  // Upload d'un fichier vers Azure Blob Storage
  async uploadFile(
    file: File,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!this.containerClient || !this.config) {
      throw new Error('Azure Storage n\'est pas configuré');
    }

    try {
      // Créer le blob client
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

      // Configuration de l'upload avec callback de progression
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
        onProgress: onProgress ? (ev: any) => {
          if (ev.loadedBytes && file.size) {
            const progress = Math.round((ev.loadedBytes / file.size) * 100);
            onProgress(progress);
          }
        } : undefined,
      };

      // Upload du fichier
      await blockBlobClient.uploadData(file, uploadOptions);

      // Retourner l'URL du blob - elle contient déjà le SAS token
      return blockBlobClient.url;
    } catch (error) {
      console.error('Erreur lors de l\'upload Azure:', error);
      throw error;
    }
  }

  // Supprimer un fichier
  async deleteFile(fileName: string): Promise<void> {
    if (!this.containerClient) {
      throw new Error('Azure Storage n\'est pas configuré');
    }

    try {
      // D'abord, vérifier si le blob existe
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

      // Vérifier l'existence du blob
      const exists = await blockBlobClient.exists();
      if (!exists) {
        console.warn('Fichier non trouvé lors de la suppression:', fileName);
        return; // Pas d'erreur, juste un warning
      }

      // Si le blob existe, le supprimer
      await blockBlobClient.delete();
      console.log('Fichier supprimé avec succès:', fileName);
    } catch (error: any) {
      // Ignorer les erreurs 404 (fichier n'existe pas) - cas normal lors du changement de Storage Account
      if (error?.statusCode === 404 || error?.code === 'BlobNotFound') {
        console.warn('Fichier non trouvé lors de la suppression (normal si Storage Account changé):', fileName);
        return; // Pas d'erreur, juste un warning
      }

      console.error('Erreur lors de la suppression Azure:', error);
      throw error;
    }
  }

  // Extraire le nom de fichier depuis une URL Azure
  extractFileNameFromUrl(url: string): string {
    try {
      // Enlever les paramètres de requête (comme le SAS token)
      const cleanUrl = url.split('?')[0];

      // Extraire tout après le 4ème slash
      // Format: https://storageaccount.blob.core.windows.net/container/filename
      const urlParts = cleanUrl.split('/');

      // Index 0: 'https:', Index 1: '', Index 2: domain, Index 3: container, Index 4+: filename
      if (urlParts.length < 5) {
        console.warn('URL Azure invalide:', cleanUrl);
        return '';
      }

      // Récupérer tout à partir de l'index 4 (après le container)
      return urlParts.slice(4).join('/');

    } catch (error) {
      console.error('Erreur lors de l\'extraction du nom de fichier:', error, 'URL:', url);
      return '';
    }
  }

  // Générer une URL avec SAS token pour un fichier existant
  getFileUrlWithSas(fileName: string): string {
    if (!this.config || !this.containerClient) {
      throw new Error('Azure Storage n\'est pas configuré');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
    return `${blockBlobClient.url}?${this.config.sasToken}`;
  }

  // Vérifier si une URL contient déjà un SAS token et l'ajouter si nécessaire
  ensureSasToken(url: string): string {
    if (!this.config) return url;

    // Si l'URL contient déjà un SAS token, la retourner telle quelle
    if (url.includes('?')) {
      return url;
    }

    // Sinon, ajouter le SAS token
    return `${url}?${this.config.sasToken}`;
  }
}

// Instance singleton
export const azureStorage = new AzureStorageService();

// Configuration depuis les variables d'environnement
export const getAzureConfig = (): AzureConfig | null => {
  const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT;
  const containerName = import.meta.env.VITE_AZURE_CONTAINER_NAME || 'videos';
  const sasToken = import.meta.env.VITE_AZURE_SAS_TOKEN;

  if (!accountName || !sasToken) {
    console.warn('Configuration Azure Storage manquante. Ajoutez VITE_AZURE_STORAGE_ACCOUNT et VITE_AZURE_SAS_TOKEN à votre .env');
    return null;
  }

  return {
    accountName,
    containerName,
    sasToken
  };
};

// Initialiser automatiquement si la config est disponible
const azureConfig = getAzureConfig();
if (azureConfig) {
  azureStorage.initialize(azureConfig);
}