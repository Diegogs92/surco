import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'
import Modal from '../components/Modal.jsx'

const initialForm = {
  nombre: '',
  superficie: '',
  estado: 'Activo',
  historial: '',
  lotes: '',
  lat: '',
  lng: '',
}
const defaultCenter = { lat: -34.6037, lng: -58.3816 }

function Campos() {
  const [campos, setCampos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userCenter, setUserCenter] = useState(null)
  const [editCampo, setEditCampo] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPhotos, setEditPhotos] = useState([])
  const [editPreviews, setEditPreviews] = useState([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

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
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setUserCenter(null)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
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
      return { lat: Number(form.lat), lng: Number(form.lng) }
    }
    return userCenter || defaultCenter
  }, [form.lat, form.lng, userCenter])

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
      lat: Number(lat).toFixed(6),
      lng: Number(lng).toFixed(6),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre || !form.superficie) return
    setSaving(true)
    setError('')
    try {
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
    } catch {
      setError('No se pudo guardar el campo. Intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!editPhotos.length) {
      setEditPreviews([])
      return undefined
    }
    const previews = editPhotos.map((file) => URL.createObjectURL(file))
    setEditPreviews(previews)
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [editPhotos])

  const openEdit = (campo) => {
    setEditCampo(campo)
    setEditForm({
      nombre: campo.nombre || '',
      ubicacion: campo.ubicacion || '',
      superficie: campo.superficie || '',
      estado: campo.estado || 'Activo',
      historial: campo.historial || '',
      lotes: campo.lotes || '',
      lat: campo.lat ?? '',
      lng: campo.lng ?? '',
    })
    setEditPhotos([])
    setEditError('')
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditPhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    setEditPhotos(files)
  }

  const handleEditMapChange = ({ lat, lng }) => {
    setEditForm((prev) => ({
      ...prev,
      lat: Number(lat).toFixed(6),
      lng: Number(lng).toFixed(6),
    }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editCampo) return
    setSavingEdit(true)
    setEditError('')
    try {
      let photoUrls = editCampo.fotos || []
      let photoStatus = editCampo.fotosEstado || 'ok'
      if (editPhotos.length) {
        try {
          const uploaded = await uploadFiles(editPhotos, 'campos')
          photoUrls = [...photoUrls, ...uploaded]
          photoStatus = 'ok'
        } catch {
          photoStatus = 'pendiente'
          setEditError('No se pudieron subir las fotos nuevas.')
        }
      }
      await updateDoc(doc(db, 'campos', editCampo.id), {
        ...editForm,
        superficie: Number(editForm.superficie),
        lat: editForm.lat ? Number(editForm.lat) : null,
        lng: editForm.lng ? Number(editForm.lng) : null,
        fotos: photoUrls,
        fotosEstado: photoStatus,
      })
      setEditCampo(null)
    } catch {
      setEditError('No se pudo guardar el campo.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (campo) => {
    const confirmDelete = window.confirm('Eliminar campo?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'campos', campo.id))
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
              {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                <div className="empty-state">
                  Configura `VITE_GOOGLE_MAPS_API_KEY` para mostrar el mapa.
                </div>
              ) : isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={12}
                  onClick={(event) =>
                    handleMapChange({
                      lat: event.latLng.lat(),
                      lng: event.latLng.lng(),
                    })
                  }
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  {form.lat && form.lng && (
                    <Marker
                      position={{ lat: Number(form.lat), lng: Number(form.lng) }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="empty-state">Cargando mapa...</div>
              )}
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
                    {campo.lat && campo.lng ? (
                      <span>
                        {Number(campo.lat).toFixed(4)}, {Number(campo.lng).toFixed(4)}
                      </span>
                    ) : (
                      <span>Sin coordenadas</span>
                    )}
                  </div>
                  <div>
                    <span>{campo.superficie} ha</span>
                    <span>{campo.estado}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(campo)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(campo)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(editCampo)}
        title="Editar campo"
        onClose={() => setEditCampo(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-campo-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form className="form-grid" id="edit-campo-form" onSubmit={handleEditSubmit}>
          <input
            className="input"
            name="nombre"
            placeholder="Nombre"
            value={editForm?.nombre || ''}
            onChange={handleEditChange}
            required
          />
          <input
            className="input"
            type="number"
            name="superficie"
            placeholder="Superficie (ha)"
            value={editForm?.superficie || ''}
            onChange={handleEditChange}
            required
          />
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Activo'}
            onChange={handleEditChange}
          >
            <option>Activo</option>
            <option>En descanso</option>
            <option>Arrendado</option>
          </select>
          <textarea
            className="input textarea"
            name="historial"
            placeholder="Historial productivo"
            value={editForm?.historial || ''}
            onChange={handleEditChange}
          />
          <textarea
            className="input textarea"
            name="lotes"
            placeholder="Subdivision en lotes"
            value={editForm?.lotes || ''}
            onChange={handleEditChange}
          />
          <div className="map-box">
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
              <div className="empty-state">
                Configura `VITE_GOOGLE_MAPS_API_KEY` para mostrar el mapa.
              </div>
            ) : isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={
                  editForm?.lat && editForm?.lng
                    ? { lat: Number(editForm.lat), lng: Number(editForm.lng) }
                    : userCenter || defaultCenter
                }
                zoom={12}
                onClick={(event) =>
                  handleEditMapChange({
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                  })
                }
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
              >
                {editForm?.lat && editForm?.lng && (
                  <Marker
                    position={{
                      lat: Number(editForm.lat),
                      lng: Number(editForm.lng),
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="empty-state">Cargando mapa...</div>
            )}
          </div>
          <div className="form-grid">
            <input
              className="input"
              name="lat"
              placeholder="Latitud"
              value={editForm?.lat ?? ''}
              onChange={handleEditChange}
            />
            <input
              className="input"
              name="lng"
              placeholder="Longitud"
              value={editForm?.lng ?? ''}
              onChange={handleEditChange}
            />
          </div>
          <label className="file-input">
            <span>Agregar fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleEditPhotoChange}
            />
          </label>
          {editPreviews.length > 0 && (
            <div className="photo-grid">
              {editPreviews.map((src) => (
                <img key={src} src={src} alt="Vista previa" />
              ))}
            </div>
          )}
          {editError && <p className="form-error">{editError}</p>}
        </form>
      </Modal>
    </div>
  )
}

export default Campos
