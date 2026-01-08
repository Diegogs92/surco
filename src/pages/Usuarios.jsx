import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])

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

  const handleRoleChange = async (id, rol) => {
    await updateDoc(doc(db, 'usuarios', id), { rol })
  }

  return (
    <div className="page">
      <PageHeader
        title="Usuarios"
        subtitle="Gestiona roles y acceso al sistema."
      />
      <div className="card">
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
    </div>
  )
}

export default Usuarios
