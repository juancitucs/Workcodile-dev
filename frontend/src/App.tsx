import { AppProvider, useApp } from './components/app-context'
import { AuthPage } from './components/auth-page'
import { MainFeed } from './components/main-feed'
import { Toaster } from './components/ui/sonner'
import { SinglePostView } from './components/single-post-view'
import { MainLayout } from './components/MainLayout'
import { Snowflakes } from './components/snowflakes'
import { Loader2 } from 'lucide-react'
import { Routes, Route } from 'react-router-dom'

function AppContent() {
  const { authStatus } = useApp()

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen workcodile-bg flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (authStatus !== 'authenticated') {
    return <AuthPage />
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<MainFeed />} />
        <Route path="/post/:id" element={<SinglePostView />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Snowflakes /> {/* 🎄 Copos de nieve navideños */}
      <Toaster />
    </AppProvider>
  )
}
