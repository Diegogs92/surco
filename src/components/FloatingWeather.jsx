import { useState } from 'react'
import { CloudSun } from 'lucide-react'
import FieldWeatherBadges from './FieldWeatherBadges.jsx'

function FloatingWeather() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        className="floating-weather-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ver clima de campos"
        title="Clima de campos"
      >
        <CloudSun size={24} />
      </button>

      {/* Panel flotante */}
      {isOpen && (
        <>
          <div className="floating-weather-overlay" onClick={() => setIsOpen(false)} />
          <div className="floating-weather-panel">
            <div className="floating-weather-header">
              <h3>Clima de campos</h3>
              <button
                type="button"
                className="floating-weather-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="floating-weather-content">
              <FieldWeatherBadges />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default FloatingWeather
