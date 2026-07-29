import { FileAttachment } from './file-utils'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const sanitizeFilename = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.')
  const body = lastDot === -1 ? filename : filename.substring(0, lastDot)
  const ext = lastDot === -1 ? '' : filename.substring(lastDot)
  let sanitized = body.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')
  if (!sanitized) sanitized = 'file'
  return sanitized + ext
}

export const uploadFiles = async (files: File[]): Promise<(Omit<FileAttachment, 'id'> & { object_key: string })[]> => {
  const results = await Promise.all(files.map(async (file) => {
    const formData = new FormData()
    formData.append('file', file, sanitizeFilename(file.name))
    try {
      const response = await fetch(`${API_BASE_URL}/api/storage`, {
        method: 'POST',
        headers: { 'x-auth-token': localStorage.getItem('token') || '' },
        body: formData,
      })
      if (!response.ok) throw new Error(`Error uploading file: ${file.name}`)
      const result = await response.json()
      return { name: file.name, size: file.size, type: file.type, object_key: result.objectName }
    } catch (error) {
      console.error(error)
      return null
    }
  }))
  return results.filter((r): r is (Omit<FileAttachment, 'id'> & { object_key: string }) => r !== null)
}
