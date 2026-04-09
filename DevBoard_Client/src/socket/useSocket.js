import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import usePresenceStore from '../store/presenceStore'
import api from '../api/axios'

let socketInstance = null

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const queryClient = useQueryClient()
  const { setOnline, setOffline, setMultipleOnline } = usePresenceStore()

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    // ✅ Prevent multiple connections
    if (socketInstance) return

    socketInstance = io('http://localhost:5000', {
      auth: { token },
      withCredentials: true,
    })

    // ✅ Connected
    socketInstance.on('connect', async () => {
      console.log('Socket connected:', socketInstance.id)

      try {
        const res = await api.get('/users/online')
        setMultipleOnline(res.data.data)
      } catch (err) {
        console.error('Failed to fetch online users:', err)
      }
    })

    // ✅ Presence updates
    socketInstance.on('user:online', ({ userId }) => {
      setOnline(userId)
    })

    socketInstance.on('user:offline', ({ userId }) => {
      setOffline(userId)
    })

    // ✅ Notifications
    socketInstance.on('notification', (notification) => {
      addNotification(notification)
    })

    // ✅ Project updates
    socketInstance.on('project:update', (update) => {
      const projectId = update.data?.projectId

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      }

      if (update.type === 'task:completed') {
        addNotification({
          type: update.type,
          data: update.data,
          timestamp: update.timestamp,
          read: false,
        })
      }
    })

    // ✅ Disconnect
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    // ✅ Error handling
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

// ✅ Utility functions
export const joinProjectRoom = (projectId) => {
  socketInstance?.emit('join:project', projectId)
}

export const leaveProjectRoom = (projectId) => {
  socketInstance?.emit('leave:project', projectId)
}

export const getSocket = () => socketInstance