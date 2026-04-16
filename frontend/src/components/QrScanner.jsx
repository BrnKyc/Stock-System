import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

export default function QrScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState(null)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.listVideoInputDevices().then(devices => {
      if (devices.length === 0) {
        setError('Kamera bulunamadı')
        return
      }
      setCameras(devices)
      // Arka kamerayı tercih et, yoksa ilkini seç
      const back = devices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('arka') ||
        d.label.toLowerCase().includes('environment')
      )
      const chosen = back || devices[devices.length - 1]
      setSelectedCamera(chosen.deviceId)
      startScanning(reader, chosen.deviceId)
    }).catch(() => setError('Kamera erişimi reddedildi'))

    return () => {
      reader.reset()
    }
  }, [])

  const startScanning = (reader, deviceId) => {
    if (!videoRef.current) return
    reader.reset()
    reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
      if (result) {
        onScan(result.getText())
        reader.reset()
      }
    })
  }

  const handleCameraChange = (deviceId) => {
    setSelectedCamera(deviceId)
    startScanning(readerRef.current, deviceId)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '25px', width: '340px', textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>📷 Barkod / QR Tara</h3>

        {error ? (
          <div style={{ color: '#f44336', padding: '20px' }}>
            ❌ {error}
            <br />
            <small>Tarayıcının kamera iznini kontrol et</small>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              style={{
                width: '290px', height: '290px',
                borderRadius: '10px',
                objectFit: 'cover',
                background: '#000',
                display: 'block',
                margin: '0 auto'
              }}
            />

            {cameras.length > 1 && (
              <select
                value={selectedCamera || ''}
                onChange={e => handleCameraChange(e.target.value)}
                style={{
                  margin: '10px 0', padding: '6px',
                  borderRadius: '6px', border: '1px solid #ddd',
                  width: '100%', fontSize: '13px'
                }}>
                {cameras.map(c => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || `Kamera ${c.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            )}

            <p style={{ color: '#666', fontSize: '13px', margin: '10px 0' }}>
              Kamerayı QR kodun üzerine tut
            </p>
          </>
        )}

        <button onClick={onClose} style={{
          background: '#f44336', color: 'white',
          border: 'none', padding: '10px 30px',
          borderRadius: '8px', cursor: 'pointer',
          fontSize: '15px', width: '100%', marginTop: '5px'
        }}>
          İptal
        </button>
      </div>
    </div>
  )
}