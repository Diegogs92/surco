import { useEffect, useState } from 'react'

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="offline-banner">
      Sin conexion. Los cambios se sincronizaran al volver en linea.
    </div>
  )
}

export default OfflineBanner
