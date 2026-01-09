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
  tipo: 'Siembra',
  fecha: '',
  campo: '',
  lote: '',
  responsable: '',
  estado: 'Pendiente',
  insumos: '',
  costoEstimado: '',
  costoReal: '',
}

function Tareas() {
  const [tareas, setTareas] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editTarea, setEditTarea] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [campos, setCampos] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [insumos, setInsumos] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'tareas'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setTareas(data)
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
    const unsubEmpleados = onSnapshot(collection(db, 'empleados'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setEmpleados(data)
    })
    const unsubInsumos = onSnapshot(collection(db, 'insumos'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setInsumos(data)
    })
    return () => {
      unsubCampos()
      unsubEmpleados()
      unsubInsumos()
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.fecha || !form.campo) return
    await addDoc(collection(db, 'tareas'), {
      ...form,
      costoEstimado: Number(form.costoEstimado || 0),
      costoReal: Number(form.costoReal || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (tarea) => {
    setEditTarea(tarea)
    setEditForm({
      tipo: tarea.tipo || 'Siembra',
      fecha: tarea.fecha || '',
      campo: tarea.campo || '',
      lote: tarea.lote || '',
      responsable: tarea.responsable || '',
      estado: tarea.estado || 'Pendiente',
      insumos: tarea.insumos || '',
      costoEstimado: tarea.costoEstimado || '',
      costoReal: tarea.costoReal || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editTarea) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'tareas', editTarea.id), {
      ...editForm,
      costoEstimado: Number(editForm.costoEstimado || 0),
      costoReal: Number(editForm.costoReal || 0),
    })
    setSavingEdit(false)
    setEditTarea(null)
  }

  const handleDelete = async (tarea) => {
    const confirmDelete = window.confirm('Eliminar tarea?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'tareas', tarea.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Tareas"
        subtitle="Planifica labores, insumos y costos."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nueva tarea</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select
              className="input"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
            >
              <option>Siembra</option>
              <option>Fertilizacion</option>
              <option>Pulverizacion</option>
              <option>Riego</option>
              <option>Cosecha</option>
              <option>Mantenimiento</option>
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
            name="campo"
            value={form.campo}
            onChange={handleChange}
            required
          >
            <option value="">Campo</option>
            {campos.map((campo) => (
              <option key={campo.id} value={campo.nombre}>
                {campo.nombre}
              </option>
            ))}
          </select>
            <input
              className="input"
              name="lote"
              placeholder="Lote"
              value={form.lote}
              onChange={handleChange}
            />
          <select
            className="input"
            name="responsable"
            value={form.responsable}
            onChange={handleChange}
          >
            <option value="">Responsable</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.nombre}>
                {empleado.nombre}
              </option>
            ))}
          </select>
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Pendiente</option>
              <option>En curso</option>
              <option>Realizada</option>
            </select>
          <select
            className="input"
            name="insumos"
            multiple
            value={form.insumos ? form.insumos.split(',') : []}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                insumos: Array.from(event.target.selectedOptions)
                  .map((option) => option.value)
                  .join(','),
              }))
            }
          >
            {insumos.map((insumo) => (
              <option key={insumo.id} value={insumo.nombre}>
                {insumo.nombre}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            name="costoEstimado"
            placeholder="Costo estimado ($)"
            value={form.costoEstimado}
            onChange={handleChange}
          />
          <input
            className="input"
            type="number"
            name="costoReal"
            placeholder="Costo real ($)"
            value={form.costoReal}
            onChange={handleChange}
          />
            <button className="primary-button" type="submit">
              Guardar tarea
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Tareas registradas</h2>
          {tareas.length === 0 ? (
            <div className="empty-state">No hay tareas cargadas.</div>
          ) : (
            <div className="table">
              {tareas.map((tarea) => (
                <div className="table-row" key={tarea.id}>
                  <div>
                    <strong>{tarea.tipo}</strong>
                    <span>{tarea.fecha}</span>
                  </div>
                  <div>
                    <span>{tarea.campo}</span>
                    <span>{tarea.lote || 'Sin lote'}</span>
                  </div>
                  <div>
                    <span>{tarea.estado}</span>
                    <span>Resp: {tarea.responsable || 'Sin responsable'}</span>
                  </div>
                  <div>
                    <span>Est: ${tarea.costoEstimado}</span>
                    <span>Real: ${tarea.costoReal}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(tarea)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(tarea)}
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
        open={Boolean(editTarea)}
        title="Editar tarea"
        onClose={() => setEditTarea(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-tarea-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form className="form-grid" id="edit-tarea-form" onSubmit={handleEditSubmit}>
          <select
            className="input"
            name="tipo"
            value={editForm?.tipo || 'Siembra'}
            onChange={handleEditChange}
          >
            <option>Siembra</option>
            <option>Fertilizacion</option>
            <option>Pulverizacion</option>
            <option>Riego</option>
            <option>Cosecha</option>
            <option>Mantenimiento</option>
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
            name="campo"
            value={editForm?.campo || ''}
            onChange={handleEditChange}
            required
          >
            <option value="">Campo</option>
            {campos.map((campo) => (
              <option key={campo.id} value={campo.nombre}>
                {campo.nombre}
              </option>
            ))}
          </select>
          <input
            className="input"
            name="lote"
            placeholder="Lote"
            value={editForm?.lote || ''}
            onChange={handleEditChange}
          />
          <select
            className="input"
            name="responsable"
            value={editForm?.responsable || ''}
            onChange={handleEditChange}
          >
            <option value="">Responsable</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.nombre}>
                {empleado.nombre}
              </option>
            ))}
          </select>
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Pendiente'}
            onChange={handleEditChange}
          >
            <option>Pendiente</option>
            <option>En curso</option>
            <option>Realizada</option>
          </select>
          <select
            className="input"
            name="insumos"
            multiple
            value={editForm?.insumos ? editForm.insumos.split(',') : []}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                insumos: Array.from(event.target.selectedOptions)
                  .map((option) => option.value)
                  .join(','),
              }))
            }
          >
            {insumos.map((insumo) => (
              <option key={insumo.id} value={insumo.nombre}>
                {insumo.nombre}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            name="costoEstimado"
            placeholder="Costo estimado ($)"
            value={editForm?.costoEstimado || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="costoReal"
            placeholder="Costo real ($)"
            value={editForm?.costoReal || ''}
            onChange={handleEditChange}
          />
        </form>
      </Modal>
    </div>
  )
}

export default Tareas
