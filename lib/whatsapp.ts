/**
 * Gera URL do WhatsApp com mensagem pré-formatada
 * @param phoneNumber - Número do telefone (com ou sem formatação)
 * @param message - Mensagem a enviar
 * @returns URL do WhatsApp
 */
export function generateWhatsAppURL(phoneNumber: string, message: string): string {
  // Remove caracteres não numéricos
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  
  // Se não tiver código do país, adiciona 55 (Brasil)
  const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
  
  // Codifica a mensagem para URL
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${phone}?text=${encodedMessage}`
}

/**
 * Cria mensagem de lembrete de agendamento para WhatsApp
 * @param clientName - Nome do cliente
 * @param serviceName - Nome do serviço
 * @param date - Data do agendamento (YYYY-MM-DD)
 * @param time - Hora do agendamento (HH:MM)
 * @param professionalName - Nome do profissional
 * @returns Mensagem formatada para WhatsApp
 */
export function generateAppointmentReminder(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  professionalName: string
): string {
  // Converter data para formato legível
  const [year, month, day] = date.split('-')
  const dateObj = new Date(`${year}-${month}-${day}`)
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return `Olá ${clientName}! 👋

Lembrete de agendamento com ${professionalName}:

📋 Serviço: ${serviceName}
📅 Data: ${formattedDate}
🕐 Horário: ${time}

Por favor, confirme sua presença ou cancele com antecedência se necessário.

Obrigado! 😊`
}

/**
 * Cria mensagem de confirmação de agendamento para WhatsApp
 * @param clientName - Nome do cliente
 * @param serviceName - Nome do serviço
 * @param date - Data do agendamento (YYYY-MM-DD)
 * @param time - Hora do agendamento (HH:MM)
 * @param professionalName - Nome do profissional
 * @returns Mensagem formatada para WhatsApp
 */
export function generateAppointmentConfirmation(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  professionalName: string
): string {
  // Converter data para formato legível
  const [year, month, day] = date.split('-')
  const dateObj = new Date(`${year}-${month}-${day}`)
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return `🎉 Agendamento Confirmado!

Olá ${clientName}! 

Seu agendamento com ${professionalName} foi realizado com sucesso:

📋 Serviço: ${serviceName}
📅 Data: ${formattedDate}
🕐 Horário: ${time}

Obrigado por escolher nossos serviços! 😊

Qualquer dúvida, estamos à disposição.`
}
