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
  contacto: '',
  telefono: '',
  email: '',
}

function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editProveedor, setEditProveedor] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'proveedores'), orderBy('nombre', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setProveedores(data)
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
    await addDoc(collection(db, 'proveedores'), {
      ...form,
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (proveedor) => {
    setEditProveedor(proveedor)
    setEditForm({
      nombre: proveedor.nombre || '',
      contacto: proveedor.contacto || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editProveedor) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'proveedores', editProveedor.id), {
      ...editForm,
    })
    setSavingEdit(false)
    setEditProveedor(null)
  }

  const handleDelete = async (proveedor) => {
    const confirmDelete = window.confirm('Eliminar proveedor?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'proveedores', proveedor.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Proveedores"
        subtitle="Gestiona proveedores para insumos."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo proveedor</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Proveedor"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="contacto"
              placeholder="Contacto"
              value={form.contacto}
              onChange={handleChange}
            />
            <input
              className="input"
              name="telefono"
              placeholder="Telefono"
              value={form.telefono}
              onChange={handleChange}
            />
            <input
              className="input"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar proveedor
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Listado de proveedores</h2>
          {proveedores.length === 0 ? (
            <div className="empty-state">No hay proveedores registrados.</div>
          ) : (
            <div className="table">
              {proveedores.map((proveedor) => (
                <div className="table-row" key={proveedor.id}>
                  <div>
                    <strong>{proveedor.nombre}</strong>
                    <span>{proveedor.contacto || 'Sin contacto'}</span>
                  </div>
                  <div>
                    <span>{proveedor.telefono || 'Sin telefono'}</span>
                    <span>{proveedor.email || 'Sin email'}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(proveedor)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(proveedor)}
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
        open={Boolean(editProveedor)}
        title="Editar proveedor"
        onClose={() => setEditProveedor(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-proveedor-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-proveedor-form"
          onSubmit={handleEditSubmit}
        >
          <input
            className="input"
            name="nombre"
            placeholder="Proveedor"
            value={editForm?.nombre || ''}
            onChange={handleEditChange}
            required
          />
          <input
            className="input"
            name="contacto"
            placeholder="Contacto"
            value={editForm?.contacto || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            name="telefono"
            placeholder="Telefono"
            value={editForm?.telefono || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            name="email"
            placeholder="Email"
            value={editForm?.email || ''}
            onChange={handleEditChange}
          />
        </form>
      </Modal>
    </div>
  )
}

export default Proveedores
