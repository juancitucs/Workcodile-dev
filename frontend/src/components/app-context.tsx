import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  university: string
  theme?: string
}

interface Course {
  id: string
  name: string
  cycle: number
}

interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url?: string // For uploaded files
  file?: File // For local files
  object_key?: string
}

interface Post {
  id: string
  title: string
  content: string
  author: User
  createdAt: Date
  course: string // Course ID
  upvotes: number
  downvotes: number
  comments: Comment[]
  userVote?: 'up' | 'down'
  hashtags: string[]
  attachments: FileAttachment[]
  // Rating system
  rating: number // Average rating (0-5)
  averageRating?: number // Same as rating, for compatibility
  totalRatings: number // Total number of ratings
  userRating?: number // Current user's rating (0-5, 0 means no rating)
  // Additional fields
  views: number
  isBookmarked?: boolean
}

interface Comment {
  id: string
  content: string
  author: User
  createdAt: Date
  score: number
  userVote?: 'up' | 'down'
  replies: Comment[]
  parentId?: string
}

interface Notification {
  id: string
  text: string
  createdAt: Date
  read: boolean
}

interface AppContextType {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated'
  user: User | null
  posts: Post[]
  courses: Course[]
  notifications: Notification[]
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (profileData: Partial<User>) => void
  createPost: (
    title: string,
    content: string,
    course: string,
    hashtags: string[],
    attachments: FileAttachment[]
  ) => Promise<void>
  votePost: (postId: string, vote: 'up' | 'down') => Promise<void>
  addComment: (
    postId: string,
    content: string,
    parentId?: string
  ) => Promise<void>
  voteComment: (
    postId: string,
    commentId: string,
    vote: 'up' | 'down'
  ) => Promise<void>
  searchPosts: (query: string) => Post[]
  getCourseById: (courseId: string) => Course | undefined
  getCoursesByCycle: (cycle: number) => Course[]
  theme: 'light' | 'dark'
  toggleTheme: () => void
  // New rating and additional features
  ratePost: (postId: string, rating: number) => void
  toggleBookmark: (postId: string) => void
  reportPost: (postId: string) => void
  incrementViews: (postId: string) => void
  mainFeedKey: number
  resetMainFeed: () => void
  selectedPostId: string | null
  selectPost: (postId: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const courses: Course[] = [
  // Ciclo 1
  { id: 'IS-121', name: 'FUNDAMENTOS DE PROGRAMACION', cycle: 1 },
  { id: 'IS-122', name: 'MATEMATICA I', cycle: 1 },
  {
    id: 'IS-123',
    name: 'METODOLOGIA Y TECNICAS DE ESTUDIO UNIVERSITARIO',
    cycle: 1,
  },
  { id: 'IS-124', name: 'REDACCION Y COMUNICACION', cycle: 1 },
  { id: 'IS-125', name: 'FILOSOFIA', cycle: 1 },
  { id: 'IS-126', name: 'SOCIOLOGIA Y REALIDAD NACIONAL', cycle: 1 },
  { id: 'IS-127', name: 'BIOLOGIA Y MEDIO AMBIENTE', cycle: 1 },

  // Ciclo 2
  { id: 'IS-221', name: 'ESTRUCTURA DE DATOS', cycle: 2 },
  { id: 'IS-223', name: 'PROGRAMACION ORIENTADA A OBJETOS I', cycle: 2 },
  { id: 'IS-224', name: 'ALGEBRA LINEAL', cycle: 2 },
  { id: 'IS-225', name: 'MATEMATICAS DISCRETAS I', cycle: 2 },
  { id: 'IS-226', name: 'MATEMATICA II', cycle: 2 },
  { id: 'IS-227', name: 'ESTADISTICA BASICA', cycle: 2 },
  { id: 'IS-228', name: 'ETICA', cycle: 2 },

  // Ciclo 3
  { id: 'IS-321', name: 'ANALISIS Y DISEÑO DE ALGORITMOS', cycle: 3 },
  { id: 'IS-322', name: 'PROGRAMACION ORIENTADA A OBJETOS II', cycle: 3 },
  { id: 'IS-323', name: 'FUNDAMENTOS DE SISTEMAS DE INFORMACION', cycle: 3 },
  { id: 'IS-324', name: 'MATEMATICA III', cycle: 3 },
  { id: 'IS-325', name: 'MATEMATICAS DISCRETAS II', cycle: 3 },
  { id: 'IS-326', name: 'PROBABILIDADES', cycle: 3 },
  { id: 'IS-327', name: 'FISICA ELECTRICA', cycle: 3 },

  // Ciclo 4
  { id: 'IS-421', name: 'ALGORITMOS PARALELOS', cycle: 4 },
  { id: 'IS-422', name: 'ANALISIS Y DISEÑO DE SISTEMAS I', cycle: 4 },
  { id: 'IS-423', name: 'BASE DE DATOS I', cycle: 4 },
  { id: 'IS-424', name: 'SISTEMAS OPERATIVOS', cycle: 4 },
  { id: 'IS-425', name: 'MATEMATICA IV', cycle: 4 },
  { id: 'IS-426', name: 'CIRCUITOS ELECTRICOS Y ELECTRONICOS', cycle: 4 },
  { id: 'IS-427', name: 'INVESTIGACION OPERATIVA I', cycle: 4 },

  // Ciclo 5
  { id: 'IS-521', name: 'SISTEMAS DISTRIBUIDOS', cycle: 5 },
  { id: 'IS-522', name: 'ANALISIS Y DISEÑO DE SISTEMAS II', cycle: 5 },
  { id: 'IS-523', name: 'BASE DE DATOS II', cycle: 5 },
  { id: 'IS-524', name: 'APLICACIONES WEB I', cycle: 5 },
  { id: 'IS-525', name: 'METODOS NUMERICOS', cycle: 5 },
  { id: 'IS-526', name: 'SISTEMAS DIGITALES', cycle: 5 },
  { id: 'IS-527', name: 'INVESTIGACION OPERATIVA II', cycle: 5 },

  // Ciclo 6
  { id: 'IS-621', name: 'INGENIERIA DE SOFTWARE', cycle: 6 },
  { id: 'IS-622', name: 'BUSINESS INTELLIGENCE', cycle: 6 },
  { id: 'IS-623', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES I', cycle: 6 },
  { id: 'IS-624', name: 'APLICACIONES WEB II', cycle: 6 },
  { id: 'IS-625', name: 'REALIDAD AUMENTADA', cycle: 6 },
  { id: 'IS-626', name: 'ARQUITECTURA DE COMPUTADORAS', cycle: 6 },

  // Ciclo 7
  { id: 'IS-721', name: 'DATA MINING', cycle: 7 },
  { id: 'IS-722', name: 'CALIDAD DE SOFTWARE', cycle: 7 },
  { id: 'IS-723', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES II', cycle: 7 },
  { id: 'IS-724', name: 'PROGRAMACION DE VIDEO JUEGOS I', cycle: 7 },
  { id: 'IS-725', name: 'REDES I', cycle: 7 },
  { id: 'IS-726', name: 'LENGUAJE DE BAJO NIVEL', cycle: 7 },

  // Ciclo 8
  { id: 'IS-821', name: 'CLOUD COMPUTING', cycle: 8 },
  { id: 'IS-822', name: 'PROCESAMIENTO DE IMAGENES Y VIDEOS', cycle: 8 },
  { id: 'IS-823', name: 'PROYECTO DE INVESTIGACION I', cycle: 8 },
  { id: 'IS-824', name: 'PROGRAMACION DE VIDEO JUEGOS II', cycle: 8 },
  { id: 'IS-825', name: 'INTERACCION HUMANO COMPUTADOR', cycle: 8 },
  { id: 'IS-826', name: 'REDES II', cycle: 8 },
  { id: 'IS-827', name: 'ROBOTICA I', cycle: 8 },

  // Ciclo 9
  { id: 'IS-921', name: 'INTELIGENCIA ARTIFICIAL I', cycle: 9 },
  { id: 'IS-922', name: 'SEGURIDAD INFORMATICA', cycle: 9 },
  { id: 'IS-923', name: 'PROYECTO DE INVESTIGACION II', cycle: 9 },
  {
    id: 'IS-924',
    name: 'FORMACION DE EMPRESAS CON BASE TECNOLOGICA',
    cycle: 9,
  },
  { id: 'IS-925', name: 'PROYECTOS INFORMATICOS I', cycle: 9 },
  { id: 'IS-926', name: 'ROBOTICA II', cycle: 9 },
  {
    id: 'IS-927',
    name: 'ELECTIVO I: PLANEAMIENTO ESTRATEGICO DE SISTEMAS DE INFORMACION',
    cycle: 9,
  },
  { id: 'IS-928', name: 'ELECTIVO I: TOPICOS AVANZADOS I', cycle: 9 },

  // Ciclo 10
  { id: 'IS-1021', name: 'INTELIGENCIA ARTIFICIAL II', cycle: 10 },
  { id: 'IS-1022', name: 'AUDITORIA DE SISTEMAS DE INFORMACION', cycle: 10 },
  { id: 'IS-1023', name: 'SEGURIDAD DE LA INFORMACION', cycle: 10 },
  { id: 'IS-1024', name: 'SEMINARIO DE TESIS', cycle: 10 },
  {
    id: 'IS-1025',
    name: 'ELECTIVO II: PLANEAMIENTO ESTRATEGICO DE TECNOLOGIA DE INFORMACION',
    cycle: 10,
  },
  { id: 'IS-1026', name: 'PROYECTOS INFORMATICOS II', cycle: 10 },
  { id: 'IS-1027', name: 'ELECTIVO II: TOPICOS AVANZADOS II', cycle: 10 },
]

const mockNotifications: Notification[] = [
  {
    id: '1',
    text: 'Carlos Mendoza ha comentado en tu publicación "Busco tutor para Matemática II".',
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: '2',
    text: 'Tu publicación "Ofrezco servicios para Aplicaciones Web I" ha recibido 5 nuevos votos.',
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60),
    read: false,
  },
  {
    id: '3',
    text: 'María Rodriguez ha respondido a tu comentario en "Grupo de estudio para Estadística Básica".',
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 3),
    read: true,
  },
]

const transformBackendComment = (comment: any): Comment => {
  return {
    ...comment,
    id: comment._id,
    createdAt: new Date(comment.createdAt),
    author: {
      id: comment.author?._id?.toString() || '',
      name: comment.author?.name || 'Usuario Anónimo',
      avatar: comment.author?.avatar_key,
      university: 'UNAM',
      email: comment.author?.email || '',
    },
    replies: comment.replies ? comment.replies.map(transformBackendComment) : [],
  }
}

const transformBackendPost = (post: any): Post => ({
  id: post._id,
  title: post.title,
  content: post.content,
  author: {
    id: post.author?._id?.toString() || '',
    name: post.author?.name || 'Usuario Anónimo',
    avatar: post.author?.avatar_key,
    university: 'UNAM',
    email: post.author?.email || '',
  },
  createdAt: new Date(post.createdAt),
  course: post.course_id || '',
  upvotes: post.upvote_count || 0,
  downvotes: post.downvote_count || 0,
  comments: post.comments ? post.comments.map(transformBackendComment) : [],
  hashtags: post.hashtags || [],
  attachments: post.attachments ? post.attachments.map((att: any) => ({
    ...att,
    url: `http://localhost:3001/api/storage/${att.object_key}`,
  })) : [],
  rating: post.average_rating || 0,
  totalRatings: post.total_ratings || 0,
  views: post.views || 0,
  isBookmarked: false,
  userVote: undefined,
  userRating: 0,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mainFeedKey, setMainFeedKey] = useState(0)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    updateUserTheme(newTheme)
  }

  const updateUserTheme = async (newTheme: 'light' | 'dark') => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await fetch('http://localhost:3001/api/auth/user/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ theme: newTheme }),
      })
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/posts')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const transformedPosts: Post[] = data.map(transformBackendPost)

        setPosts(transformedPosts)
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
              'x-auth-token': token,
            },
          })

          if (!response.ok) {
            logout()
            setAuthStatus('unauthenticated')
            return
          }

          const userData = await response.json()
          setUser(userData)
          if (userData.theme) {
            setTheme(userData.theme)
          }
          setAuthStatus('authenticated')
        } catch (error) {
          console.error('Failed to load user session:', error)
          logout()
          setAuthStatus('unauthenticated')
        }
      } else {
        setAuthStatus('unauthenticated')
      }
    }

    loadUser()
  }, [])

  const resetMainFeed = () => setMainFeedKey((prev) => prev + 1)
  const selectPost = (postId: string | null) => setSelectedPostId(postId)

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || 'Error al iniciar sesión')
    }

    const { token, user: userData } = await response.json()
    localStorage.setItem('token', token)
    setUser(userData)
    if (userData.theme) {
      setTheme(userData.theme)
    }
    setAuthStatus('authenticated')
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || 'Error al registrarse')
    }

    const { token, user: userData } = await response.json()
    localStorage.setItem('token', token)
    setUser(userData)
    if (userData.theme) {
      setTheme(userData.theme)
    }
    setAuthStatus('authenticated')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setAuthStatus('unauthenticated')
  }

  const updateProfile = (profileData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...profileData })
    }
  }

  const createPost = async (
    title: string,
    content: string,
    course: string,
    hashtags: string[],
    attachments: FileAttachment[]
  ) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ title, content, course, hashtags, attachments }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const newPost = await response.json()
      const transformedPost = transformBackendPost(newPost)
      setPosts((prev) => [transformedPost, ...prev])
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const votePost = async (postId: string, vote: 'up' | 'down') => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(
        `http://localhost:3001/api/posts/${postId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ vote }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to vote on post')
      }

      const updatedPost = await response.json()
      const transformedPost = transformBackendPost(updatedPost)

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? transformedPost : p))
      )
    } catch (error) {
      console.error('Error voting on post:', error)
    }
  }

  const addComment = async (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(
        `http://localhost:3001/api/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ content, parentId }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const updatedPost = await response.json()
      const transformedPost = transformBackendPost(updatedPost)

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? transformedPost : p))
      )
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const voteComment = async (
    postId: string,
    commentId: string,
    vote: 'up' | 'down'
  ) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(
        `http://localhost:3001/api/posts/${postId}/comments/${commentId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ vote }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to vote on comment')
      }

      const updatedPost = await response.json()
      const transformedPost = transformBackendPost(updatedPost)

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? transformedPost : p))
      )
    } catch (error) {
      console.error('Error voting on comment:', error)
    }
  }

  const searchPosts = (query: string) => {
    if (!query.trim()) return posts

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.author.name.toLowerCase().includes(query.toLowerCase()) ||
        post.hashtags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    )
  }

  const getCourseById = (courseId: string) => {
    return courses.find((course) => course.id === courseId)
  }

  const getCoursesByCycle = (cycle: number) => {
    return courses.filter((course) => course.cycle === cycle)
  }

  const ratePost = (postId: string, rating: number) => {
    if (!user) return

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const wasUserRated = post.userRating && post.userRating > 0
          const newTotalRatings = wasUserRated
            ? post.totalRatings
            : post.totalRatings + 1

          const currentTotal = post.rating * post.totalRatings
          const newTotal = wasUserRated
            ? currentTotal - (post.userRating || 0) + rating
            : currentTotal + rating
          const newAverageRating =
            newTotalRatings > 0 ? newTotal / newTotalRatings : 0

          console.log(
            `Usuario ${user.name} calificó el post "${post.title}" con ${rating} cocodrilos`
          )

          return {
            ...post,
            rating: newAverageRating,
            totalRatings: newTotalRatings,
            userRating: rating,
          }
        }
        return post
      })
    )
  }

  const toggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarked: !post.isBookmarked,
          }
        }
        return post
      })
    )
  }

  const reportPost = (postId: string) => {
    console.log(`Post ${postId} reported by user ${user?.id}`)
  }

  const incrementViews = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            views: post.views + 1,
          }
        }
        return post
      })
    )
  }

  return (
    <AppContext.Provider
      value={{
        authStatus,
        user,
        posts,
        courses,
        notifications,
        login,
        register,
        logout,
        updateProfile,
        createPost,
        votePost,
        addComment,
        voteComment,
        searchPosts,
        getCourseById,
        getCoursesByCycle,
        theme,
        toggleTheme,
        ratePost,
        toggleBookmark,
        reportPost,
        incrementViews,
        mainFeedKey,
        resetMainFeed,
        selectedPostId,
        selectPost,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
