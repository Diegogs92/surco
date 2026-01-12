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
  cultivo: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'Activa',
  lotes: '',
  notas: '',
}

function Campanas() {
  const [campanas, setCampanas] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [lotesAgricolas, setLotesAgricolas] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editCampana, setEditCampana] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'campanas'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCampanas(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsubCultivos = onSnapshot(collection(db, 'cultivos'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCultivos(data)
    })
    const unsubLotes = onSnapshot(collection(db, 'lotesAgricolas'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setLotesAgricolas(data)
    })
    return () => {
      unsubCultivos()
      unsubLotes()
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre) return
    await addDoc(collection(db, 'campanas'), {
      ...form,
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (campana) => {
    setEditCampana(campana)
    setEditForm({
      nombre: campana.nombre || '',
      cultivo: campana.cultivo || '',
      fechaInicio: campana.fechaInicio || '',
      fechaFin: campana.fechaFin || '',
      estado: campana.estado || 'Activa',
      lotes: campana.lotes || '',
      notas: campana.notas || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editCampana) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'campanas', editCampana.id), {
      ...editForm,
    })
    setSavingEdit(false)
    setEditCampana(null)
  }

  const handleDelete = async (campana) => {
    const confirmDelete = window.confirm('Eliminar campana?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'campanas', campana.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Campanas agricolas"
        subtitle="Planifica campañas y lotes asociados."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nueva campana</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Campana (2024/25)"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <select
              className="input"
              name="cultivo"
              value={form.cultivo}
              onChange={handleChange}
            >
              <option value="">Cultivo</option>
              {cultivos.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.cultivo || cultivo.nombre}>
                  {cultivo.cultivo || cultivo.nombre}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="date"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={handleChange}
            />
            <input
              className="input"
              type="date"
              name="fechaFin"
              value={form.fechaFin}
              onChange={handleChange}
            />
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Activa</option>
              <option>Finalizada</option>
              <option>Planificada</option>
            </select>
            <select
              className="input"
              name="lotes"
              multiple
              value={form.lotes ? form.lotes.split(',') : []}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  lotes: Array.from(event.target.selectedOptions)
                    .map((option) => option.value)
                    .join(','),
                }))
              }
            >
              {lotesAgricolas.map((lote) => (
                <option key={lote.id} value={lote.nombre}>
                  {lote.nombre}
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
              Guardar campana
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Campanas registradas</h2>
          {campanas.length === 0 ? (
            <div className="empty-state">No hay campanas registradas.</div>
          ) : (
            <div className="table">
              {campanas.map((campana) => (
                <div className="table-row" key={campana.id}>
                  <div>
                    <strong>{campana.nombre}</strong>
                    <span>{campana.cultivo || 'Sin cultivo'}</span>
                  </div>
                  <div>
                    <span>{campana.fechaInicio || 'Sin inicio'}</span>
                    <span>{campana.fechaFin || 'Sin cierre'}</span>
                  </div>
                  <div>
                    <span>{campana.estado}</span>
                    <span>{campana.lotes || 'Sin lotes'}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(campana)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(campana)}
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
        open={Boolean(editCampana)}
        title="Editar campana"
        onClose={() => setEditCampana(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-campana-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-campana-form"
          onSubmit={handleEditSubmit}
        >
          <input
            className="input"
            name="nombre"
            placeholder="Campana"
            value={editForm?.nombre || ''}
            onChange={handleEditChange}
            required
          />
          <select
            className="input"
            name="cultivo"
            value={editForm?.cultivo || ''}
            onChange={handleEditChange}
          >
            <option value="">Cultivo</option>
            {cultivos.map((cultivo) => (
              <option key={cultivo.id} value={cultivo.cultivo || cultivo.nombre}>
                {cultivo.cultivo || cultivo.nombre}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            name="fechaInicio"
            value={editForm?.fechaInicio || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="date"
            name="fechaFin"
            value={editForm?.fechaFin || ''}
            onChange={handleEditChange}
          />
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Activa'}
            onChange={handleEditChange}
          >
            <option>Activa</option>
            <option>Finalizada</option>
            <option>Planificada</option>
          </select>
          <select
            className="input"
            name="lotes"
            multiple
            value={editForm?.lotes ? editForm.lotes.split(',') : []}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                lotes: Array.from(event.target.selectedOptions)
                  .map((option) => option.value)
                  .join(','),
              }))
            }
          >
            {lotesAgricolas.map((lote) => (
              <option key={lote.id} value={lote.nombre}>
                {lote.nombre}
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

export default Campanas
