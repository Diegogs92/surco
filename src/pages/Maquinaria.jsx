import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'

const initialForm = {
  nombre: '',
  modelo: '',
  serie: '',
  ubicacion: '',
  estado: 'Operativa',
  ultimaFechaServicio: '',
}

function Maquinaria() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(initialForm)
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre || !form.modelo) return
    await addDoc(collection(db, 'maquinaria'), {
      ...form,
      ultimaFechaServicio: form.ultimaFechaServicio || null,
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

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
          <h2>Nuevo equipo</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Nombre de equipo"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="modelo"
              placeholder="Modelo"
              value={form.modelo}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="serie"
              placeholder="Serie"
              value={form.serie}
              onChange={handleChange}
            />
            <input
              className="input"
              name="ubicacion"
              placeholder="Ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
            />
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Operativa</option>
              <option>En mantenimiento</option>
              <option>Fuera de servicio</option>
            </select>
            <input
              className="input"
              type="date"
              name="ultimaFechaServicio"
              value={form.ultimaFechaServicio}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar equipo
            </button>
          </form>
        </div>
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
