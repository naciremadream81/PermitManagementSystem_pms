import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiService } from '../lib/api'
import { CreatePackageData, PermitType } from '../types'
import toast from 'react-hot-toast'

const mobileHomeSchema = z.object({
  makeModel: z.string().min(1, 'Make/Model is required'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  widthFt: z.coerce.number().int().positive().optional(),
  lengthFt: z.coerce.number().int().positive().optional(),
  serialVIN: z.string().optional(),
  hudLabel: z.string().optional(),
  installerLicense: z.string().optional(),
  foundationType: z.string().optional(),
  tieDownSystem: z.string().optional(),
  windZone: z.string().optional(),
})

const packageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  permitType: z.enum(['RESIDENTIAL', 'MOBILE_HOME', 'MODULAR_HOME']),
  customerId: z.string().min(1, 'Customer is required'),
  contractorId: z.string().min(1, 'Contractor is required'),
  countyId: z.coerce.number().int().positive('County is required'),
  dueDate: z.string().optional(),
  parcelNumber: z.string().optional(),
  floodZone: z.string().optional(),
  windExposure: z.string().optional(),
  zoningApprovalRef: z.string().optional(),
  siteAddress: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zip: z.string().min(1, 'ZIP code is required'),
  }).optional(),
  mobileHome: mobileHomeSchema.optional(),
})

type PackageFormData = z.infer<typeof packageSchema>

interface PackageFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<PackageFormData>
}

const PackageForm: React.FC<PackageFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data for dropdowns
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => ApiService.getCustomers({ limit: 100 }),
  })

  const { data: contractors } = useQuery({
    queryKey: ['contractors'],
    queryFn: () => ApiService.getContractors({ limit: 100 }),
  })

  const { data: counties } = useQuery({
    queryKey: ['counties'],
    queryFn: () => ApiService.getCounties(),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      permitType: 'RESIDENTIAL',
      siteAddress: { state: 'FL' },
      ...initialData,
    },
  })

  const permitType = watch('permitType')

  const createPackageMutation = useMutation({
    mutationFn: (data: CreatePackageData) => ApiService.createPackage(data),
    onSuccess: () => {
      toast.success('Package created successfully!')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to create package')
      console.error('Create package error:', error)
    },
  })

  const onSubmit = async (data: PackageFormData) => {
    try {
      setIsSubmitting(true)
      
      // Prepare the data for API
      const packageData: CreatePackageData = {
        title: data.title,
        permitType: data.permitType,
        customerId: data.customerId,
        contractorId: data.contractorId,
        countyId: data.countyId,
        dueDate: data.dueDate,
        parcelNumber: data.parcelNumber,
        floodZone: data.floodZone,
        windExposure: data.windExposure,
        zoningApprovalRef: data.zoningApprovalRef,
        siteAddress: data.siteAddress,
        mobileHome: data.mobileHome,
      }

      await createPackageMutation.mutateAsync(packageData)
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Package Title *
            </label>
            <input
              {...register('title')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.title ? 'border-red-300' : ''
              }`}
              placeholder="Enter package title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Permit Type *
            </label>
            <select
              {...register('permitType')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.permitType ? 'border-red-300' : ''
              }`}
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="MOBILE_HOME">Mobile Home</option>
              <option value="MODULAR_HOME">Modular Home</option>
            </select>
            {errors.permitType && (
              <p className="mt-1 text-sm text-red-600">{errors.permitType.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer *
            </label>
            <select
              {...register('customerId')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.customerId ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select a customer</option>
              {customers?.items?.map((customer: any) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contractor *
            </label>
            <select
              {...register('contractorId')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.contractorId ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select a contractor</option>
              {contractors?.items?.map((contractor: any) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.companyName}
                </option>
              ))}
            </select>
            {errors.contractorId && (
              <p className="mt-1 text-sm text-red-600">{errors.contractorId.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              County *
            </label>
            <select
              {...register('countyId')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.countyId ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select a county</option>
              {counties?.map((county: any) => (
                <option key={county.id} value={county.id}>
                  {county.name}
                </option>
              ))}
            </select>
            {errors.countyId && (
              <p className="mt-1 text-sm text-red-600">{errors.countyId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Site Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Site Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parcel Number
            </label>
            <input
              {...register('parcelNumber')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter parcel number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Flood Zone
            </label>
            <input
              {...register('floodZone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter flood zone"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wind Exposure
            </label>
            <input
              {...register('windExposure')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter wind exposure"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Zoning Approval Reference
            </label>
            <input
              {...register('zoningApprovalRef')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter zoning approval reference"
            />
          </div>
        </div>

        {/* Site Address */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Site Address</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line 1 *
            </label>
            <input
              {...register('siteAddress.line1')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.siteAddress?.line1 ? 'border-red-300' : ''
              }`}
              placeholder="Enter street address"
            />
            {errors.siteAddress?.line1 && (
              <p className="mt-1 text-sm text-red-600">{errors.siteAddress.line1.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line 2
            </label>
            <input
              {...register('siteAddress.line2')}
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
                {...register('siteAddress.city')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.siteAddress?.city ? 'border-red-300' : ''
                }`}
                placeholder="Enter city"
              />
              {errors.siteAddress?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.siteAddress.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State *
              </label>
              <input
                {...register('siteAddress.state')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.siteAddress?.state ? 'border-red-300' : ''
                }`}
                placeholder="FL"
                maxLength={2}
              />
              {errors.siteAddress?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.siteAddress.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ZIP Code *
              </label>
              <input
                {...register('siteAddress.zip')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.siteAddress?.zip ? 'border-red-300' : ''
                }`}
                placeholder="Enter ZIP code"
              />
              {errors.siteAddress?.zip && (
                <p className="mt-1 text-sm text-red-600">{errors.siteAddress.zip.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Home Details */}
      {permitType !== 'RESIDENTIAL' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {permitType === 'MOBILE_HOME' ? 'Mobile Home' : 'Modular Home'} Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Make/Model *
              </label>
              <input
                {...register('mobileHome.makeModel')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.mobileHome?.makeModel ? 'border-red-300' : ''
                }`}
                placeholder="Enter make and model"
              />
              {errors.mobileHome?.makeModel && (
                <p className="mt-1 text-sm text-red-600">{errors.mobileHome.makeModel.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="number"
                {...register('mobileHome.year')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter year"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Width (feet)
              </label>
              <input
                type="number"
                {...register('mobileHome.widthFt')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter width"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Length (feet)
              </label>
              <input
                type="number"
                {...register('mobileHome.lengthFt')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter length"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Serial/VIN
              </label>
              <input
                {...register('mobileHome.serialVIN')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter serial or VIN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                HUD Label
              </label>
              <input
                {...register('mobileHome.hudLabel')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter HUD label"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Foundation Type
              </label>
              <input
                {...register('mobileHome.foundationType')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., piers, slab, stem wall"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tie-down System
              </label>
              <input
                {...register('mobileHome.tieDownSystem')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter tie-down system details"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Installer License
              </label>
              <input
                {...register('mobileHome.installerLicense')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter installer license number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wind Zone
              </label>
              <input
                {...register('mobileHome.windZone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter wind zone"
              />
            </div>
          </div>
        </div>
      )}

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
              Creating...
            </div>
          ) : (
            'Create Package'
          )}
        </button>
      </div>
    </form>
  )
}

export default PackageForm
