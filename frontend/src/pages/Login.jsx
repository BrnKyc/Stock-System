import { useState } from 'react'
import api from '../api/axios'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/users/login', { name, password })
      localStorage.setItem('user', JSON.stringify(res.data))
      onLogin(res.data)
    } catch {
      setError('Kullanıcı adı veya şifre hatalı')
    }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100vh', background: '#f0f0f0'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'white', padding: '40px', borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '320px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📦 Stok Sistemi</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <input
          placeholder="Kullanıcı Adı"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>Giriş Yap</button>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px', marginBottom: '15px',
  borderRadius: '6px', border: '1px solid #ddd',
  fontSize: '14px', boxSizing: 'border-box'
}
const btnStyle = {
  width: '100%', padding: '12px', background: '#1a1a2e',
  color: 'white', border: 'none', borderRadius: '6px',
  fontSize: '16px', cursor: 'pointer'
}