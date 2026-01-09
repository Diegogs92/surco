import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'

const WEATHER_TIMEOUT_MS = 8000
const WEATHER_CACHE_MS = 15 * 60 * 1000 // 15 minutos de cache

function FieldWeatherBadge({ campo }) {
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
    if (code >= 95) return '⛈️' // Tormenta
    if (code >= 80) return '🌧️' // Lluvia fuerte
    if (code >= 61) return '🌦️' // Lluvia
    if (code >= 51) return '🌥️' // Llovizna
    if (code >= 3) return '☁️' // Nublado
    if (code >= 1) return '🌤️' // Parcialmente nublado
    return '☀️' // Despejado
  }

  if (loading) {
    return (
      <div className="field-weather-badge loading">
        <span className="field-name">{campo.nombre}</span>
        <span className="weather-info">...</span>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="field-weather-badge error">
        <span className="field-name">{campo.nombre}</span>
        <span className="weather-info">-</span>
      </div>
    )
  }

  return (
    <div className="field-weather-badge">
      <span className="field-name">{campo.nombre}</span>
      <span className="weather-info">
        <span className="weather-icon">{getWeatherIcon(weather.code)}</span>
        <span className="weather-temp">{weather.temp}°</span>
      </span>
    </div>
  )
}

function FieldWeatherBadges() {
  const [campos, setCampos] = useState([])
  const [loading, setLoading] = useState(true)

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
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="field-weather-badges">
        <span className="muted">Cargando clima...</span>
      </div>
    )
  }

  if (campos.length === 0) {
    return (
      <div className="field-weather-badges">
        <span className="muted">Agrega coordenadas en Campos para ver el clima</span>
      </div>
    )
  }

  return (
    <div className="field-weather-badges">
      {campos.map((campo) => (
        <FieldWeatherBadge key={campo.id} campo={campo} />
      ))}
    </div>
  )
}

export default FieldWeatherBadges
