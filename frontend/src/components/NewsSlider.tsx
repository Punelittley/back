import { useEffect, useState } from 'react'
import './NewsSlider.css'

type NewsItem = {
  _id: string
  title: string
  content: string
  publishedAt: string
  isFeatured: boolean
  imageUrl?: string
}

type Props = {
  items: NewsItem[]
}

export function NewsSlider({ items }: Props) {
  const featured = items.filter((n) => n.isFeatured === true)
  const list = featured.length > 0 ? featured : items
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (list.length === 0) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % list.length)
    }, 6000)
    return () => window.clearInterval(id)
  }, [list.length])

  if (list.length === 0) return null

  const current = list[index]

  return (
    <div className="slider">
      <div className="slider-inner">
        {current.imageUrl && (
          <div className="slider-image-wrap">
            <img src={current.imageUrl} alt="" className="slider-image" />
          </div>
        )}
        <div className="slider-meta">
          <span className="pill pill-soft">Важное</span>
          <span>{new Date(current.publishedAt).toLocaleDateString()}</span>
        </div>
        <h2>{current.title}</h2>
        <p>{current.content.length > 180 ? current.content.slice(0, 180) + '…' : current.content}</p>
        <div className="slider-dots">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === index ? 'dot dot-active' : 'dot'}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

