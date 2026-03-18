import { useEffect, useState, useCallback } from 'react'
import type { FormEvent } from 'react'
import { apiFetch } from '../api/config'
import { appointmentStatusLabel } from '../utils/statusLabels'
import './BookingPage.css'

type Service = {
  _id: string
  name: string
  durationMinutes: number
  price?: number
  description?: string
  category?: string
}

type Doctor = {
  _id: string
  fullName: string
  phone?: string
}

type Appointment = {
  _id: string
  serviceId: string
  doctorId?: string
  date: string
  time: string
  status: string
  comment?: string
}

export function BookingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [serviceId, setServiceId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  

  const loadServices = useCallback(async () => {
    const res = await apiFetch('/services')
    if (res.ok) {
      const data = (await res.json()) as Service[]
      setServices(data)
      if (data.length > 0 && !serviceId) setServiceId(data[0]._id)
    }
  }, [serviceId])
  const loadDoctors = useCallback(async () => {
    const res = await apiFetch('/users/doctors')
    if (res.ok) {
      const data = (await res.json()) as Doctor[]
      setDoctors(data)
      if (data.length > 0 && !doctorId) setDoctorId(data[0]._id)
    }
  }, [doctorId])
  const loadAppointments = async () => {
    const res = await apiFetch('/appointments')
    if (res.ok) setAppointments((await res.json()) as Appointment[])
  }

  useEffect(() => {
    void loadServices()
  }, [loadServices])
  useEffect(() => {
    void loadDoctors()
  }, [loadDoctors])
  useEffect(() => {
    void loadAppointments()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.custom-select')) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({ serviceId, doctorId, date, time, comment }),
    })
    if (res.ok) {
      setMessage('Запись успешно создана. С вами свяжутся для подтверждения.')
      setComment('')
      void loadAppointments()
    } else {
      setMessage('Ошибка при создании записи. Попробуйте другую дату или время.')
    }
  }

  const getServiceName = (id: string) => services.find((s) => s._id === id)?.name ?? 'Услуга'
  const getDoctorName = (id?: string) => id ? doctors.find((d) => d._id === id)?.fullName ?? 'Врач' : 'Врач не выбран'
  const selectedService = services.find((s) => s._id === serviceId)

  const handleServiceSelect = (id: string) => {
    setServiceId(id)
    setIsDropdownOpen(false)
  }

  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const upcoming = appointments
    .filter((a) => a.status === 'scheduled' && a.date >= todayString)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Запись на приём</h1>
        <p className="booking-subtitle">
          Выберите услугу, удобные дату и время. После отправки заявки с вами свяжется регистратура для подтверждения записи.
        </p>
      </div>

      <div className="booking-form-card">
        <form onSubmit={handleSubmit} className="booking-form">
          <label>
            Услуга
            <div className="custom-select">
              <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedService ? `${selectedService.name} — ${selectedService.durationMinutes} мин${selectedService.price != null ? ` · ${selectedService.price} ₽` : ''}` : 'Выберите услугу'}
                <span className="custom-select-arrow">▼</span>
              </button>
              {isDropdownOpen && (
                <ul className="custom-select-options">
                  {services.map((s) => (
                    <li
                      key={s._id}
                      className="custom-select-option"
                      onClick={() => handleServiceSelect(s._id)}
                    >
                      {s.name} — {s.durationMinutes} мин{s.price != null ? ` · ${s.price} ₽` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>
          <label>
            Врач
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
              <option value="">Выберите врача</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Дата
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Время
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
          <label>
            Комментарий
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="По желанию: причина визита, особые пожелания" />
          </label>
          <button type="submit" className="booking-submit">
            Записаться
          </button>
          {message && <p className={message.startsWith('Ошибка') ? 'booking-error booking-message' : 'booking-success booking-message'}>{message}</p>}
        </form>
      </div>

      {upcoming.length > 0 && (
        <div className="booking-upcoming">
          <h2>Мои ближайшие записи</h2>
          <ul className="booking-list">
            {upcoming.map((a) => (
              <li key={a._id} className="booking-item">
                <div className="booking-item-info">
                  <div className="booking-item-service">{getServiceName(a.serviceId)}</div>
                  <div className="booking-item-doctor">{getDoctorName(a.doctorId)}</div>
                  <div className="booking-item-datetime">{new Date(a.date).toLocaleDateString('ru-RU')} в {a.time}</div>
                </div>
                <span className="booking-status">{appointmentStatusLabel(a.status)}</span>
              </li>
            ))}
          </ul>
          <p className="booking-upcoming-note">Отменить или перенести запись можно по телефону регистратуры.</p>
        </div>
      )}
    </div>
  )
}

