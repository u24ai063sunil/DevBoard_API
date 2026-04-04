import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark', // default theme

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          // Apply to document root immediately
          document.documentElement.classList.remove('dark', 'light')
          document.documentElement.classList.add(newTheme)
          return { theme: newTheme }
        })
      },

      setTheme: (theme) => {
        document.documentElement.classList.remove('dark', 'light')
        document.documentElement.classList.add(theme)
        set({ theme })
      },
    }),
    {
      name: 'theme-storage', // persists to localStorage
    }
  )
)

export default useThemeStore