import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university: string;
}

interface Course {
  id: string;
  name: string;
  cycle: number;
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string; // For uploaded files
  file?: File; // For local files
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
  course: string; // Course ID
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  userVote?: 'up' | 'down';
  hashtags: string[];
  attachments: FileAttachment[];
  // Rating system
  rating: number; // Average rating (0-5)
  averageRating?: number; // Same as rating, for compatibility
  totalRatings: number; // Total number of ratings
  userRating?: number; // Current user's rating (0-5, 0 means no rating)
  // Additional fields
  views: number;
  isBookmarked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  score: number;
  userVote?: 'up' | 'down';
  replies: Comment[];
  parentId?: string;
}

interface Notification {
  id: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

interface AppContextType {
  user: User | null;
  posts: Post[];
  courses: Course[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => void;
  createPost: (title: string, content: string, course: string, hashtags: string[], attachments: FileAttachment[]) => void;
  votePost: (postId: string, vote: 'up' | 'down') => void;
  addComment: (postId: string, content: string, parentId?: string) => void;
  voteComment: (postId: string, commentId: string, vote: 'up' | 'down') => void;
  searchPosts: (query: string) => Post[];
  getCourseById: (courseId: string) => Course | undefined;
  getCoursesByCycle: (cycle: number) => Course[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  // New rating and additional features
  ratePost: (postId: string, rating: number) => void;
  toggleBookmark: (postId: string) => void;
  reportPost: (postId: string) => void;
  incrementViews: (postId: string) => void;
  mainFeedKey: number;
  resetMainFeed: () => void;
  selectedPostId: string | null;
  selectPost: (postId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const courses: Course[] = [
  // Ciclo 1
  { id: 'IS-121', name: 'FUNDAMENTOS DE PROGRAMACION', cycle: 1 },
  { id: 'IS-122', name: 'MATEMATICA I', cycle: 1 },
  { id: 'IS-123', name: 'METODOLOGIA Y TECNICAS DE ESTUDIO UNIVERSITARIO', cycle: 1 },
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
  { id: 'IS-924', name: 'FORMACION DE EMPRESAS CON BASE TECNOLOGICA', cycle: 9 },
  { id: 'IS-925', name: 'PROYECTOS INFORMATICOS I', cycle: 9 },
  { id: 'IS-926', name: 'ROBOTICA II', cycle: 9 },
  { id: 'IS-927', name: 'ELECTIVO I: PLANEAMIENTO ESTRATEGICO DE SISTEMAS DE INFORMACION', cycle: 9 },
  { id: 'IS-928', name: 'ELECTIVO I: TOPICOS AVANZADOS I', cycle: 9 },
  
  // Ciclo 10
  { id: 'IS-1021', name: 'INTELIGENCIA ARTIFICIAL II', cycle: 10 },
  { id: 'IS-1022', name: 'AUDITORIA DE SISTEMAS DE INFORMACION', cycle: 10 },
  { id: 'IS-1023', name: 'SEGURIDAD DE LA INFORMACION', cycle: 10 },
  { id: 'IS-1024', name: 'SEMINARIO DE TESIS', cycle: 10 },
  { id: 'IS-1025', name: 'ELECTIVO II: PLANEAMIENTO ESTRATEGICO DE TECNOLOGIA DE INFORMACION', cycle: 10 },
  { id: 'IS-1026', name: 'PROYECTOS INFORMATICOS II', cycle: 10 },
  { id: 'IS-1027', name: 'ELECTIVO II: TOPICOS AVANZADOS II', cycle: 10 }
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@unam.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=100&h=100&fit=crop&crop=face',
    university: 'UNAM'
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@unam.edu.pe',
    // Sin avatar para mostrar el logo por defecto
    university: 'UNAM'
  },
  {
    id: '3',
    name: 'María Rodriguez',
    email: 'maria.rodriguez@unam.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    university: 'UNAM'
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    title: '🔍 Busco tutor para Matemática II',
    content: 'Hola estudiantes de UNAM! Necesito ayuda con Matemática II, especialmente con integrales. Estoy dispuesto a pagar por sesiones de tutoría. Si alguien puede ayudarme, por favor contáctenme.',
    author: mockUsers[0],
    createdAt: new Date('2024-01-15T10:30:00'),
    course: 'IS-226',
    upvotes: 12,
    downvotes: 1,
    hashtags: ['tutoría', 'matemática', 'integrales', 'ayuda'],
    attachments: [
      {
        id: 'att1',
        name: 'ejercicios_matematica_ii.pdf',
        size: 2048000,
        type: 'application/pdf'
      }
    ],
    comments: [
      {
        id: '1',
        content: 'Hola Ana! Yo puedo ayudarte con Matemática II. Soy estudiante de quinto ciclo de Ingeniería. Mándame un mensaje.',
        author: mockUsers[1],
        createdAt: new Date('2024-01-15T11:00:00'),
        score: 3,
        replies: [],
      }
    ],
    rating: 4.2,
    averageRating: 4.2,
    totalRatings: 8,
    userRating: 5,
    views: 156,
    isBookmarked: false
  },
  {
    id: '2',
    title: '💻 Ofrezco servicios para Aplicaciones Web I',
    content: 'Soy estudiante de Ingeniería de Sistemas y ofrezco servicios de desarrollo web (HTML, CSS, JavaScript, React). Precios accesibles para estudiantes. Portfolio disponible.',
    author: mockUsers[1],
    createdAt: new Date('2024-01-14T15:45:00'),
    course: 'IS-524',
    upvotes: 25,
    downvotes: 2,
    hashtags: ['desarrollo', 'web', 'react', 'javascript', 'freelance'],
    attachments: [
      {
        id: 'att2',
        name: 'portfolio_proyectos.zip',
        size: 5120000,
        type: 'application/zip'
      },
      {
        id: 'att3',
        name: 'certificados_cursos.jpg',
        size: 1024000,
        type: 'image/jpeg'
      }
    ],
    comments: [
      {
        id: '2',
        content: '¿Tienes experiencia con bases de datos? Necesito ayuda con un proyecto de MySQL.',
        author: mockUsers[2],
        createdAt: new Date('2024-01-14T16:30:00'),
        score: 1,
        replies: [
          {
            id: '3',
            content: 'Sí, manejo MySQL, PostgreSQL y MongoDB. Te puedo ayudar sin problema.',
            author: mockUsers[1],
            createdAt: new Date('2024-01-14T16:45:00'),
            score: 2,
            replies: [],
            parentId: '2',
          }
        ]
      }
    ],
    rating: 4.8,
    averageRating: 4.8,
    totalRatings: 15,
    userRating: 0,
    views: 342,
    isBookmarked: true
  },
  {
    id: '3',
    title: '📚 Grupo de estudio para Estadística Básica',
    content: 'Estoy formando un grupo de estudio para el curso de Estadística Básica del profesor Mamani. Nos juntaríamos los sábados por la tarde en la biblioteca. ¿Quién se apunta?',
    author: mockUsers[2],
    createdAt: new Date('2024-01-13T09:15:00'),
    course: 'IS-227',
    upvotes: 18,
    downvotes: 0,
    hashtags: ['grupo', 'estudio', 'estadística', 'biblioteca', 'sábados'],
    attachments: [],
    comments: [],
    rating: 3.9,
    averageRating: 3.9,
    totalRatings: 12,
    userRating: 4,
    views: 89,
    isBookmarked: false
  },
  {
    id: '4',
    title: '⚠️ Aviso: Laboratorio para Fundamentos de Programación',
    content: 'Por mantenimiento, el laboratorio de computación estará cerrado del 20 al 25 de enero. Por favor planifiquen sus trabajos de Fundamentos de Programación con anticipación.',
    author: mockUsers[0],
    createdAt: new Date('2024-01-12T14:20:00'),
    course: 'IS-121',
    upvotes: 8,
    downvotes: 3,
    hashtags: ['aviso', 'laboratorio', 'mantenimiento', 'programación'],
    attachments: [],
    comments: [
      {
        id: '4',
        content: 'Gracias por el aviso. ¿Hay algún laboratorio alternativo disponible?',
        author: mockUsers[1],
        createdAt: new Date('2024-01-12T15:00:00'),
        score: 2,
        replies: []
      }
    ],
    rating: 3.5,
    averageRating: 3.5,
    totalRatings: 6,
    userRating: 0,
    views: 234,
    isBookmarked: false
  }
];

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
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mainFeedKey, setMainFeedKey] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const resetMainFeed = () => setMainFeedKey(prev => prev + 1);
  const selectPost = (postId: string | null) => setSelectedPostId(postId);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Usuario no encontrado');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      university: 'UNAM'
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (profileData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...profileData });
    }
  };

  const createPost = (title: string, content: string, course: string, hashtags: string[], attachments: FileAttachment[]) => {
    if (!user) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      author: user,
      createdAt: new Date(),
      course,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      hashtags,
      attachments,
      rating: 0,
      averageRating: 0,
      totalRatings: 0,
      userRating: 0,
      views: 0,
      isBookmarked: false
    };
    
    setPosts(prev => [newPost, ...prev]);
  };

  const votePost = (postId: string, vote: 'up' | 'down') => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const currentVote = post.userVote;
        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;

        // Handle vote changes
        if (currentVote === vote) {
          // User is undoing their vote
          if (vote === 'up') newUpvotes--;
          else newDownvotes--;
          return { ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: undefined };
        } else {
          // New vote or changing vote
          if (currentVote === 'up') newUpvotes--;
          if (currentVote === 'down') newDownvotes--;
          
          if (vote === 'up') newUpvotes++;
          else newDownvotes++;
          
          return { ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: vote };
        }
      }
      return post;
    }));
  };

  const addComment = (postId: string, content: string, parentId?: string) => {
    if (!user) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: user,
      createdAt: new Date(),
      score: 0,
      replies: [],
      parentId,
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        if (parentId) {
          // Add a reply to a nested comment
          const addReplyToComment = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, newComment],
                };
              }
              if (comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: addReplyToComment(comment.replies),
                };
              }
              return comment;
            });
          };
          return {
            ...post,
            comments: addReplyToComment(post.comments),
          };
        } else {
          // Add a top-level comment
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
      }
      return post;
    }));
  };

  const voteComment = (postId: string, commentId: string, vote: 'up' | 'down') => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const updateCommentVotes = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const currentVote = comment.userVote;
              let newScore = comment.score;

              if (currentVote === vote) {
                // Undoing vote
                newScore += (vote === 'up' ? -1 : 1);
                return { ...comment, score: newScore, userVote: undefined };
              } else {
                // New vote or changing vote
                if (currentVote === 'up') newScore -= 1;
                if (currentVote === 'down') newScore += 1;
                newScore += (vote === 'up' ? 1 : -1);
                return { ...comment, score: newScore, userVote: vote };
              }
            }
            // Recursively update replies
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: updateCommentVotes(comment.replies) };
            }
            return comment;
          });
        };
        return { ...post, comments: updateCommentVotes(post.comments) };
      }
      return post;
    }));
  };

  const searchPosts = (query: string) => {
    if (!query.trim()) return posts;
    
    return posts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.author.name.toLowerCase().includes(query.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const getCourseById = (courseId: string) => {
    return courses.find(course => course.id === courseId);
  };

  const getCoursesByCycle = (cycle: number) => {
    return courses.filter(course => course.cycle === cycle);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const ratePost = (postId: string, rating: number) => {
    if (!user) return; // Ensure user is logged in
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const wasUserRated = post.userRating && post.userRating > 0;
        const newTotalRatings = wasUserRated ? post.totalRatings : post.totalRatings + 1;
        
        // Calculate new average rating
        const currentTotal = post.rating * post.totalRatings;
        const newTotal = wasUserRated 
          ? currentTotal - (post.userRating || 0) + rating
          : currentTotal + rating;
        const newAverageRating = newTotalRatings > 0 ? newTotal / newTotalRatings : 0;

        console.log(`Usuario ${user.name} calificó el post "${post.title}" con ${rating} cocodrilos`);

        return {
          ...post,
          rating: newAverageRating,
          totalRatings: newTotalRatings,
          userRating: rating
        };
      }
      return post;
    }));
  };

  const toggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };

  const reportPost = (postId: string) => {
    // In a real app, this would send a report to the backend
    console.log(`Post ${postId} reported by user ${user?.id}`);
  };

  const incrementViews = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          views: post.views + 1
        };
      }
      return post;
    }));
  };

  return (
    <AppContext.Provider value={{
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
      isDarkMode,
      toggleDarkMode,
      ratePost,
      toggleBookmark,
      reportPost,
      incrementViews,
      mainFeedKey,
      resetMainFeed,
      selectedPostId,
      selectPost
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}