import { useEffect, useState } from 'react'
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

const initialForm = {
  equipoId: '',
  equipoNombre: '',
  tipo: 'Preventivo',
  prioridad: 'Media',
  estado: 'Pendiente',
  descripcion: '',
  fecha: new Date().toISOString().slice(0, 10),
}

function NuevoReporte() {
  const [equipos, setEquipos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'maquinaria'), orderBy('nombre', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEquipos(data)
    })
    return () => unsub()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'equipoId') {
      const selected = equipos.find((equipo) => equipo.id === value)
      setForm((prev) => ({
        ...prev,
        equipoId: value,
        equipoNombre: selected?.nombre || '',
      }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.equipoId || !form.descripcion) return
    setSaving(true)
    await addDoc(collection(db, 'reportes'), {
      ...form,
      createdAt: serverTimestamp(),
    })
    setSaving(false)
    setForm(initialForm)
  }

  return (
    <div className="page">
      <PageHeader
        title="Nuevo reporte"
        subtitle="Registra mantenimientos preventivos o correctivos."
      />
      <div className="card">
        <form className="form-grid wide" onSubmit={handleSubmit}>
          <select
            className="input"
            name="equipoId"
            value={form.equipoId}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un equipo</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre} - {equipo.modelo}
              </option>
            ))}
          </select>
          <select
            className="input"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
          >
            <option>Preventivo</option>
            <option>Correctivo</option>
          </select>
          <select
            className="input"
            name="prioridad"
            value={form.prioridad}
            onChange={handleChange}
          >
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
          <select
            className="input"
            name="estado"
            value={form.estado}
            onChange={handleChange}
          >
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Resuelto</option>
          </select>
          <input
            className="input"
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
          />
          <textarea
            className="input textarea"
            name="descripcion"
            placeholder="Describe el problema o la tarea..."
            value={form.descripcion}
            onChange={handleChange}
            rows="4"
            required
          />
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default NuevoReporte
