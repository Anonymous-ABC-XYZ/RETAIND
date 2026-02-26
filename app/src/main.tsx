import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { AccessControlProvider } from '@/contexts/AccessControlContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessControlProvider>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </AccessControlProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
