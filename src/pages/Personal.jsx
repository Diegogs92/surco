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
  rol: 'Operario',
  camposAsignados: '',
  horas: '',
  costoLaboral: '',
  asistencia: 'Al dia',
}

function Personal() {
  const [empleados, setEmpleados] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editEmpleado, setEditEmpleado] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'empleados'), orderBy('nombre', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setEmpleados(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('nombre', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setUsuarios(data)
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
    await addDoc(collection(db, 'empleados'), {
      ...form,
      horas: Number(form.horas || 0),
      costoLaboral: Number(form.costoLaboral || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const handleRoleChange = async (id, rol) => {
    await updateDoc(doc(db, 'usuarios', id), { rol })
  }

  const openEdit = (empleado) => {
    setEditEmpleado(empleado)
    setEditForm({
      nombre: empleado.nombre || '',
      rol: empleado.rol || 'Operario',
      camposAsignados: empleado.camposAsignados || '',
      horas: empleado.horas || '',
      costoLaboral: empleado.costoLaboral || '',
      asistencia: empleado.asistencia || 'Al dia',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editEmpleado) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'empleados', editEmpleado.id), {
      ...editForm,
      horas: Number(editForm.horas || 0),
      costoLaboral: Number(editForm.costoLaboral || 0),
    })
    setSavingEdit(false)
    setEditEmpleado(null)
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Eliminar empleado?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'empleados', id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Personal"
        subtitle="Empleados, roles y control de asistencia."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo empleado</h2>
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
              name="rol"
              value={form.rol}
              onChange={handleChange}
            >
              <option>Operario</option>
              <option>Mecanico</option>
              <option>Supervisor</option>
              <option>Administrativo</option>
            </select>
            <input
              className="input"
              name="camposAsignados"
              placeholder="Campos asignados"
              value={form.camposAsignados}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="horas"
              placeholder="Jornales / horas"
              value={form.horas}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="costoLaboral"
              placeholder="Costo laboral"
              value={form.costoLaboral}
              onChange={handleChange}
            />
            <select
              className="input"
              name="asistencia"
              value={form.asistencia}
              onChange={handleChange}
            >
              <option>Al dia</option>
              <option>Ausente</option>
              <option>Licencia</option>
            </select>
            <button className="primary-button" type="submit">
              Guardar empleado
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Empleados</h2>
          {empleados.length === 0 ? (
            <div className="empty-state">No hay empleados registrados.</div>
          ) : (
            <div className="table">
              {empleados.map((empleado) => (
                <div className="table-row" key={empleado.id}>
                  <div>
                    <strong>{empleado.nombre}</strong>
                    <span>{empleado.rol}</span>
                  </div>
                  <div>
                    <span>{empleado.camposAsignados || 'Sin campos'}</span>
                    <span>Horas: {empleado.horas || 0}</span>
                  </div>
                  <div>
                    <span>Asistencia: {empleado.asistencia}</span>
                    <span>Costo: {empleado.costoLaboral || 0}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(empleado)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(empleado.id)}
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

      <div className="card">
        <h2>Usuarios del sistema</h2>
        {usuarios.length === 0 ? (
          <div className="empty-state">No hay usuarios registrados.</div>
        ) : (
          <div className="table">
            {usuarios.map((usuario) => (
              <div className="table-row" key={usuario.id}>
                <div>
                  <strong>{usuario.nombre}</strong>
                  <span>{usuario.email}</span>
                </div>
                <div>
                  <span>Ultimo acceso</span>
                  <span>
                    {usuario.lastLogin?.toDate
                      ? usuario.lastLogin.toDate().toLocaleDateString('es-AR')
                      : 'Sin datos'}
                  </span>
                </div>
                <div>
                  <select
                    className="input compact"
                    value={usuario.rol || 'tecnico'}
                    onChange={(event) =>
                      handleRoleChange(usuario.id, event.target.value)
                    }
                  >
                    <option value="admin">Administrador</option>
                    <option value="tecnico">Tecnico</option>
                    <option value="operario">Operario</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(editEmpleado)}
        title="Editar empleado"
        onClose={() => setEditEmpleado(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-empleado-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-empleado-form"
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
            name="rol"
            value={editForm?.rol || 'Operario'}
            onChange={handleEditChange}
          >
            <option>Operario</option>
            <option>Mecanico</option>
            <option>Supervisor</option>
            <option>Administrativo</option>
          </select>
          <input
            className="input"
            name="camposAsignados"
            placeholder="Campos asignados"
            value={editForm?.camposAsignados || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="horas"
            placeholder="Jornales / horas"
            value={editForm?.horas || ''}
            onChange={handleEditChange}
          />
          <input
            className="input"
            type="number"
            name="costoLaboral"
            placeholder="Costo laboral"
            value={editForm?.costoLaboral || ''}
            onChange={handleEditChange}
          />
          <select
            className="input"
            name="asistencia"
            value={editForm?.asistencia || 'Al dia'}
            onChange={handleEditChange}
          >
            <option>Al dia</option>
            <option>Ausente</option>
            <option>Licencia</option>
          </select>
        </form>
      </Modal>
    </div>
  )
}

export default Personal
