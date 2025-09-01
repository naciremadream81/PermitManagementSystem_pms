import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { ApiService } from '../lib/api'
import { PermitType } from '../types'
import toast from 'react-hot-toast'

interface CountyTemplateModalProps {
  county: any
  onClose: () => void
}

const CountyTemplateModal: React.FC<CountyTemplateModalProps> = ({ county, onClose }) => {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Fetch county templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['county-templates', county.id],
    queryFn: () => ApiService.getCountyTemplates(county.id),
  })

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => ApiService.createCountyTemplate(county.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county-templates', county.id] })
      toast.success('Template item created successfully')
      setShowAddForm(false)
    },
    onError: () => {
      toast.error('Failed to create template item')
    },
  })

  const updateTemplateMutation = useMutation({
    mutationFn: (data: any) => ApiService.updateCountyTemplate(county.id, editingItem.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county-templates', county.id] })
      toast.success('Template item updated successfully')
      setEditingItem(null)
    },
    onError: () => {
      toast.error('Failed to update template item')
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: (itemId: string) => ApiService.deleteCountyTemplate(county.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county-templates', county.id] })
      toast.success('Template item deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete template item')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      label: formData.get('label') as string,
      category: formData.get('category') as string,
      permitType: formData.get('permitType') as PermitType || undefined,
      required: formData.get('required') === 'on',
      sort: parseInt(formData.get('sort') as string) || 0,
    }

    if (editingItem) {
      updateTemplateMutation.mutate(data)
    } else {
      createTemplateMutation.mutate(data)
    }
  }

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this template item?')) {
      deleteTemplateMutation.mutate(itemId)
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Checklist Templates - {county.name}
            </h3>
            <p className="text-sm text-gray-500">
              Manage checklist items for this county
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {(showAddForm || editingItem) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Template Item' : 'Add Template Item'}
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Label *
                    </label>
                    <input
                      name="label"
                      type="text"
                      defaultValue={editingItem?.label}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter checklist item label"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <input
                      name="category"
                      type="text"
                      defaultValue={editingItem?.category}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g., Application, Site, Foundation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Permit Type
                    </label>
                    <select
                      name="permitType"
                      defaultValue={editingItem?.permitType || ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="RESIDENTIAL">Residential</option>
                      <option value="MOBILE_HOME">Mobile Home</option>
                      <option value="MODULAR_HOME">Modular Home</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sort Order
                    </label>
                    <input
                      name="sort"
                      type="number"
                      defaultValue={editingItem?.sort || 0}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        name="required"
                        type="checkbox"
                        defaultChecked={editingItem?.required}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Required</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingItem(null)
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                  >
                    {createTemplateMutation.isPending || updateTemplateMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingItem ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      editingItem ? 'Update Item' : 'Add Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Templates List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Template Items</h4>
              {!showAddForm && !editingItem && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : templates?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No template items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding a template item.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupByCategory(templates || [])).map(([category, items]) => (
                  <div key={category} className="border border-gray-200 rounded-lg">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        {category}
                      </h5>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {(items as any[]).map((item: any) => (
                        <div key={item.id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {item.required ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.label}
                                </p>
                                {item.permitType && (
                                  <p className="text-xs text-gray-500">
                                    {item.permitType.replace('_', ' ')} only
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="text-gray-600 hover:text-gray-900"
                                disabled={!!editingItem}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900"
                                disabled={deleteTemplateMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CountyTemplateModal
