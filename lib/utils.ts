/**
 * Formata um número para moeda brasileira (R$)
 * @param value - Valor numérico ou string a ser formatado
 * @returns String formatada como moeda (ex: R$ 150,00)
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) {
    return 'R$ 0,00'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue)
}

/**
 * Formata uma data para o padrão brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada (ex: 16/02/2026)
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR')
}

/**
 * Formata um horário removendo segundos
 * @param time - Horário a ser formatado (HH:MM:SS ou HH:MM)
 * @returns String formatada (ex: 14:30)
 */
export function formatTime(time: string): string {
  return time.substring(0, 5)
}
