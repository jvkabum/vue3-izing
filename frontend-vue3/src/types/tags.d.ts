export interface Tag {
  id: number | string
  name: string
  color: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: number | string
  updatedBy?: number | string
}

export interface TagFormData {
  name: string
  color: string
  description?: string
  isActive: boolean
}

export interface TagFilters {
  search?: string
  isActive?: boolean
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface TagsState {
  tags: Tag[]
  loading: boolean
  error: string | null
  filters: TagFilters
  selectedTags: Tag[]
}

export interface TagValidationError {
  field: 'name' | 'color' | 'description'
  message: string
}

export interface TagsResponse {
  data: Tag[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface TagStats {
  total: number
  active: number
  inactive: number
  mostUsed: Array<{
    tagId: number | string
    tagName: string
    count: number
  }>
}

// Enums para constantes relacionadas a tags
export enum TagSortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export enum TagSortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

// Type para funções auxiliares de tags
export interface TagHelpers {
  validateTagName: (name: string) => boolean
  validateTagColor: (color: string) => boolean
  formatTagName: (name: string) => string
  getTagInitials: (name: string) => string
  getContrastColor: (hexcolor: string) => string
}

// Type para constantes de tags
export interface TagConstants {
  MAX_NAME_LENGTH: number
  MAX_DESCRIPTION_LENGTH: number
  MAX_TAGS_PER_ITEM: number
  DEFAULT_COLOR: string
}

// Type para eventos emitidos pelos componentes de tag
export interface TagEvents {
  'update:modelValue': (tags: Tag[]) => void
  'tag:add': (tag: Tag) => void
  'tag:remove': (tag: Tag) => void
  'tag:select': (tag: Tag) => void
  'tag:create': (tagData: TagFormData) => void
  'tag:update': (id: number | string, tagData: TagFormData) => void
  'tag:delete': (id: number | string) => void
}
