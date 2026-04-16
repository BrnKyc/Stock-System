import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', role: 'worker', password: '' })
  const [message, setMessage] = useState(null)

  const fetchUsers = () => {
    api.get('/users/').then(res => setUsers(res.data))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/', form)
      setForm({ name: '', role: 'worker', password: '' })
      setMessage({ text: '✅ Kullanıcı eklendi', color: '#4CAF50' })
      fetchUsers()
    } catch (err) {
      setMessage({ text: `❌ ${err.response?.data?.detail || 'Hata oluştu'}`, color: '#f44336' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz?`)) return
    try {
      await api.delete(`/users/${id}`)
      setMessage({ text: '✅ Kullanıcı silindi', color: '#4CAF50' })
      fetchUsers()
    } catch {
      setMessage({ text: '❌ Kullanıcı silinemedi', color: '#f44336' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2>👥 Kullanıcı Yönetimi</h2>

      {/* FORM */}
      <div style={{
        background: '#f9f9f9', padding: '20px',
        borderRadius: '10px', marginBottom: '30px',
        border: '2px solid #ddd'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>➕ Yeni Kullanıcı Ekle</h3>

        {message && (
          <div style={{
            padding: '10px 15px', borderRadius: '6px', marginBottom: '15px',
            background: message.color === '#4CAF50' ? '#e8f5e9' : '#ffebee',
            color: message.color, fontWeight: 'bold'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <div style={labelStyle}>Kullanıcı Adı *</div>
            <input
              placeholder="Ad Soyad"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>Rol *</div>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={inputStyle}>
              <option value="worker">İşçi</option>
              <option value="admin">Yönetici</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Şifre *</div>
            <input
              type="password"
              placeholder="Şifre"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <button type="submit"
            style={{ ...btnStyle('#1a1a2e'), gridColumn: 'span 3' }}>
            ➕ Kullanıcı Ekle
          </button>
        </form>
      </div>

      {/* KULLANICI LİSTESİ */}
      <h3>Mevcut Kullanıcılar</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1a1a2e', color: 'white' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Ad</th>
            <th style={thStyle}>Rol</th>
            <th style={thStyle}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={tdStyle}>{u.id}</td>
              <td style={tdStyle}>{u.name}</td>
              <td style={tdStyle}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '13px',
                  background: u.role === 'admin' ? '#e3f2fd' : '#f3e5f5',
                  color: u.role === 'admin' ? '#1565c0' : '#6a1b9a',
                  fontWeight: 'bold'
                }}>
                  {u.role === 'admin' ? '👑 Yönetici' : '👷 İşçi'}
                </span>
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleDelete(u.id, u.name)}
                  style={btnStyle('#f44336', '8px 14px')}>
                  🗑️ Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const labelStyle = { fontSize: '12px', color: '#666', marginBottom: '4px' }
const inputStyle = {
  width: '100%', padding: '8px', borderRadius: '6px',
  border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
}
const btnStyle = (bg, padding = '10px 20px') => ({
  background: bg, color: 'white', border: 'none',
  padding, borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
})
const thStyle = { padding: '10px', textAlign: 'left', border: '1px solid #ddd' }
const tdStyle = { padding: '10px', border: '1px solid #ddd' }