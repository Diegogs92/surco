import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'

const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

function WeatherWidget() {
  const [coords, setCoords] = useState(null)
  const [weather, setWeather] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'campos'), orderBy('nombre', 'asc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const campos = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        const coordsList = campos
          .filter(
            (campo) =>
              campo.lat !== null &&
              campo.lat !== undefined &&
              campo.lat !== '' &&
              campo.lng !== null &&
              campo.lng !== undefined &&
              campo.lng !== '',
          )
          .map((campo) => ({
            lat: Number(campo.lat),
            lng: Number(campo.lng),
          }))
          .filter(
            (coord) =>
              Number.isFinite(coord.lat) && Number.isFinite(coord.lng),
          )
        if (!coordsList.length) {
          setCoords(null)
          return
        }
        const avg = coordsList.reduce(
          (acc, coord) => ({
            lat: acc.lat + coord.lat,
            lng: acc.lng + coord.lng,
          }),
          { lat: 0, lng: 0 },
        )
        setCoords({
          lat: avg.lat / coordsList.length,
          lng: avg.lng / coordsList.length,
        })
      },
      () => {
        setError('Sin permisos para leer campos.')
        setLoading(false)
      },
    )
    return () => unsub()
  }, [])

  useEffect(() => {
    const fetchWeather = async () => {
      if (!coords) {
        setLoading(false)
        setWeather(null)
        setError('')
        return
      }
      setLoading(true)
      setError('')
      const params = new URLSearchParams({
        latitude: coords.lat,
        longitude: coords.lng,
        current: 'temperature_2m,wind_speed_10m,precipitation,weather_code',
        hourly:
          'temperature_2m,precipitation,precipitation_probability,weather_code',
        timezone: 'auto',
      })
      const response = await fetch(`${WEATHER_ENDPOINT}?${params}`)
      if (!response.ok) {
        throw new Error('Weather request failed')
      }
      const data = await response.json()
      setWeather(data)
      setLoading(false)
    }

    fetchWeather().catch(() => {
      setError('No se pudo obtener el clima.')
      setLoading(false)
    })
  }, [coords])

  useEffect(() => {
    if (!weather?.hourly) {
      setAlerts([])
      return
    }
    const temps = weather.hourly.temperature_2m?.slice(0, 24) || []
    const precip = weather.hourly.precipitation?.slice(0, 24) || []
    const precipProb =
      weather.hourly.precipitation_probability?.slice(0, 24) || []
    const codes = weather.hourly.weather_code?.slice(0, 24) || []

    const frost = temps.some((temp) => temp <= 0)
    const rain = precip.some(
      (val, idx) => val >= 1 && (precipProb[idx] || 0) >= 60,
    )
    const hail = codes.some((code) => [95, 96, 99].includes(code))

    const nextAlerts = []
    if (rain) nextAlerts.push('Lluvias')
    if (hail) nextAlerts.push('Granizo')
    if (frost) nextAlerts.push('Heladas')
    setAlerts(nextAlerts)
  }, [weather])

  const current = useMemo(() => {
    if (!weather?.current) return null
    return {
      temp: Math.round(weather.current.temperature_2m),
      wind: Math.round(weather.current.wind_speed_10m),
      precip: weather.current.precipitation,
    }
  }, [weather])

  if (loading) {
    return <div className="weather-widget">Cargando clima...</div>
  }

  if (!coords) {
    return (
      <div className="weather-widget muted">
        Agrega coordenadas en Campos para ver el clima.
      </div>
    )
  }

  if (error) {
    return <div className="weather-widget muted">{error}</div>
  }

  return (
    <div className="weather-widget">
      <div>
        <p className="weather-title">Clima en campos</p>
        {current ? (
          <p className="weather-value">
            {current.temp} C / {current.wind} km/h
          </p>
        ) : (
          <p className="weather-value">Sin datos</p>
        )}
      </div>
      <div className="weather-alerts">
        {alerts.length === 0 ? (
          <span className="badge">Sin alertas</span>
        ) : (
          alerts.map((alert) => (
            <span key={alert} className="badge status-warning">
              {alert}
            </span>
          ))
        )}
      </div>
    </div>
  )
}

export default WeatherWidget
