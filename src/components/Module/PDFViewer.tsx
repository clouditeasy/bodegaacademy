import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title?: string;
}

export function PDFViewer({ url, title = "Document PDF" }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`transition-all duration-300 ${
      isFullscreen
        ? 'fixed inset-0 z-50 bg-black bg-opacity-75 p-4'
        : 'mb-6 sm:mb-8'
    }`}>
      {!isFullscreen && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Plein écran"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative">
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-2 right-2 z-10 p-2 bg-gray-900 bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-all"
            title="Quitter le plein écran"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        )}

        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
          className={`w-full border rounded-lg ${
            isFullscreen ? 'h-[calc(100vh-2rem)]' : 'h-96 lg:h-[600px]'
          }`}
          title="Visionneuse PDF"
          frameBorder="0"
          loading="lazy"
        />
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 -z-10"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}