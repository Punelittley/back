import { Route, Routes, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import './App.css'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { AnalysesPage } from './pages/AnalysesPage'
import { NewsPage } from './pages/NewsPage'
import { BookingPage } from './pages/BookingPage'
import { AdminPage } from './pages/AdminPage'
import { AboutPage } from './pages/AboutPage'
import { ProfilePage } from './pages/ProfilePage'
import { Layout } from './components/Layout'
import { BackToTop } from './components/BackToTop'
import { AuthProvider, useAuth } from './features/auth/AuthContext'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="centered">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Layout>
        <BackToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/analyses"
            element={
              <PrivateRoute>
                <AnalysesPage />
              </PrivateRoute>
            }
          />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <PrivateRoute>
                <BookingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
