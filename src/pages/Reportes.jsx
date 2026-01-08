import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'

function Reportes() {
  const [reportes, setReportes] = useState([])
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')

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

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return reportes.filter((reporte) => {
      const matchesFilter =
        filter === 'Todos' ? true : reporte.estado === filter
      const matchesSearch = term
        ? [reporte.equipoNombre, reporte.descripcion, reporte.tipo]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true
      return matchesFilter && matchesSearch
    })
  }, [reportes, filter, search])

  const handleEstadoChange = async (id, estado) => {
    await updateDoc(doc(db, 'reportes', id), { estado })
  }

  return (
    <div className="page">
      <PageHeader
        title="Reportes"
        subtitle="Historial de servicios, correcciones y preventivos."
        actions={
          <div className="filters">
            <select
              className="input"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option>Todos</option>
              <option>Pendiente</option>
              <option>En proceso</option>
              <option>Resuelto</option>
            </select>
            <input
              className="input"
              placeholder="Buscar reporte..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        }
      />
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">No hay reportes para mostrar.</div>
        ) : (
          <div className="table">
            {filtered.map((reporte) => (
              <div className="table-row report-row" key={reporte.id}>
                <div>
                  <strong>{reporte.equipoNombre || 'Equipo'}</strong>
                  <span>{reporte.tipo}</span>
                </div>
                <div>
                  <span className="report-desc">{reporte.descripcion}</span>
                  <span>
                    {reporte.prioridad} · {reporte.fecha}
                  </span>
                </div>
                <div>
                  <select
                    className="input compact"
                    value={reporte.estado}
                    onChange={(event) =>
                      handleEstadoChange(reporte.id, event.target.value)
                    }
                  >
                    <option>Pendiente</option>
                    <option>En proceso</option>
                    <option>Resuelto</option>
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

export default Reportes
