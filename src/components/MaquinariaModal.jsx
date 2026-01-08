import { useEffect, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import Modal from './Modal.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

const initialForm = {
  nombre: '',
  modelo: '',
  serie: '',
  ubicacion: '',
  estado: 'Operativa',
  ultimaFechaServicio: '',
}

function MaquinariaModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    setPhotos(files)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre || !form.modelo) return
    setSaving(true)
    setError('')
    let photoUrls = []
    let photoStatus = 'ok'
    if (photos.length) {
      try {
        photoUrls = await uploadFiles(photos, 'maquinaria')
      } catch {
        photoStatus = 'pendiente'
        setError(
          'No se pudieron subir las fotos. Se guardo el equipo sin imagenes.',
        )
      }
    }
    await addDoc(collection(db, 'maquinaria'), {
      ...form,
      ultimaFechaServicio: form.ultimaFechaServicio || null,
      fotos: photoUrls,
      fotosEstado: photoStatus,
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
    setPhotos([])
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Registrar nuevo equipo"
      onClose={onClose}
      actions={
        <button
          className="primary-button"
          type="submit"
          form="maquinaria-form"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar equipo'}
        </button>
      }
    >
      <form className="form-grid" id="maquinaria-form" onSubmit={handleSubmit}>
        <input
          className="input"
          name="nombre"
          placeholder="Nombre de equipo"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          name="modelo"
          placeholder="Modelo"
          value={form.modelo}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          name="serie"
          placeholder="Serie"
          value={form.serie}
          onChange={handleChange}
        />
        <input
          className="input"
          name="ubicacion"
          placeholder="Ubicacion"
          value={form.ubicacion}
          onChange={handleChange}
        />
        <select
          className="input"
          name="estado"
          value={form.estado}
          onChange={handleChange}
        >
          <option>Operativa</option>
          <option>En mantenimiento</option>
          <option>Fuera de servicio</option>
        </select>
        <input
          className="input"
          type="date"
          name="ultimaFechaServicio"
          value={form.ultimaFechaServicio}
          onChange={handleChange}
        />
        <label className="file-input">
          <span>Fotos del equipo</span>
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

export default MaquinariaModal
