import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '../types'
import axiosInstance from '../lib/axios'

const customStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(name, value)
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  getMe: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await axiosInstance.post('/auth/login', { email, password })
          const { user, token } = response.data.data
          set({ user, token, isAuthenticated: true })
        } catch (error) {
          console.error('Login failed', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      getMe: async () => {
        set({ isLoading: true })
        try {
          const { data } = await axiosInstance.get('/auth/me')
          set({ user: data.user, isAuthenticated: true })
        } catch (error) {
          console.error('Failed to fetch user', error)
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage as any),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
