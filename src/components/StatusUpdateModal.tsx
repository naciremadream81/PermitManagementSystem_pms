import React, { useState } from 'react'
import { PackageStatus } from '../types'

interface StatusUpdateModalProps {
  currentStatus: PackageStatus
  onUpdate: (status: PackageStatus, note?: string) => void
  onClose: () => void
  isLoading: boolean
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  currentStatus,
  onUpdate,
  onClose,
  isLoading,
}) => {
  const [status, setStatus] = useState<PackageStatus>(currentStatus)
  const [note, setNote] = useState('')

  const statusOptions: { value: PackageStatus; label: string; description: string }[] = [
    {
      value: 'DRAFT',
      label: 'Draft',
      description: 'Package is being prepared and reviewed internally',
    },
    {
      value: 'IN_REVIEW',
      label: 'In Review',
      description: 'Package is under internal review before submission',
    },
    {
      value: 'SUBMITTED',
      label: 'Submitted',
      description: 'Package has been submitted to the county',
    },
    {
      value: 'APPROVED',
      label: 'Approved',
      description: 'Package has been approved by the county',
    },
    {
      value: 'REJECTED',
      label: 'Rejected',
      description: 'Package has been rejected by the county',
    },
    {
      value: 'CLOSED',
      label: 'Closed',
      description: 'Package has been completed and closed',
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(status, note.trim() || undefined)
  }

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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Update Package Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                {currentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status *
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    status === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value as PackageStatus)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                      {status === option.value && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(option.value)}`}>
                          {option.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes about this status change..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This note will be recorded in the status history.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || status === currentStatus}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusUpdateModal
