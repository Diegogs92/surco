import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'

function Maquinaria() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'maquinaria'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEquipos(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const stats = useMemo(() => {
    const total = equipos.length
    const operativas = equipos.filter((e) => e.estado === 'Operativa').length
    const mantenimiento = equipos.filter((e) => e.estado === 'En mantenimiento')
      .length
    return { total, operativas, mantenimiento }
  }, [equipos])

  const filtered = useMemo(() => {
    if (!search.trim()) return equipos
    const term = search.toLowerCase()
    return equipos.filter((equipo) =>
      [equipo.nombre, equipo.modelo, equipo.serie, equipo.ubicacion]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    )
  }, [equipos, search])

  return (
    <div className="page">
      <PageHeader
        title="Maquinaria"
        subtitle="Controla la flota, su estado y los ultimos servicios."
        actions={
          <input
            className="input"
            placeholder="Buscar equipo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
      />

      <section className="stats-grid">
        <StatCard label="Equipos" value={stats.total} hint="Total registrados" />
        <StatCard label="Operativas" value={stats.operativas} hint="Listas hoy" />
        <StatCard
          label="En mantenimiento"
          value={stats.mantenimiento}
          hint="En taller o campo"
        />
      </section>

      <section className="two-column">
        <div className="card">
          <h2>Listado de equipos</h2>
          {loading ? (
            <div className="empty-state">Cargando equipos...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              No hay equipos registrados aun.
            </div>
          ) : (
            <div className="table">
              {filtered.map((equipo) => (
                <div className="table-row" key={equipo.id}>
                  <div className="thumb">
                    {equipo.fotos?.[0] ? (
                      <img src={equipo.fotos[0]} alt={equipo.nombre} />
                    ) : (
                      <span>Sin foto</span>
                    )}
                  </div>
                  <div>
                    <strong>{equipo.nombre}</strong>
                    <span>{equipo.modelo}</span>
                  </div>
                  <div>
                    <span>{equipo.ubicacion || 'Sin ubicacion'}</span>
                    <span>{equipo.serie || 'Sin serie'}</span>
                  </div>
                  <div>
                    <span
                      className={`badge status-${(equipo.estado || '')
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {equipo.estado}
                    </span>
                    {equipo.fotosEstado === 'pendiente' && (
                      <span className="badge status-warning">
                        Fotos pendientes
                      </span>
                    )}
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

export default Maquinaria
