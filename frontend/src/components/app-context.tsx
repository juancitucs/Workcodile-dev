import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { User, Course, FileAttachment, Post, Comment, Notification } from './types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email: string, code: string, password: string) => Promise<any>;
  logout: () => void
  updateProfile: (profileData: Partial<User>) => void
  createPost: (
    title: string,
    content: string,
    course: string,
    hashtags: string[],
    attachments: FileAttachment[]
  ) => Promise<void>
  deletePost: (postId: string) => Promise<void>
  updatePost: (postId: string, data: { title: string; content: string }) => Promise<void>
  votePost: (postId: string, vote: 'up' | 'down') => Promise<void>
  addComment: (
    postId: string,
    content: string,
    parentId?: string,
    attachments?: Omit<FileAttachment, 'id'>[]
  ) => Promise<void>
  voteComment: (
    postId: string,
    commentId: string,
    vote: 'up' | 'down'
  ) => Promise<void>
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

const transformBackendComment = (comment: any): Comment => {
  const transformedReplies = comment.replies
    ? comment.replies.map(transformBackendComment).sort((a: Comment, b: Comment) => b.score - a.score)
    : [];
  return {
    ...comment,
    id: comment._id,
    createdAt: new Date(comment.createdAt),
    author: {
      id: comment.author?._id?.toString() || '',
      name: comment.author?.name?.trim() || 'Usuario Anónimo',
      avatar: comment.author?.avatar_key ? comment.author.avatar : undefined,
      university: 'UNAM',
      email: comment.author?.email || '',
      level: comment.author?.level || 1, // Nivel del usuario para el badge
    },
    attachments: comment.attachments ? comment.attachments.map((att: any) => ({
      ...att,
    })) : [],
    score: comment.score,
    userVote: comment.user_vote,
    replies: transformedReplies,
  }
}

const transformBackendPost = (post: any): Post => ({
  id: post._id,
  title: post.title,
  content: post.content,
  author: {
    id: post.author?._id?.toString() || '',
    name: post.author?.name?.trim() || 'Usuario Anónimo',
    avatar: post.author?.avatar_key ? post.author.avatar : undefined,
    university: 'UNAM',
    email: post.author?.email || '',
    level: post.author?.level || 1, // Nivel del usuario para el badge
  },
  createdAt: new Date(post.createdAt),
  course: post.course_id || '',
  upvotes: post.upvote_count || 0,
  downvotes: post.downvote_count || 0,
  comments: post.comments
    ? post.comments.map(transformBackendComment).sort((a: Comment, b: Comment) => b.score - a.score)
    : [],
  hashtags: post.hashtags || [],
  attachments: post.attachments ? post.attachments.map((att: any) => ({
    ...att,
  })) : [],
  views: post.views || 0,
  isBookmarked: false,
  userVote: post.user_vote,
  commentsDisabled: post.commentsDisabled || false,
  // Comment pagination
  totalComments: post.totalComments,
  hasMoreComments: post.hasMoreComments,
  commentOffset: post.commentOffset,
})

const transformBackendNotification = (notification: any): Notification => ({
  id: notification._id,
  text: notification.text,
  createdAt: new Date(notification.createdAt),
  read: notification.read,
  link: notification.link,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [christmasTheme, setChristmasTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('workcodile-christmas-theme');
    return saved === 'true';
  })
  const [mainFeedKey, setMainFeedKey] = useState(0)
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

  // Efecto para tema claro/oscuro
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  // Efecto para tema navideño
  useEffect(() => {
    const root = window.document.documentElement
    if (christmasTheme) {
      root.classList.add('christmas')
    } else {
      root.classList.remove('christmas')
    }
    localStorage.setItem('workcodile-christmas-theme', christmasTheme.toString())
  }, [christmasTheme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    updateUserTheme(newTheme)
  }

  const toggleChristmasTheme = () => {
    setChristmasTheme(prev => !prev)
  }

  const updateUserTheme = async (newTheme: 'light' | 'dark') => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await fetch(`${API_BASE_URL}/api/auth/user/theme`, {
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

  const fetchInitialPosts = async () => {
    setIsFetchingPosts(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts?page=1`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json();

      const transformedPosts: Post[] = data.posts.map(transformBackendPost);
      setPosts(transformedPosts);
      setPostPage(1);
      setHasMorePosts(data.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsFetchingPosts(false);
    }
  }

  const fetchMorePosts = async () => {
    if (isFetchingPosts || !hasMorePosts) return;

    setIsFetchingPosts(true);
    const nextPage = postPage + 1;
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts?page=${nextPage}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json();

      const transformedPosts: Post[] = data.posts.map(transformBackendPost);
      setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      setPostPage(nextPage);
      setHasMorePosts(data.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch more posts:', error);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  useEffect(() => {
    fetchInitialPosts();
  }, [user]);

  const fetchPostById = async (postId: string): Promise<Post | undefined> => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const transformedPost = transformBackendPost(data);

      // Opcionalmente, actualizar el estado global de posts
      setPosts(prevPosts => {
        const postExists = prevPosts.some(p => p.id === transformedPost.id);
        if (postExists) {
          return prevPosts.map(p => p.id === transformedPost.id ? transformedPost : p);
        }
        return [...prevPosts, transformedPost];
      });

      return transformedPost;
    } catch (error) {
      console.error('Failed to fetch post by ID:', error);
      return undefined;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
          // El backend ahora retorna la URL completa del avatar directamente
          // if (userData.avatar_key) {
          //   userData.avatar = `${API_BASE_URL}/workcodile-files/${userData.avatar_key}`;
          // }
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

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token')
      if (authStatus === 'authenticated' && token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/notifications`, {
            headers: {
              'x-auth-token': token,
            },
          })
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          const transformedNotifications: Notification[] = data.map(transformBackendNotification)
          setNotifications(transformedNotifications)
        } catch (error) {
          console.error('Failed to fetch notifications:', error)
        }
      }
    }

    fetchNotifications()
  }, [authStatus])

  const markNotificationAsRead = async (notificationId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    const originalNotifications = notifications;
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      })

      if (!response.ok) {
        setNotifications(originalNotifications);
        throw new Error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      setNotifications(originalNotifications);
    }
  }

  const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Actualizar la UI optimistamente
    const originalNotifications = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read/all`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      })

      if (!response.ok) {
        // Revertir en caso de error
        setNotifications(originalNotifications);
        throw new Error('Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Revertir en caso de error
      setNotifications(originalNotifications);
    }
  }

  const resetMainFeed = () => {
    setMainFeedKey((prev) => prev + 1)
    fetchInitialPosts()
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
    // El backend ahora retorna la URL completa del avatar directamente
    // if (userData.avatar_key) {
    //   userData.avatar = `${API_BASE_URL}/workcodile-files/${userData.avatar_key}`;
    // }
    setUser(userData)
    if (userData.theme) {
      setTheme(userData.theme)
    }
    setAuthStatus('authenticated')
  }

  const sendVerificationCode = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.msg || 'Error al enviar el código de verificación')
    }

    return responseData; // Retorna { msg: 'Código de verificación enviado...' }
  }

  const verifyAndRegister = async (email: string, password: string, verificationCode: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-and-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, verificationCode }),
    })

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.msg || 'Error al verificar el código o registrar el usuario')
    }

    // En verificación y registro exitosos, iniciar sesión del usuario directamente
    const { token, user: userData } = responseData;
    localStorage.setItem('token', token);
    // El backend ahora retorna la URL completa del avatar directamente
    // if (userData.avatar_key) {
    //   userData.avatar = `${API_BASE_URL}/workcodile-files/${userData.avatar_key}`;
    // }
    setUser(userData);
    if (userData.theme) {
      setTheme(userData.theme);
    }
    setAuthStatus('authenticated');
    return responseData; // Retorna { token, user }
  }

  const forgotPassword = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.msg || 'Error al enviar el correo de recuperación');
    }

    return responseData;
  };

  const resetPassword = async (code: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, password }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.msg || 'Error al restablecer la contraseña');
    }

    return responseData;
  };

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setAuthStatus('unauthenticated')
    setNotifications([])
  }

  const updateProfile = (profileData: Partial<User>) => {
    if (user) {
      const newProfile = { ...user, ...profileData };
      // Backend now returns the full avatar URL directly
      // if (newProfile.avatar_key) {
      //   newProfile.avatar = `${API_BASE_URL}/workcodile-files/${newProfile.avatar_key}`;
      // }
      setUser(newProfile);
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
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
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

    // Guardar el estado original de posts para revertir en caso de error
    let originalPosts: Post[] = [];

    try {
      setPosts((prev) => {
        originalPosts = prev; // Guardar el estado antes de actualización optimista
        const postIndex = prev.findIndex(p => p.id === postId);
        if (postIndex === -1) return prev; // Post no encontrado

        const originalPost = prev[postIndex];
        let newUpvotes = originalPost.upvotes;
        let newDownvotes = originalPost.downvotes;
        let newUserVote = originalPost.userVote;

        // Determinar nuevos conteos de votos y estado de userVote
        if (vote === 'up') {
          if (originalPost.userVote === 'up') { // Usuario está quitando su upvote
            newUpvotes--;
            newUserVote = null;
          } else { // Usuario está dando upvote
            newUpvotes++;
            if (originalPost.userVote === 'down') { // Usuario tenía downvote, quitar downvote
              newDownvotes--;
            }
            newUserVote = 'up';
          }
        } else { // vote === 'down'
          if (originalPost.userVote === 'down') { // Usuario está quitando su downvote
            newDownvotes--;
            newUserVote = null;
          } else { // Usuario está dando downvote
            newDownvotes++;
            if (originalPost.userVote === 'up') { // Usuario tenía upvote, quitar upvote
              newUpvotes--;
            }
            newUserVote = 'down';
          }
        }

        const optimisticPost = {
          ...originalPost,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote,
        };

        const newPosts = [...prev];
        newPosts[postIndex] = optimisticPost;
        return newPosts;
      });

      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/vote`,
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
        throw new Error('Failed to vote on post'); // Error during API call
      }

      // Reconcile with backend's response (optional, but good for consistency)
      const updatedPostFromServer = await response.json();
      const transformedPostFromServer = transformBackendPost(updatedPostFromServer);

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? transformedPostFromServer : p))
      );

    } catch (error) {
      console.error('Error voting on post:', error);
      // Rollback to original state if API call fails
      setPosts(originalPosts);
      // Optionally show a toast notification for the error
    }
  }

  const addComment = async (
    postId: string,
    content: string,
    parentId?: string,
    attachments: Omit<FileAttachment, 'id'>[] = []
  ) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    // Create a temporary optimistic comment
    const tempCommentId = `temp-${Date.now()}`
    const optimisticComment: Comment = {
      id: tempCommentId,
      content,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        university: user.university,
        level: user.level,
      },
      createdAt: new Date(),
      score: 0,
      userVote: undefined,
      replies: [],
      parentId,
      attachments: attachments.map((att, index) => ({
        ...att,
        id: `temp-att-${index}`,
      })) as FileAttachment[],
    }

    // Helper to add comment to the right place in the tree
    const addCommentToTree = (comments: Comment[], newComment: Comment, targetParentId?: string): Comment[] => {
      if (!targetParentId) {
        // Add to root level
        return [...comments, newComment]
      }
      // Add as reply to a parent comment
      return comments.map(comment => {
        if (comment.id === targetParentId) {
          return { ...comment, replies: [...comment.replies, newComment] }
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: addCommentToTree(comment.replies, newComment, targetParentId) }
        }
        return comment
      })
    }

    // Optimistic update - show comment immediately
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: addCommentToTree(p.comments, optimisticComment, parentId),
          }
        }
        return p
      })
    )

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ content, parentId, attachments }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      // Reconcile with server response to get the real comment ID
      const updatedPost = await response.json()
      const transformedPost = transformBackendPost(updatedPost)

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? transformedPost : p))
      )
    } catch (error) {
      console.error('Error adding comment:', error)
      // Rollback optimistic update on error
      const removeCommentFromTree = (comments: Comment[], commentId: string): Comment[] => {
        return comments
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: removeCommentFromTree(c.replies, commentId)
          }))
      }

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: removeCommentFromTree(p.comments, tempCommentId),
            }
          }
          return p
        })
      )
    }
  }

  // Helper function to find and optimistically update a comment in a nested structure
  const findAndUpdateCommentRecursive = (
    comments: Comment[],
    targetCommentId: string,
    vote: 'up' | 'down',
    userId: string // Not directly used for userVote anymore, but can be for score if needed
  ): Comment[] => {
    return comments.map(comment => {
      if (comment.id === targetCommentId) {
        let newScore = comment.score;
        let newUserVote = comment.userVote;
        console.log(`Optimistically updating comment: ${targetCommentId}, new userVote: ${newUserVote}, new score: ${newScore}`); if (vote === 'up') {
          if (comment.userVote === 'up') { // Un-upvoting
            newScore--;
            newUserVote = null;
          } else { // Upvoting
            newScore++;
            newUserVote = 'up';
            if (comment.userVote === 'down') { // Was downvoting
              newScore++; // Undo previous downvote from score
            }
          }
        } else { // vote === 'down'
          if (comment.userVote === 'down') { // Un-downvoting
            newScore++;
            newUserVote = null;
          } else { // Downvoting
            newScore--;
            newUserVote = 'down';
            if (comment.userVote === 'up') { // Was upvoting
              newScore--; // Undo previous upvote from score
            }
          }
        }

        return {
          ...comment,
          score: newScore,
          userVote: newUserVote,
        };
      } else if (comment.replies && comment.replies.length > 0) {
        // Recursively check replies
        return {
          ...comment,
          replies: findAndUpdateCommentRecursive(comment.replies, targetCommentId, vote, userId),
        };
      }
      return comment; // No change to this comment or its replies
    });
  };

  const voteComment = async (
    postId: string,
    commentId: string,
    vote: 'up' | 'down'
  ) => {
    const token = localStorage.getItem('token')
    if (!token) return
    if (!user) return; // Must be logged in to vote

    let originalPosts: Post[] = [];

    try {
      setPosts((prevPosts) => {
        originalPosts = prevPosts; // Store original state for rollback
        const postIndex = prevPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return prevPosts;

        const postToUpdate = { ...prevPosts[postIndex] }; // Deep copy the post

        // Optimistically update the comment within the post's comments tree
        const updatedComments = findAndUpdateCommentRecursive(
          postToUpdate.comments,
          commentId,
          vote,
          user.id
        );

        const optimisticPost = {
          ...postToUpdate,
          comments: updatedComments,
        };

        const newPosts = [...prevPosts];
        newPosts[postIndex] = optimisticPost;
        return newPosts;
      });

      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}/vote`,
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

      // Reconcile with backend's response
      const updatedPostFromServer = await response.json();
      const transformedPostFromServer = transformBackendPost(updatedPostFromServer);

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? transformedPostFromServer : p))
      );

    } catch (error) {
      console.error('Error voting on comment:', error)
      // Rollback to original state
      setPosts(originalPosts);
      // Optionally show a toast notification for the error
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

  const fetchCommentReplies = async (postId: string, commentId: string): Promise<Comment[]> => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}/replies`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json();
      return data.map(transformBackendComment);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      return [];
    }
  }

  // Fetch more comments for a post (pagination)
  const fetchMoreComments = async (postId: string) => {
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {}
    if (token) {
      headers['x-auth-token'] = token
    }

    const currentPost = posts.find(p => p.id === postId)
    if (!currentPost || !currentPost.hasMoreComments) return

    const currentOffset = currentPost.comments.length
    const limit = 5

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}?commentOffset=${currentOffset}&commentLimit=${limit}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch more comments')
      }

      const data = await response.json()
      const newComments = data.comments ? data.comments.map(transformBackendComment) : []

      setPosts(prev =>
        prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, ...newComments],
              hasMoreComments: data.hasMoreComments,
              commentOffset: currentOffset,
            }
          }
          return post
        })
      )
    } catch (error) {
      console.error('Error fetching more comments:', error)
    }
  }

  // TODO BACKEND: El endpoint POST /api/posts/:id/bookmark debe:
  // 1. Alternar el estado de bookmark del post para el usuario autenticado
  // 2. Guardar la relación user_id + post_id en la base de datos
  // 3. Devolver { bookmarked: true/false } indicando el nuevo estado
  const toggleBookmark = async (postId: string) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to bookmark post')
      }

      const { bookmarked } = await response.json()

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isBookmarked: bookmarked,
            }
          }
          return post
        })
      )
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  // TODO BACKEND: El endpoint POST /api/posts/:id/report debe:
  // 1. Guardar el reporte con: postId, reporterId (usuario que reporta), reason, timestamp
  // 2. Notificar a los moderadores/admins sobre el nuevo reporte
  // 3. Evitar reportes duplicados del mismo usuario al mismo post
  const reportPost = async (postId: string, reason: string = 'No reason provided') => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to report post')
      }

      console.log(`Post ${postId} reported by user ${user?.id}`)
    } catch (error) {
      console.error('Error reporting post:', error)
    }
  }

  // TODO BACKEND: El endpoint PUT /api/posts/:id/toggle-comments debe:
  // 1. Alternar el estado de commentsDisabled del post
  // 2. Solo el autor del post puede ejecutar esta acción
  // 3. Devolver el nuevo estado { commentsDisabled: true/false }
  const toggleComments = async (postId: string) => {
    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return { ...post, commentsDisabled: !post.commentsDisabled }
        }
        return post
      })
    )

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/toggle-comments`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to toggle comments')
      }
      console.log(`Comments toggled for post ${postId}`)
    } catch (error) {
      console.error('Error toggling comments:', error)
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return { ...post, commentsDisabled: !post.commentsDisabled }
          }
          return post
        })
      )
    }
  }

  const incrementViews = (postId: string) => {
    // This function is now a no-op on the network level, only updates local state.
    // The batch processing will handle backend updates.
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            views: post.views + 1,
          };
        }
        return post;
      })
    );
  };

  const incrementViewsBatch = async (postIds: string[]) => {
    if (postIds.length === 0) return;
    try {
      // This endpoint needs to be created in the backend
      await fetch(`${API_BASE_URL}/api/posts/views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postIds }),
      });

      // The local state might have been updated optimistically by `incrementViews`.
      // If not, this is where you'd update the state for all postIds.
      // To be safe, let's ensure the views are updated.
      setPosts((prevPosts) =>
        prevPosts.map(post => {
          if (postIds.includes(post.id)) {
            // This could lead to double increments if not handled carefully.
            // For this reason, incrementViews is kept as a local-only update for now.
            // And the batch is for the backend.
            // A more robust implementation might be needed.
            // For now, we assume the backend handles avoiding double counts.
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error incrementing views in batch:', error);
    }
  };

  const deletePost = async (postId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Store the post for potential rollback
    let deletedPost: Post | undefined

    // Optimistic update - remove post immediately
    setPosts((prev) => {
      deletedPost = prev.find((post) => post.id === postId)
      return prev.filter((post) => post.id !== postId)
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }
      // Post successfully deleted, no further action needed
    } catch (error) {
      console.error('Error deleting post:', error)
      // Rollback - restore the post on error
      if (deletedPost) {
        setPosts((prev) => [...prev, deletedPost!])
      }
    }
  }

  // TODO BACKEND: El endpoint PUT /api/posts/:id debe:
  // 1. Aceptar 'hashtags' (string[]) en el body además de title y content
  // 2. Devolver 'editedAt' (timestamp) cuando el post es actualizado
  // 3. Guardar editedAt en la base de datos para mostrar "(editado)" en el frontend
  const updatePost = async (postId: string, data: { title: string; content: string; hashtags?: string[] }) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      const updatedPost = await response.json()
      const transformedPost = transformBackendPost(updatedPost)
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? transformedPost : post))
      )
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        authStatus,
        user,
        posts,
        courses,
        notifications,
        fetchPostById,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        login,
        sendVerificationCode, // new function
        verifyAndRegister,    // new function
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        createPost,
        deletePost,
        updatePost,
        votePost,
        addComment,
        voteComment,
        fetchCommentReplies,
        fetchMoreComments,
        searchPosts,
        getCourseById,
        getCoursesByCycle,
        theme,
        toggleTheme,
        christmasTheme,
        toggleChristmasTheme,
        toggleBookmark,
        reportPost,
        incrementViews,
        incrementViewsBatch,
        mainFeedKey,
        resetMainFeed,
        fetchMorePosts,
        hasMorePosts,
        isFetchingPosts,
        toggleComments,
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
