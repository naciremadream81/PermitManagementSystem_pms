import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { ApiService } from '../lib/api'
import { useSocket } from '../contexts/SocketContext'
import toast from 'react-hot-toast'

interface ChecklistEditorProps {
  packageId: string
}

const ChecklistEditor: React.FC<ChecklistEditorProps> = ({ packageId }) => {
  const queryClient = useQueryClient()
  const { toggleChecklistItem } = useSocket()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  // Fetch checklist data
  const { data: checklist, isLoading } = useQuery({
    queryKey: ['package-checklist', packageId],
    queryFn: () => ApiService.getPackageChecklist(packageId),
  })

  // Update checklist item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      ApiService.updateChecklistItem(packageId, itemId, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-checklist', packageId] })
    },
    onError: () => {
      toast.error('Failed to update checklist item')
    },
  })

  const handleToggleItem = async (itemId: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted
    
    // Optimistic update
    setUpdatingItems(prev => new Set(prev).add(itemId))
    
    try {
      // Send real-time update
      toggleChecklistItem(packageId, itemId, newCompleted)
      
      // Update in database
      await updateItemMutation.mutateAsync({ itemId, completed: newCompleted })
    } catch (error) {
      // Revert optimistic update on error
      console.error('Failed to update checklist item:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const groupByCategory = (items: any[]) => {
    return items.reduce((groups, item) => {
      const category = item.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    }, {})
  }

  const getProgressStats = (items: any[]) => {
    const total = items.length
    const completed = items.filter(item => item.completed).length
    const required = items.filter(item => item.required).length
    const requiredCompleted = items.filter(item => item.required && item.completed).length
    
    return {
      total,
      completed,
      required,
      requiredCompleted,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      requiredPercentage: required > 0 ? Math.round((requiredCompleted / required) * 100) : 0,
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!checklist || checklist.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No checklist items found</p>
      </div>
    )
  }

  const groupedItems = groupByCategory(checklist)
  const stats = getProgressStats(checklist)

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{stats.completed}/{stats.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
        
        {stats.required > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Required Items</span>
              <span className="text-xs text-gray-500">{stats.requiredCompleted}/{stats.required}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  stats.requiredPercentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${stats.requiredPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              {category}
            </h4>
            <div className="space-y-2">
              {(items as any[]).map((item: any) => {
                const isUpdating = updatingItems.has(item.id)
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                      item.completed 
                        ? 'bg-green-50 border-green-200' 
                        : item.required 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-white border-gray-200'
                    } ${isUpdating ? 'opacity-75' : ''}`}
                  >
                    <button
                      onClick={() => handleToggleItem(item.id, item.completed)}
                      disabled={isUpdating}
                      className={`flex-shrink-0 mt-0.5 transition-colors ${
                        isUpdating ? 'cursor-not-allowed' : 'hover:scale-110'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${
                            item.completed 
                              ? 'text-green-800 line-through' 
                              : 'text-gray-900'
                          }`}>
                            {item.label}
                          </p>
                          {item.completed && item.completedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Completed {new Date(item.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-2">
                          {item.required && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {stats.requiredCompleted === stats.required && stats.required > 0 ? (
              <span className="text-green-600 font-medium">✓ All required items completed</span>
            ) : stats.required > 0 ? (
              <span className="text-yellow-600">
                {stats.required - stats.requiredCompleted} required items remaining
              </span>
            ) : (
              <span className="text-gray-500">No required items</span>
            )}
          </span>
          <span className="text-gray-500">
            {stats.completed} of {stats.total} items
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChecklistEditor
