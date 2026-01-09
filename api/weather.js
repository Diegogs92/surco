export default async function handler(request, response) {
  const { lat, lng } = request.query
  if (!lat || !lng) {
    response.status(400).json({ error: 'Missing lat/lng' })
    return
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,wind_speed_10m,precipitation,weather_code',
    hourly:
      'temperature_2m,precipitation,precipitation_probability,weather_code',
    timezone: 'auto',
    forecast_days: '1',
  })

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!res.ok) {
      response.status(res.status).json({ error: 'Weather provider error' })
      return
    }
    const data = await res.json()
    response.status(200).json(data)
  } catch (error) {
    response.status(500).json({ error: 'Weather fetch failed' })
  }
}
