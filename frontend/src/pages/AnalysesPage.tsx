import { useEffect, useState } from 'react'
import { apiFetch } from '../api/config'
import { analysisStatusLabel } from '../utils/statusLabels'

type Analysis = {
  _id: string
  type: string
  date: string
  resultSummary: string
  status: string
}

export function AnalysesPage() {
  const [items, setItems] = useState<Analysis[]>([])

  useEffect(() => {
    const fetchAnalyses = async () => {
      const res = await apiFetch('/analyses')
      if (res.ok) {
        setItems((await res.json()) as Analysis[])
      }
    }
    void fetchAnalyses()
  }, [])

  return (
    <div>
      <h1>Результаты анализов и обследований</h1>
      <p className="dashboard-subtitle">Здесь отображаются все ваши результаты анализов и обследований. Данные подгружаются после того, как врач внесёт их в систему.</p>
      {items.length === 0 ? (
        <div className="card empty-block">
          <p>Пока нет результатов анализов.</p>
          <p>После сдачи анализов в клинике результаты появятся в этом разделе. При необходимости уточните у лечащего врача.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Статус</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id}>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.type}</td>
                  <td>
                    <span className="pill">{analysisStatusLabel(a.status)}</span>
                  </td>
                  <td>{a.resultSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

