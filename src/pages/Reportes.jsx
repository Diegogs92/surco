import { useEffect, useState } from 'react'
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
import Modal from '../components/Modal.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'

const initialForm = {
  maquinariaId: '',
  maquinariaNombre: '',
  fecha: '',
  descripcion: '',
  estado: 'Pendiente',
  personal: '',
}

function Reportes() {
  const [reportes, setReportes] = useState([])
  const [maquinarias, setMaquinarias] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editReporte, setEditReporte] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPhotos, setEditPhotos] = useState([])
  const [editPreviews, setEditPreviews] = useState([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'reportes'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setReportes(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsubMaquinaria = onSnapshot(collection(db, 'maquinaria'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setMaquinarias(data)
    })
    const unsubEmpleados = onSnapshot(collection(db, 'empleados'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setEmpleados(data)
    })
    return () => {
      unsubMaquinaria()
      unsubEmpleados()
    }
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

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'maquinariaId') {
      const selected = maquinarias.find((item) => item.id === value)
      setForm((prev) => ({
        ...prev,
        maquinariaId: value,
        maquinariaNombre: selected?.maquinaria || '',
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
    if (!form.maquinariaId || !form.fecha || !form.descripcion) return
    setSaving(true)
    setError('')
    let photoUrls = []
    let photoStatus = 'ok'
    if (photos.length) {
      try {
        photoUrls = await uploadFiles(photos, 'reportes')
      } catch {
        photoStatus = 'pendiente'
        setError('No se pudieron subir las fotos.')
      }
    }
    await addDoc(collection(db, 'reportes'), {
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

  const openEdit = (reporte) => {
    setEditReporte(reporte)
    setEditForm({
      maquinariaId: reporte.maquinariaId || '',
      maquinariaNombre: reporte.maquinariaNombre || '',
      fecha: reporte.fecha || '',
      descripcion: reporte.descripcion || '',
      estado: reporte.estado || 'Pendiente',
      personal: reporte.personal || '',
    })
    setEditPhotos([])
    setEditError('')
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    if (name === 'maquinariaId') {
      const selected = maquinarias.find((item) => item.id === value)
      setEditForm((prev) => ({
        ...prev,
        maquinariaId: value,
        maquinariaNombre: selected?.maquinaria || '',
      }))
      return
    }
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditPhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    setEditPhotos(files)
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editReporte) return
    setSavingEdit(true)
    setEditError('')
    let photoUrls = editReporte.fotos || []
    let photoStatus = editReporte.fotosEstado || 'ok'
    if (editPhotos.length) {
      try {
        const uploaded = await uploadFiles(editPhotos, 'reportes')
        photoUrls = [...photoUrls, ...uploaded]
        photoStatus = 'ok'
      } catch {
        photoStatus = 'pendiente'
        setEditError('No se pudieron subir las fotos nuevas.')
      }
    }
    await updateDoc(doc(db, 'reportes', editReporte.id), {
      ...editForm,
      fotos: photoUrls,
      fotosEstado: photoStatus,
    })
    setSavingEdit(false)
    setEditReporte(null)
  }

  const handleDelete = async (reporte) => {
    const confirmDelete = window.confirm('Eliminar reporte?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'reportes', reporte.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Reportes"
        subtitle="Reportes de maquinaria con fotos y responsables."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo reporte</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select
              className="input"
              name="maquinariaId"
              value={form.maquinariaId}
              onChange={handleChange}
              required
            >
              <option value="">Maquinaria</option>
              {maquinarias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.maquinaria}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
            />
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Pendiente</option>
              <option>En curso</option>
              <option>Resuelto</option>
            </select>
            <select
              className="input"
              name="personal"
              value={form.personal}
              onChange={handleChange}
            >
              <option value="">Personal interviniente</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.nombre}>
                  {empleado.nombre}
                </option>
              ))}
            </select>
            <textarea
              className="input textarea"
              name="descripcion"
              placeholder="Descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
            />
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
              {saving ? 'Guardando...' : 'Guardar reporte'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Reportes registrados</h2>
          {reportes.length === 0 ? (
            <div className="empty-state">No hay reportes cargados.</div>
          ) : (
            <div className="table">
              {reportes.map((reporte) => (
                <div className="table-row with-thumb" key={reporte.id}>
                  <div className="thumb">
                    {reporte.fotos?.[0] ? (
                      <img src={reporte.fotos[0]} alt="Reporte" />
                    ) : (
                      <span>Sin foto</span>
                    )}
                  </div>
                  <div>
                    <strong>{reporte.maquinariaNombre}</strong>
                    <span>{reporte.fecha}</span>
                  </div>
                  <div>
                    <span>{reporte.estado}</span>
                    <span>{reporte.personal || 'Sin personal'}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(reporte)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(reporte)}
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
        open={Boolean(editReporte)}
        title="Editar reporte"
        onClose={() => setEditReporte(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-reporte-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form className="form-grid" id="edit-reporte-form" onSubmit={handleEditSubmit}>
          <select
            className="input"
            name="maquinariaId"
            value={editForm?.maquinariaId || ''}
            onChange={handleEditChange}
            required
          >
            <option value="">Maquinaria</option>
            {maquinarias.map((item) => (
              <option key={item.id} value={item.id}>
                {item.maquinaria}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            name="fecha"
            value={editForm?.fecha || ''}
            onChange={handleEditChange}
            required
          />
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Pendiente'}
            onChange={handleEditChange}
          >
            <option>Pendiente</option>
            <option>En curso</option>
            <option>Resuelto</option>
          </select>
          <select
            className="input"
            name="personal"
            value={editForm?.personal || ''}
            onChange={handleEditChange}
          >
            <option value="">Personal interviniente</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.nombre}>
                {empleado.nombre}
              </option>
            ))}
          </select>
          <textarea
            className="input textarea"
            name="descripcion"
            placeholder="Descripcion"
            value={editForm?.descripcion || ''}
            onChange={handleEditChange}
            required
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

export default Reportes
