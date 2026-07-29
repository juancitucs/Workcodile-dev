import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User, FileAttachment, Post, Comment, Notification } from './types'
import { courses as COURSES_DATA, Course } from '../data/courses'
import { useAuthActions } from '../hooks/use-auth'
import { usePostActions } from '../hooks/use-posts'
import { useCommentActions } from '../hooks/use-comments'
import { useNotificationActions } from '../hooks/use-notifications'
import { useTheme } from '../hooks/use-theme'


interface AppContextType {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated'
  user: User | null
  posts: Post[]
  courses: Course[]
  notifications: Notification[]
  fetchPostById: (postId: string) => Promise<Post | undefined>
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  login: (email: string, password: string) => Promise<void>
  sendVerificationCode: (name: string, email: string, password: string) => Promise<any>
  verifyAndRegister: (email: string, password: string, verificationCode: string) => Promise<any>
  forgotPassword: (email: string) => Promise<any>
  resetPassword: (code: string, password: string) => Promise<any>
  logout: () => void
  updateProfile: (profileData: Partial<User>) => void
  createPost: (
    title: string, content: string, course: string, hashtags: string[], attachments: FileAttachment[]
  ) => Promise<void>
  deletePost: (postId: string) => Promise<void>
  updatePost: (postId: string, data: { title: string; content: string }) => Promise<void>
  votePost: (postId: string, vote: 'up' | 'down') => Promise<void>
  addComment: (
    postId: string, content: string, parentId?: string, attachments?: Omit<FileAttachment, 'id'>[]
  ) => Promise<void>
  voteComment: (postId: string, commentId: string, vote: 'up' | 'down') => Promise<void>
  fetchCommentReplies: (postId: string, commentId: string) => Promise<Comment[]>
  fetchMoreComments: (postId: string) => Promise<void>
  searchPosts: (query: string) => Post[]
  getCourseById: (courseId: string) => Course | undefined
  getCoursesByCycle: (cycle: number) => Course[]
  theme: 'light' | 'dark'
  toggleTheme: () => void
  christmasTheme: boolean
  toggleChristmasTheme: () => void
  toggleBookmark: (postId: string) => void
  reportPost: (postId: string, reason?: string) => void
  incrementViews: (postId: string) => void
  incrementViewsBatch: (postIds: string[]) => void
  mainFeedKey: number
  resetMainFeed: () => void
  fetchMorePosts: () => void
  hasMorePosts: boolean
  isFetchingPosts: boolean
  toggleComments: (postId: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const courses = COURSES_DATA

export function AppProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [mainFeedKey, setMainFeedKey] = useState(0)
  const [postPage, setPostPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [isFetchingPosts, setIsFetchingPosts] = useState(false)

  const { theme, setTheme, toggleTheme, christmasTheme, toggleChristmasTheme } = useTheme()

  const auth = useAuthActions({ setUser, setAuthStatus, setNotifications, setTheme })
  const postActions = usePostActions({ setPosts })
  const commentActions = useCommentActions({ posts, setPosts })
  const notifActions = useNotificationActions({ authStatus, notifications, setNotifications })

  useEffect(() => { auth.loadUser() }, [])
  useEffect(() => { notifActions.fetchNotifications() }, [authStatus])
  useEffect(() => {
    postActions.fetchInitialPosts(setIsFetchingPosts, setPostPage, setHasMorePosts)
  }, [user])

  const fetchMorePosts = () => {
    if (isFetchingPosts || !hasMorePosts) return
    postActions.fetchMorePosts(postPage + 1, setIsFetchingPosts, setPostPage, setHasMorePosts)
  }

  const resetMainFeed = () => {
    setMainFeedKey(prev => prev + 1)
    postActions.fetchInitialPosts(setIsFetchingPosts, setPostPage, setHasMorePosts)
  }

  const toggleThemeWithSave = () => {
    toggleTheme()
    auth.updateTheme(theme === 'light' ? 'dark' : 'light')
  }

  const updateProfile = (profileData: Partial<User>) => {
    if (user) setUser({ ...user, ...profileData })
  }

  const searchPosts = (query: string) => {
    if (!query.trim()) return posts
    const q = query.toLowerCase()
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      p.hashtags.some(t => t.toLowerCase().includes(q))
    )
  }

  const getCourseById = (courseId: string) => courses.find(c => c.id === courseId)
  const getCoursesByCycle = (cycle: number) => courses.filter(c => c.cycle === cycle)

  return (
    <AppContext.Provider value={{
      authStatus, user, posts, courses, notifications,
      fetchPostById: postActions.fetchPostById,
      markNotificationAsRead: notifActions.markNotificationAsRead,
      markAllNotificationsAsRead: notifActions.markAllNotificationsAsRead,
      login: auth.login,
      sendVerificationCode: auth.sendVerificationCode,
      verifyAndRegister: auth.verifyAndRegister,
      forgotPassword: auth.forgotPassword,
      resetPassword: auth.resetPassword,
      logout: auth.logout,
      updateProfile,
      createPost: (t, c, co, h, a) => postActions.createPost(t, c, co, h, a, user),
      deletePost: postActions.deletePost,
      updatePost: postActions.updatePost,
      votePost: postActions.votePost,
      addComment: (pid, content, parent, att) => commentActions.addComment(pid, content, parent, att, user),
      voteComment: commentActions.voteComment,
      fetchCommentReplies: commentActions.fetchCommentReplies,
      fetchMoreComments: commentActions.fetchMoreComments,
      searchPosts, getCourseById, getCoursesByCycle,
      theme, toggleTheme: toggleThemeWithSave,
      christmasTheme, toggleChristmasTheme,
      toggleBookmark: postActions.toggleBookmark,
      reportPost: postActions.reportPost,
      incrementViews: postActions.incrementViews,
      incrementViewsBatch: postActions.incrementViewsBatch,
      mainFeedKey, resetMainFeed, fetchMorePosts, hasMorePosts, isFetchingPosts,
      toggleComments: postActions.toggleComments,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}
