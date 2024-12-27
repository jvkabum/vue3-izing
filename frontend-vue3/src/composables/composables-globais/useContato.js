import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

export function useContato() {
  const $q = useQuasar()
  const loading = ref(false)
  const contatos = ref([])

  const parseVCard = (vcard) => {
    const lines = vcard.split('\n')
    const contact = {
      name: '',
      number: '',
      photo: ''
    }

    lines.forEach(line => {
      if (line.startsWith('FN:')) {
        contact.name = line.substring(3)
      } else if (line.startsWith('TEL') || line.includes('.TEL')) {
        contact.number = line.split(':')[1]
      } else if (line.startsWith('PHOTO;BASE64')) {
        contact.photo = line.split(':')[1]
      }
    })

    return contact
  }

  const buscarContatos = async (searchParam = '') => {
    try {
      loading.value = true
      const { data } = await api.get(`/contacts?searchParam=${searchParam}`)
      contatos.value = data.contacts
      return data
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao buscar contatos',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const criarContato = async (contato) => {
    try {
      loading.value = true
      const { data } = await api.post('/contacts', contato)
      $q.notify({
        type: 'positive',
        message: 'Contato criado com sucesso',
        position: 'top'
      })
      return data
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar contato',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarContato = async (id, contato) => {
    try {
      loading.value = true
      const { data } = await api.put(`/contacts/${id}`, contato)
      $q.notify({
        type: 'positive',
        message: 'Contato atualizado com sucesso',
        position: 'top'
      })
      return data
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar contato',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const deletarContato = async (id) => {
    try {
      loading.value = true
      await api.delete(`/contacts/${id}`)
      $q.notify({
        type: 'positive',
        message: 'Contato deletado com sucesso',
        position: 'top'
      })
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar contato',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    contatos,
    parseVCard,
    buscarContatos,
    criarContato,
    atualizarContato,
    deletarContato
  }
}
