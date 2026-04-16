import { useEffect, useRef } from 'react'

export default function QrModal({ barcode, name, onClose }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // QR kodu canvas'a çiz
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current, barcode, {
        width: 200,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' }
      })
    })
  }, [barcode])

  const handleDownload = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `qr-${barcode}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '30px', textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ margin: '0 0 5px 0' }}>{name}</h3>
        <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '13px' }}>
          Barkod: {barcode}
        </p>
        <canvas ref={canvasRef} style={{ borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button onClick={handleDownload} style={{
            flex: 1, background: '#4CAF50', color: 'white',
            border: 'none', padding: '10px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px'
          }}>
            💾 İndir
          </button>
          <button onClick={onClose} style={{
            flex: 1, background: '#666', color: 'white',
            border: 'none', padding: '10px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px'
          }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}