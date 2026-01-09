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
  categoria: 'Semillas',
  nombre: '',
  stock: '',
  consumoPorTarea: '',
  costoUnitario: '',
  proveedor: '',
}

function Insumos() {
  const [insumos, setInsumos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editInsumo, setEditInsumo] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'insumos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setInsumos(data)
    })
    return () => unsub()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre) return
    await addDoc(collection(db, 'insumos'), {
      ...form,
      stock: Number(form.stock || 0),
      consumoPorTarea: Number(form.consumoPorTarea || 0),
      costoUnitario: Number(form.costoUnitario || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (insumo) => {
    setEditInsumo(insumo)
    setEditForm({
      categoria: insumo.categoria || 'Semillas',
      nombre: insumo.nombre || '',
      stock: insumo.stock || '',
      consumoPorTarea: insumo.consumoPorTarea || '',
      costoUnitario: insumo.costoUnitario || '',
      proveedor: insumo.proveedor || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editInsumo) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'insumos', editInsumo.id), {
      ...editForm,
      stock: Number(editForm.stock || 0),
      consumoPorTarea: Number(editForm.consumoPorTarea || 0),
      costoUnitario: Number(editForm.costoUnitario || 0),
    })
    setSavingEdit(false)
    setEditInsumo(null)
  }

  const handleDelete = async (insumo) => {
    const confirmDelete = window.confirm('Eliminar insumo?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'insumos', insumo.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Insumos"
        subtitle="Stock, consumo y costos unitarios."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo insumo</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select
              className="input"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
            >
              <option>Semillas</option>
              <option>Fertilizante</option>
              <option>Agroquimicos</option>
              <option>Combustible</option>
            </select>
            <input
              className="input"
              name="nombre"
              placeholder="Insumo"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              type="number"
              name="stock"
              placeholder="Stock"
              value={form.stock}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="consumoPorTarea"
              placeholder="Consumo por tarea"
              value={form.consumoPorTarea}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="costoUnitario"
              placeholder="Costo unitario"
              value={form.costoUnitario}
              onChange={handleChange}
            />
            <input
              className="input"
              name="proveedor"
              placeholder="Proveedor"
              value={form.proveedor}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar insumo
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Inventario</h2>
          {insumos.length === 0 ? (
            <div className="empty-state">No hay insumos registrados.</div>
          ) : (
            <div className="table">
              {insumos.map((insumo) => (
                <div className="table-row" key={insumo.id}>
                  <div>
                    <strong>{insumo.nombre}</strong>
                    <span>{insumo.categoria}</span>
                  </div>
                  <div>
                    <span>Stock: {insumo.stock}</span>
                    <span>Consumo: {insumo.consumoPorTarea}</span>
                  </div>
                  <div>
                    <span>Costo: {insumo.costoUnitario}</span>
                    <span>{insumo.proveedor || 'Sin proveedor'}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(insumo)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(insumo)}
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
        open={Boolean(editInsumo)}
        title="Editar insumo"
        onClose={() => setEditInsumo(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-insumo-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-insumo-form"
          onSubmit={handleEditSubmit}
        >
          <select
            className="input"
            name="categoria"
            value={editForm?.categoria || 'Semillas'}
            onChange={handleEditChange}
          >
            <option>Semillas</option>
            <option>Fertilizante</option>
            <option>Agroquimicos</option>
            <option>Combustible</option>
          </select>
          <input
            className="input"
            name="nombre"
            placeholder="Insumo"
            value={editForm?.nombre || ''}
            onChange={handleEditChange}
            required
          />
          <input
            className="input"
            type="number"
            name="stock"
            placeholder="Stock"
            value={editForm?.stock || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="consumoPorTarea"
            placeholder="Consumo por tarea"
            value={editForm?.consumoPorTarea || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="costoUnitario"
            placeholder="Costo unitario"
            value={editForm?.costoUnitario || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            name="proveedor"
            placeholder="Proveedor"
            value={editForm?.proveedor || ''}
            onChange={handleEditChange}
          />
        </form>
      </Modal>
    </div>
  )
}

export default Insumos
