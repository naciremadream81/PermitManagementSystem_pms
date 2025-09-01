import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { PresenceEvent, ChecklistToggleEvent, StatusChangeEvent } from '../types'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinPackage: (packageId: string) => void
  leavePackage: (packageId: string) => void
  toggleChecklistItem: (packageId: string, itemId: string, completed: boolean) => void
  updateStatus: (packageId: string, status: string, note?: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentPackage, setCurrentPackage] = useState<string | null>(null)

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:4000', {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
      })

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user])

  const joinPackage = (packageId: string) => {
    if (socket && isConnected) {
      if (currentPackage) {
        socket.emit('leave', { packageId: currentPackage })
      }
      
      socket.emit('join', { packageId })
      setCurrentPackage(packageId)
      
      // Listen for package-specific events
      socket.on(`package:${packageId}:presence`, (data: PresenceEvent) => {
        console.log('Presence event:', data)
        // Handle presence updates (e.g., show who's viewing the package)
      })

      socket.on(`package:${packageId}:checklist`, (data: ChecklistToggleEvent) => {
        console.log('Checklist toggle event:', data)
        // Handle checklist updates (e.g., update UI without refetching)
      })

      socket.on(`package:${packageId}:status`, (data: StatusChangeEvent) => {
        console.log('Status change event:', data)
        // Handle status updates
      })
    }
  }

  const leavePackage = (packageId: string) => {
    if (socket && isConnected) {
      socket.emit('leave', { packageId })
      setCurrentPackage(null)
      
      // Remove package-specific event listeners
      socket.off(`package:${packageId}:presence`)
      socket.off(`package:${packageId}:checklist`)
      socket.off(`package:${packageId}:status`)
    }
  }

  const toggleChecklistItem = (packageId: string, itemId: string, completed: boolean) => {
    if (socket && isConnected) {
      socket.emit('checklist:toggle', {
        packageId,
        itemId,
        completed,
      })
    }
  }

  const updateStatus = (packageId: string, status: string, note?: string) => {
    if (socket && isConnected) {
      socket.emit('status:update', {
        packageId,
        status,
        note,
      })
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    joinPackage,
    leavePackage,
    toggleChecklistItem,
    updateStatus,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
