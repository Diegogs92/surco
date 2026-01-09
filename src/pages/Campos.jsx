import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  arrayUnion,
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
  lat: '',
  lng: '',
}
const defaultCenter = { lat: -34.6037, lng: -58.3816 }
const initialLoteForm = { nombre: '', tamano: '', descripcion: '' }

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
  const [loteCampo, setLoteCampo] = useState(null)
  const [loteForm, setLoteForm] = useState(initialLoteForm)
  const [savingLote, setSavingLote] = useState(false)
  const [loteError, setLoteError] = useState('')
  const [editLoteCampo, setEditLoteCampo] = useState(null)
  const [editLote, setEditLote] = useState(null)
  const [editLoteForm, setEditLoteForm] = useState(initialLoteForm)
  const [savingEditLote, setSavingEditLote] = useState(false)
  const [editLoteError, setEditLoteError] = useState('')
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
      superficie: campo.superficie || '',
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

  const openLoteModal = (campo) => {
    setLoteCampo(campo)
    setLoteForm(initialLoteForm)
    setLoteError('')
  }

  const handleLoteChange = (event) => {
    const { name, value } = event.target
    setLoteForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoteSubmit = async (event) => {
    event.preventDefault()
    if (!loteCampo || !loteForm.nombre) return
    setSavingLote(true)
    setLoteError('')
    const tamanoValue = loteForm.tamano ? Number(loteForm.tamano) : null
    const lotePayload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      nombre: loteForm.nombre,
      tamano: Number.isNaN(tamanoValue) ? null : tamanoValue,
      descripcion: loteForm.descripcion || '',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', loteCampo.id), {
        lotes: arrayUnion(lotePayload),
      })
      setLoteCampo(null)
    } catch {
      setLoteError('No se pudo guardar el lote.')
    } finally {
      setSavingLote(false)
    }
  }

  const openEditLote = (campo, lote) => {
    setEditLoteCampo(campo)
    setEditLote(lote)
    setEditLoteForm({
      nombre: lote.nombre || '',
      tamano: lote.tamano ?? '',
      descripcion: lote.descripcion || '',
    })
    setEditLoteError('')
  }

  const handleEditLoteChange = (event) => {
    const { name, value } = event.target
    setEditLoteForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditLoteSubmit = async (event) => {
    event.preventDefault()
    if (!editLoteCampo || !editLote || !editLoteForm.nombre) return
    setSavingEditLote(true)
    setEditLoteError('')
    const tamanoValue = editLoteForm.tamano ? Number(editLoteForm.tamano) : null
    const updatedLotes = (editLoteCampo.lotes || []).map((item) =>
      item.id === editLote.id
        ? {
            ...item,
            nombre: editLoteForm.nombre,
            tamano: Number.isNaN(tamanoValue) ? null : tamanoValue,
            descripcion: editLoteForm.descripcion || '',
          }
        : item,
    )
    try {
      await updateDoc(doc(db, 'campos', editLoteCampo.id), {
        lotes: updatedLotes,
      })
      setEditLoteCampo(null)
      setEditLote(null)
    } catch {
      setEditLoteError('No se pudo guardar el lote.')
    } finally {
      setSavingEditLote(false)
    }
  }

  const handleDeleteLote = async (campo, lote) => {
    const confirmDelete = window.confirm('Eliminar lote?')
    if (!confirmDelete) return
    const updatedLotes = (campo.lotes || []).filter((item) => item.id !== lote.id)
    await updateDoc(doc(db, 'campos', campo.id), {
      lotes: updatedLotes,
    })
  }

  return (
    <div className="page">
      <PageHeader
        title="Campos"
        subtitle="Registro de campos y ubicaciones."
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
            <button
              className="primary-button field-action"
              type="submit"
              disabled={saving}
            >
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
                      className="icon-button"
                      type="button"
                      onClick={() => openLoteModal(campo)}
                    >
                      Agregar lote
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(campo)}
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="row-details">
                    <span className="detail-label">Lotes</span>
                    {campo.lotes?.length ? (
                      <div className="lote-list">
                        {campo.lotes.map((lote) => (
                          <div className="lote-chip" key={lote.id}>
                            <strong>{lote.nombre}</strong>
                            <span>
                              {lote.tamano ? `${lote.tamano} ha` : 'Tamano sin definir'}
                            </span>
                            {lote.descripcion ? (
                              <span className="lote-description">{lote.descripcion}</span>
                            ) : (
                              <span className="lote-description">Sin descripcion</span>
                            )}
                            <div className="lote-actions">
                              <button
                                className="icon-button"
                                type="button"
                                onClick={() => openEditLote(campo, lote)}
                              >
                                Editar
                              </button>
                              <button
                                className="icon-button danger"
                                type="button"
                                onClick={() => handleDeleteLote(campo, lote)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="detail-muted">Sin lotes registrados.</span>
                    )}
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

      <Modal
        open={Boolean(loteCampo)}
        title="Nuevo lote"
        onClose={() => setLoteCampo(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="lote-form"
            disabled={savingLote}
          >
            {savingLote ? 'Guardando...' : 'Guardar lote'}
          </button>
        }
      >
        <form className="form-grid" id="lote-form" onSubmit={handleLoteSubmit}>
          <input
            className="input"
            name="nombre"
            placeholder="Nombre del lote"
            value={loteForm.nombre}
            onChange={handleLoteChange}
            required
          />
          <input
            className="input"
            type="number"
            name="tamano"
            placeholder="Tamano (ha)"
            value={loteForm.tamano}
            onChange={handleLoteChange}
          />
          <textarea
            className="textarea"
            name="descripcion"
            placeholder="Descripcion"
            rows={3}
            value={loteForm.descripcion}
            onChange={handleLoteChange}
          />
          {loteError && <p className="form-error">{loteError}</p>}
        </form>
      </Modal>

      <Modal
        open={Boolean(editLoteCampo && editLote)}
        title="Editar lote"
        onClose={() => {
          setEditLoteCampo(null)
          setEditLote(null)
        }}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-lote-form"
            disabled={savingEditLote}
          >
            {savingEditLote ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form className="form-grid" id="edit-lote-form" onSubmit={handleEditLoteSubmit}>
          <input
            className="input"
            name="nombre"
            placeholder="Nombre del lote"
            value={editLoteForm.nombre}
            onChange={handleEditLoteChange}
            required
          />
          <input
            className="input"
            type="number"
            name="tamano"
            placeholder="Tamano (ha)"
            value={editLoteForm.tamano}
            onChange={handleEditLoteChange}
          />
          <textarea
            className="textarea"
            name="descripcion"
            placeholder="Descripcion"
            rows={3}
            value={editLoteForm.descripcion}
            onChange={handleEditLoteChange}
          />
          {editLoteError && <p className="form-error">{editLoteError}</p>}
        </form>
      </Modal>
    </div>
  )
}

export default Campos
