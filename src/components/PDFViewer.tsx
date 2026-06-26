import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setHasError(false);
  }, [url]);

  // Clean and prepare the URL
  const displayUrl = url.startsWith('/') 
    ? `${window.location.origin}${url}` 
    : url;

  return (
    <div className="w-full h-[50vh] lg:h-[65vh] flex flex-col bg-white rounded border border-gray-200/80 overflow-hidden relative shadow-inner">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <Loader2 className="w-8 h-8 text-black animate-spin mb-3 animate-pulse" />
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">Rendering Certificate...</p>
        </div>
      )}

      <iframe
        src={`${displayUrl}#toolbar=0&navpanes=0&scrollbar=1`}
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
        title="Certificate Viewer"
      />

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 text-center z-10 animate-fade-in">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h4 className="text-sm font-bold text-gray-800 mb-2">Failed to display document</h4>
          <p className="text-xs text-gray-500 max-w-xs mb-4">
            The document could not be rendered directly. Please use the sidebar to open or download the certificate.
          </p>
        </div>
      )}
    </div>
  );
}
