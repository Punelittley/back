import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { apiFetch } from '../api/config'
import './ProfilePage.css'

type Profile = {
  id: string
  email: string
  fullName: string
  phone?: string | null
}

export function ProfilePage() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/auth/me')
      if (res.ok) {
        const data = (await res.json()) as Profile
        setFullName(data.fullName)
        setPhone(data.phone ?? '')
      }
      setLoading(false)
    }
    void load()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)
    const res = await apiFetch('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() || null }),
    })
    if (res.ok) {
      setSaved(true)
    }
  }

  if (loading) return <div className="centered">Загрузка...</div>

  return (
    <div className="profile-page">
      <h1>Мой профиль</h1>
      <p className="dashboard-subtitle">Измените данные для связи и отображения в личном кабинете.</p>
      <form onSubmit={handleSubmit} className="card profile-form">
        <label>
          ФИО
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value.replace(/[0-9]/g, ''))}
            required
            minLength={2}
            maxLength={30}
            pattern="[A-Za-zА-Яа-яЁё\s\-]*"
            placeholder="Иванов Иван Иванович"
            title="Оно может содержать только буквы, пробелы и дефисы"
          />
        </label>
        <label>
          Email
          <input type="email" value={user?.email ?? ''} disabled className="profile-email" />
          <span className="profile-hint">Email изменить нельзя</span>
        </label>
        <label>
          Телефон
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            minLength={11}
            maxLength={12}
            placeholder="+7 (999) 123-45-67"
          />
        </label>
        <button type="submit" className="btn btn-primary">Сохранить</button>
        {saved && <p className="profile-saved">Изменения сохранены</p>}
      </form>
    </div>
  )
}
