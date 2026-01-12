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
import Modal from '../components/Modal.jsx'

const initialForm = {
  tipo: 'Siembra',
  fecha: '',
  campoId: '',
  loteId: '',
  cultivoId: '',
  rendimiento: '',
  observaciones: '',
}

function RegistrosAgricolas() {
  const [registros, setRegistros] = useState([])
  const [campos, setCampos] = useState([])
  const [lotesAgricolas, setLotesAgricolas] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editRegistro, setEditRegistro] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'registrosAgricolas'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setRegistros(data)
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
    const unsubLotes = onSnapshot(collection(db, 'lotesAgricolas'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setLotesAgricolas(data)
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
      unsubLotes()
      unsubCultivos()
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.fecha || !form.campoId) return
    await addDoc(collection(db, 'registrosAgricolas'), {
      ...form,
      rendimiento: Number(form.rendimiento || 0),
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (registro) => {
    setEditRegistro(registro)
    setEditForm({
      tipo: registro.tipo || 'Siembra',
      fecha: registro.fecha || '',
      campoId: registro.campoId || '',
      loteId: registro.loteId || '',
      cultivoId: registro.cultivoId || '',
      rendimiento: registro.rendimiento || '',
      observaciones: registro.observaciones || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editRegistro) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'registrosAgricolas', editRegistro.id), {
      ...editForm,
      rendimiento: Number(editForm.rendimiento || 0),
    })
    setSavingEdit(false)
    setEditRegistro(null)
  }

  const handleDelete = async (registro) => {
    const confirmDelete = window.confirm('Eliminar registro?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'registrosAgricolas', registro.id))
  }

  const campoName = (campoId) =>
    campos.find((campo) => campo.id === campoId)?.nombre || 'Sin campo'
  const loteName = (loteId) =>
    lotesAgricolas.find((lote) => lote.id === loteId)?.nombre || 'Sin lote'
  const cultivoName = (cultivoId) =>
    cultivos.find((cultivo) => cultivo.id === cultivoId)?.cultivo ||
    cultivos.find((cultivo) => cultivo.id === cultivoId)?.nombre ||
    'Sin cultivo'

  return (
    <div className="page">
      <PageHeader
        title="Registro de siembra y cosecha"
        subtitle="Seguimiento por fecha, lote y rendimiento."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo registro</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select className="input" name="tipo" value={form.tipo} onChange={handleChange}>
              <option>Siembra</option>
              <option>Cosecha</option>
            </select>
            <input
              className="input"
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
            />
            <select
              className="input"
              name="campoId"
              value={form.campoId}
              onChange={handleChange}
              required
            >
              <option value="">Campo</option>
              {campos.map((campo) => (
                <option key={campo.id} value={campo.id}>
                  {campo.nombre}
                </option>
              ))}
            </select>
            <select
              className="input"
              name="loteId"
              value={form.loteId}
              onChange={handleChange}
            >
              <option value="">Lote agricola</option>
              {lotesAgricolas.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.nombre}
                </option>
              ))}
            </select>
            <select
              className="input"
              name="cultivoId"
              value={form.cultivoId}
              onChange={handleChange}
            >
              <option value="">Cultivo</option>
              {cultivos.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.id}>
                  {cultivo.cultivo || cultivo.nombre}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              name="rendimiento"
              placeholder="Rendimiento (toneladas)"
              value={form.rendimiento}
              onChange={handleChange}
            />
            <textarea
              className="textarea"
              name="observaciones"
              placeholder="Observaciones"
              rows={3}
              value={form.observaciones}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar registro
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Registros agricolas</h2>
          {registros.length === 0 ? (
            <div className="empty-state">No hay registros cargados.</div>
          ) : (
            <div className="table">
              {registros.map((registro) => (
                <div className="table-row" key={registro.id}>
                  <div>
                    <strong>{registro.tipo}</strong>
                    <span>{registro.fecha}</span>
                  </div>
                  <div>
                    <span>{campoName(registro.campoId)}</span>
                    <span>{loteName(registro.loteId)}</span>
                  </div>
                  <div>
                    <span>{cultivoName(registro.cultivoId)}</span>
                    <span>
                      {registro.rendimiento
                        ? `${registro.rendimiento} tn`
                        : 'Rendimiento N/D'}
                    </span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(registro)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(registro)}
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

      <Modal
        open={Boolean(editRegistro)}
        title="Editar registro"
        onClose={() => setEditRegistro(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-registro-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-registro-form"
          onSubmit={handleEditSubmit}
        >
          <select
            className="input"
            name="tipo"
            value={editForm?.tipo || 'Siembra'}
            onChange={handleEditChange}
          >
            <option>Siembra</option>
            <option>Cosecha</option>
          </select>
          <input
            className="input"
            type="date"
            name="fecha"
            value={editForm?.fecha || ''}
            onChange={handleEditChange}
            required
          />
          <select
            className="input"
            name="campoId"
            value={editForm?.campoId || ''}
            onChange={handleEditChange}
            required
          >
            <option value="">Campo</option>
            {campos.map((campo) => (
              <option key={campo.id} value={campo.id}>
                {campo.nombre}
              </option>
            ))}
          </select>
          <select
            className="input"
            name="loteId"
            value={editForm?.loteId || ''}
            onChange={handleEditChange}
          >
            <option value="">Lote agricola</option>
            {lotesAgricolas.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.nombre}
              </option>
            ))}
          </select>
          <select
            className="input"
            name="cultivoId"
            value={editForm?.cultivoId || ''}
            onChange={handleEditChange}
          >
            <option value="">Cultivo</option>
            {cultivos.map((cultivo) => (
              <option key={cultivo.id} value={cultivo.id}>
                {cultivo.cultivo || cultivo.nombre}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            name="rendimiento"
            placeholder="Rendimiento (toneladas)"
            value={editForm?.rendimiento || ''}
            onChange={handleEditChange}
          />
          <textarea
            className="textarea"
            name="observaciones"
            placeholder="Observaciones"
            rows={3}
            value={editForm?.observaciones || ''}
            onChange={handleEditChange}
          />
        </form>
      </Modal>
    </div>
  )
}

export default RegistrosAgricolas
