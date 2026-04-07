import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'

let socketInstance = null

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore()
  const addNotification     = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    // Create socket connection
    socketInstance = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
    })

    // Listen for personal notifications
    socketInstance.on('notification', (notification) => {
      console.log('Notification received:', notification)
      addNotification(notification)
    })

    // Listen for project updates (real-time task changes)
    socketInstance.on('project:update', (update) => {
      console.log('Project update:', update)
      // This triggers React Query to refetch
      addNotification({
        type: update.type,
        data: update.data,
        timestamp: update.timestamp,
        isProjectUpdate: true,
      })
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socketInstance.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
      }
    }
  }, [isAuthenticated])

  return socketInstance
}

// Join a project room
export const joinProjectRoom = (projectId) => {
  if (socketInstance) {
    socketInstance.emit('join:project', projectId)
  }
}

// Leave a project room
export const leaveProjectRoom = (projectId) => {
  if (socketInstance) {
    socketInstance.emit('leave:project', projectId)
  }
}

export const getSocket = () => socketInstance