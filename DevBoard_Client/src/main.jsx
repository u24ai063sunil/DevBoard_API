import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient()

// Apply saved theme before render — prevents flash of wrong theme
const savedTheme = JSON.parse(localStorage.getItem('theme-storage') || '{}')
const theme = savedTheme?.state?.theme || 'dark'
document.documentElement.classList.add(theme)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)