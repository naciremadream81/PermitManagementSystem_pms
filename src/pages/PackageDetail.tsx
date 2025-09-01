import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Building2,
  Plus,
  Trash2,
  Eye
} from 'lucide-react'
import { ApiService } from '../lib/api'
import { useSocket } from '../contexts/SocketContext'
import { PackageStatus } from '../types'
import toast from 'react-hot-toast'
import ChecklistEditor from '../components/ChecklistEditor'
import DocumentUploader from '../components/DocumentUploader'
import PdfViewer from '../components/PdfViewer'
import StatusUpdateModal from '../components/StatusUpdateModal'

const PackageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { joinPackage, leavePackage } = useSocket()
  
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDocumentUploader, setShowDocumentUploader] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  // Fetch package data
  const { data: packageData, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: () => ApiService.getPackage(id!),
    enabled: !!id,
  })

  // Fetch related data
  const { data: documents } = useQuery({
    queryKey: ['package-documents', id],
    queryFn: () => ApiService.getPackageDocuments(id!),
    enabled: !!id,
  })

  const { data: statusLogs } = useQuery({
    queryKey: ['package-logs', id],
    queryFn: () => ApiService.getStatusLogs(id!),
    enabled: !!id,
  })

  // Join package room for real-time updates
  useEffect(() => {
    if (id) {
      joinPackage(id)
      return () => leavePackage(id)
    }
  }, [id, joinPackage, leavePackage])

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: PackageStatus; note?: string }) => 
      ApiService.updatePackageStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package', id] })
      queryClient.invalidateQueries({ queryKey: ['package-logs', id] })
      toast.success('Status updated successfully')
      setShowStatusModal(false)
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => ApiService.deleteDocument(id!, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-documents', id] })
      toast.success('Document deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete document')
    },
  })

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: PackageStatus) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-4 w-4" />
      case 'IN_REVIEW':
        return <Clock className="h-4 w-4" />
      case 'SUBMITTED':
        return <FileText className="h-4 w-4" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />
      case 'CLOSED':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isOverdue = (dueDate: string, status: PackageStatus) => {
    if (!dueDate || status === 'APPROVED') return false
    return new Date(dueDate) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Package not found</h2>
        <p className="mt-2 text-gray-600">The package you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/packages')}
          className="mt-4 btn-primary"
        >
          Back to Packages
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/packages')}
            className="btn-ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{packageData.title}</h1>
            <p className="text-sm text-gray-500">
              Created {formatDate(packageData.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-outline"
          >
            Update Status
          </button>
          <button
            onClick={() => navigate(`/packages/${id}/edit`)}
            className="btn-primary"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      </div>

      {/* Status and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(packageData.status)}`}>
                {getStatusIcon(packageData.status)}
                <span className="ml-2">{packageData.status.replace('_', ' ')}</span>
              </span>
            </div>
            
            {packageData.dueDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(packageData.dueDate)}</span>
                {isOverdue(packageData.dueDate, packageData.status) && (
                  <span className="text-red-600 font-medium">(Overdue)</span>
                )}
              </div>
            )}
          </div>

          {/* Package Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Permit Type</label>
                <p className="mt-1 text-sm text-gray-900">{packageData.permitType.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">County</label>
                <p className="mt-1 text-sm text-gray-900">{packageData.county?.name}</p>
              </div>
              {packageData.parcelNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Parcel Number</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.parcelNumber}</p>
                </div>
              )}
              {packageData.floodZone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Flood Zone</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.floodZone}</p>
                </div>
              )}
              {packageData.windExposure && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Wind Exposure</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.windExposure}</p>
                </div>
              )}
              {packageData.zoningApprovalRef && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Zoning Approval Ref</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.zoningApprovalRef}</p>
                </div>
              )}
            </div>
          </div>

          {/* Site Address */}
          {packageData.siteAddress && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Site Address</h3>
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">{packageData.siteAddress.line1}</p>
                  {packageData.siteAddress.line2 && (
                    <p className="text-sm text-gray-900">{packageData.siteAddress.line2}</p>
                  )}
                  <p className="text-sm text-gray-900">
                    {packageData.siteAddress.city}, {packageData.siteAddress.state} {packageData.siteAddress.zip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Home Details */}
          {packageData.mobileHome && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {packageData.permitType === 'MOBILE_HOME' ? 'Mobile Home' : 'Modular Home'} Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packageData.mobileHome.makeModel && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Make/Model</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.makeModel}</p>
                  </div>
                )}
                {packageData.mobileHome.year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Year</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.year}</p>
                  </div>
                )}
                {packageData.mobileHome.serialVIN && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Serial/VIN</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.serialVIN}</p>
                  </div>
                )}
                {packageData.mobileHome.hudLabel && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">HUD Label</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.hudLabel}</p>
                  </div>
                )}
                {packageData.mobileHome.foundationType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Foundation Type</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.foundationType}</p>
                  </div>
                )}
                {packageData.mobileHome.tieDownSystem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tie-down System</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.tieDownSystem}</p>
                  </div>
                )}
                {packageData.mobileHome.installerLicense && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Installer License</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.installerLicense}</p>
                  </div>
                )}
                {packageData.mobileHome.windZone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Wind Zone</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.windZone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer & Contractor */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Parties</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                </div>
                <p className="text-sm text-gray-900">{packageData.customer?.name}</p>
                {packageData.customer?.email && (
                  <p className="text-sm text-gray-500">{packageData.customer.email}</p>
                )}
                {packageData.customer?.phone && (
                  <p className="text-sm text-gray-500">{packageData.customer.phone}</p>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">Contractor</label>
                </div>
                <p className="text-sm text-gray-900">{packageData.contractor?.companyName}</p>
                {packageData.contractor?.contactName && (
                  <p className="text-sm text-gray-500">{packageData.contractor.contactName}</p>
                )}
                {packageData.contractor?.email && (
                  <p className="text-sm text-gray-500">{packageData.contractor.email}</p>
                )}
                {packageData.contractor?.phone && (
                  <p className="text-sm text-gray-500">{packageData.contractor.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Checklist</h3>
            </div>
            <ChecklistEditor packageId={id!} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Documents</h3>
            <button
              onClick={() => setShowDocumentUploader(true)}
              className="btn-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>

        <div className="p-6">
          {documents?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading a document.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents?.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                      <p className="text-sm text-gray-500">
                        {doc.type.replace('_', ' ')} • {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        // Handle download
                        ApiService.getDocumentDownloadUrl(doc.id).then(({ url }) => {
                          window.open(url, '_blank')
                        })
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          deleteDocumentMutation.mutate(doc.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      {statusLogs && statusLogs.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
          <div className="space-y-4">
            {statusLogs.map((log: any) => (
              <div key={log.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Status changed to <span className="font-medium">{log.status.replace('_', ' ')}</span>
                  </p>
                  {log.note && (
                    <p className="text-sm text-gray-500 mt-1">{log.note}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(log.createdAt)} by {log.createdBy?.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showStatusModal && (
        <StatusUpdateModal
          currentStatus={packageData.status}
          onUpdate={(status, note) => updateStatusMutation.mutate({ status, note })}
          onClose={() => setShowStatusModal(false)}
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {showDocumentUploader && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowDocumentUploader(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DocumentUploader
              packageId={id!}
              onSuccess={() => {
                setShowDocumentUploader(false)
                queryClient.invalidateQueries({ queryKey: ['package-documents', id] })
              }}
              onCancel={() => setShowDocumentUploader(false)}
            />
          </div>
        </div>
      )}

      {selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedDocument.filename}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PdfViewer documentId={selectedDocument.id} />
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageDetail
