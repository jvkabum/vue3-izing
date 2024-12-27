export interface UserForm {
  id?: number
  name: string
  email: string
  password: string
  profile: 'admin' | 'user' | 'super'
  tenantId?: string
  userId?: number
  username?: string
}

export interface ProfileOption {
  value: 'admin' | 'user' | 'super'
  label: string
}

export interface ApiResponse<T> {
  data: T
  error?: string
}
