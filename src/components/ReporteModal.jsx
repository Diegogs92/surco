import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import Modal from './Modal.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

const initialForm = {
  equipoId: '',
  equipoNombre: '',
  tipo: 'Preventivo',
  prioridad: 'Media',
  estado: 'Pendiente',
  descripcion: '',
  fecha: new Date().toISOString().slice(0, 10),
}

function ReporteModal({ open, onClose }) {
  const [equipos, setEquipos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'maquinaria'), orderBy('nombre', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEquipos(data)
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
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photos])

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'equipoId') {
      const selected = equipos.find((equipo) => equipo.id === value)
      setForm((prev) => ({
        ...prev,
        equipoId: value,
        equipoNombre: selected?.nombre || '',
      }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    setPhotos(files)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.equipoId || !form.descripcion) return
    setSaving(true)
    setError('')
    let photoUrls = []
    let photoStatus = 'ok'
    if (photos.length) {
      try {
        photoUrls = await uploadFiles(photos, 'reportes')
      } catch {
        photoStatus = 'pendiente'
        setError(
          'No se pudieron subir las fotos. Se guardo el reporte sin imagenes.',
        )
      }
    }
    await addDoc(collection(db, 'reportes'), {
      ...form,
      fotos: photoUrls,
      fotosEstado: photoStatus,
      createdAt: serverTimestamp(),
    })
    setSaving(false)
    setForm(initialForm)
    setPhotos([])
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Nuevo reporte"
      onClose={onClose}
      actions={
        <button
          className="primary-button"
          type="submit"
          form="reporte-form"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar reporte'}
        </button>
      }
    >
      <form className="form-grid wide" id="reporte-form" onSubmit={handleSubmit}>
        <select
          className="input"
          name="equipoId"
          value={form.equipoId}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un equipo</option>
          {equipos.map((equipo) => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre} - {equipo.modelo}
            </option>
          ))}
        </select>
        <select
          className="input"
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
        >
          <option>Preventivo</option>
          <option>Correctivo</option>
        </select>
        <select
          className="input"
          name="prioridad"
          value={form.prioridad}
          onChange={handleChange}
        >
          <option>Alta</option>
          <option>Media</option>
          <option>Baja</option>
        </select>
        <select
          className="input"
          name="estado"
          value={form.estado}
          onChange={handleChange}
        >
          <option>Pendiente</option>
          <option>En proceso</option>
          <option>Resuelto</option>
        </select>
        <input
          className="input"
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
        />
        <textarea
          className="input textarea"
          name="descripcion"
          placeholder="Describe el problema o la tarea..."
          value={form.descripcion}
          onChange={handleChange}
          rows="4"
          required
        />
        <label className="file-input">
          <span>Fotos del reporte</span>
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
      </form>
    </Modal>
  )
}

export default ReporteModal
