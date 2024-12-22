export interface UserCredentials {
  email: string
  password: string
}

export interface UserConfig {
  filtrosAtendimento?: {
    searchParam?: string
    pageNumber?: number
    status?: string[]
    showAll?: boolean
    count?: number | null
    queuesIds?: number[]
    withUnreadMessages?: boolean
    isNotAssignedUser?: boolean
    includeNotQueueDefined?: boolean
  }
  isDark?: boolean
}

export interface UserData {
  token: string
  username: string
  profile: 'admin' | 'super' | 'user'
  userId: number
  queues: any[] // TODO: Adicionar tipo específico para filas
  email: string
  tenantId: string
  configs?: UserConfig
}

export interface UserState {
  token: string | null
  isAdmin: boolean
  isSuporte: boolean
}
