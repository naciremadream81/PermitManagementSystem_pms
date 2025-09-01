import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ApiService } from '../lib/api'
import toast from 'react-hot-toast'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zip: z.string().min(1, 'ZIP code is required'),
  }).optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<CustomerFormData>
  customerId?: string
}

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData,
  customerId 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [includeAddress, setIncludeAddress] = useState(!!initialData?.address)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      address: { state: 'FL' },
      ...initialData,
    },
  })

  const createCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormData) => ApiService.createCustomer(data),
    onSuccess: () => {
      toast.success('Customer created successfully!')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to create customer')
      console.error('Create customer error:', error)
    },
  })

  const updateCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormData) => ApiService.updateCustomer(customerId!, data),
    onSuccess: () => {
      toast.success('Customer updated successfully!')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to update customer')
      console.error('Update customer error:', error)
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true)
      
      // Remove address if not included
      const customerData = {
        ...data,
        address: includeAddress ? data.address : undefined,
      }

      if (customerId) {
        await updateCustomerMutation.mutateAsync(customerData)
      } else {
        await createCustomerMutation.mutateAsync(customerData)
      }
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            {...register('name')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.name ? 'border-red-300' : ''
            }`}
            placeholder="Enter customer name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
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
              {customerId ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            customerId ? 'Update Customer' : 'Create Customer'
          )}
        </button>
      </div>
    </form>
  )
}

export default CustomerForm
