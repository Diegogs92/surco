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
  cultivo: 'Soja',
  campana: '',
  fechaSiembra: '',
  variedad: '',
  fechaCosecha: '',
  rendimientoEsperado: '',
  rendimientoReal: '',
}

function Cultivos() {
  const [cultivos, setCultivos] = useState([])
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    const q = query(collection(db, 'cultivos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCultivos(data)
    })
    return () => unsub()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.campana) return
    await addDoc(collection(db, 'cultivos'), {
      ...form,
      rendimientoEsperado: Number(form.rendimientoEsperado || 0),
      rendimientoReal: Number(form.rendimientoReal || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  return (
    <div className="page">
      <PageHeader
        title="Cultivos"
        subtitle="Gestiona campanas, variedades y rendimiento."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo cultivo</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select
              className="input"
              name="cultivo"
              value={form.cultivo}
              onChange={handleChange}
            >
              <option>Soja</option>
              <option>Maiz</option>
              <option>Trigo</option>
              <option>Girasol</option>
              <option>Cebada</option>
            </select>
            <input
              className="input"
              name="campana"
              placeholder="Campana (2024/25)"
              value={form.campana}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              type="date"
              name="fechaSiembra"
              value={form.fechaSiembra}
              onChange={handleChange}
            />
            <input
              className="input"
              name="variedad"
              placeholder="Variedad"
              value={form.variedad}
              onChange={handleChange}
            />
            <input
              className="input"
              type="date"
              name="fechaCosecha"
              value={form.fechaCosecha}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="rendimientoEsperado"
              placeholder="Rendimiento esperado"
              value={form.rendimientoEsperado}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="rendimientoReal"
              placeholder="Rendimiento real"
              value={form.rendimientoReal}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar cultivo
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Campanas</h2>
          {cultivos.length === 0 ? (
            <div className="empty-state">No hay cultivos registrados.</div>
          ) : (
            <div className="table">
              {cultivos.map((cultivo) => (
                <div className="table-row" key={cultivo.id}>
                  <div>
                    <strong>{cultivo.cultivo}</strong>
                    <span>{cultivo.campana}</span>
                  </div>
                  <div>
                    <span>Siembra: {cultivo.fechaSiembra || 'Sin fecha'}</span>
                    <span>Cosecha: {cultivo.fechaCosecha || 'Sin fecha'}</span>
                  </div>
                  <div>
                    <span>Esperado: {cultivo.rendimientoEsperado}</span>
                    <span>Real: {cultivo.rendimientoReal}</span>
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

export default Cultivos
