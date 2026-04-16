import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Movements from './pages/Movements'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Users from './pages/Users'


function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogin = (userData) => setUser(userData)

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/users" element={
            user?.role === 'admin' ? <Users /> : <Navigate to="/" />
               } />
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/products" element={
            user.role === 'admin'
              ? <Products />
              : <Navigate to="/" />
          } />
          <Route path="/movements" element={<Movements user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App