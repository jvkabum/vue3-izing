export interface Contact {
  name: string
}

export interface Message {
  id: number
  fromMe: boolean
  isDeleted: boolean
  updatedAt: string
  mediaType: 'audio' | 'vcard' | 'image' | 'video' | 'application' | 'chat'
  mediaUrl?: string
  body: string
  ticketId?: number
  contact?: Contact
}

export interface Ticket {
  isGroup: boolean
}
