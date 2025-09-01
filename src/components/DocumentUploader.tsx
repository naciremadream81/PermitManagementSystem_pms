import React, { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { ApiService } from '../lib/api'
import toast from 'react-hot-toast'

interface DocumentUploaderProps {
  packageId: string
  onSuccess: () => void
  onCancel: () => void
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ packageId, onSuccess, onCancel }) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [documentType, setDocumentType] = useState<string>('ATTACHMENT')
  const [documentTag, setDocumentTag] = useState<string>('')

  const uploadMutation = useMutation({
    mutationFn: async (fileData: { file: File; type: string; tag?: string }) => {
      const { file, type, tag } = fileData
      
      // Generate unique key for the file
      const key = `packages/${packageId}/documents/${Date.now()}-${file.name}`
      
      // Get presigned URL for upload
      const { url } = await ApiService.getPresignedUrl({ key, op: 'put' })
      
      // Upload file to storage
      await ApiService.uploadFile(url, file)
      
      // Create document record
      const documentData = {
        type,
        tag: tag || undefined,
        filename: file.name,
        mime: file.type,
        size: file.size,
        objectKey: key,
      }
      
      return ApiService.uploadDocument(packageId, documentData)
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to upload document')
      console.error('Upload error:', error)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }))
    
    setUploadingFiles(prev => [...prev, ...newFiles])
    
    // Upload each file
    acceptedFiles.forEach((file, index) => {
      const fileIndex = uploadingFiles.length + index
      
      uploadMutation.mutate(
        { file, type: documentType, tag: documentTag },
        {
          onSuccess: () => {
            setUploadingFiles(prev => 
              prev.map((f, i) => 
                i === fileIndex 
                  ? { ...f, status: 'success' as const, progress: 100 }
                  : f
              )
            )
          },
          onError: (error) => {
            setUploadingFiles(prev => 
              prev.map((f, i) => 
                i === fileIndex 
                  ? { ...f, status: 'error' as const, error: 'Upload failed' }
                  : f
              )
            )
          },
        }
      )
    })
  }, [documentType, documentTag, uploadMutation, uploadingFiles.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  })

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileText className="h-8 w-8 text-blue-500" />
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ATTACHMENT">Attachment</option>
            <option value="PDF_TEMPLATE">PDF Template</option>
            <option value="FILLED_PDF">Filled PDF</option>
            <option value="PHOTO">Photo</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Tag (Optional)
          </label>
          <input
            type="text"
            value={documentTag}
            onChange={(e) => setDocumentTag(e.target.value)}
            placeholder="e.g., site_plan, foundation_plan"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'
          }
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supports PDF, images, Word, Excel (max 50MB per file)
        </p>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploading Files</h4>
          {uploadingFiles.map((fileData, index) => (
            <div
              key={`${fileData.file.name}-${index}`}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
            >
              {getFileIcon(fileData.file)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileData.file.name}
                  </p>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileData.file.size)}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    {fileData.status === 'uploading' && (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-gray-500">Uploading...</span>
                      </div>
                    )}
                    
                    {fileData.status === 'success' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Uploaded</span>
                      </div>
                    )}
                    
                    {fileData.status === 'error' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs">Failed</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {fileData.status === 'uploading' && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${fileData.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {fileData.error && (
                  <p className="text-xs text-red-600 mt-1">{fileData.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="btn-outline"
          disabled={uploadMutation.isPending}
        >
          Cancel
        </button>
        <button
          onClick={onSuccess}
          className="btn-primary"
          disabled={uploadMutation.isPending || uploadingFiles.some(f => f.status === 'uploading')}
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Done'}
        </button>
      </div>
    </div>
  )
}

export default DocumentUploader
