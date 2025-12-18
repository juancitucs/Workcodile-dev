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
