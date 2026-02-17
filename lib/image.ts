/**
 * Utility para carregar imagens de forma otimizada em mobile
 */

export function optimizeImageUrl(url: string | undefined, maxWidth: number = 300): string {
  if (!url) return ''
  
  // Se for URL Base64, retornar como está
  if (url.startsWith('data:')) return url
  
  // Se for URL Supabase, adicionar transformações
  if (url.includes('supabase')) {
    // Exemplo: redimensionar para mobile
    return `${url}?width=${maxWidth}&quality=70`
  }
  
  return url
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}
