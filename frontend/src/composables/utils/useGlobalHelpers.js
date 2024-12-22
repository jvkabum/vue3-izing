/**
 * Composable para helpers globais
 * @returns {Object} Objeto contendo helpers globais
 */
export function useGlobalHelpers() {
  /**
   * Obtém iniciais de uma string
   * @param {string} str - String para extrair iniciais
   * @returns {string} Iniciais em maiúsculo
   */
  const getInitials = (str) => {
    if (!str) return ''
    return str
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  /**
   * Solicita permissão para notificações
   */
  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        return permission
      }
      return 'denied'
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      return 'denied'
    }
  }

  return {
    getInitials,
    requestNotificationPermission
  }
}
