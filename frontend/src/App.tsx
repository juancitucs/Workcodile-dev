import { AppProvider, useApp } from './components/app-context'
import { AuthPage } from './components/auth-page'
import { MainFeed } from './components/main-feed'
import { Toaster } from './components/ui/sonner'
import { SinglePostView } from './components/single-post-view'

function AppContent() {
  const { user, mainFeedKey, selectedPostId } = useApp()

  if (!user) {
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
