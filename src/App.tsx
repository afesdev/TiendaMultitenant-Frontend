import './App.css'

import { useEffect, useState } from 'react'
import type { LoginResponse, AuthUser, AuthTienda } from './types'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [currentTienda, setCurrentTienda] = useState<AuthTienda | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedTienda = localStorage.getItem('tienda')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    if (savedTienda) {
      setCurrentTienda(JSON.parse(savedTienda))
    }
  }, [])

  const handleAuthSuccess = (data: LoginResponse) => {
    setToken(data.token)
    setCurrentUser(data.user)
    setCurrentTienda(data.tienda)

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('tienda', JSON.stringify(data.tienda))
  }

  const handleLogout = () => {
    setToken(null)
    setCurrentUser(null)
    setCurrentTienda(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tienda')
  }

  const path = window.location.pathname

  if (path === '/register') {
    return <RegisterPage />
  }

  if (!token || !currentUser || !currentTienda) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <DashboardPage
      token={token}
      user={currentUser}
      tienda={currentTienda}
      onLogout={handleLogout}
    />
  )
}

export default App

