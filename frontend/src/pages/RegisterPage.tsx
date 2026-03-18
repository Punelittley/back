import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import './AuthPages.css'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ email, password, fullName })
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message ?? 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Регистрация пациента</h1>
        <p className="auth-subtitle">Создайте личный кабинет для управления визитами и результатами анализов</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            ФИО
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.replace(/[0-9]/g, ''))}
              required
              minLength={2}
              maxLength={50}
              pattern="[A-Za-zА-Яа-яЁё\s\-]*"
              placeholder="Иванов Иван Иванович"
              title="Оно может содержать только буквы, пробелы и дефисы"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              minLength={5}
              maxLength={100}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={50}
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </button>
        </form>
        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}

