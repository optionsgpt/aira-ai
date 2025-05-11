export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  content: string // Base64 encoded content
}
