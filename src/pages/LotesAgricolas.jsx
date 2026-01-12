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

const initialForm = {
  nombre: '',
  campoId: '',
  superficie: '',
  estado: 'Activo',
  cultivo: '',
  notas: '',
}

function LotesAgricolas() {
  const [lotes, setLotes] = useState([])
  const [campos, setCampos] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editLote, setEditLote] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'lotesAgricolas'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setLotes(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsubCampos = onSnapshot(collection(db, 'campos'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCampos(data)
    })
    const unsubCultivos = onSnapshot(collection(db, 'cultivos'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCultivos(data)
    })
    return () => {
      unsubCampos()
      unsubCultivos()
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre || !form.campoId) return
    await addDoc(collection(db, 'lotesAgricolas'), {
      ...form,
      superficie: Number(form.superficie || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (lote) => {
    setEditLote(lote)
    setEditForm({
      nombre: lote.nombre || '',
      campoId: lote.campoId || '',
      superficie: lote.superficie || '',
      estado: lote.estado || 'Activo',
      cultivo: lote.cultivo || '',
      notas: lote.notas || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editLote) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'lotesAgricolas', editLote.id), {
      ...editForm,
      superficie: Number(editForm.superficie || 0),
    })
    setSavingEdit(false)
    setEditLote(null)
  }

  const handleDelete = async (lote) => {
    const confirmDelete = window.confirm('Eliminar lote agricola?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'lotesAgricolas', lote.id))
  }

  const campoName = (campoId) =>
    campos.find((campo) => campo.id === campoId)?.nombre || 'Sin campo'

  return (
    <div className="page">
      <PageHeader
        title="Lotes agricolas"
        subtitle="Administracion de lotes productivos."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo lote agricola</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <select
              className="input"
              name="campoId"
              value={form.campoId}
              onChange={handleChange}
              required
            >
              <option value="">Campo</option>
              {campos.map((campo) => (
                <option key={campo.id} value={campo.id}>
                  {campo.nombre}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              name="superficie"
              placeholder="Superficie (ha)"
              value={form.superficie}
              onChange={handleChange}
            />
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Activo</option>
              <option>Descanso</option>
              <option>Arrendado</option>
            </select>
            <select
              className="input"
              name="cultivo"
              value={form.cultivo}
              onChange={handleChange}
            >
              <option value="">Cultivo actual</option>
              {cultivos.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.cultivo || cultivo.nombre}>
                  {cultivo.cultivo || cultivo.nombre}
                </option>
              ))}
            </select>
            <textarea
              className="textarea"
              name="notas"
              placeholder="Notas"
              rows={3}
              value={form.notas}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar lote
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Lotes registrados</h2>
          {lotes.length === 0 ? (
            <div className="empty-state">No hay lotes registrados.</div>
          ) : (
            <div className="table">
              {lotes.map((lote) => (
                <div className="table-row" key={lote.id}>
                  <div>
                    <strong>{lote.nombre}</strong>
                    <span>{campoName(lote.campoId)}</span>
                  </div>
                  <div>
                    <span>{lote.superficie} ha</span>
                    <span>{lote.cultivo || 'Sin cultivo'}</span>
                  </div>
                  <div>
                    <span>{lote.estado}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(lote)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(lote)}
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
        open={Boolean(editLote)}
        title="Editar lote agricola"
        onClose={() => setEditLote(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-lote-agricola-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-lote-agricola-form"
          onSubmit={handleEditSubmit}
        >
          <input
            className="input"
            name="nombre"
            placeholder="Nombre"
            value={editForm?.nombre || ''}
            onChange={handleEditChange}
            required
          />
          <select
            className="input"
            name="campoId"
            value={editForm?.campoId || ''}
            onChange={handleEditChange}
            required
          >
            <option value="">Campo</option>
            {campos.map((campo) => (
              <option key={campo.id} value={campo.id}>
                {campo.nombre}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            name="superficie"
            placeholder="Superficie (ha)"
            value={editForm?.superficie || ''}
            onChange={handleEditChange}
          />
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Activo'}
            onChange={handleEditChange}
          >
            <option>Activo</option>
            <option>Descanso</option>
            <option>Arrendado</option>
          </select>
          <select
            className="input"
            name="cultivo"
            value={editForm?.cultivo || ''}
            onChange={handleEditChange}
          >
            <option value="">Cultivo actual</option>
            {cultivos.map((cultivo) => (
              <option key={cultivo.id} value={cultivo.cultivo || cultivo.nombre}>
                {cultivo.cultivo || cultivo.nombre}
              </option>
            ))}
          </select>
          <textarea
            className="textarea"
            name="notas"
            placeholder="Notas"
            rows={3}
            value={editForm?.notas || ''}
            onChange={handleEditChange}
          />
        </form>
      </Modal>
    </div>
  )
}

export default LotesAgricolas
