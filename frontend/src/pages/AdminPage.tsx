import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { apiFetch } from '../api/config'
import { analysisStatusLabel } from '../utils/statusLabels'

type NewsItem = {
  _id: string
  title: string
  content: string
  publishedAt: string
  isFeatured?: boolean
  priority?: number
  imageUrl?: string
}

type Service = {
  _id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  category?: string
  isActive?: boolean
}

type User = {
  _id: string
  email: string
  fullName: string
  role: string
}

type Analysis = {
  _id: string
  patientId: string
  type: string
  date: string
  resultSummary: string
  status: string
  doctorNotes?: string
}

type Appointment = {
  _id: string
  patientId: string
  serviceId: string
  date: string
  time: string
  status: string
  comment?: string
}

type Tab = 'news' | 'services' | 'analyses' | 'appointments'

export function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('news')
  const [news, setNews] = useState<NewsItem[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [nTitle, setNTitle] = useState('')
  const [nContent, setNContent] = useState('')
  const [nFeatured, setNFeatured] = useState(false)
  const [nPriority, setNPriority] = useState(5)
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)

  const [sName, setSName] = useState('')
  const [sDesc, setSDesc] = useState('')
  const [sPrice, setSPrice] = useState<number | ''>('')
  const [sDuration, setSDuration] = useState<number | ''>(30)
  const [sCategory, setSCategory] = useState('')
  const [sActive, setSActive] = useState(true)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

  const [aPatientId, setAPatientId] = useState('')
  const [aType, setAType] = useState('')
  const [aDate, setADate] = useState('')
  const [aSummary, setASummary] = useState('')
  const [aStatus, setAStatus] = useState('ready')

  const [apPatientId, setApPatientId] = useState('')
  const [apServiceId, setApServiceId] = useState('')
  const [apDate, setApDate] = useState('')
  const [apTime, setApTime] = useState('')
  const [apComment, setApComment] = useState('')

  const loadAll = async () => {
    setLoading(true)
    try {
      const [nRes, sRes, aRes, apRes, uRes] = await Promise.all([
        apiFetch('/news'),
        apiFetch('/services?all=true'),
        apiFetch('/analyses'),
        apiFetch('/appointments'),
        apiFetch('/users'),
      ])
      if (nRes.ok) setNews((await nRes.json()) as NewsItem[])
      if (sRes.ok) setServices((await sRes.json()) as Service[])
      if (aRes.ok) setAnalyses((await aRes.json()) as Analysis[])
      if (apRes.ok) setAppointments((await apRes.json()) as Appointment[])
      if (uRes.ok) setUsers((await uRes.json()) as User[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  if (user?.role !== 'admin') {
    return (
      <div className="card">
        <p>Доступ к админ-панели только для администратора.</p>
      </div>
    )
  }

  const getUserName = (id: string) => users.find((u) => u._id === id)?.fullName ?? id
  const getServiceName = (id: string) => services.find((s) => s._id === id)?.name ?? id

  const saveNews = async () => {
    if (!nTitle.trim() || !nContent.trim()) return
    if (editingNewsId) {
      const res = await apiFetch(`/news/${editingNewsId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: nTitle, content: nContent, isFeatured: nFeatured, priority: nPriority }),
      })
      if (res.ok) {
        const updated = (await res.json()) as NewsItem
        setNews((prev) => prev.map((n) => (n._id === updated._id ? updated : n)))
        setEditingNewsId(null)
        setNTitle('')
        setNContent('')
        setNFeatured(false)
        setNPriority(5)
      }
    } else {
      const res = await apiFetch('/news', {
        method: 'POST',
        body: JSON.stringify({ title: nTitle, content: nContent, isFeatured: nFeatured, priority: nPriority }),
      })
      if (res.ok) {
        const created = (await res.json()) as NewsItem
        setNews((prev) => [created, ...prev])
        setNTitle('')
        setNContent('')
        setNFeatured(false)
        setNPriority(5)
      }
    }
  }
  const deleteNews = async (id: string) => {
    if (!confirm('Удалить новость?')) return
    const res = await apiFetch(`/news/${id}`, { method: 'DELETE' })
    if (res.ok) setNews((prev) => prev.filter((n) => n._id !== id))
  }
  const startEditNews = (n: NewsItem) => {
    setEditingNewsId(n._id)
    setNTitle(n.title)
    setNContent(n.content)
    setNFeatured(n.isFeatured ?? false)
    setNPriority(n.priority ?? 5)
  }

  const saveService = async () => {
    if (!sName.trim() || !sDesc.trim() || sPrice === '' || sDuration === '') return
    if (editingServiceId) {
      const res = await apiFetch(`/services/${editingServiceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: sName,
          description: sDesc,
          price: Number(sPrice),
          durationMinutes: Number(sDuration),
          category: sCategory || undefined,
          isActive: sActive,
        }),
      })
      if (res.ok) {
        const updated = (await res.json()) as Service
        setServices((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
        setEditingServiceId(null)
        resetServiceForm()
      }
    } else {
      const res = await apiFetch('/services', {
        method: 'POST',
        body: JSON.stringify({
          name: sName,
          description: sDesc,
          price: Number(sPrice),
          durationMinutes: Number(sDuration),
          category: sCategory || undefined,
          isActive: sActive,
        }),
      })
      if (res.ok) {
        const created = (await res.json()) as Service
        setServices((prev) => [created, ...prev])
        resetServiceForm()
      }
    }
  }
  const resetServiceForm = () => {
    setSName('')
    setSDesc('')
    setSPrice('')
    setSDuration(30)
    setSCategory('')
    setSActive(true)
  }
  const deleteService = async (id: string) => {
    if (!confirm('Удалить услугу?')) return
    const res = await apiFetch(`/services/${id}`, { method: 'DELETE' })
    if (res.ok) setServices((prev) => prev.filter((s) => s._id !== id))
  }
  const startEditService = (s: Service) => {
    setEditingServiceId(s._id)
    setSName(s.name)
    setSDesc(s.description)
    setSPrice(s.price)
    setSDuration(s.durationMinutes)
    setSCategory(s.category ?? '')
    setSActive(s.isActive ?? true)
  }

  const createAnalysis = async () => {
    if (!aPatientId || !aType || !aDate || !aSummary) return
    const res = await apiFetch('/analyses', {
      method: 'POST',
      body: JSON.stringify({
        patientId: aPatientId,
        type: aType,
        date: aDate,
        resultSummary: aSummary,
        status: aStatus,
      }),
    })
    if (res.ok) {
      const created = (await res.json()) as Analysis
      setAnalyses((prev) => [created, ...prev])
      setAPatientId('')
      setAType('')
      setADate('')
      setASummary('')
      setAStatus('ready')
    }
  }
  const deleteAnalysis = async (id: string) => {
    if (!confirm('Удалить запись об анализе?')) return
    const res = await apiFetch(`/analyses/${id}`, { method: 'DELETE' })
    if (res.ok) setAnalyses((prev) => prev.filter((a) => a._id !== id))
  }

  const createAppointment = async () => {
    if (!apPatientId || !apServiceId || !apDate || !apTime) return
    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientId: apPatientId,
        serviceId: apServiceId,
        date: apDate,
        time: apTime,
        comment: apComment || undefined,
      }),
    })
    if (res.ok) {
      const created = (await res.json()) as Appointment
      setAppointments((prev) => [created, ...prev])
      setApPatientId('')
      setApServiceId('')
      setApDate('')
      setApTime('')
      setApComment('')
    }
  }
  const updateAppointmentStatus = async (id: string, status: string) => {
    const res = await apiFetch(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)))
    }
  }
  const deleteAppointment = async (id: string) => {
    if (!confirm('Отменить запись?')) return
    const res = await apiFetch(`/appointments/${id}`, { method: 'DELETE' })
    if (res.ok) setAppointments((prev) => prev.filter((a) => a._id !== id))
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'news', label: 'Новости' },
    { id: 'services', label: 'Услуги' },
    { id: 'analyses', label: 'Анализы' },
    { id: 'appointments', label: 'Записи' },
  ]

  return (
    <div className="admin-page">
      <h1>Админ-панель</h1>
      <p className="dashboard-subtitle">Управление контентом сайта, услугами, результатами анализов и записями пациентов.</p>
      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="centered">Загрузка…</p>
      ) : (
        <>
          {tab === 'news' && (
            <div className="admin-section card">
              <h2>Новости</h2>
              <div className="auth-form admin-form">
                <input placeholder="Заголовок" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
                <textarea placeholder="Текст новости" value={nContent} onChange={(e) => setNContent(e.target.value)} rows={3} />
                <label className="admin-check">
                  <input type="checkbox" checked={nFeatured} onChange={(e) => setNFeatured(e.target.checked)} />
                  В слайдере (важное)
                </label>
                <input type="number" placeholder="Приоритет" value={nPriority} onChange={(e) => setNPriority(Number(e.target.value) || 0)} />
                <button type="button" className="btn btn-primary" onClick={saveNews}>
                  {editingNewsId ? 'Сохранить' : 'Добавить новость'}
                </button>
                {editingNewsId && (
                  <button type="button" className="btn btn-outline" onClick={() => { setEditingNewsId(null); setNTitle(''); setNContent(''); setNFeatured(false); setNPriority(5); }}>
                    Отмена
                  </button>
                )}
              </div>
              <ul className="list admin-list">
                {news.map((n) => (
                  <li key={n._id} className="admin-list-item">
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.content.slice(0, 120)}…</p>
                    </div>
                    <div className="admin-actions">
                      <button type="button" className="btn btn-outline" onClick={() => startEditNews(n)}>Изменить</button>
                      <button type="button" className="btn btn-outline" onClick={() => deleteNews(n._id)}>Удалить</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'services' && (
            <div className="admin-section card">
              <h2>Услуги</h2>
              <div className="auth-form admin-form">
                <input placeholder="Название" value={sName} onChange={(e) => setSName(e.target.value)} />
                <textarea placeholder="Описание" value={sDesc} onChange={(e) => setSDesc(e.target.value)} rows={2} />
                <input type="number" placeholder="Цена (₽)" value={sPrice} onChange={(e) => setSPrice(e.target.value === '' ? '' : Number(e.target.value))} />
                <input type="number" placeholder="Длительность (мин)" value={sDuration} onChange={(e) => setSDuration(e.target.value === '' ? '' : Number(e.target.value))} />
                <input placeholder="Категория" value={sCategory} onChange={(e) => setSCategory(e.target.value)} />
                <label className="admin-check">
                  <input type="checkbox" checked={sActive} onChange={(e) => setSActive(e.target.checked)} />
                  Активна (отображается при записи)
                </label>
                <div className="admin-form-buttons">
                  <button type="button" className="btn btn-primary" onClick={saveService}>
                    {editingServiceId ? 'Сохранить' : 'Добавить услугу'}
                  </button>
                  {editingServiceId && (
                    <button type="button" className="btn btn-outline" onClick={() => { setEditingServiceId(null); resetServiceForm(); }}>Отмена</button>
                  )}
                </div>
              </div>
              <ul className="list admin-list">
                {services.map((s) => (
                  <li key={s._id} className="admin-list-item">
                    <div>
                      <strong>{s.name}</strong> — {s.price} ₽ · {s.durationMinutes} мин {s.category && `· ${s.category}`}
                      {s.isActive === false && <span className="pill" style={{ marginLeft: 8 }}>неактивна</span>}
                    </div>
                    <div className="admin-actions">
                      <button type="button" className="btn btn-outline" onClick={() => startEditService(s)}>Изменить</button>
                      <button type="button" className="btn btn-outline" onClick={() => deleteService(s._id)}>Удалить</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'analyses' && (
            <div className="admin-section card">
              <h2>Анализы и обследования</h2>
              <div className="auth-form admin-form">
                <label>Пациент</label>
                <select value={aPatientId} onChange={(e) => setAPatientId(e.target.value)}>
                  <option value="">— выберите —</option>
                  {users.filter((u) => u.role === 'patient').map((u) => (
                    <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
                <input placeholder="Тип (напр. Общий анализ крови)" value={aType} onChange={(e) => setAType(e.target.value)} />
                <input type="date" value={aDate} onChange={(e) => setADate(e.target.value)} />
                <textarea placeholder="Результат / краткое заключение" value={aSummary} onChange={(e) => setASummary(e.target.value)} rows={2} />
                <select value={aStatus} onChange={(e) => setAStatus(e.target.value)}>
                  <option value="pending">Ожидает</option>
                  <option value="ready">Готов</option>
                  <option value="cancelled">Отменён</option>
                </select>
                <button type="button" className="btn btn-primary" onClick={createAnalysis}>Добавить результат</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Пациент</th>
                    <th>Тип</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Результат</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <tr key={a._id}>
                      <td>{getUserName(a.patientId)}</td>
                      <td>{a.type}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td><span className="pill">{analysisStatusLabel(a.status)}</span></td>
                      <td>{a.resultSummary}</td>
                      <td>
                        <button type="button" className="btn btn-outline" onClick={() => deleteAnalysis(a._id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'appointments' && (
            <div className="admin-section card">
              <h2>Записи на приём</h2>
              <div className="auth-form admin-form">
                <label>Пациент</label>
                <select value={apPatientId} onChange={(e) => setApPatientId(e.target.value)}>
                  <option value="">— выберите —</option>
                  {users.filter((u) => u.role === 'patient').map((u) => (
                    <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
                <label>Услуга</label>
                <select value={apServiceId} onChange={(e) => setApServiceId(e.target.value)}>
                  <option value="">— выберите —</option>
                  {services.filter((s) => s.isActive !== false).map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <input type="date" value={apDate} onChange={(e) => setApDate(e.target.value)} />
                <input type="time" value={apTime} onChange={(e) => setApTime(e.target.value)} />
                <textarea placeholder="Комментарий" value={apComment} onChange={(e) => setApComment(e.target.value)} rows={2} />
                <button type="button" className="btn btn-primary" onClick={createAppointment}>Создать запись</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Пациент</th>
                    <th>Услуга</th>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a._id}>
                      <td>{getUserName(a.patientId)}</td>
                      <td>{getServiceName(a.serviceId)}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{a.time}</td>
                      <td>
                        <select value={a.status} onChange={(e) => updateAppointmentStatus(a._id, e.target.value)} className="admin-select-inline">
                          <option value="scheduled">Запланирована</option>
                          <option value="completed">Выполнена</option>
                          <option value="cancelled">Отменена</option>
                        </select>
                      </td>
                      <td>
                        <button type="button" className="btn btn-outline" onClick={() => deleteAppointment(a._id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
