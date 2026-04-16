import { useEffect, useState } from 'react'
import api from '../api/axios'
import QrModal from '../components/QrCode'

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    barcode: '', name: '', category: '',
    unit: 'adet', min_stock: 0, current_stock: 0
  })
  const [editingId, setEditingId] = useState(null)
  const [qrProduct, setQrProduct] = useState(null)
  const fetchProducts = () => {
    api.get('/products').then(res => setProducts(res.data))
    
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await api.put(`/products/${editingId}`, form)
      setEditingId(null)
    } else {
      await api.post('/products', form)
    }
    setForm({ barcode: '', name: '', category: '', unit: 'adet', min_stock: 0, current_stock: 0 })
    fetchProducts()
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({
      barcode: product.barcode,
      name: product.name,
      category: product.category || '',
      unit: product.unit,
      min_stock: product.min_stock,
      current_stock: product.current_stock
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({ barcode: '', name: '', category: '', unit: 'adet', min_stock: 0, current_stock: 0 })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Silmek istediğinize emin misiniz?')) {
      await api.delete(`/products/${id}`)
      fetchProducts()
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>📦 Ürün Yönetimi</h2>

      {/* FORM */}
      <div style={{
        background: editingId ? '#fff8e1' : '#f9f9f9',
        padding: '20px', borderRadius: '10px',
        marginBottom: '30px',
        border: `2px solid ${editingId ? '#FFC107' : '#ddd'}`
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>
          {editingId ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}
        </h3>
        <form onSubmit={handleSubmit}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <div style={labelStyle}>Barkod *</div>
            <input
              placeholder="Barkod"
              value={form.barcode}
              onChange={e => setForm({ ...form, barcode: e.target.value })}
              required
              disabled={!!editingId}
              style={{ ...inputStyle, background: editingId ? '#eee' : 'white' }}
            />
          </div>
          <div>
            <div style={labelStyle}>Ürün Adı *</div>
            <input
              placeholder="Ürün Adı"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>Kategori</div>
            <input
              placeholder="Kategori"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>Birim</div>
            <select
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              style={inputStyle}>
              <option value="adet">Adet</option>
              <option value="kg">Kg</option>
              <option value="metre">Metre</option>
              <option value="litre">Litre</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Minimum Stok</div>
            <input
              type="number" min="0" step="0.1"
              value={form.min_stock}
              onChange={e => setForm({ ...form, min_stock: parseFloat(e.target.value) })}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>
              {editingId ? 'Mevcut Stok' : 'Başlangıç Stoğu'}
            </div>
            <input
              type="number" min="0" step="0.1"
              value={form.current_stock}
              onChange={e => setForm({ ...form, current_stock: parseFloat(e.target.value) })}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: 'span 3', display: 'flex', gap: '10px' }}>
            <button type="submit" style={btnStyle(editingId ? '#FFC107' : '#1a1a2e')}>
              {editingId ? '💾 Kaydet' : '➕ Ekle'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} style={btnStyle('#999')}>
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLO */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1a1a2e', color: 'white' }}>
            <th style={thStyle}>Barkod</th>
            <th style={thStyle}>Ürün Adı</th>
            <th style={thStyle}>Kategori</th>
            <th style={thStyle}>Stok</th>
            <th style={thStyle}>Birim</th>
            <th style={thStyle}>Min. Stok</th>
            <th style={thStyle}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{
              background: editingId === p.id
                ? '#fff8e1'
                : p.current_stock <= p.min_stock && p.min_stock > 0
                  ? '#fff3f3'
                  : 'white'
            }}>
              <td style={tdStyle}>{p.barcode}</td>
              <td style={tdStyle}>{p.name}</td>
              <td style={tdStyle}>{p.category || '-'}</td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>{p.current_stock}</td>
              <td style={tdStyle}>{p.unit}</td>
              <td style={tdStyle}>{p.min_stock}</td>
              <td style={{ ...tdStyle, display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleEdit(p)}
                  style={btnStyle('#FFC107', '5px', '8px 12px')}>
                  ✏️ Düzenle
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={btnStyle('#f44336', '5px', '8px 12px')}>
                  🗑️ Sil
                </button>
                <button
                 onClick={() => setQrProduct(p)}
                 style={btnStyle('#6c47ff', '5px', '8px 12px')}>
                QR
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {qrProduct && (
  <QrModal
    barcode={qrProduct.barcode}
    name={qrProduct.name}
    onClose={() => setQrProduct(null)}
  />
)}
    </div>
  )
}

const labelStyle = { fontSize: '12px', color: '#666', marginBottom: '4px' }
const inputStyle = {
  width: '100%', padding: '8px', borderRadius: '6px',
  border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
}
const btnStyle = (bg, radius = '6px', padding = '10px 20px') => ({
  background: bg, color: bg === '#FFC107' ? '#333' : 'white',
  border: 'none', padding, borderRadius: radius,
  fontSize: '14px', cursor: 'pointer'
})
const thStyle = { padding: '10px', textAlign: 'left', border: '1px solid #ddd' }
const tdStyle = { padding: '10px', border: '1px solid #ddd' }