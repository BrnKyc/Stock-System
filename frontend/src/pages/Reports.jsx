import { useState } from 'react'
import * as XLSX from 'xlsx'
import api from '../api/axios'

export default function Reports() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      const res = await api.get('/reports/summary', { params })
      setData(res.data)
    } catch (err) {
      alert('Rapor alınamadı')
    }
    setLoading(false)
  }

 const handleExcelExport = () => {
  if (!data) return

  const wb = XLSX.utils.book_new()

  // ---- Sayfa 1: Özet ----
  const summaryData = [
    ['STOK YÖNETİM SİSTEMİ - RAPOR', ''],
    ['', ''],
    ['Rapor Tarihi:', new Date().toLocaleDateString('tr-TR')],
    ['Başlangıç:', startDate || 'Tüm zamanlar'],
    ['Bitiş:', endDate || 'Tüm zamanlar'],
    ['', ''],
    ['GENEL ÖZET', ''],
    ['Toplam Hareket', data.total_movements],
    ['Toplam Giriş', totalGiris],
    ['Toplam Çıkış', totalCikis],
    ['Kritik Stok Sayısı', kritikStok.length],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet')

  // ---- Sayfa 2: Ürün Bazlı Özet ----
  const productRows = [
    ['Ürün Adı', 'Birim', 'Toplam Giriş', 'Toplam Çıkış', 'Mevcut Stok', 'İşlem Sayısı', 'Durum'],
    ...data.products
      .sort((a, b) => b.movement_count - a.movement_count)
      .map(p => [
        p.product_name,
        p.unit,
        p.total_giris,
        p.total_cikis,
        p.current_stock,
        p.movement_count,
        p.current_stock <= 0 ? 'KRİTİK' : p.current_stock <= p.min_stock ? 'DÜŞÜK' : 'NORMAL'
      ])
  ]
  const wsProducts = XLSX.utils.aoa_to_sheet(productRows)
  wsProducts['!cols'] = [
    { wch: 25 }, { wch: 10 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
  ]
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Ürün Bazlı')

  // ---- Sayfa 3: Hareket Detayı ----
  // Backend'den ham hareketleri de çekmemiz lazım
  // Bunun için data.movements'ı kullanacağız (aşağıda backend'e ekleyeceğiz)
  if (data.movements && data.movements.length > 0) {
    const movementRows = [
      ['Tarih', 'Ürün Adı', 'İşlem Tipi', 'Miktar', 'Birim', 'Not'],
      ...data.movements.map(m => [
        new Date(m.created_at).toLocaleString('tr-TR'),
        m.product_name,
        m.type === 'giris' ? 'GİRİŞ' : 'ÇIKIŞ',
        m.quantity,
        m.unit,
        m.note || '-'
      ])
    ]
    const wsMovements = XLSX.utils.aoa_to_sheet(movementRows)
    wsMovements['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 12 },
      { wch: 10 }, { wch: 10 }, { wch: 30 }
    ]
    XLSX.utils.book_append_sheet(wb, wsMovements, 'Hareket Detayı')
  }

  // ---- Sayfa 4: Kritik Stoklar ----
  const kritikRows = [
    ['Kritik Stok Durumundaki Ürünler', '', '', ''],
    ['', '', '', ''],
    ['Ürün Adı', 'Birim', 'Mevcut Stok', 'Toplam Çıkış'],
    ...kritikStok.map(p => [p.product_name, p.unit, p.current_stock, p.total_cikis])
  ]
  const wsKritik = XLSX.utils.aoa_to_sheet(kritikRows)
  wsKritik['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsKritik, 'Kritik Stoklar')

  const tarih = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')
  XLSX.writeFile(wb, `stok-raporu-${tarih}.xlsx`)
}

  const totalGiris = data?.products.reduce((s, p) => s + p.total_giris, 0) || 0
  const totalCikis = data?.products.reduce((s, p) => s + p.total_cikis, 0) || 0
  const kritikStok = data?.products.filter(p => p.current_stock <= 0) || []

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>📊 Raporlar</h2>

      {/* FİLTRE */}
      <div style={{
        background: '#f9f9f9', padding: '20px',
        borderRadius: '10px', marginBottom: '25px',
        border: '2px solid #ddd'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>🗓️ Tarih Aralığı</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={labelStyle}>Başlangıç Tarihi</div>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>Bitiş Tarihi</div>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            onClick={fetchReport}
            style={btnStyle('#1a1a2e')}>
            {loading ? '⏳ Yükleniyor...' : '🔍 Rapor Al'}
          </button>
          <button
            onClick={() => { setStartDate(''); setEndDate(''); fetchReport() }}
            style={btnStyle('#666')}>
            Tümünü Göster
          </button>
          {data && (
  <button onClick={handleExcelExport} style={btnStyle('#217346')}>
    📥 Excel İndir
  </button>
)}
        </div>
      </div>

      {/* ÖZET KARTLAR */}
      {data && (
        <>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <div style={cardStyle('#1a1a2e')}>
              <div style={{ fontSize: '13px', opacity: 0.7 }}>Toplam Hareket</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data.total_movements}</div>
            </div>
            <div style={cardStyle('#4CAF50')}>
              <div style={{ fontSize: '13px', opacity: 0.7 }}>Toplam Giriş</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalGiris}</div>
            </div>
            <div style={cardStyle('#f44336')}>
              <div style={{ fontSize: '13px', opacity: 0.7 }}>Toplam Çıkış</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalCikis}</div>
            </div>
            <div style={cardStyle('#FF9800')}>
              <div style={{ fontSize: '13px', opacity: 0.7 }}>Kritik Stok</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{kritikStok.length}</div>
            </div>
          </div>

          {/* ÜRÜN BAZLI TABLO */}
          <h3>📦 Ürün Bazlı Özet</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ background: '#1a1a2e', color: 'white' }}>
                <th style={thStyle}>Ürün</th>
                <th style={thStyle}>Birim</th>
                <th style={{ ...thStyle, color: '#81C784' }}>Toplam Giriş</th>
                <th style={{ ...thStyle, color: '#EF9A9A' }}>Toplam Çıkış</th>
                <th style={thStyle}>Mevcut Stok</th>
                <th style={thStyle}>İşlem Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {data.products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                    Bu tarih aralığında hareket bulunamadı
                  </td>
                </tr>
              ) : (
                data.products
                  .sort((a, b) => b.movement_count - a.movement_count)
                  .map(p => (
                    <tr key={p.product_id} style={{
                      background: p.current_stock <= 0 ? '#fff3f3' : 'white'
                    }}>
                      <td style={{ ...tdStyle, fontWeight: 'bold' }}>{p.product_name}</td>
                      <td style={tdStyle}>{p.unit}</td>
                      <td style={{ ...tdStyle, color: '#4CAF50', fontWeight: 'bold' }}>
                        +{p.total_giris}
                      </td>
                      <td style={{ ...tdStyle, color: '#f44336', fontWeight: 'bold' }}>
                        -{p.total_cikis}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                        {p.current_stock}
                      </td>
                      <td style={tdStyle}>{p.movement_count}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </>
      )}

      {!data && (
        <div style={{
          textAlign: 'center', padding: '60px',
          color: '#999', background: '#f9f9f9', borderRadius: '10px'
        }}>
          <div style={{ fontSize: '48px' }}>📊</div>
          <p>Tarih aralığı seçin ve "Rapor Al" butonuna tıklayın</p>
          <p>Ya da tüm zamanları görmek için "Tümünü Göster" butonuna basın</p>
        </div>
      )}
    </div>
  )
}

const labelStyle = { fontSize: '12px', color: '#666', marginBottom: '4px' }
const inputStyle = {
  padding: '8px 12px', borderRadius: '6px',
  border: '1px solid #ddd', fontSize: '14px'
}
const btnStyle = (bg) => ({
  background: bg, color: 'white', border: 'none',
  padding: '10px 20px', borderRadius: '6px',
  fontSize: '14px', cursor: 'pointer'
})
const cardStyle = (bg) => ({
  background: bg, color: 'white', padding: '15px 25px',
  borderRadius: '10px', minWidth: '150px', textAlign: 'center'
})
const thStyle = { padding: '10px', textAlign: 'left', border: '1px solid #ddd' }
const tdStyle = { padding: '10px', border: '1px solid #ddd' }