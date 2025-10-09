import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import YouTubeVideosPanel from './YouTubeVideosPanel';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const TabButton = ({ children, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium ${
      isActive
        ? 'border-b-2 border-red-400 text-red-600'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

function PDFPreview({ pdfUrl }) {
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [pageRendering, setPageRendering] = useState(false);
    const [pageNumPending, setPageNumPending] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const renderPage = useCallback(async (num) => {
      if (!pdfDoc || !canvasRef.current) return;
      if (renderTaskRef.current) {
        await renderTaskRef.current.cancel();
      }
      setPageRendering(true);
  
      try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
  
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        renderTaskRef.current = page.render(renderContext);
        renderTaskRef.current.promise.then(() => {
          setPageRendering(false);
          if (pageNumPending !== null) {
            setPageNum(pageNumPending);
            setPageNumPending(null);
          }
        }).catch(e => {
          if (e.name !== 'RenderingCancelledException') {
            console.error("Failed to render page", e);
            setError("Failed to render PDF page.");
          }
        });
      } catch (e) {
        if (e.name !== 'RenderingCancelledException') {
          console.error("Failed to render page", e);
          setError("Failed to render PDF page.");
        }
      }
    }, [pdfDoc, pageNumPending]);
  
    useEffect(() => {
      const loadPdf = async () => {
        if (!pdfUrl) {
          setPdfDoc(null);
          return;
        }
        setPageNum(1); // Reset to first page on new PDF
        setIsLoading(true);
        setError(null);
        try {
          const loadingTask = pdfjs.getDocument({
            url: pdfUrl,
            wasmUrl: `${process.env.PUBLIC_URL}/`,
          });
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
        } catch (e) {
          console.error('Error loading PDF:', e);
          setError('Failed to load PDF.');
          setPdfDoc(null);
        } finally {
          setIsLoading(false);
        }
      };
      loadPdf();
    }, [pdfUrl]);
  
    useEffect(() => {
      if (pdfDoc) {
        renderPage(pageNum);
      }
      return () => {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
      };
    }, [pdfDoc, pageNum, renderPage]);
  
    const onPrevPage = () => {
      if (pageNum <= 1) return;
      if (pageRendering) {
        setPageNumPending(pageNum - 1);
      } else {
        setPageNum(pageNum - 1);
      }
    };
  
    const onNextPage = () => {
      if (pdfDoc && pageNum >= pdfDoc.numPages) return;
      if (pageRendering) {
        setPageNumPending(pageNum + 1);
      } else {
        setPageNum(pageNum + 1);
      }
    };
  
    if (isLoading) {
      return (
          <div className="text-gray-500 text-sm p-4 bg-white rounded-md shadow-sm h-full flex items-center justify-center">
              Loading PDF Preview...
          </div>
      );
    }
  
    if (error) {
      return (
          <div className="text-red-500 text-sm p-4 bg-white rounded-md shadow-sm h-full flex items-center justify-center">
              {error}
          </div>
      );
    }
  
    return (
      <div className="h-full flex flex-col">
        {pdfDoc && (
          <div className="flex items-center justify-between p-2 border-b">
            <div>
              <button
                onClick={onPrevPage}
                disabled={pageNum <= 1 || pageRendering}
                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm mx-2">
                Page {pageNum} of {pdfDoc.numPages}
              </span>
              <button
                onClick={onNextPage}
                disabled={pageNum >= pdfDoc.numPages || pageRendering}
                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto flex justify-center p-4">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto"
          />
        </div>
      </div>
    );
}

export default function AnnotationsPanel({ pdfUrl }) {
  const [activeTab, setActiveTab] = useState('pdf');

  if (!pdfUrl) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-white rounded-md shadow-sm h-full flex items-center justify-center">
        No PDF selected.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] bg-white shadow-sm border flex flex-col overflow-y-auto">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton onClick={() => setActiveTab('pdf')} isActive={activeTab === 'pdf'}>
            PDF Preview
          </TabButton>
          <TabButton onClick={() => setActiveTab('youtube')} isActive={activeTab === 'youtube'}>
            YouTube Videos
          </TabButton>
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab === 'pdf' && <div className="z-10"><PDFPreview pdfUrl={pdfUrl} /></div>}
        {activeTab === 'youtube' && <div className="z-20"><YouTubeVideosPanel pdfUrl={pdfUrl} /></div>}
      </div>
    </div>
  );
}
