import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { User, Course, FileAttachment, Post, Comment, Notification } from './types'

interface AppContextType {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated'
  user: User | null
  posts: Post[]
  courses: Course[]
  notifications: Notification[]
  fetchPostById: (postId: string) => Promise<Post | undefined>
  markNotificationAsRead: (notificationId: string) => void
  login: (email: string, password: string) => Promise<void>
  sendVerificationCode: (name: string, email: string, password: string) => Promise<any>
  verifyAndRegister: (email: string, password: string, verificationCode: string) => Promise<any>
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
  fetchCommentReplies: (postId: string, commentId: string) => Promise<Comment[]>
  searchPosts: (query: string) => Post[]
  getCourseById: (courseId: string) => Course | undefined
  getCoursesByCycle: (cycle: number) => Course[]
  theme: 'light' | 'dark'
  toggleTheme: () => void
  toggleBookmark: (postId: string) => void
  reportPost: (postId: string) => void
  incrementViews: (postId: string) => void
  incrementViewsBatch: (postIds: string[]) => void
  mainFeedKey: number
  resetMainFeed: () => void
  fetchMorePosts: () => void
  hasMorePosts: boolean
  isFetchingPosts: boolean
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
  return {
    ...comment,
    id: comment._id,
    createdAt: new Date(comment.createdAt),
    author: {
      id: comment.author?._id?.toString() || '',
      name: comment.author?.name || 'Usuario Anónimo',
      avatar: comment.author?.avatar_key ? comment.author.avatar : undefined, // Backend now provides full URL
      university: 'UNAM',
      email: comment.author?.email || '',
    },
    score: comment.score,
    userVote: comment.user_vote,
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
    avatar: post.author?.avatar_key ? post.author.avatar : undefined, // Backend now provides full URL
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
  })) : [],
  views: post.views || 0,
  isBookmarked: false,
  userVote: post.user_vote,
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
  const [mainFeedKey, setMainFeedKey] = useState(0)
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

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

  const fetchInitialPosts = async () => {
    setIsFetchingPosts(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch('http://localhost:3001/api/posts?page=1', { headers });
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

      const response = await fetch(`http://localhost:3001/api/posts?page=${nextPage}`, { headers });
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

      const response = await fetch(`http://localhost:3001/api/posts/${postId}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const transformedPost = transformBackendPost(data);
      
      // Optionally, update the global posts state
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
          // Backend now returns the full avatar URL directly
          // if (userData.avatar_key) {
          //   userData.avatar = `http://localhost:9000/workcodile-files/${userData.avatar_key}`;
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
          const response = await fetch('http://localhost:3001/api/notifications', {
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

    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const resetMainFeed = () => {
    setMainFeedKey((prev) => prev + 1)
    fetchInitialPosts()
  }

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
    // Backend now returns the full avatar URL directly
    // if (userData.avatar_key) {
    //   userData.avatar = `http://localhost:9000/workcodile-files/${userData.avatar_key}`;
    // }
    setUser(userData)
    if (userData.theme) {
      setTheme(userData.theme)
    }
    setAuthStatus('authenticated')
  }

  const sendVerificationCode = async (name: string, email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/send-verification-code', {
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

    return responseData; // Returns { msg: 'Verification code sent...' }
  }

  const verifyAndRegister = async (email: string, password: string, verificationCode: string) => {
    const response = await fetch('http://localhost:3001/api/auth/verify-and-register', {
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

    // On successful verification and registration, log in the user directly
    const { token, user: userData } = responseData;
    localStorage.setItem('token', token);
    // Backend now returns the full avatar URL directly
    // if (userData.avatar_key) {
    //   userData.avatar = `http://localhost:9000/workcodile-files/${userData.avatar_key}`;
    // }
    setUser(userData);
    if (userData.theme) {
      setTheme(userData.theme);
    }
    setAuthStatus('authenticated');
    return responseData; // Returns { token, user }
  }

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
      //   newProfile.avatar = `http://localhost:9000/workcodile-files/${newProfile.avatar_key}`;
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

    // Store the original posts state for rollback in case of error
    let originalPosts: Post[] = [];

    try {
      setPosts((prev) => {
        originalPosts = prev; // Store the state before optimistic update
        const postIndex = prev.findIndex(p => p.id === postId);
        if (postIndex === -1) return prev; // Post not found

        const originalPost = prev[postIndex];
        let newUpvotes = originalPost.upvotes;
        let newDownvotes = originalPost.downvotes;
        let newUserVote = originalPost.userVote;

        // Determine new vote counts and userVote status
        if (vote === 'up') {
          if (originalPost.userVote === 'up') { // User is un-upvoting
            newUpvotes--;
            newUserVote = null;
          } else { // User is upvoting
            newUpvotes++;
            if (originalPost.userVote === 'down') { // User was downvoting, remove downvote
              newDownvotes--;
            }
            newUserVote = 'up';
          }
        } else { // vote === 'down'
          if (originalPost.userVote === 'down') { // User is un-downvoting
            newDownvotes--;
            newUserVote = null;
          } else { // User is downvoting
            newDownvotes++;
            if (originalPost.userVote === 'up') { // User was upvoting, remove upvote
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
                  console.log(`Optimistically updating comment: ${targetCommentId}, new userVote: ${newUserVote}, new score: ${newScore}`);      if (vote === 'up') {
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

      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comments/${commentId}/replies`, { headers });
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

  const toggleBookmark = async (postId: string) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/bookmark`, {
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

  const reportPost = async (postId: string, reason: string = 'No reason provided') => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/report`, {
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
      await fetch(`http://localhost:3001/api/posts/views`, {
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
        login,
        sendVerificationCode, // new function
        verifyAndRegister,    // new function
        logout,
        updateProfile,
        createPost,
        votePost,
        addComment,
        voteComment,
        fetchCommentReplies,
        searchPosts,
        getCourseById,
        getCoursesByCycle,
        theme,
        toggleTheme,
        toggleBookmark,
        reportPost,
        incrementViews,
        incrementViewsBatch,
        mainFeedKey,
        resetMainFeed,
        fetchMorePosts,
        hasMorePosts,
        isFetchingPosts,
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