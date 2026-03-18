import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { sanitizeEmail, validateEmail, validatePassword, sanitizeFullName } from '../../utils/authValidation'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { validatePhone } from '../../utils/authValidation'

type User = {
  id: string
  email: string
  fullName: string
  role: 'patient' | 'doctor' | 'admin'
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    fullName: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = (await res.json()) as User
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  const login = useCallback(
    async (email: string, password: string) => {
      // Валидация входных данных
      validateEmail(email)
      validatePassword(password)

      setLoading(true)
      try {
        const sanitizedEmail = sanitizeEmail(email)
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: sanitizedEmail, password }),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error((json as { message?: string }).message ?? 'Неверный логин или пароль')
        }
        const data = (await res.json()) as User
        setUser(data)
      } catch (err) {
        if ((err as Error).message === 'Failed to fetch') {
          throw new Error('Сервер недоступен. Запустите бэкенд: в папке backend выполните npm run dev')
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const register = useCallback(
    async (payload: { email: string; password: string; fullName: string }) => {
      // Валидация входных данных
      validateEmail(payload.email)
      validatePassword(payload.password)
      const sanitizedFullName = sanitizeFullName(payload.fullName)

      setLoading(true)
      try {
        const sanitizedEmail = sanitizeEmail(payload.email)
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: sanitizedEmail,
            password: payload.password,
            fullName: sanitizedFullName,
          }),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error((json as { message?: string }).message ?? 'Ошибка регистрации')
        }
        const data = (await res.json()) as User
        setUser(data)
      } catch (err) {
        if ((err as Error).message === 'Failed to fetch') {
          throw new Error('Сервер недоступен. Запустите бэкенд: в папке backend выполните npm run dev')
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

