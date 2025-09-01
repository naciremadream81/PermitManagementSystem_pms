import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ZoomIn, ZoomOut, Download, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { ApiService } from '../lib/api'

interface PdfViewerProps {
  documentId: string
}

const PdfViewer: React.FC<PdfViewerProps> = ({ documentId }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch document download URL
  const { data: documentUrl } = useQuery({
    queryKey: ['document-url', documentId],
    queryFn: () => ApiService.getDocumentDownloadUrl(documentId),
    enabled: !!documentId,
  })

  useEffect(() => {
    if (!documentUrl?.url) return

    const loadPdf = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist')
        
        // Set worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(documentUrl.url)
        const pdf = await loadingTask.promise
        
        setTotalPages(pdf.numPages)
        
        // Render first page
        await renderPage(pdf, 1)
        
      } catch (err) {
        console.error('Error loading PDF:', err)
        setError('Failed to load PDF document')
      } finally {
        setIsLoading(false)
      }
    }

    loadPdf()
  }, [documentUrl?.url])

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum)
      
      const canvas = canvasRef.current
      if (!canvas) return

      const context = canvas.getContext('2d')
      if (!context) return

      // Calculate viewport with scale and rotation
      const viewport = page.getViewport({ scale, rotation })
      
      // Set canvas dimensions
      canvas.width = viewport.width
      canvas.height = viewport.height

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise
      
    } catch (err) {
      console.error('Error rendering page:', err)
      setError('Failed to render PDF page')
    }
  }

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    
    setCurrentPage(newPage)
    
    // Re-render the page with current scale and rotation
    if (documentUrl?.url) {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        const loadingTask = pdfjsLib.getDocument(documentUrl.url)
        const pdf = await loadingTask.promise
        await renderPage(pdf, newPage)
      } catch (err) {
        console.error('Error changing page:', err)
      }
    }
  }

  const handleZoom = (newScale: number) => {
    const clampedScale = Math.max(0.5, Math.min(3.0, newScale))
    setScale(clampedScale)
    
    // Re-render current page with new scale
    if (documentUrl?.url) {
      (async () => {
        try {
          const pdfjsLib = await import('pdfjs-dist')
          const loadingTask = pdfjsLib.getDocument(documentUrl.url)
          const pdf = await loadingTask.promise
          await renderPage(pdf, currentPage)
        } catch (err) {
          console.error('Error zooming:', err)
        }
      })()
    }
  }

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
    
    // Re-render current page with new rotation
    if (documentUrl?.url) {
      (async () => {
        try {
          const pdfjsLib = await import('pdfjs-dist')
          const loadingTask = pdfjsLib.getDocument(documentUrl.url)
          const pdf = await loadingTask.promise
          await renderPage(pdf, currentPage)
        } catch (err) {
          console.error('Error rotating:', err)
        }
      })()
    }
  }

  const handleDownload = () => {
    if (documentUrl?.url) {
      const link = document.createElement('a')
      link.href = documentUrl.url
      link.download = 'document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoom(scale - 0.25)}
              disabled={scale <= 0.5}
              className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={() => handleZoom(scale + 0.25)}
              disabled={scale >= 3.0}
              className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm">Download</span>
        </button>
      </div>

      {/* PDF Canvas */}
      <div className="flex justify-center bg-gray-100 rounded-lg p-4 overflow-auto">
        <canvas
          ref={canvasRef}
          className="shadow-lg bg-white"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>

      {/* Page Navigation (Bottom) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      )}
    </div>
  )
}

export default PdfViewer
