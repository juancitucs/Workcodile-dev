import { Dispatch, SetStateAction } from 'react'
import { Post, Comment, FileAttachment } from '../components/types'
import { API_BASE_URL } from './api-constants'
import { transformBackendComment, transformBackendPost, getAuthHeaders } from './api-helpers'

interface UseCommentsParams {
  posts: Post[]
  setPosts: Dispatch<SetStateAction<Post[]>>
}

export function useCommentActions({ posts, setPosts }: UseCommentsParams) {
  const addCommentToTree = (comments: Comment[], newComment: Comment, targetParentId?: string): Comment[] => {
    if (!targetParentId) return [...comments, newComment]
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

  const findAndUpdateCommentRecursive = (
    comments: Comment[], targetId: string, vote: 'up' | 'down'
  ): Comment[] => {
    return comments.map(comment => {
      if (comment.id === targetId) {
        let score = comment.score
        let uv = comment.userVote
        if (vote === 'up') {
          if (uv === 'up') { score--; uv = null }
          else { score++; uv = 'up'; if (uv === 'down') score++ }
        } else {
          if (uv === 'down') { score++; uv = null }
          else { score--; uv = 'down'; if (uv === 'up') score-- }
        }
        return { ...comment, score, userVote: uv }
      }
      if (comment.replies?.length > 0) {
        return { ...comment, replies: findAndUpdateCommentRecursive(comment.replies, targetId, vote) }
      }
      return comment
    })
  }

  const addComment = async (
    postId: string, content: string, parentId?: string,
    attachments: Omit<FileAttachment, 'id'>[] = [], user?: any
  ) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    const tempId = `temp-${Date.now()}`
    const optimistic: Comment = {
      id: tempId, content,
      author: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, university: user.university, level: user.level },
      createdAt: new Date(), score: 0, userVote: undefined, replies: [], parentId,
      attachments: attachments.map((att, i) => ({ ...att, id: `temp-att-${i}` })) as FileAttachment[],
    }

    let originalPosts: Post[] = []
    setPosts(prev => {
      originalPosts = JSON.parse(JSON.stringify(prev))
      const next = JSON.parse(JSON.stringify(prev))
      const idx = next.findIndex((p: Post) => p.id === postId)
      if (idx !== -1) next[idx].comments = addCommentToTree(next[idx].comments, optimistic, parentId)
      return next
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ content, parentId, attachments }),
      })
      if (!response.ok) throw new Error('Failed to add comment')
      const updatedPost = await response.json()
      setPosts(prev => prev.map(p => p.id === postId ? transformBackendPost(updatedPost) : p))
    } catch (error) {
      console.error('Error adding comment:', error)
      setPosts(originalPosts)
    }
  }

  const voteComment = async (postId: string, commentId: string, vote: 'up' | 'down') => {
    const token = localStorage.getItem('token')
    if (!token) return
    let originalPosts: Post[] = []
    setPosts(prev => {
      originalPosts = JSON.parse(JSON.stringify(prev))
      const idx = prev.findIndex(p => p.id === postId)
      if (idx === -1) return prev
      const updated = findAndUpdateCommentRecursive(prev[idx].comments, commentId, vote)
      const next = [...prev]
      next[idx] = { ...prev[idx], comments: updated }
      return next
    })
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ vote }),
      })
      if (!response.ok) throw new Error('Failed to vote on comment')
    } catch (error) {
      console.error('Error voting on comment:', error)
      setPosts(originalPosts)
    }
  }

  const fetchCommentReplies = async (postId: string, commentId: string): Promise<Comment[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}/replies`, { headers: getAuthHeaders() })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      return data.map(transformBackendComment)
    } catch (error) {
      console.error('Failed to fetch replies:', error)
      return []
    }
  }

  const fetchMoreComments = async (postId: string) => {
    const currentPost = posts.find(p => p.id === postId)
    if (!currentPost || !currentPost.hasMoreComments) return
    const currentOffset = currentPost.comments.length
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}?commentOffset=${currentOffset}&commentLimit=5`,
        { headers: getAuthHeaders() }
      )
      if (!response.ok) throw new Error('Failed to fetch more comments')
      const data = await response.json()
      const newComments = data.comments ? data.comments.map(transformBackendComment) : []
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, ...newComments],
            hasMoreComments: data.hasMoreComments,
            commentOffset: currentOffset,
          }
        }
        return post
      }))
    } catch (error) {
      console.error('Error fetching more comments:', error)
    }
  }

  return { addComment, voteComment, fetchCommentReplies, fetchMoreComments }
}
