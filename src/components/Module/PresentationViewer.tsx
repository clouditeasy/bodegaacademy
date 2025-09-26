import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface PresentationViewerProps {
  url: string;
  type: 'pdf' | 'powerpoint';
  title?: string;
}

export function PresentationViewer({ url, type, title }: PresentationViewerProps) {
  const isPdf = type === 'pdf';
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Les événements de changement de fullscreen
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    const container = document.querySelector('.presentation-container') as HTMLElement;
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    }
  };

  const exitFullscreen = () => {
    if (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      {/* Fullscreen Button - Outside of viewer */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleToggleFullscreen}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
          title={isFullscreen ? "Sortir du plein écran" : "Ouvrir en plein écran"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          {isFullscreen ? "Réduire" : "Plein écran"}
        </button>
      </div>

      {/* Presentation Container */}
      <div className="presentation-container bg-gray-100 rounded-lg overflow-hidden relative">
        {/* PDF Embedded Viewer */}
        {isPdf && (
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            className={`w-full border-0 presentation-iframe ${
              isFullscreen ? 'h-screen' : 'h-96 sm:h-[600px]'
            }`}
            title={title || "Document PDF"}
            loading="lazy"
          />
        )}

        {/* PowerPoint Embedded Viewer */}
        {!isPdf && (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            className={`w-full border-0 presentation-iframe ${
              isFullscreen ? 'h-screen' : 'h-96 sm:h-[600px]'
            }`}
            title={title || "Présentation PowerPoint"}
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}