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
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

const initialForm = {
  maquinaria: '',
  tipo: '',
  horasUso: '',
  consumo: '',
  mantenimientos: '',
  estado: 'Operativa',
}

function Maquinaria() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editEquipo, setEditEquipo] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPhotos, setEditPhotos] = useState([])
  const [editPreviews, setEditPreviews] = useState([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'maquinaria'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
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
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
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
      [equipo.maquinaria, equipo.tipo]
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
    if (!form.maquinaria) return
    setSaving(true)
    setError('')
    let photoUrls = []
    let photoStatus = 'ok'
    if (photos.length) {
      try {
        photoUrls = await uploadFiles(photos, 'maquinaria')
      } catch {
        photoStatus = 'pendiente'
        setError('No se pudieron subir las fotos de la maquinaria.')
      }
    }
    await addDoc(collection(db, 'maquinaria'), {
      ...form,
      horasUso: Number(form.horasUso || 0),
      consumo: Number(form.consumo || 0),
      fotos: photoUrls,
      fotosEstado: photoStatus,
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
    setPhotos([])
    setSaving(false)
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

  const openEdit = (equipo) => {
    setEditEquipo(equipo)
    setEditForm({
      maquinaria: equipo.maquinaria || '',
      tipo: equipo.tipo || '',
      horasUso: equipo.horasUso || '',
      consumo: equipo.consumo || '',
      mantenimientos: equipo.mantenimientos || '',
      estado: equipo.estado || 'Operativa',
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
      horasUso: Number(editForm.horasUso || 0),
      consumo: Number(editForm.consumo || 0),
      fotos: photoUrls,
      fotosEstado: photoStatus,
    })
    setSavingEdit(false)
    setEditEquipo(null)
  }

  const handleDelete = async (equipo) => {
    const confirmDelete = window.confirm(
      `Eliminar ${equipo.maquinaria || 'equipo'}?`,
    )
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'maquinaria', equipo.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Maquinaria"
        subtitle="Controla maquinaria, horas de uso y consumo."
        actions={
          <input
            className="input"
            placeholder="Buscar maquinaria..."
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
          <h2>Nueva maquinaria</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="maquinaria"
              placeholder="Maquinaria"
              value={form.maquinaria}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="tipo"
              placeholder="Tipo"
              value={form.tipo}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="horasUso"
              placeholder="Horas de uso"
              value={form.horasUso}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="consumo"
              placeholder="Consumo"
              value={form.consumo}
              onChange={handleChange}
            />
            <textarea
              className="input textarea"
              name="mantenimientos"
              placeholder="Mantenimientos"
              value={form.mantenimientos}
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
              {saving ? 'Guardando...' : 'Guardar maquinaria'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Listado de maquinaria</h2>
          {loading ? (
            <div className="empty-state">Cargando maquinaria...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              No hay maquinaria registrada.
            </div>
          ) : (
            <div className="table">
              {filtered.map((equipo) => (
                <div className="table-row with-thumb" key={equipo.id}>
                  <div className="thumb">
                    {equipo.fotos?.[0] ? (
                      <img src={equipo.fotos[0]} alt={equipo.maquinaria} />
                    ) : (
                      <span>Sin foto</span>
                    )}
                  </div>
                  <div>
                    <strong>{equipo.maquinaria}</strong>
                    <span>{equipo.tipo || 'Sin tipo'}</span>
                  </div>
                  <div>
                    <span>Horas: {equipo.horasUso || 0}</span>
                    <span>Consumo: {equipo.consumo || 0}</span>
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
            name="maquinaria"
            placeholder="Maquinaria"
            value={editForm?.maquinaria || ''}
            onChange={handleEditChange}
            required
          />
          <input
            className="input"
            name="tipo"
            placeholder="Tipo"
            value={editForm?.tipo || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="horasUso"
            placeholder="Horas de uso"
            value={editForm?.horasUso || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="consumo"
            placeholder="Consumo"
            value={editForm?.consumo || ''}
            onChange={handleEditChange}
          />
          <textarea
            className="input textarea"
            name="mantenimientos"
            placeholder="Mantenimientos"
            value={editForm?.mantenimientos || ''}
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
