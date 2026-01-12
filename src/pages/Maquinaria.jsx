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
import { useSearchParams } from 'react-router-dom'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

const initialForm = {
  maquinaria: '',
  tipo: '',
  uso: 'Agricola',
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
  const [searchParams] = useSearchParams()

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

  const tipoFiltro = useMemo(() => {
    const tipo = searchParams.get('tipo')
    if (tipo === 'ganadera' || tipo === 'ganadero') return 'Ganaderia'
    if (tipo === 'agricola') return 'Agricola'
    return ''
  }, [searchParams])

  const stats = useMemo(() => {
    const data = tipoFiltro ? equipos.filter((e) => e.uso === tipoFiltro) : equipos
    const total = data.length
    const operativas = data.filter((e) => e.estado === 'Operativa').length
    const fuera = data.filter((e) => e.estado === 'Fuera de servicio').length
    return { total, operativas, fuera }
  }, [equipos, tipoFiltro])

  const filtered = useMemo(() => {
    const base = tipoFiltro ? equipos.filter((equipo) => equipo.uso === tipoFiltro) : equipos
    if (!search.trim()) return base
    const term = search.toLowerCase()
    return base.filter((equipo) =>
      [equipo.maquinaria, equipo.tipo]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    )
  }, [equipos, search, tipoFiltro])

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
      uso: equipo.uso || 'Agricola',
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
      fotos: photoUrls,
      fotosEstado: photoStatus,
    })
    setSavingEdit(false)
    setEditEquipo(null)
  }

  const handleDelete = async (equipo) => {
    const confirmDelete = window.confirm(
      `Eliminar ${equipo.maquinaria || 'maquinaria'}?`,
    )
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'maquinaria', equipo.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Maquinaria"
        subtitle="Catalogo de maquinaria y estado operativo."
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
        <StatCard label="Total" value={stats.total} hint="Unidades" />
        <StatCard label="Operativas" value={stats.operativas} hint="Listas hoy" />
        <StatCard label="Fuera de servicio" value={stats.fuera} hint="En pausa" />
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
            <select
              className="input"
              name="uso"
              value={form.uso}
              onChange={handleChange}
            >
              <option>Agricola</option>
              <option>Ganaderia</option>
            </select>
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Operativa</option>
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
          <h2>Maquinaria registrada</h2>
          {loading ? (
            <div className="empty-state">Cargando maquinaria...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No hay maquinaria registrada.</div>
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
                    <span>
                      {equipo.tipo || 'Sin tipo'} · {equipo.uso || 'Sin uso'}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`badge status-${(equipo.estado || '')
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {equipo.estado}
                    </span>
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
          <select
            className="input"
            name="uso"
            value={editForm?.uso || 'Agricola'}
            onChange={handleEditChange}
          >
            <option>Agricola</option>
            <option>Ganaderia</option>
          </select>
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Operativa'}
            onChange={handleEditChange}
          >
            <option>Operativa</option>
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
