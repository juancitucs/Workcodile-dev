import { User, Post, Comment } from '../components/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const transformAuthor = (author: any) => ({
  id: author?._id?.toString() || '',
  name: author?.name?.trim() || 'Usuario Anonimo',
  avatar: author?.avatar_key ? author.avatar : undefined,
  university: 'UNAM',
  email: author?.email || '',
  level: author?.level || 1,
})

export const transformBackendComment = (comment: any): Comment => {
  const transformedReplies = comment.replies
    ? comment.replies.map(transformBackendComment)
    : []
  return {
    ...comment,
    id: comment._id,
    createdAt: new Date(comment.createdAt),
    author: transformAuthor(comment.author),
    attachments: comment.attachments ? comment.attachments.map((att: any) => ({ ...att })) : [],
    score: comment.score,
    userVote: comment.user_vote,
    replies: transformedReplies,
  }
}

export const transformBackendPost = (post: any): Post => ({
  id: post._id,
  title: post.title,
  content: post.content,
  author: transformAuthor(post.author),
  createdAt: new Date(post.createdAt),
  course: post.course_id || '',
  upvotes: post.upvote_count || 0,
  downvotes: post.downvote_count || 0,
  comments: post.comments ? post.comments.map(transformBackendComment) : [],
  hashtags: post.hashtags || [],
  attachments: post.attachments ? post.attachments.map((att: any) => ({ ...att })) : [],
  views: post.views || 0,
  isBookmarked: false,
  userVote: post.user_vote,
  commentsDisabled: post.commentsDisabled || false,
  totalComments: post.totalComments,
  hasMoreComments: post.hasMoreComments,
  commentOffset: post.commentOffset,
})

export const transformBackendNotification = (notification: any) => ({
  id: notification._id,
  text: notification.text,
  createdAt: new Date(notification.createdAt),
  read: notification.read,
  link: notification.link,
})

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {}
  if (token) {
    headers['x-auth-token'] = token
  }
  return headers
}

export function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { 'x-auth-token': token } : {}
}
