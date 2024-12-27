import type { AxiosResponse } from 'axios'
import { api } from '../boot/axios'
import type { UserForm } from '../types/user.types'

interface ApiResponse<T> {
  data: T
  error?: string
}

export const AdminUpdateUsuarios = async (
  id: number, 
  userData: Partial<UserForm>
): Promise<AxiosResponse<ApiResponse<UserForm>>> => api.put(`/users/${id}`, userData)
