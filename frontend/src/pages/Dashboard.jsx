import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Dashboard() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data))
  }, [])

const lowStock = products.filter(p => p.min_stock > 0 && p.current_stock <= p.min_stock)

  return (
    <div>
      <h2>📊 Genel Durum</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={cardStyle('#4CAF50')}>
          <h3>Toplam Ürün</h3>
          <p style={{ fontSize: '36px', margin: 0 }}>{products.length}</p>
        </div>
        <div style={cardStyle('#f44336')}>
          <h3>Kritik Stok</h3>
          <p style={{ fontSize: '36px', margin: 0 }}>{lowStock.length}</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div>
          <h3>⚠️ Kritik Stok Uyarısı</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: '#f44336', color: 'white' }}>
                <th style={thStyle}>Ürün</th>
                <th style={thStyle}>Mevcut Stok</th>
                <th style={thStyle}>Minimum Stok</th>
                <th style={thStyle}>Birim</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.current_stock}</td>
                  <td style={tdStyle}>{p.min_stock}</td>
                  <td style={tdStyle}>{p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>📦 Tüm Stoklar</h3>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#1a1a2e', color: 'white' }}>
            <th style={thStyle}>Ürün</th>
            <th style={thStyle}>Kategori</th>
            <th style={thStyle}>Stok</th>
            <th style={thStyle}>Birim</th>
            <th style={thStyle}>Min. Stok</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{
              background: p.current_stock <= p.min_stock ? '#fff3f3' : 'white'
            }}>
              <td style={tdStyle}>{p.name}</td>
              <td style={tdStyle}>{p.category || '-'}</td>
              <td style={tdStyle}>{p.current_stock}</td>
              <td style={tdStyle}>{p.unit}</td>
              <td style={tdStyle}>{p.min_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const cardStyle = (color) => ({
  background: color,
  color: 'white',
  padding: '20px 40px',
  borderRadius: '10px',
  textAlign: 'center'
})

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '10px'
}

const thStyle = {
  padding: '10px',
  textAlign: 'left',
  border: '1px solid #ddd'
}

const tdStyle = {
  padding: '10px',
  border: '1px solid #ddd'
}