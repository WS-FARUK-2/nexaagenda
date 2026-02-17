import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export const isProfessionalRole = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('user_role') === 'professional'
}

export const requireAdminRole = (router: AppRouterInstance) => {
  if (isProfessionalRole()) {
    router.push('/dashboard/profissional')
    return true
  }
  return false
}
