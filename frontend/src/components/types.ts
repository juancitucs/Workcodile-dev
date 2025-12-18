export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  avatar_key?: string
  university: string
  theme?: string
  bookmarked_posts?: string[]
  level?: number  // Nivel del usuario para mostrar badge
  xp?: number     // Experiencia del usuario
}

export interface Course {
  id: string
  name: string
  cycle: number
}

export interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url?: string // For uploaded files
  file?: File // For local files
  object_key?: string
}

// TODO BACKEND: El modelo Post en la base de datos debe incluir estos campos:
// - editedAt: Date (opcional, se actualiza cuando el post es editado)
// - isBookmarked: se calcula dinámicamente según el usuario que consulta
// - commentsDisabled: boolean para permitir al autor desactivar comentarios
export interface Post {
  id: string
  title: string
  content: string
  author: User
  createdAt: Date
  editedAt?: Date  // Fecha de última edición
  course: string // Course ID
  upvotes: number
  downvotes: number
  comments: Comment[]
  userVote?: 'up' | 'down'
  hashtags: string[]
  attachments: FileAttachment[]
  // Additional fields
  views: number
  isBookmarked?: boolean
  commentsDisabled?: boolean
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: Date
  score: number
  userVote?: 'up' | 'down'
  replies: Comment[]
  parentId?: string
  attachments: FileAttachment[]
}

export interface Notification {
  id: string
  text: string
  createdAt: Date
  read: boolean
  link?: string
}
