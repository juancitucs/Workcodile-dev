import { Course } from '../data/courses'

export type { Course }

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  avatar_key?: string
  university: string
  theme?: string
  bookmarked_posts?: string[]
  level?: number
  xp?: number
  stats?: {
    totalPosts: number
    totalComments: number
    totalLikesReceived: number
    totalLikesGiven: number
  }
}

export interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url?: string
  file?: File
  object_key?: string
}

export interface Post {
  id: string
  title: string
  content: string
  author: User
  createdAt: Date
  editedAt?: Date
  course: string
  upvotes: number
  downvotes: number
  comments: Comment[]
  userVote?: 'up' | 'down'
  hashtags: string[]
  attachments: FileAttachment[]
  views: number
  isBookmarked?: boolean
  commentsDisabled?: boolean
  totalComments?: number
  hasMoreComments?: boolean
  commentOffset?: number
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