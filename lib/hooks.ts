/**
 * Debounce hook para otimizar performance em inputs
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = require('react').useState(value)

  require('react').useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Debounce function para callbacks
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Throttle function para eventos frequentes como scroll
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 500
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
