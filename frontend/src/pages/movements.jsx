import { useEffect, useState, useRef } from 'react'
import api from '../api/axios'
import QrScanner from '../components/QrScanner'

export default function Movements({ user }) {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [barcode, setBarcode] = useState('')
  const [foundProduct, setFoundProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [type, setType] = useState('giris')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState(null)
  const [filter, setFilter] = useState('')
  const barcodeRef = useRef()
  const quantityRef = useRef()
  const [showScanner, setShowScanner] = useState(false)


  useEffect(() => {
    fetchAll()
    barcodeRef.current?.focus()
  }, [])

  const fetchAll = async () => {
  try {
    const [p, m] = await Promise.all([
      api.get('/products/'),
      api.get('/movements/')
    ])
    setProducts(p.data)
    setMovements(m.data)
  } catch (err) {
    console.error('Veri yüklenemedi:', err)
  }
}

  // Barkod input'u — Enter'a basınca otomatik arar
  // Gerçek okuyucuda da aynı şekilde çalışır
  const handleBarcodeInput = (e) => {
    setBarcode(e.target.value)
  }

  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchBarcode()
    }
  }
  const handleQrScan = (result) => {
  setShowScanner(false)
  setBarcode(result)
  setTimeout(() => searchBarcode(), 100)
}

  const searchBarcode = async () => {
    if (!barcode.trim()) return
    try {
      const res = await api.get(`/products/barcode/${barcode.trim()}`)
      setFoundProduct(res.data)
      setMessage(null)
      // Ürün bulununca miktar inputuna geç
      setTimeout(() => quantityRef.current?.focus(), 100)
    } catch {
      setFoundProduct(null)
      setMessage({ text: `❌ "${barcode}" barkodlu ürün bulunamadı`, color: '#f44336' })
    }
  }
 

  const handleMovement = async (e) => {
    e?.preventDefault()
    try {
      await api.post('/movements', {
        product_id: foundProduct.id,
        type,
        quantity: parseFloat(quantity),
        note: note || null,
        user_id: user.id
      })
      setMessage({
        text: `✅ ${foundProduct.name} — ${type === 'giris' ? 'Giriş' : 'Çıkış'}: ${quantity} ${foundProduct.unit}`,
        color: '#4CAF50'
      })
      setFoundProduct(null)
      setBarcode('')
      setQuantity(1)
      setNote('')
      fetchAll()
      // Yeni işlem için barkod inputuna dön
      setTimeout(() => barcodeRef.current?.focus(), 100)
    } catch (err) {
      setMessage({ text: `❌ ${err.response?.data?.detail || 'Hata oluştu'}`, color: '#f44336' })
    }
  }

  const handleCancel = () => {
    setFoundProduct(null)
    setBarcode('')
    setQuantity(1)
    setNote('')
    setMessage(null)
    barcodeRef.current?.focus()
  }

  const getProductName = (id) => products.find(p => p.id === id)?.name || '-'

  const filteredMovements = movements.filter(m => {
    if (!filter) return true
    const name = getProductName(m.product_id).toLowerCase()
    return name.includes(filter.toLowerCase())
  })

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {showScanner && (
       <QrScanner
          onScan={handleQrScan}
           onClose={() => setShowScanner(false)}
           />
         )}
      <h2>🔄 Stok Hareketi</h2>

      {/* BARKOD OKUMA ALANI */}
      <div style={{
        background: foundProduct ? '#f0fff0' : '#f9f9f9',
        padding: '25px', borderRadius: '12px',
        marginBottom: '30px',
        border: `2px solid ${foundProduct ? '#4CAF50' : '#ddd'}`,
        transition: 'all 0.3s'
      }}>

        {/* Barkod input — her zaman görünür */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            ref={barcodeRef}
            placeholder="📷 Barkod okut veya yaz, Enter'a bas..."
            value={barcode}
            onChange={handleBarcodeInput}
            onKeyDown={handleBarcodeKeyDown}
            style={{
              flex: 1, padding: '12px', fontSize: '16px',
              borderRadius: '8px', border: '2px solid #1a1a2e',
              outline: 'none'
            }}
          />
          <button onClick={searchBarcode} style={btnStyle('#1a1a2e')}>Ara</button>
        </div>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            style={btnStyle('#6c47ff')}>
            📷 Kamera
          </button>   
        {/* Mesaj */}
        {message && (
          <div style={{
            padding: '10px 15px', borderRadius: '6px',
            background: message.color === '#4CAF50' ? '#e8f5e9' : '#ffebee',
            color: message.color, fontWeight: 'bold', marginBottom: '15px'
          }}>
            {message.text}
          </div>
        )}

        {/* Ürün bulununca form çıkar */}
        {foundProduct && (
          <div>
            {/* Ürün bilgisi */}
            <div style={{
              background: 'white', padding: '15px', borderRadius: '8px',
              marginBottom: '15px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', border: '1px solid #ddd'
            }}>
              <div>
                <strong style={{ fontSize: '18px' }}>{foundProduct.name}</strong>
                <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                  ({foundProduct.category || 'Kategori yok'})
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {foundProduct.current_stock} {foundProduct.unit}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Mevcut Stok</div>
              </div>
            </div>

            {/* İşlem formu */}
            <form onSubmit={handleMovement}
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

              {/* Giriş/Çıkış seçimi */}
              <div style={{ display: 'flex', gap: '0' }}>
                <button type="button"
                  onClick={() => setType('giris')}
                  style={{
                    padding: '10px 20px', border: 'none', cursor: 'pointer',
                    borderRadius: '6px 0 0 6px', fontSize: '14px',
                    background: type === 'giris' ? '#4CAF50' : '#ddd',
                    color: type === 'giris' ? 'white' : '#666',
                    fontWeight: type === 'giris' ? 'bold' : 'normal'
                  }}>
                  📥 Giriş
                </button>
                <button type="button"
                  onClick={() => setType('cikis')}
                  style={{
                    padding: '10px 20px', border: 'none', cursor: 'pointer',
                    borderRadius: '0 6px 6px 0', fontSize: '14px',
                    background: type === 'cikis' ? '#f44336' : '#ddd',
                    color: type === 'cikis' ? 'white' : '#666',
                    fontWeight: type === 'cikis' ? 'bold' : 'normal'
                  }}>
                  📤 Çıkış
                </button>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Miktar ({foundProduct.unit})
                </div>
                <input
                  ref={quantityRef}
                  type="number" min="0.1" step="0.1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  style={{ padding: '10px', width: '100px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Not (opsiyonel)</div>
                <input
                  placeholder="Açıklama..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ padding: '10px', width: '100%', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={btnStyle(type === 'giris' ? '#4CAF50' : '#f44336')}>
                {type === 'giris' ? '📥 Giriş Yap' : '📤 Çıkış Yap'}
              </button>
              <button type="button" onClick={handleCancel} style={btnStyle('#999')}>
                İptal
              </button>
            </form>
          </div>
        )}
      </div>

      {/* HAREKETLer LİSTESİ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>📋 Hareket Geçmişi</h3>
        <input
          placeholder="Ürün adına göre filtrele..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '220px' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1a1a2e', color: 'white' }}>
            <th style={thStyle}>Tarih</th>
            <th style={thStyle}>Ürün</th>
            <th style={thStyle}>İşlem</th>
            <th style={thStyle}>Miktar</th>
            <th style={thStyle}>Not</th>
          </tr>
        </thead>
        <tbody>
          {filteredMovements.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                Hareket bulunamadı
              </td>
            </tr>
          ) : (
            filteredMovements.map(m => (
              <tr key={m.id} style={{ background: m.type === 'giris' ? '#f0fff0' : '#fff0f0' }}>
                <td style={tdStyle}>{new Date(m.created_at).toLocaleString('tr-TR')}</td>
                <td style={tdStyle}>{getProductName(m.product_id)}</td>
                <td style={tdStyle}>
                  {m.type === 'giris'
                    ? <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>📥 Giriş</span>
                    : <span style={{ color: '#f44336', fontWeight: 'bold' }}>📤 Çıkış</span>
                  }
                </td>
                <td style={tdStyle}>{m.quantity}</td>
                <td style={tdStyle}>{m.note || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = (bg) => ({
  background: bg, color: 'white', border: 'none',
  padding: '10px 20px', borderRadius: '6px',
  fontSize: '14px', cursor: 'pointer'
})
const thStyle = { padding: '10px', textAlign: 'left', border: '1px solid #ddd' }
const tdStyle = { padding: '10px', border: '1px solid #ddd' }