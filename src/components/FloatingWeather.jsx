import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  X,
} from 'lucide-react'

const WEATHER_TIMEOUT_MS = 8000
const WEATHER_CACHE_MS = 15 * 60 * 1000 // 15 minutos de cache

function FloatingWeatherBadge({ campo, index, onClose }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchWeather = async () => {
      if (!campo.lat || !campo.lng) {
        setLoading(false)
        return
      }

      // Verificar cache
      const cacheKey = `weather_${campo.id}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < WEATHER_CACHE_MS) {
          setWeather(data)
          setLoading(false)
          return
        }
      }

      setLoading(true)
      setError(false)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS)

      try {
        const params = new URLSearchParams({
          lat: Number(campo.lat).toFixed(4),
          lng: Number(campo.lng).toFixed(4),
        })
        const response = await fetch(`/api/weather?${params}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) throw new Error(`API error ${response.status}`)

        const data = await response.json()
        if (!data?.current) throw new Error('Invalid data')

        const weatherData = {
          temp: Math.round(data.current.temperature_2m),
          wind: Math.round(data.current.wind_speed_10m),
          code: data.current.weather_code || 0,
        }

        // Guardar en cache
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ data: weatherData, timestamp: Date.now() })
        )

        setWeather(weatherData)
        setLoading(false)
      } catch (err) {
        setError(true)
        setLoading(false)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    fetchWeather()
  }, [campo.id, campo.lat, campo.lng])

  // Determinar icono según código de clima
  const getWeatherIcon = (code) => {
    if (code >= 95) return CloudLightning
    if (code >= 80) return CloudRain
    if (code >= 61) return CloudRain
    if (code >= 51) return CloudDrizzle
    if (code >= 3) return Cloud
    if (code >= 1) return CloudSun
    return Sun
  }

  if (loading || error || !weather) {
    return null
  }

  const WeatherIcon = getWeatherIcon(weather.code)

  return (
    <div className="floating-weather-badge" style={{ bottom: `${80 + index * 70}px` }}>
      <div className="floating-weather-badge-content">
        <span className="floating-weather-field-name">{campo.nombre}</span>
        <div className="floating-weather-info">
          <WeatherIcon size={18} />
          <span className="floating-weather-temp">{weather.temp}°</span>
        </div>
      </div>
      <button
        type="button"
        className="floating-weather-badge-close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  )
}

function FloatingWeather() {
  const [campos, setCampos] = useState([])
  const [closedBadges, setClosedBadges] = useState(new Set())

  useEffect(() => {
    const q = query(collection(db, 'campos'), orderBy('nombre', 'asc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const camposData = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter(
            (campo) =>
              campo.lat &&
              campo.lng &&
              Number.isFinite(Number(campo.lat)) &&
              Number.isFinite(Number(campo.lng))
          )
        setCampos(camposData)
      },
      (err) => {
        console.error('Error fetching campos:', err)
      }
    )
    return () => unsub()
  }, [])

  const handleClose = (campoId) => {
    setClosedBadges((prev) => new Set([...prev, campoId]))
  }

  const visibleCampos = campos.filter((campo) => !closedBadges.has(campo.id))

  return (
    <>
      {visibleCampos.map((campo, index) => (
        <FloatingWeatherBadge
          key={campo.id}
          campo={campo}
          index={index}
          onClose={() => handleClose(campo.id)}
        />
      ))}
    </>
  )
}

export default FloatingWeather
