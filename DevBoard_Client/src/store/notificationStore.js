import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,

  addNotification: (notification) => {
    // Skip project updates from notification bell
    if (notification.isProjectUpdate) return

    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount:   state.unreadCount + 1,
    }))
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount:   0,
    }))
  },

  markRead: (index) => {
    set((state) => {
      const updated = [...state.notifications]
      if (!updated[index].read) {
        updated[index] = { ...updated[index], read: true }
        return {
          notifications: updated,
          unreadCount:   Math.max(0, state.unreadCount - 1),
        }
      }
      return state
    })
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))

export default useNotificationStore