import { useEffect, useState } from 'react'
import { ParallaxHero } from '../components/ParallaxHero'
import { NewsSlider } from '../components/NewsSlider'
import { apiFetch } from '../api/config'

type NewsItem = {
  _id: string
  title: string
  content: string
  publishedAt: string
  isFeatured: boolean
}

export function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchNews = async () => {
      const res = await apiFetch('/news')
      if (res.ok) {
        setItems((await res.json()) as NewsItem[])
      }
    }
    void fetchNews()
  }, [])

  const query = search.trim().toLowerCase()
  const filtered = query
    ? items.filter((n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
    : items

  return (
    <div>
      <ParallaxHero />
      <NewsSlider items={items} />
      <section className="card">
        <h2>Все новости</h2>
        <p className="dashboard-subtitle">Акции, изменения в графике работы и важные объявления клиники.</p>
        {items.length > 0 && (
          <div className="news-search-wrap">
            <input
              type="search"
              placeholder="Поиск по новостям..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="news-search"
            />
          </div>
        )}
        {filtered.length === 0 ? (
          <p>{query ? 'По вашему запросу ничего не найдено.' : 'Пока нет новостей. Следите за обновлениями — здесь появятся акции и объявления.'}</p>
        ) : (
          <ul className="list">
            {filtered.map((n) => (
              <li key={n._id}>
                <div className="list-row">
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.content}</p>
                  </div>
                  <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

