import { AppProvider, useApp } from './components/app-context'
import { AuthPage } from './components/auth-page'
import { ForgotPasswordPage } from './components/forgot-password-page'
import { MainFeed } from './components/main-feed'
import { Toaster } from './components/ui/sonner'
import { SinglePostView } from './components/single-post-view'
import { MainLayout } from './components/MainLayout'
import { Snowflakes } from './components/snowflakes'
import { ChristmasMusicPlayer } from './components/ChristmasMusicPlayer'
import { ErrorBoundary } from './components/error-boundary'
import { Loader2 } from 'lucide-react'
import { Routes, Route, Navigate } from 'react-router-dom'

function AppContent() {
  const { authStatus } = useApp()

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen workcodile-bg flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Routes>
      {authStatus !== 'authenticated' ? (
        <>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </>
      ) : (
        <Route element={<MainLayout />}>
          <Route path="/" element={<MainFeed />} />
          <Route path="/post/:id" element={<SinglePostView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
        <Snowflakes /> {/* 🎄 Copos de nieve navideños */}
        <ChristmasMusicPlayer /> {/* 🎵 Música navideña */}
        <Toaster />
      </AppProvider>
    </ErrorBoundary>
  )
}
