import { create } from 'zustand'

const usePresenceStore = create((set, get) => ({
  onlineUsers: new Set(),

  setOnline: (userId) => {
    set((state) => {
      const updated = new Set(state.onlineUsers)
      updated.add(userId.toString())
      return { onlineUsers: updated }
    })
  },

  setOffline: (userId) => {
    set((state) => {
      const updated = new Set(state.onlineUsers)
      updated.delete(userId.toString())
      return { onlineUsers: updated }
    })
  },

  setMultipleOnline: (userIds) => {
    set({ onlineUsers: new Set(userIds.map((id) => id.toString())) })
  },

  isOnline: (userId) => {
    return get().onlineUsers.has(userId?.toString())
  },
}))

export default usePresenceStore