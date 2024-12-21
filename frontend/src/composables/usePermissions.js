import { ref, computed } from 'vue'
import { useUser } from './useUser'

export function usePermissions() {
  const { user } = useUser()
  const permissions = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isAdmin = computed(() => user.value?.profile === 'admin')

  const can = (permission) => {
    if (isAdmin.value) return true
    return permissions.value.includes(permission)
  }

  const canAny = (permissionList) => {
    if (isAdmin.value) return true
    return permissionList.some(p => permissions.value.includes(p))
  }

  const canAll = (permissionList) => {
    if (isAdmin.value) return true
    return permissionList.every(p => permissions.value.includes(p))
  }

  const loadPermissions = async () => {
    loading.value = true
    try {
      permissions.value = user.value?.permissions || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    permissions,
    loading,
    error,
    isAdmin,
    can,
    canAny,
    canAll,
    loadPermissions
  }
} 