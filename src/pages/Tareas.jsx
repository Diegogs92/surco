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
            <input
              className="input"
              name="campo"
              placeholder="Campo"
              value={form.campo}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="lote"
              placeholder="Lote"
              value={form.lote}
              onChange={handleChange}
            />
            <input
              className="input"
              name="responsable"
              placeholder="Responsable"
              value={form.responsable}
              onChange={handleChange}
            />
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
            <input
              className="input"
              name="insumos"
              placeholder="Insumos usados"
              value={form.insumos}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="costoEstimado"
              placeholder="Costo estimado"
              value={form.costoEstimado}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="costoReal"
              placeholder="Costo real"
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
                    <span>Est: {tarea.costoEstimado}</span>
                    <span>Real: {tarea.costoReal}</span>
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

export default Tareas
