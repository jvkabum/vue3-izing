export function useContato() {
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

  return {
    parseVCard
  }
}
