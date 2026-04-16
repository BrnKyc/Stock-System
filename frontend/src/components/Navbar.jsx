import { NavLink } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  
  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#ffffff' : '#cccccc',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
    paddingBottom: '4px',
    borderBottom: isActive ? '2px solid #6c47ff' : '2px solid transparent',
    textShadow: isActive ? '0px 0px 8px rgba(255, 255, 255, 0.5)' : 'none',
    transition: 'all 0.2s ease-in-out'
  })

  return (
    <nav style={{
      background: '#1a1a2e', padding: '15px 30px',
      display: 'flex', gap: '30px', alignItems: 'center'
    }}>
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
        📦 Stok Sistemi
      </span>

      <NavLink to="/" style={navLinkStyle}>Ana Sayfa</NavLink>

      {user?.role === 'admin' && (
        <NavLink to="/products" style={navLinkStyle}>Ürünler</NavLink>
      )}

      {user?.role === 'admin' && (
        <NavLink to="/users" style={navLinkStyle}>👥 Kullanıcılar</NavLink>
      )}

      <NavLink to="/movements" style={navLinkStyle}>Hareketler</NavLink>
      <NavLink to="/reports" style={navLinkStyle}>Raporlar</NavLink>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          👤 {user?.name} ({user?.role === 'admin' ? 'Yönetici' : 'İşçi'})
        </span>
        <button onClick={onLogout} style={{
          background: '#f44336', color: 'white', border: 'none',
          padding: '6px 14px', borderRadius: '4px', cursor: 'pointer'
        }}>
          Çıkış
        </button>
      </div>
    </nav>
  )
}