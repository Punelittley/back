import { Link } from 'react-router-dom'
import './AboutPage.css'

export function AboutPage() {
  return (
    <div className="about-page">
      <h1>О клинике</h1>
      <p className="about-lead">
        PolimedicClinic — современная клиника в Оренбурге. Мы заботимся о здоровье взрослых и детей и делаем медицину доступной и понятной.
      </p>
      <div className="about-grid">
        <section className="card about-block">
          <h2>Контакты</h2>
          <p><strong>Адрес:</strong> г. Оренбург, ул. Чкалова, 22</p>
          <p><strong>Регистратура:</strong> +7 (495) 123-45-67</p>
          <p><strong>Режим работы:</strong><br />Пн–Пт 8:00–20:00<br />Сб 9:00–18:00</p>
        </section>
        <section className="card about-block">
          <h2>Услуги</h2>
          <p>Консультации терапевта, педиатра, кардиолога, анализы, УЗИ, ЭКГ, рентген, вакцинация, процедуры.</p>
          <Link to="/news" className="about-link">Новости и акции →</Link>
        </section>
      </div>
      <p className="about-footer">
        Записаться на приём можно через личный кабинет после регистрации на сайте.
      </p>
    </div>
  )
}
