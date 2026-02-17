// Cache utilities para melhorar performance em mobile

const CACHE_PREFIX = 'nexa_cache_'
const CACHE_EXPIRY_PREFIX = 'nexa_expiry_'

interface CacheOptions {
  expiresIn?: number // segundos
}

/**
 * Salvar dados em localStorage com expiração opcional
 */
export const setCache = (key: string, data: any, options?: CacheOptions) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`
    const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`
    
    localStorage.setItem(cacheKey, JSON.stringify(data))
    
    if (options?.expiresIn) {
      const expiryTime = Date.now() + options.expiresIn * 1000
      localStorage.setItem(expiryKey, String(expiryTime))
    } else {
      localStorage.removeItem(expiryKey)
    }
  } catch (error) {
    console.warn('Cache error:', error)
  }
}

/**
 * Recuperar dados do cache
 */
export const getCache = (key: string): any | null => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`
    const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`
    
    const expiryTime = localStorage.getItem(expiryKey)
    
    // Verificar se cache expirou
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      clearCache(key)
      return null
    }
    
    const cachedData = localStorage.getItem(cacheKey)
    return cachedData ? JSON.parse(cachedData) : null
  } catch (error) {
    console.warn('Cache error:', error)
    return null
  }
}

/**
 * Limpar cache específico
 */
export const clearCache = (key: string) => {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`)
    localStorage.removeItem(`${CACHE_EXPIRY_PREFIX}${key}`)
  } catch (error) {
    console.warn('Cache error:', error)
  }
}

/**
 * Limpar todo o cache
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Cache error:', error)
  }
}

/**
 * Hook para usar cache com fallback
 */
export const useCacheOrFetch = async (
  key: string,
  fetchFn: () => Promise<any>,
  options?: CacheOptions
) => {
  // Verificar cache primeiro
  const cached = getCache(key)
  if (cached) {
    return cached
  }
  
  // Se não houver cache, fazer fetch
  const data = await fetchFn()
  setCache(key, data, options)
  return data
}
