import { Link, useLocation, useNavigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import './Layout.css'

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo">Полимедика</span>
          <nav className="nav">
            <Link to="/news">Новости</Link>
            <Link to="/about">О клинике</Link>
            {user && (
              <>
                <Link to="/dashboard">Кабинет</Link>
                <Link to="/analyses">Анализы</Link>
                <Link to="/booking">Запись</Link>
                <Link to="/profile">Профиль</Link>
                {user.role === 'admin' && <Link to="/admin">Админ</Link>}
              </>
            )}
          </nav>
        </div>
        <div className="header-right">
          {user ? (
            <>
              <span className="user-name">{user.fullName}</span>
              <button onClick={handleLogout} className="btn btn-outline">
                Выйти
              </button>
            </>
          ) : !isAuthPage ? (
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Войти
            </button>
          ) : null}
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">PolimedicClinic</span>
          <span>г. Оренбург, ул. Чкалова, 22</span>
          <span>Регистратура: +7 (495) 123-45-67</span>
          <span>Пн–Пт 8:00–20:00, Сб 9:00–18:00</span>
          <span className="footer-legal">Конфиденциальность и защита персональных данных · © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

