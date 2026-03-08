import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { AppLayout } from '@/components/layouts/AppLayout'

// Lazy load pages for better performance
const Landing = lazy(() => import('@/pages/Landing'))
const SignIn = lazy(() => import('@/pages/SignIn'))
const SignUp = lazy(() => import('@/pages/SignUp'))
const Contact = lazy(() => import('@/pages/Contact'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const People = lazy(() => import('@/pages/People'))
const WorkerProfile = lazy(() => import('@/pages/WorkerProfile'))
const Templates = lazy(() => import('@/pages/Templates'))
const Issues = lazy(() => import('@/pages/Issues'))
const Playbooks = lazy(() => import('@/pages/Playbooks'))
const Certificate = lazy(() => import('@/pages/Certificate'))
const Plans = lazy(() => import('@/pages/Plans'))
const Settings = lazy(() => import('@/pages/Settings'))
const Account = lazy(() => import('@/pages/Account'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}

// Public route wrapper (redirects to app if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />

          {/* Auth routes */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <AuthLayout>
                  <SignIn />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <AuthLayout>
                  <SignUp />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route path="/contact" element={<Contact />} />

          {/* Protected app routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="people" element={<People />} />
            <Route path="people/:workerId" element={<WorkerProfile />} />
            <Route path="templates" element={<Templates />} />
            <Route path="issues" element={<Issues />} />
            <Route path="playbooks" element={<Playbooks />} />
            <Route path="certificate" element={<Certificate />} />
            <Route path="plans" element={<Plans />} />
            <Route path="settings" element={<Settings />} />
            <Route path="account" element={<Account />} />
          </Route>

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
