import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { 
  ListarContatos, 
  ImportarArquivoContato, 
  DeletarContato, 
  SyncronizarContatos,
  ExportarArquivoContato 
} from '../../service/contatos'
import { CriarTicket } from '../../service/tickets'
import { ListarUsuarios } from '../../service/user'
import { ListarEtiquetas } from '../../service/etiquetas'

/**
 * Composable para gerenciar contatos
 * @returns {Object} Objeto contendo estados e métodos dos contatos
 */
export function useContatos() {
  const $q = useQuasar()
  const router = useRouter()
  const store = useStore()

  // Estado
  const contacts = ref([])
  const loading = ref(false)
  const filter = ref(null)
  const selectedContactId = ref(null)
  const modalContato = ref(false)
  const modalImportarContatos = ref(false)
  const file = ref([])
  const isImportCSV = ref(false)
  const wallets = ref([])
  const tags = ref([])
  const etiquetas = ref([])
  const usuarios = ref([])

  // Parâmetros de paginação
  const params = ref({
    pageNumber: 1,
    searchParam: null,
    hasMore: true
  })

  const pagination = ref({
    rowsPerPage: 100,
    rowsNumber: 0,
    lastIndex: 0
  })

  /**
   * Configuração das colunas da tabela
   */
  const columns = [
    { 
      name: 'profilePicUrl', 
      label: '', 
      field: 'profilePicUrl', 
      style: 'width: 50px', 
      align: 'center' 
    },
    {
      name: 'name',
      label: 'Nome',
      field: 'name',
      align: 'left',
      style: 'width: 300px',
      format: (v, r) => {
        if (r.number && r.name == r.number && r.pushname) {
          return r.pushname
        }
        return r.name
      }
    },
    { 
      name: 'number', 
      label: 'WhatsApp', 
      field: 'number', 
      align: 'center', 
      style: 'width: 300px' 
    },
    {
      name: 'wallet',
      label: 'Carteira',
      field: 'wallet',
      align: 'center',
      style: 'width: 300px'
    },
    {
      name: 'instagramPK',
      label: 'Instagram',
      field: 'instagramPK',
      align: 'center',
      style: 'width: 300px',
      format: (v, r) => r.instagramPK ? r.pushname : ''
    },
    {
      name: 'telegramId',
      label: 'Id Telegram',
      field: 'telegramId',
      align: 'center',
      style: 'width: 300px',
      format: (v, r) => r.telegramId ? r.pushname : ''
    },
    { 
      name: 'email', 
      label: 'Email', 
      field: 'email', 
      style: 'width: 500px', 
      align: 'left' 
    },
    { 
      name: 'acoes', 
      label: 'Ações', 
      field: 'acoes', 
      align: 'center' 
    }
  ]

  /**
   * Lista todos os contatos
   */
  const listarContatos = async () => {
    try {
      loading.value = true
      const { data } = await ListarContatos(params.value)
      params.value.hasMore = data.hasMore
      loadContacts(data.contacts)
      pagination.value.lastIndex = contacts.value.length - 1
      pagination.value.rowsNumber = data.count
    } catch (error) {
      console.error('Erro ao listar contatos:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar contatos',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Lista todos os usuários
   */
  const listarUsuarios = async () => {
    try {
      const { data } = await ListarUsuarios()
      usuarios.value = data.users
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar usuários',
        position: 'top'
      })
    }
  }

  /**
   * Lista todas as etiquetas
   */
  const listarEtiquetas = async () => {
    try {
      const { data } = await ListarEtiquetas(true)
      etiquetas.value = data
    } catch (error) {
      console.error('Erro ao listar etiquetas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar etiquetas',
        position: 'top'
      })
    }
  }

  /**
   * Carrega contatos na lista
   */
  const loadContacts = (newContacts) => {
    const updatedContacts = []
    newContacts.forEach(contact => {
      const contactIndex = contacts.value.findIndex(c => c.id === contact.id)
      if (contactIndex !== -1) {
        contacts.value[contactIndex] = contact
      } else {
        updatedContacts.push(contact)
      }
    })
    contacts.value = [...contacts.value, ...updatedContacts]
  }

  /**
   * Atualiza um contato
   */
  const updateContact = (contact) => {
    const contactIndex = contacts.value.findIndex(c => c.id === contact.id)
    if (contactIndex !== -1) {
      contacts.value[contactIndex] = contact
    } else {
      contacts.value.unshift(contact)
    }
  }

  /**
   * Remove um contato
   */
  const deleteContact = (contactId) => {
    const contactIndex = contacts.value.findIndex(c => c.id === contactId)
    if (contactIndex !== -1) {
      contacts.value.splice(contactIndex, 1)
    }
  }

  /**
   * Filtra contatos
   */
  const filtrarContato = (searchParam) => {
    contacts.value = []
    params.value.pageNumber = 1
    params.value.searchParam = searchParam
    listarContatos()
  }

  /**
   * Manipula scroll infinito
   */
  const onScroll = ({ to }) => {
    if (!loading.value && params.value.hasMore && to === pagination.value.lastIndex) {
      params.value.pageNumber++
      listarContatos()
    }
  }

  /**
   * Manipula criação de ticket
   */
  const handleSaveTicket = async (contact, channel) => {
    if (!contact.id) return

    const whatsapps = computed(() => store.getters.whatsapps)
    const userId = +localStorage.getItem('userId')

    const itens = []
    whatsapps.value.forEach(w => {
      if (w.type === channel) {
        itens.push({ label: w.name, value: w.id })
      }
    })

    try {
      const channelId = await new Promise((resolve) => {
        $q.dialog({
          title: `Contato: ${contact.name}`,
          message: 'Selecione o canal para iniciar o atendimento.',
          options: {
            type: 'radio',
            model: null,
            isValid: v => !!v,
            items: itens
          },
          ok: {
            push: true,
            rounded: true,
            color: 'positive',
            label: 'Iniciar'
          },
          cancel: {
            push: true,
            rounded: true,
            label: 'Cancelar',
            color: 'negative'
          },
          persistent: true
        }).onOk(resolve).onCancel(() => resolve(null))
      })

      if (!channelId) return

      loading.value = true
      const { data: ticket } = await CriarTicket({
        contactId: contact.id,
        isActiveDemand: true,
        userId,
        channel,
        channelId,
        status: 'open'
      })

      await store.commit('SET_HAS_MORE', true)
      await store.dispatch('AbrirChatMensagens', ticket)

      $q.notify({
        message: `Atendimento Iniciado || ${ticket.contact.name} - Ticket: ${ticket.id}`,
        type: 'positive',
        position: 'top',
        timeout: 5000
      })

      router.push({ name: 'chat', params: { ticketId: ticket.id } })
    } catch (error) {
      if (error?.status === 409) {
        const ticketAtual = JSON.parse(error.data.error)
        abrirAtendimentoExistente(contact, ticketAtual)
        return
      }
      console.error('Erro ao criar ticket:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar atendimento',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    contacts,
    loading,
    filter,
    selectedContactId,
    modalContato,
    modalImportarContatos,
    file,
    isImportCSV,
    wallets,
    tags,
    etiquetas,
    usuarios,
    params,
    pagination,
    columns,

    // Métodos
    listarContatos,
    listarUsuarios,
    listarEtiquetas,
    loadContacts,
    updateContact,
    deleteContact,
    filtrarContato,
    onScroll,
    handleSaveTicket
  }
}
