import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

const initialForm = {
  nombre: '',
  ubicacion: '',
  superficie: '',
  estado: 'Activo',
  historial: '',
  lotes: '',
  lat: '',
  lng: '',
}

function LocationPicker({ onChange }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng)
    },
  })
  return null
}

function Campos() {
  const [campos, setCampos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'campos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCampos(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!photos.length) {
      setPhotoPreviews([])
      return undefined
    }
    const previews = photos.map((file) => URL.createObjectURL(file))
    setPhotoPreviews(previews)
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [photos])

  const mapCenter = useMemo(() => {
    if (form.lat && form.lng) {
      return [Number(form.lat), Number(form.lng)]
    }
    return [-34.6037, -58.3816]
  }, [form.lat, form.lng])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    setPhotos(files)
  }

  const handleMapChange = ({ lat, lng }) => {
    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre || !form.superficie) return
    setSaving(true)
    setError('')
    let photoUrls = []
    let photoStatus = 'ok'
    if (photos.length) {
      try {
        photoUrls = await uploadFiles(photos, 'campos')
      } catch {
        photoStatus = 'pendiente'
        setError('No se pudieron subir las fotos del campo.')
      }
    }
    await addDoc(collection(db, 'campos'), {
      ...form,
      superficie: Number(form.superficie),
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      fotos: photoUrls,
      fotosEstado: photoStatus,
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
    setPhotos([])
    setSaving(false)
  }

  return (
    <div className="page">
      <PageHeader
        title="Campos"
        subtitle="Registro de campos, lotes y su historial productivo."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo campo</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="ubicacion"
              placeholder="Ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="superficie"
              placeholder="Superficie (ha)"
              value={form.superficie}
              onChange={handleChange}
              required
            />
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Activo</option>
              <option>En descanso</option>
              <option>Arrendado</option>
            </select>
            <textarea
              className="input textarea"
              name="historial"
              placeholder="Historial productivo"
              value={form.historial}
              onChange={handleChange}
            />
            <textarea
              className="input textarea"
              name="lotes"
              placeholder="Subdivision en lotes"
              value={form.lotes}
              onChange={handleChange}
            />
            <div className="map-box">
              <MapContainer
                key={`${mapCenter[0]}-${mapCenter[1]}`}
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {form.lat && form.lng && (
                  <Marker position={[Number(form.lat), Number(form.lng)]} />
                )}
                <LocationPicker onChange={handleMapChange} />
              </MapContainer>
            </div>
            <div className="form-grid">
              <input
                className="input"
                name="lat"
                placeholder="Latitud"
                value={form.lat}
                onChange={handleChange}
              />
              <input
                className="input"
                name="lng"
                placeholder="Longitud"
                value={form.lng}
                onChange={handleChange}
              />
            </div>
            <label className="file-input">
              <span>Fotos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
              />
            </label>
            {photoPreviews.length > 0 && (
              <div className="photo-grid">
                {photoPreviews.map((src) => (
                  <img key={src} src={src} alt="Vista previa" />
                ))}
              </div>
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar campo'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Campos registrados</h2>
          {campos.length === 0 ? (
            <div className="empty-state">No hay campos cargados.</div>
          ) : (
            <div className="table">
              {campos.map((campo) => (
                <div className="table-row with-thumb" key={campo.id}>
                  <div className="thumb">
                    {campo.fotos?.[0] ? (
                      <img src={campo.fotos[0]} alt={campo.nombre} />
                    ) : (
                      <span>Sin foto</span>
                    )}
                  </div>
                  <div>
                    <strong>{campo.nombre}</strong>
                    <span>{campo.ubicacion || 'Sin ubicacion'}</span>
                  </div>
                  <div>
                    <span>{campo.superficie} ha</span>
                    <span>{campo.estado}</span>
                  </div>
                  <div>
                    {campo.lat && campo.lng ? (
                      <span>
                        {campo.lat.toFixed(4)}, {campo.lng.toFixed(4)}
                      </span>
                    ) : (
                      <span>Sin coordenadas</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Campos
