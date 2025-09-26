import React, { useState, useMemo } from 'react';
import { Play, ExternalLink, Loader } from 'lucide-react';
import { getVideoEmbedInfo, VideoEmbedInfo } from '../../utils/videoEmbedding';
import { azureStorage } from '../../lib/azureStorage';

interface VideoEmbedProps {
  url: string;
  className?: string;
}

export function VideoEmbed({ url, className = '' }: VideoEmbedProps) {
  const videoInfo: VideoEmbedInfo = getVideoEmbedInfo(url);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const isDirectVideo = url.includes('blob.core.windows.net') || url.includes('.mp4') || url.includes('.avi') || url.includes('.mov') || url.includes('.wmv') || url.includes('.mkv') || url.includes('.webm');
  
  // Ensure Azure blob URLs have SAS tokens
  const videoUrl = useMemo(() => {
    if (url.includes('blob.core.windows.net') && azureStorage.isConfigured()) {
      try {
        return azureStorage.ensureSasToken(url);
      } catch (error) {
        console.warn('Could not add SAS token to Azure URL:', error);
        return url;
      }
    }
    return url;
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handlePlayClick = () => {
    if (!isLoading) {
      setShowVideo(true);
    }
  };

  // Handle direct video files (Azure Blob Storage, etc.)
  if (isDirectVideo) {
    return (
      <div className={`aspect-video rounded-lg overflow-hidden relative ${className}`}>
        {/* Preload video (hidden) */}
        <video
          src={videoUrl}
          className={`w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
          controls={showVideo}
          preload="metadata"
          onLoadedMetadata={handleVideoLoad}
        />
        
        {/* Overlay with play button */}
        {!showVideo && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 hover:scale-105 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <Loader className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (videoInfo.type === 'unknown' || !videoInfo.embedUrl) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Vidéo non embeddable</p>
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 underline"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>
    );
  }

  if (videoInfo.type === 'youtube' || videoInfo.type === 'sharepoint' || videoInfo.type === 'stream') {
    return (
      <div className={`aspect-video rounded-lg overflow-hidden relative ${className}`}>
        {/* Preload iframe (hidden) */}
        <iframe
          src={videoInfo.embedUrl}
          title={
            videoInfo.type === 'youtube' ? "Vidéo YouTube" : 
            videoInfo.type === 'stream' ? "Vidéo Microsoft Stream" : 
            "Vidéo SharePoint"
          }
          className={`w-full h-full transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
          frameBorder="0"
          allow={videoInfo.type === 'youtube' ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" : undefined}
          allowFullScreen
          onLoad={handleIframeLoad}
        />
        
        {/* Overlay with play button */}
        {!showVideo && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 hover:scale-105 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <Loader className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}