import { FileAttachment } from './types'

export type { FileAttachment }

export const createFileAttachment = (file: File): FileAttachment => {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
    url: URL.createObjectURL(file),
  }
}

export const getAttachmentUrl = (attachment: Partial<FileAttachment>): string | undefined => {
  return attachment.url
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileIcon = (type: string): string => {
  if (type.includes('image/')) return '🖼️'
  if (type.includes('video/')) return '🎬'
  if (type.includes('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('zip') || type.includes('rar')) return '📦'
  if (type.includes('word')) return '📝'
  if (type.includes('text/')) return '📝'
  return '📄'
}

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/zip',
    'application/x-rar-compressed',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  return allowedTypes.includes(file.type)
}

export const validateFileSize = (file: File, maxSizeMB = 10): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024
}