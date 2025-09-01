import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ApiService } from '../lib/api'
import toast from 'react-hot-toast'

const contractorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zip: z.string().min(1, 'ZIP code is required'),
  }).optional(),
})

type ContractorFormData = z.infer<typeof contractorSchema>

interface ContractorFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<ContractorFormData>
  contractorId?: string
}

const ContractorForm: React.FC<ContractorFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData,
  contractorId 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [includeAddress, setIncludeAddress] = useState(!!initialData?.address)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      address: { state: 'FL' },
      ...initialData,
    },
  })

  const createContractorMutation = useMutation({
    mutationFn: (data: ContractorFormData) => ApiService.createContractor(data),
    onSuccess: () => {
      toast.success('Contractor created successfully!')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to create contractor')
      console.error('Create contractor error:', error)
    },
  })

  const updateContractorMutation = useMutation({
    mutationFn: (data: ContractorFormData) => ApiService.updateContractor(contractorId!, data),
    onSuccess: () => {
      toast.success('Contractor updated successfully!')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to update contractor')
      console.error('Update contractor error:', error)
    },
  })

  const onSubmit = async (data: ContractorFormData) => {
    try {
      setIsSubmitting(true)
      
      // Remove address if not included
      const contractorData = {
        ...data,
        address: includeAddress ? data.address : undefined,
      }

      if (contractorId) {
        await updateContractorMutation.mutateAsync(contractorData)
      } else {
        await createContractorMutation.mutateAsync(contractorData)
      }
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name *
          </label>
          <input
            {...register('companyName')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.companyName ? 'border-red-300' : ''
            }`}
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <input
            {...register('licenseNumber')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter license number"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Name
          </label>
          <input
            {...register('contactName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter contact person name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.email ? 'border-red-300' : ''
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Address</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeAddress}
              onChange={(e) => setIncludeAddress(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Include address</span>
          </label>
        </div>

        {includeAddress && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                {...register('address.line1')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.address?.line1 ? 'border-red-300' : ''
                }`}
                placeholder="Enter street address"
              />
              {errors.address?.line1 && (
                <p className="mt-1 text-sm text-red-600">{errors.address.line1.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                {...register('address.line2')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  {...register('address.city')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.address?.city ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter city"
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  {...register('address.state')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.address?.state ? 'border-red-300' : ''
                  }`}
                  placeholder="FL"
                  maxLength={2}
                />
                {errors.address?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  {...register('address.zip')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.address?.zip ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter ZIP code"
                />
                {errors.address?.zip && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.zip.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {contractorId ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            contractorId ? 'Update Contractor' : 'Create Contractor'
          )}
        </button>
      </div>
    </form>
  )
}

export default ContractorForm
