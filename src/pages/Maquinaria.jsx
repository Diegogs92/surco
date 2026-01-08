import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

const initialForm = {
  nombre: '',
  modelo: '',
  serie: '',
  ubicacion: '',
  estado: 'Operativa',
  ultimaFechaServicio: '',
}

function Maquinaria() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(initialForm)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'maquinaria'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEquipos(data)
      setLoading(false)
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

  const stats = useMemo(() => {
    const total = equipos.length
    const operativas = equipos.filter((e) => e.estado === 'Operativa').length
    const mantenimiento = equipos.filter((e) => e.estado === 'En mantenimiento')
      .length
    return { total, operativas, mantenimiento }
  }, [equipos])

  const filtered = useMemo(() => {
    if (!search.trim()) return equipos
    const term = search.toLowerCase()
    return equipos.filter((equipo) =>
      [equipo.nombre, equipo.modelo, equipo.serie, equipo.ubicacion]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    )
  }, [equipos, search])

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
      } catch (uploadError) {
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
    setIsModalOpen(false)
    setSaving(false)
  }

  return (
    <div className="page">
      <PageHeader
        title="Maquinaria"
        subtitle="Controla la flota, su estado y los ultimos servicios."
        actions={
          <div className="page-actions">
            <input
              className="input"
              placeholder="Buscar equipo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              className="primary-button"
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              Nuevo equipo
            </button>
          </div>
        }
      />

      <section className="stats-grid">
        <StatCard label="Equipos" value={stats.total} hint="Total registrados" />
        <StatCard label="Operativas" value={stats.operativas} hint="Listas hoy" />
        <StatCard
          label="En mantenimiento"
          value={stats.mantenimiento}
          hint="En taller o campo"
        />
      </section>

      <section className="two-column">
        <div className="card">
          <h2>Listado de equipos</h2>
          {loading ? (
            <div className="empty-state">Cargando equipos...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              No hay equipos registrados aun.
            </div>
          ) : (
            <div className="table">
              {filtered.map((equipo) => (
                <div className="table-row" key={equipo.id}>
                  <div className="thumb">
                    {equipo.fotos?.[0] ? (
                      <img src={equipo.fotos[0]} alt={equipo.nombre} />
                    ) : (
                      <span>Sin foto</span>
                    )}
                  </div>
                  <div>
                    <strong>{equipo.nombre}</strong>
                    <span>{equipo.modelo}</span>
                  </div>
                  <div>
                    <span>{equipo.ubicacion || 'Sin ubicacion'}</span>
                    <span>{equipo.serie || 'Sin serie'}</span>
                  </div>
                  <div>
                    <span
                      className={`badge status-${(equipo.estado || '')
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {equipo.estado}
                    </span>
                    {equipo.fotosEstado === 'pendiente' && (
                      <span className="badge status-warning">Fotos pendientes</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal
        open={isModalOpen}
        title="Registrar nuevo equipo"
        onClose={() => setIsModalOpen(false)}
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
    </div>
  )
}

export default Maquinaria
