import { Dispatch, SetStateAction } from 'react'
import { Post } from '../components/types'
import { API_BASE_URL } from './api-constants'
import { transformBackendPost, getAuthHeaders } from './api-helpers'

interface UsePostsParams {
  setPosts: Dispatch<SetStateAction<Post[]>>
}

export function usePostActions({ setPosts }: UsePostsParams) {
  const fetchInitialPosts = async (
    setIsFetching: (v: boolean) => void,
    setPostPage: (v: number) => void,
    setHasMore: (v: boolean) => void
  ) => {
    setIsFetching(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?page=1`, { headers: getAuthHeaders() })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setPosts(data.posts.map(transformBackendPost))
      setPostPage(1)
      setHasMore(data.hasNextPage)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const fetchMorePosts = async (
    nextPage: number,
    setIsFetching: (v: boolean) => void,
    setPostPage: (v: number) => void,
    setHasMore: (v: boolean) => void
  ) => {
    setIsFetching(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?page=${nextPage}`, { headers: getAuthHeaders() })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setPosts(prev => [...prev, ...data.posts.map(transformBackendPost)])
      setPostPage(nextPage)
      setHasMore(data.hasNextPage)
    } catch (error) {
      console.error('Failed to fetch more posts:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const fetchPostById = async (postId: string): Promise<Post | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { headers: getAuthHeaders() })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      const transformed = transformBackendPost(data)
      setPosts(prev => {
        const exists = prev.some(p => p.id === transformed.id)
        if (exists) return prev.map(p => p.id === transformed.id ? transformed : p)
        return [...prev, transformed]
      })
      return transformed
    } catch (error) {
      console.error('Failed to fetch post by ID:', error)
      return undefined
    }
  }

  const createPost = async (
    title: string, content: string, course: string, hashtags: string[], attachments: any[],
    user: any
  ) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ title, content, course, hashtags, attachments }),
      })
      if (!response.ok) throw new Error('Failed to create post')
      const newPost = await response.json()
      setPosts(prev => [transformBackendPost(newPost), ...prev])
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const deletePost = async (postId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    let deletedPost: Post | undefined
    setPosts(prev => {
      deletedPost = prev.find(p => p.id === postId)
      return prev.filter(p => p.id !== postId)
    })
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      })
      if (!response.ok) throw new Error('Failed to delete post')
    } catch (error) {
      console.error('Error deleting post:', error)
      if (deletedPost) setPosts(prev => [...prev, deletedPost!])
    }
  }

  const updatePost = async (postId: string, data: { title: string; content: string; hashtags?: string[] }) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update post')
      const updatedPost = await response.json()
      setPosts(prev => prev.map(p => p.id === postId ? transformBackendPost(updatedPost) : p))
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const votePost = async (postId: string, vote: 'up' | 'down') => {
    const token = localStorage.getItem('token')
    if (!token) return
    let originalPosts: Post[] = []
    setPosts(prev => {
      originalPosts = JSON.parse(JSON.stringify(prev))
      const idx = prev.findIndex(p => p.id === postId)
      if (idx === -1) return prev
      const p = prev[idx]
      let up = p.upvotes, down = p.downvotes, uv = p.userVote
      if (vote === 'up') {
        if (uv === 'up') { up--; uv = null }
        else { up++; if (uv === 'down') down--; uv = 'up' }
      } else {
        if (uv === 'down') { down--; uv = null }
        else { down++; if (uv === 'up') up--; uv = 'down' }
      }
      const next = [...prev]
      next[idx] = { ...p, upvotes: up, downvotes: down, userVote: uv }
      return next
    })
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ vote }),
      })
      if (!response.ok) throw new Error('Failed to vote on post')
    } catch (error) {
      console.error('Error voting on post:', error)
      setPosts(originalPosts)
    }
  }

  const toggleBookmark = async (postId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      })
      if (!response.ok) throw new Error('Failed to bookmark post')
      const { bookmarked } = await response.json()
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBookmarked: bookmarked } : p))
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  const reportPost = async (postId: string, reason: string = 'No reason provided') => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ reason }),
      })
      if (!response.ok) throw new Error('Failed to report post')
    } catch (error) {
      console.error('Error reporting post:', error)
    }
  }

  const toggleComments = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsDisabled: !p.commentsDisabled } : p))
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/toggle-comments`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
      })
      if (!response.ok) throw new Error('Failed to toggle comments')
    } catch (error) {
      console.error('Error toggling comments:', error)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsDisabled: !p.commentsDisabled } : p))
    }
  }

  const incrementViews = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p))
  }

  const incrementViewsBatch = async (postIds: string[]) => {
    if (postIds.length === 0) return
    try {
      await fetch(`${API_BASE_URL}/api/posts/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds }),
      })
    } catch (error) {
      console.error('Error incrementing views in batch:', error)
    }
  }

  return {
    fetchInitialPosts,
    fetchMorePosts,
    fetchPostById,
    createPost,
    deletePost,
    updatePost,
    votePost,
    toggleBookmark,
    reportPost,
    toggleComments,
    incrementViews,
    incrementViewsBatch,
  }
}
