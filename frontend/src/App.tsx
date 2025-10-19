import { AppProvider, useApp } from './components/app-context'
import { AuthPage } from './components/auth-page'
import { MainFeed } from './components/main-feed'
import { Toaster } from './components/ui/sonner'
import { SinglePostView } from './components/single-post-view'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { authStatus, mainFeedKey, selectedPostId } = useApp()

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

  if (selectedPostId) {
    return <SinglePostView />
  }

  return <MainFeed key={mainFeedKey} />
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  )
}
