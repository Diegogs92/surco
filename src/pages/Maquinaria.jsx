import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

function Maquinaria() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editEquipo, setEditEquipo] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPhotos, setEditPhotos] = useState([])
  const [editPreviews, setEditPreviews] = useState([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

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

  useEffect(() => {
    if (!editPhotos.length) {
      setEditPreviews([])
      return undefined
    }
    const previews = editPhotos.map((file) => URL.createObjectURL(file))
    setEditPreviews(previews)
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [editPhotos])

  const openEdit = (equipo) => {
    setEditEquipo(equipo)
    setEditForm({
      nombre: equipo.nombre || '',
      modelo: equipo.modelo || '',
      serie: equipo.serie || '',
      ubicacion: equipo.ubicacion || '',
      estado: equipo.estado || 'Operativa',
      ultimaFechaServicio: equipo.ultimaFechaServicio || '',
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

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editEquipo) return
    setSavingEdit(true)
    setEditError('')
    let photoUrls = editEquipo.fotos || []
    let photoStatus = editEquipo.fotosEstado || 'ok'
    if (editPhotos.length) {
      try {
        const uploaded = await uploadFiles(editPhotos, 'maquinaria')
        photoUrls = [...photoUrls, ...uploaded]
        photoStatus = 'ok'
      } catch {
        photoStatus = 'pendiente'
        setEditError('No se pudieron subir las fotos nuevas.')
      }
    }
    await updateDoc(doc(db, 'maquinaria', editEquipo.id), {
      ...editForm,
      ultimaFechaServicio: editForm.ultimaFechaServicio || null,
      fotos: photoUrls,
      fotosEstado: photoStatus,
    })
    setSavingEdit(false)
    setEditEquipo(null)
  }

  const handleDelete = async (equipo) => {
    const confirmDelete = window.confirm(
      `Eliminar ${equipo.nombre || 'equipo'}?`,
    )
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'maquinaria', equipo.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Maquinaria"
        subtitle="Controla la flota, su estado y los ultimos servicios."
        actions={
          <input
            className="input"
            placeholder="Buscar equipo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
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
                      <span className="badge status-warning">
                        Fotos pendientes
                      </span>
                    )}
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(equipo)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(equipo)}
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
        open={Boolean(editEquipo)}
        title="Editar maquinaria"
        onClose={() => setEditEquipo(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-maquinaria-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-maquinaria-form"
          onSubmit={handleEditSubmit}
        >
          <input
            className="input"
            name="nombre"
            placeholder="Nombre de equipo"
            value={editForm?.nombre || ''}
            onChange={handleEditChange}
            required
          />
          <input
            className="input"
            name="modelo"
            placeholder="Modelo"
            value={editForm?.modelo || ''}
            onChange={handleEditChange}
            required
          />
          <input
            className="input"
            name="serie"
            placeholder="Serie"
            value={editForm?.serie || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            name="ubicacion"
            placeholder="Ubicacion"
            value={editForm?.ubicacion || ''}
            onChange={handleEditChange}
          />
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Operativa'}
            onChange={handleEditChange}
          >
            <option>Operativa</option>
            <option>En mantenimiento</option>
            <option>Fuera de servicio</option>
          </select>
          <input
            className="input"
            type="date"
            name="ultimaFechaServicio"
            value={editForm?.ultimaFechaServicio || ''}
            onChange={handleEditChange}
          />
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

export default Maquinaria
