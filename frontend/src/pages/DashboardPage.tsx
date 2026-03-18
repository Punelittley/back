import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { apiFetch } from '../api/config'
import { appointmentStatusLabel, analysisStatusLabel } from '../utils/statusLabels'

type Analysis = {
  _id: string
  type: string
  date: string
  resultSummary: string
  status: string
}

type Appointment = {
  _id: string
  date: string
  time: string
  status: string
}

export function DashboardPage() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [aRes, apRes] = await Promise.all([
        apiFetch('/analyses'),
        apiFetch('/appointments'),
      ])
      if (aRes.ok) setAnalyses((await aRes.json()) as Analysis[])
      if (apRes.ok) setAppointments((await apRes.json()) as Appointment[])
    }
    void fetchData()
  }, [])

  return (
    <div className="dashboard">
      <h1>Здравствуйте, {user?.fullName}</h1>
      <p className="dashboard-subtitle">
        В личном кабинете — ваши ближайшие записи, последние результаты анализов и быстрый доступ к разделам сайта.
      </p>
      <div className="dashboard-actions">
        <Link to="/booking" className="dashboard-action-card">
          <strong>Записаться на приём</strong>
          <span>Выберите услугу, дату и время</span>
        </Link>
        <Link to="/analyses" className="dashboard-action-card">
          <strong>Мои анализы</strong>
          <span>Результаты обследований</span>
        </Link>
        <Link to="/news" className="dashboard-action-card">
          <strong>Новости клиники</strong>
          <span>Акции и объявления</span>
        </Link>
      </div>
      <div className="dashboard-grid">
        <section className="card">
          <h2>Ближайшие записи</h2>
          {appointments.length === 0 ? (
            <p>Нет запланированных визитов.</p>
          ) : (
            <ul className="list">
              {appointments.slice(0, 3).map((a) => (
                <li key={a._id}>
                  <strong>
                    {new Date(a.date).toLocaleDateString()} в {a.time}
                  </strong>
                  <span className="pill">{appointmentStatusLabel(a.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2>Последние анализы</h2>
          {analyses.length === 0 ? (
            <p>Результатов анализов пока нет.</p>
          ) : (
            <ul className="list">
              {analyses.slice(0, 3).map((an) => (
                <li key={an._id}>
                  <strong>{an.type}</strong>
                  <span>{new Date(an.date).toLocaleDateString()}</span>
                  <span className="pill">{analysisStatusLabel(an.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

