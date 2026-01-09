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
  cultivo: 'Soja',
  campana: '',
  fechaSiembra: '',
  variedad: '',
  fechaCosecha: '',
  rendimientoEsperado: '',
  rendimientoReal: '',
}

function Cultivos() {
  const [cultivos, setCultivos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editCultivo, setEditCultivo] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'cultivos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCultivos(data)
    })
    return () => unsub()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.campana) return
    await addDoc(collection(db, 'cultivos'), {
      ...form,
      rendimientoEsperado: Number(form.rendimientoEsperado || 0),
      rendimientoReal: Number(form.rendimientoReal || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (cultivo) => {
    setEditCultivo(cultivo)
    setEditForm({
      cultivo: cultivo.cultivo || 'Soja',
      campana: cultivo.campana || '',
      fechaSiembra: cultivo.fechaSiembra || '',
      variedad: cultivo.variedad || '',
      fechaCosecha: cultivo.fechaCosecha || '',
      rendimientoEsperado: cultivo.rendimientoEsperado || '',
      rendimientoReal: cultivo.rendimientoReal || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editCultivo) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'cultivos', editCultivo.id), {
      ...editForm,
      rendimientoEsperado: Number(editForm.rendimientoEsperado || 0),
      rendimientoReal: Number(editForm.rendimientoReal || 0),
    })
    setSavingEdit(false)
    setEditCultivo(null)
  }

  const handleDelete = async (cultivo) => {
    const confirmDelete = window.confirm('Eliminar cultivo?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'cultivos', cultivo.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Cultivos"
        subtitle="Gestiona campañas, variedades y rendimiento."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo cultivo</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select
              className="input"
              name="cultivo"
              value={form.cultivo}
              onChange={handleChange}
            >
              <option>Soja</option>
              <option>Maiz</option>
              <option>Trigo</option>
              <option>Girasol</option>
              <option>Cebada</option>
            </select>
            <input
              className="input"
              name="campana"
              placeholder="Campaña (2024/25)"
              value={form.campana}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              type="date"
              name="fechaSiembra"
              value={form.fechaSiembra}
              onChange={handleChange}
            />
            <input
              className="input"
              name="variedad"
              placeholder="Variedad"
              value={form.variedad}
              onChange={handleChange}
            />
            <input
              className="input"
              type="date"
              name="fechaCosecha"
              value={form.fechaCosecha}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="rendimientoEsperado"
              placeholder="Rendimiento esperado"
              value={form.rendimientoEsperado}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="rendimientoReal"
              placeholder="Rendimiento real"
              value={form.rendimientoReal}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar cultivo
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Campañas</h2>
          {cultivos.length === 0 ? (
            <div className="empty-state">No hay cultivos registrados.</div>
          ) : (
            <div className="table">
              {cultivos.map((cultivo) => (
                <div className="table-row" key={cultivo.id}>
                  <div>
                    <strong>{cultivo.cultivo}</strong>
                    <span>{cultivo.campana}</span>
                  </div>
                  <div>
                    <span>Siembra: {cultivo.fechaSiembra || 'Sin fecha'}</span>
                    <span>Cosecha: {cultivo.fechaCosecha || 'Sin fecha'}</span>
                  </div>
                  <div>
                    <span>Esperado: {cultivo.rendimientoEsperado}</span>
                    <span>Real: {cultivo.rendimientoReal}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(cultivo)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(cultivo)}
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
        open={Boolean(editCultivo)}
        title="Editar cultivo"
        onClose={() => setEditCultivo(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-cultivo-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-cultivo-form"
          onSubmit={handleEditSubmit}
        >
          <select
            className="input"
            name="cultivo"
            value={editForm?.cultivo || 'Soja'}
            onChange={handleEditChange}
          >
            <option>Soja</option>
            <option>Maiz</option>
            <option>Trigo</option>
            <option>Girasol</option>
            <option>Cebada</option>
          </select>
          <input
            className="input"
            name="campana"
            placeholder="Campaña (2024/25)"
            value={editForm?.campana || ''}
            onChange={handleEditChange}
            required
          />
          <input
            className="input"
            type="date"
            name="fechaSiembra"
            value={editForm?.fechaSiembra || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            name="variedad"
            placeholder="Variedad"
            value={editForm?.variedad || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="date"
            name="fechaCosecha"
            value={editForm?.fechaCosecha || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="rendimientoEsperado"
            placeholder="Rendimiento esperado"
            value={editForm?.rendimientoEsperado || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="rendimientoReal"
            placeholder="Rendimiento real"
            value={editForm?.rendimientoReal || ''}
            onChange={handleEditChange}
          />
        </form>
      </Modal>
    </div>
  )
}

export default Cultivos
