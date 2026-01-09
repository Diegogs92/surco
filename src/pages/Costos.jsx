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
  campo: '',
  lote: '',
  cultivo: '',
  campana: '',
  ingresosCosecha: '',
  margenBruto: '',
  rentabilidadHa: '',
}

function Costos() {
  const [costos, setCostos] = useState([])
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    const q = query(collection(db, 'costos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCostos(data)
    })
    return () => unsub()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.campo || !form.cultivo) return
    await addDoc(collection(db, 'costos'), {
      ...form,
      ingresosCosecha: Number(form.ingresosCosecha || 0),
      margenBruto: Number(form.margenBruto || 0),
      rentabilidadHa: Number(form.rentabilidadHa || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  return (
    <div className="page">
      <PageHeader
        title="Costos y finanzas"
        subtitle="Margenes y rentabilidad por campaña."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo registro</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
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
              name="cultivo"
              placeholder="Cultivo"
              value={form.cultivo}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="campana"
              placeholder="Campaña"
              value={form.campana}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="ingresosCosecha"
              placeholder="Ingresos por cosecha"
              value={form.ingresosCosecha}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="margenBruto"
              placeholder="Margen bruto"
              value={form.margenBruto}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="rentabilidadHa"
              placeholder="Rentabilidad por ha"
              value={form.rentabilidadHa}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar costos
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Resumen financiero</h2>
          {costos.length === 0 ? (
            <div className="empty-state">No hay costos cargados.</div>
          ) : (
            <div className="table">
              {costos.map((costo) => (
                <div className="table-row" key={costo.id}>
                  <div>
                    <strong>{costo.campo}</strong>
                    <span>{costo.cultivo}</span>
                  </div>
                  <div>
                    <span>Campaña: {costo.campana || 'Sin campaña'}</span>
                    <span>Ingresos: {costo.ingresosCosecha}</span>
                  </div>
                  <div>
                    <span>Margen: {costo.margenBruto}</span>
                    <span>Rentabilidad: {costo.rentabilidadHa}</span>
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

export default Costos
