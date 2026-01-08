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

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [empleadoForm, setEmpleadoForm] = useState({
    nombre: '',
    rol: 'Operario',
    area: '',
    telefono: '',
  })

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

  const handleRoleChange = async (id, rol) => {
    await updateDoc(doc(db, 'usuarios', id), { rol })
  }

  const handleEmpleadoChange = (event) => {
    const { name, value } = event.target
    setEmpleadoForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmpleadoSubmit = async (event) => {
    event.preventDefault()
    if (!empleadoForm.nombre) return
    await addDoc(collection(db, 'empleados'), {
      ...empleadoForm,
      createdAt: serverTimestamp(),
    })
    setEmpleadoForm({
      nombre: '',
      rol: 'Operario',
      area: '',
      telefono: '',
    })
  }

  const handleEmpleadoDelete = async (id) => {
    const confirmDelete = window.confirm('Eliminar empleado?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'empleados', id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Usuarios"
        subtitle="Gestiona roles, acceso y equipos de trabajo."
      />
      <section className="two-column">
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

        <div className="card">
          <h2>Empleados</h2>
          <form className="form-grid" onSubmit={handleEmpleadoSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Nombre completo"
              value={empleadoForm.nombre}
              onChange={handleEmpleadoChange}
              required
            />
            <select
              className="input"
              name="rol"
              value={empleadoForm.rol}
              onChange={handleEmpleadoChange}
            >
              <option>Operario</option>
              <option>Mecanico</option>
              <option>Supervisor</option>
              <option>Administrativo</option>
            </select>
            <input
              className="input"
              name="area"
              placeholder="Area"
              value={empleadoForm.area}
              onChange={handleEmpleadoChange}
            />
            <input
              className="input"
              name="telefono"
              placeholder="Telefono"
              value={empleadoForm.telefono}
              onChange={handleEmpleadoChange}
            />
            <button className="primary-button" type="submit">
              Guardar empleado
            </button>
          </form>
          {empleados.length === 0 ? (
            <div className="empty-state">No hay empleados cargados.</div>
          ) : (
            <div className="table">
              {empleados.map((empleado) => (
                <div className="table-row" key={empleado.id}>
                  <div>
                    <strong>{empleado.nombre}</strong>
                    <span>{empleado.rol}</span>
                  </div>
                  <div>
                    <span>{empleado.area || 'Sin area'}</span>
                    <span>{empleado.telefono || 'Sin telefono'}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleEmpleadoDelete(empleado.id)}
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
    </div>
  )
}

export default Usuarios
