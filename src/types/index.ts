// User and Authentication
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'ADMIN' | 'USER'
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Address
export interface Address {
  id: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
}

// Customer
export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: Address
  addressId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerData {
  name: string
  phone?: string
  email?: string
  address?: Omit<Address, 'id'>
}

// Contractor
export interface Contractor {
  id: string
  companyName: string
  contactName?: string
  phone?: string
  email?: string
  licenseNumber?: string
  address?: Address
  addressId?: string
}

export interface CreateContractorData {
  companyName: string
  contactName?: string
  phone?: string
  email?: string
  licenseNumber?: string
  address?: Omit<Address, 'id'>
}

// County
export interface County {
  id: number
  name: string
}

// Permit Types and Status
export type PermitType = 'RESIDENTIAL' | 'MOBILE_HOME' | 'MODULAR_HOME'
export type PackageStatus = 'DRAFT' | 'IN_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CLOSED'

// Mobile Home Details
export interface MobileHomeDetails {
  id: string
  packageId: string
  makeModel?: string
  year?: number
  widthFt?: number
  lengthFt?: number
  serialVIN?: string
  hudLabel?: string
  installerLicense?: string
  foundationType?: string
  tieDownSystem?: string
  windZone?: string
}

export interface CreateMobileHomeData {
  makeModel?: string
  year?: number
  widthFt?: number
  lengthFt?: number
  serialVIN?: string
  hudLabel?: string
  installerLicense?: string
  foundationType?: string
  tieDownSystem?: string
  windZone?: string
}

// Permit Package
export interface PermitPackage {
  id: string
  title: string
  permitType: PermitType
  status: PackageStatus
  dueDate?: string
  parcelNumber?: string
  floodZone?: string
  windExposure?: string
  zoningApprovalRef?: string
  customer: Customer
  customerId: string
  contractor: Contractor
  contractorId: string
  county: County
  countyId: number
  siteAddress?: Address
  siteAddressId?: string
  mobileHome?: MobileHomeDetails
  createdBy: User
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface CreatePackageData {
  title: string
  permitType: PermitType
  customerId: string
  contractorId: string
  countyId: number
  dueDate?: string
  parcelNumber?: string
  floodZone?: string
  windExposure?: string
  zoningApprovalRef?: string
  siteAddress?: Omit<Address, 'id'>
  mobileHome?: CreateMobileHomeData
}

export interface UpdatePackageData {
  title?: string
  permitType?: PermitType
  dueDate?: string
  parcelNumber?: string
  floodZone?: string
  windExposure?: string
  zoningApprovalRef?: string
  siteAddress?: Omit<Address, 'id'>
}

// Checklist
export interface CountyChecklistTemplateItem {
  id: string
  countyId: number
  label: string
  category: string
  permitType?: PermitType
  required: boolean
  sort: number
}

export interface PackageChecklistItem {
  id: string
  packageId: string
  label: string
  category: string
  required: boolean
  completed: boolean
  completedAt?: string
}

export interface CreateChecklistItemData {
  label: string
  category: string
  permitType?: PermitType
  required?: boolean
  sort?: number
}

// Documents
export type DocumentType = 'PDF_TEMPLATE' | 'FILLED_PDF' | 'ATTACHMENT' | 'PHOTO'

export interface Document {
  id: string
  packageId: string
  type: DocumentType
  tag?: string
  objectKey: string
  filename: string
  mime: string
  size: number
  uploadedBy: User
  uploadedById: string
  createdAt: string
}

export interface CreateDocumentData {
  type: DocumentType
  tag?: string
  filename: string
  mime: string
  size: number
}

// PDF Field Mapping
export type FieldSource = 'CUSTOMER' | 'CONTRACTOR' | 'PACKAGE' | 'MOBILE_HOME' | 'MANUAL'

export interface PdfFieldMap {
  id: string
  templateDocumentId: string
  fieldName: string
  source: FieldSource
  sourcePath?: string
  transform?: string
}

export interface CreateFieldMapData {
  fieldName: string
  source: FieldSource
  sourcePath?: string
  transform?: string
}

// Status Log
export interface StatusLog {
  id: string
  packageId: string
  status: PackageStatus
  note?: string
  createdBy: User
  createdById: string
  createdAt: string
}

export interface CreateStatusLogData {
  status: PackageStatus
  note?: string
}

// Signature
export interface Signature {
  id: string
  packageId: string
  signedBy: User
  signedById: string
  imageObjectKey: string
  createdAt: string
}

// API Responses
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Search and Filter
export interface PackageFilters {
  q?: string
  status?: PackageStatus[]
  countyId?: number
  permitType?: PermitType[]
  dueBefore?: string
  dueAfter?: string
  assignedTo?: string
}

export interface SearchParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Real-time Events
export interface PresenceEvent {
  id: string
  join: boolean
  user?: User
}

export interface ChecklistToggleEvent {
  itemId: string
  completed: boolean
  userId: string
}

export interface StatusChangeEvent {
  status: PackageStatus
  note?: string
  userId: string
}

// Form Data Types
export interface PackageFormData {
  title: string
  permitType: PermitType
  customerId: string
  contractorId: string
  countyId: number
  dueDate?: string
  parcelNumber?: string
  floodZone?: string
  windExposure?: string
  zoningApprovalRef?: string
  siteAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  mobileHome?: CreateMobileHomeData
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}
