import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'

let socketInstance = null

export const useSocket = () => {
  const { isAuthenticated }  = useAuthStore()
  const addNotification      = useNotificationStore((s) => s.addNotification)
  const queryClient          = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    socketInstance = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
    })

    // Personal notifications
    socketInstance.on('notification', (notification) => {
      addNotification(notification)
    })

    // Project room updates — refetch tasks automatically
    socketInstance.on('project:update', (update) => {
      console.log('Live update:', update)

      // Extract projectId from the data
      const projectId = update.data?.projectId

      if (projectId) {
        // Invalidate tasks cache → React Query refetches automatically
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      }

      // Show notification for meaningful events
      if (update.type === 'task:completed') {
        addNotification({
          type:      update.type,
          data:      update.data,
          timestamp: update.timestamp,
          read:      false,
        })
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socketInstance.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })
    // Add to notificationStore or a separate store
    socketInstance.on('room:members', ({ projectId, count }) => {
      console.log(`${count} people viewing project ${projectId}`)
      // Store this in a simple ref or state
      window.__projectViewers = { ...window.__projectViewers, [projectId]: count }
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

export const joinProjectRoom  = (projectId) => socketInstance?.emit('join:project', projectId)
export const leaveProjectRoom = (projectId) => socketInstance?.emit('leave:project', projectId)
export const getSocket        = () => socketInstance