import { useEffect, useState } from 'react'
import './ParallaxHero.css'

export function ParallaxHero() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(window.scrollY)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const translateY = offset * 0.3

  return (
    <section className="hero">
      <div
        className="hero-bg"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
        }}
      />
      <div className="hero-content">
        <h1>Новости и акции клиники</h1>
        <p>Будьте в курсе акций, новых услуг и важных объявлений. Заботимся о вашем здоровье каждый день.</p>
      </div>
    </section>
  )
}

