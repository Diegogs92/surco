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
  const [campos, setCampos] = useState([])
  const [cultivos, setCultivos] = useState([])

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

  useEffect(() => {
    const unsubCampos = onSnapshot(collection(db, 'campos'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCampos(data)
    })
    const unsubCultivos = onSnapshot(collection(db, 'cultivos'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCultivos(data)
    })
    return () => {
      unsubCampos()
      unsubCultivos()
    }
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
            <select
              className="input"
              name="campo"
              value={form.campo}
              onChange={handleChange}
              required
            >
              <option value="">Campo</option>
              {campos.map((campo) => (
                <option key={campo.id} value={campo.nombre}>
                  {campo.nombre}
                </option>
              ))}
            </select>
            <input
              className="input"
              name="lote"
              placeholder="Lote"
              value={form.lote}
              onChange={handleChange}
            />
            <select
              className="input"
              name="cultivo"
              value={form.cultivo}
              onChange={handleChange}
              required
            >
              <option value="">Cultivo</option>
              {cultivos.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.cultivo}>
                  {cultivo.cultivo} {cultivo.campana ? `(${cultivo.campana})` : ''}
                </option>
              ))}
            </select>
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
              placeholder="Ingresos por cosecha ($)"
              value={form.ingresosCosecha}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="margenBruto"
              placeholder="Margen bruto (%)"
              value={form.margenBruto}
              onChange={handleChange}
            />
            <input
              className="input"
              type="number"
              name="rentabilidadHa"
              placeholder="Rentabilidad (%)"
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
                    <span>Ingresos: ${costo.ingresosCosecha}</span>
                  </div>
                  <div>
                    <span>Margen: {costo.margenBruto}%</span>
                    <span>Rentabilidad: {costo.rentabilidadHa}%</span>
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
