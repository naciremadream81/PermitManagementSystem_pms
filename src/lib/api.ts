import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import toast from 'react-hot-toast'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
        return Promise.reject(error)
      }
      
      // Handle validation errors
      if (status === 422 && data && typeof data === 'object' && 'errors' in data) {
        const errors = (data as any).errors
        Object.values(errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((error: string) => {
              toast.error(error)
            })
          }
        })
        return Promise.reject(error)
      }
      
      // Handle other errors
      if (data && typeof data === 'object' && 'message' in data) {
        toast.error((data as any).message || 'An error occurred')
      } else {
        toast.error(`Error ${status}: ${error.message}`)
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred.')
    }
    
    return Promise.reject(error)
  }
)

// API Service class
export class ApiService {
  // Authentication
  static async login(credentials: { email: string; password: string }) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  }

  static async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  }

  static async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data
  }

  // Users
  static async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const response = await api.get('/users', { params })
    return response.data
  }

  static async createUser(userData: { email: string; password: string; role: string; firstName?: string; lastName?: string }) {
    const response = await api.post('/users', userData)
    return response.data
  }

  static async updateUser(id: string, userData: Partial<{ email: string; role: string }>) {
    const response = await api.patch(`/users/${id}`, userData)
    return response.data
  }

  static async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }

  // Customers
  static async getCustomers(params?: { page?: number; limit?: number; q?: string }) {
    const response = await api.get('/customers', { params })
    return response.data
  }

  static async getCustomer(id: string) {
    const response = await api.get(`/customers/${id}`)
    return response.data
  }

  static async createCustomer(customerData: any) {
    const response = await api.post('/customers', customerData)
    return response.data
  }

  static async updateCustomer(id: string, customerData: any) {
    const response = await api.patch(`/customers/${id}`, customerData)
    return response.data
  }

  static async deleteCustomer(id: string) {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  }

  // Contractors
  static async getContractors(params?: { page?: number; limit?: number; q?: string }) {
    const response = await api.get('/contractors', { params })
    return response.data
  }

  static async getContractor(id: string) {
    const response = await api.get(`/contractors/${id}`)
    return response.data
  }

  static async createContractor(contractorData: any) {
    const response = await api.post('/contractors', contractorData)
    return response.data
  }

  static async updateContractor(id: string, contractorData: any) {
    const response = await api.patch(`/contractors/${id}`, contractorData)
    return response.data
  }

  static async deleteContractor(id: string) {
    const response = await api.delete(`/contractors/${id}`)
    return response.data
  }

  // Counties
  static async getCounties() {
    const response = await api.get('/counties')
    return response.data
  }

  static async getCounty(id: number) {
    const response = await api.get(`/counties/${id}`)
    return response.data
  }

  static async getCountyTemplates(countyId: number) {
    const response = await api.get(`/counties/${countyId}/templates`)
    return response.data
  }

  static async createCountyTemplate(countyId: number, templateData: any) {
    const response = await api.post(`/counties/${countyId}/templates`, templateData)
    return response.data
  }

  static async updateCountyTemplate(countyId: number, templateId: string, templateData: any) {
    const response = await api.patch(`/counties/${countyId}/templates/${templateId}`, templateData)
    return response.data
  }

  static async deleteCountyTemplate(countyId: number, templateId: string) {
    const response = await api.delete(`/counties/${countyId}/templates/${templateId}`)
    return response.data
  }

  // Packages
  static async getPackages(params?: any) {
    const response = await api.get('/packages', { params })
    return response.data
  }

  static async getPackage(id: string) {
    const response = await api.get(`/packages/${id}`)
    return response.data
  }

  static async createPackage(packageData: any) {
    const response = await api.post('/packages', packageData)
    return response.data
  }

  static async updatePackage(id: string, packageData: any) {
    const response = await api.patch(`/packages/${id}`, packageData)
    return response.data
  }

  static async deletePackage(id: string) {
    const response = await api.delete(`/packages/${id}`)
    return response.data
  }

  static async updatePackageStatus(id: string, statusData: { status: string; note?: string }) {
    const response = await api.patch(`/packages/${id}/status`, statusData)
    return response.data
  }

  static async updateMobileHomeDetails(id: string, mobileHomeData: any) {
    const response = await api.put(`/packages/${id}/mobile-home`, mobileHomeData)
    return response.data
  }

  // Checklist
  static async getPackageChecklist(packageId: string) {
    const response = await api.get(`/packages/${packageId}/checklist`)
    return response.data
  }

  static async updateChecklistItem(packageId: string, itemId: string, data: { completed: boolean }) {
    const response = await api.patch(`/packages/${packageId}/checklist/${itemId}`, data)
    return response.data
  }

  // Documents
  static async getPackageDocuments(packageId: string) {
    const response = await api.get(`/packages/${packageId}/documents`)
    return response.data
  }

  static async uploadDocument(packageId: string, documentData: any) {
    const response = await api.post(`/packages/${packageId}/documents`, documentData)
    return response.data
  }

  static async deleteDocument(packageId: string, documentId: string) {
    const response = await api.delete(`/packages/${packageId}/documents/${documentId}`)
    return response.data
  }

  static async getDocumentDownloadUrl(documentId: string) {
    const response = await api.get(`/documents/${documentId}/download`)
    return response.data
  }

  // PDF Operations
  static async getPdfFields(documentId: string) {
    const response = await api.get(`/documents/${documentId}/fields`)
    return response.data
  }

  static async updatePdfFields(documentId: string, fields: any[]) {
    const response = await api.put(`/documents/${documentId}/fields`, { fields })
    return response.data
  }

  static async fillPdf(packageId: string, documentId: string) {
    const response = await api.post(`/packages/${packageId}/fill-pdf`, { documentId })
    return response.data
  }

  // Signatures
  static async uploadSignature(packageId: string, signatureData: FormData) {
    const response = await api.post(`/packages/${packageId}/signatures`, signatureData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async getSignatures(packageId: string) {
    const response = await api.get(`/packages/${packageId}/signatures`)
    return response.data
  }

  // Status Logs
  static async getStatusLogs(packageId: string) {
    const response = await api.get(`/packages/${packageId}/logs`)
    return response.data
  }

  // File Upload
  static async getPresignedUrl(data: { key: string; op: 'put' | 'get' }) {
    const response = await api.post('/documents/presign', data)
    return response.data
  }

  static async uploadFile(presignedUrl: string, file: File) {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
    return response
  }
}

export default api
