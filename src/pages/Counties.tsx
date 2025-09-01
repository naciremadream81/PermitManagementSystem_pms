import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  Settings
} from 'lucide-react'
import { ApiService } from '../lib/api'
import CountyTemplateModal from '../components/CountyTemplateModal'

const Counties: React.FC = () => {
  const [selectedCounty, setSelectedCounty] = useState<any>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Fetch counties
  const { data: counties, isLoading } = useQuery({
    queryKey: ['counties'],
    queryFn: () => ApiService.getCounties(),
  })

  const handleViewTemplates = (county: any) => {
    setSelectedCounty(county)
    setShowTemplateModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Florida Counties</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage county information and checklist templates
        </p>
      </div>

      {/* Counties grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Counties ({counties?.length || 0})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {counties?.map((county: any) => (
                <div
                  key={county.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <MapPin className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {county.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          County #{county.id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewTemplates(county)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Manage templates"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* County Template Modal */}
      {showTemplateModal && selectedCounty && (
        <CountyTemplateModal
          county={selectedCounty}
          onClose={() => {
            setShowTemplateModal(false)
            setSelectedCounty(null)
          }}
        />
      )}
    </div>
  )
}

export default Counties
