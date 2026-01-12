import { useEffect, useMemo, useState } from 'react'
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
import { useSearchParams } from 'react-router-dom'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'

const initialForm = {
  titulo: '',
  tipo: 'Agricola',
  fecha: '',
  prioridad: 'Media',
  estado: 'Pendiente',
  campo: '',
  lote: '',
  campana: '',
  descripcion: '',
}

function Alertas() {
  const [alertas, setAlertas] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editAlerta, setEditAlerta] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [campos, setCampos] = useState([])
  const [lotesAgricolas, setLotesAgricolas] = useState([])
  const [campanas, setCampanas] = useState([])
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const q = query(collection(db, 'alertas'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setAlertas(data)
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
    const unsubCampanas = onSnapshot(collection(db, 'campanas'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCampanas(data)
    })
    return () => {
      unsubCampos()
      unsubLotes()
      unsubCampanas()
    }
  }, [])

  useEffect(() => {
    const tipo = searchParams.get('tipo')
    if (tipo === 'meteorologica') {
      setForm((prev) => ({ ...prev, tipo: 'Meteorologica' }))
    } else if (tipo === 'ganadera') {
      setForm((prev) => ({ ...prev, tipo: 'Ganaderia' }))
    } else if (tipo === 'agricola') {
      setForm((prev) => ({ ...prev, tipo: 'Agricola' }))
    }
  }, [searchParams])

  const filtered = useMemo(() => {
    const tipo = searchParams.get('tipo')
    if (!tipo) return alertas
    if (tipo === 'meteorologica') {
      return alertas.filter((alerta) => alerta.tipo === 'Meteorologica')
    }
    if (tipo === 'ganadera') {
      return alertas.filter((alerta) => alerta.tipo === 'Ganaderia')
    }
    if (tipo === 'agricola') {
      return alertas.filter((alerta) => alerta.tipo === 'Agricola')
    }
    return alertas
  }, [alertas, searchParams])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.titulo || !form.fecha) return
    await addDoc(collection(db, 'alertas'), {
      ...form,
      createdAt: serverTimestamp(),
    })
    setForm(initialForm)
  }

  const openEdit = (alerta) => {
    setEditAlerta(alerta)
    setEditForm({
      titulo: alerta.titulo || '',
      tipo: alerta.tipo || 'Agricola',
      fecha: alerta.fecha || '',
      prioridad: alerta.prioridad || 'Media',
      estado: alerta.estado || 'Pendiente',
      campo: alerta.campo || '',
      lote: alerta.lote || '',
      campana: alerta.campana || '',
      descripcion: alerta.descripcion || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editAlerta) return
    setSavingEdit(true)
    await updateDoc(doc(db, 'alertas', editAlerta.id), {
      ...editForm,
    })
    setSavingEdit(false)
    setEditAlerta(null)
  }

  const handleDelete = async (alerta) => {
    const confirmDelete = window.confirm('Eliminar alerta?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'alertas', alerta.id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Alertas y recordatorios"
        subtitle="Planifica avisos para agricultura y ganaderia."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nueva alerta</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="titulo"
              placeholder="Titulo"
              value={form.titulo}
              onChange={handleChange}
              required
            />
            <select className="input" name="tipo" value={form.tipo} onChange={handleChange}>
              <option>Agricola</option>
              <option>Ganaderia</option>
              <option>Meteorologica</option>
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
              name="prioridad"
              value={form.prioridad}
              onChange={handleChange}
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
            <select
              className="input"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>Pendiente</option>
              <option>En curso</option>
              <option>Atendida</option>
            </select>
            <select className="input" name="campo" value={form.campo} onChange={handleChange}>
              <option value="">Campo</option>
              {campos.map((campo) => (
                <option key={campo.id} value={campo.nombre}>
                  {campo.nombre}
                </option>
              ))}
            </select>
            <select className="input" name="lote" value={form.lote} onChange={handleChange}>
              <option value="">Lote agricola</option>
              {lotesAgricolas.map((lote) => (
                <option key={lote.id} value={lote.nombre}>
                  {lote.nombre}
                </option>
              ))}
            </select>
            <select
              className="input"
              name="campana"
              value={form.campana}
              onChange={handleChange}
            >
              <option value="">Campana</option>
              {campanas.map((campana) => (
                <option key={campana.id} value={campana.nombre}>
                  {campana.nombre}
                </option>
              ))}
            </select>
            <textarea
              className="textarea"
              name="descripcion"
              placeholder="Descripcion"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
            />
            <button className="primary-button" type="submit">
              Guardar alerta
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Alertas registradas</h2>
          {filtered.length === 0 ? (
            <div className="empty-state">No hay alertas registradas.</div>
          ) : (
            <div className="table">
              {filtered.map((alerta) => (
                <div className="table-row" key={alerta.id}>
                  <div>
                    <strong>{alerta.titulo}</strong>
                    <span>{alerta.tipo}</span>
                  </div>
                  <div>
                    <span>{alerta.fecha}</span>
                    <span>{alerta.prioridad}</span>
                  </div>
                  <div>
                    <span>{alerta.campo || 'Sin campo'}</span>
                    <span>{alerta.lote || alerta.campana || 'Sin detalle'}</span>
                  </div>
                  <div>
                    <span>{alerta.estado}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(alerta)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(alerta)}
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
        open={Boolean(editAlerta)}
        title="Editar alerta"
        onClose={() => setEditAlerta(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-alerta-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form
          className="form-grid"
          id="edit-alerta-form"
          onSubmit={handleEditSubmit}
        >
          <input
            className="input"
            name="titulo"
            placeholder="Titulo"
            value={editForm?.titulo || ''}
            onChange={handleEditChange}
            required
          />
          <select
            className="input"
            name="tipo"
            value={editForm?.tipo || 'Agricola'}
            onChange={handleEditChange}
          >
            <option>Agricola</option>
            <option>Ganaderia</option>
            <option>Meteorologica</option>
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
            name="prioridad"
            value={editForm?.prioridad || 'Media'}
            onChange={handleEditChange}
          >
            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>
          </select>
          <select
            className="input"
            name="estado"
            value={editForm?.estado || 'Pendiente'}
            onChange={handleEditChange}
          >
            <option>Pendiente</option>
            <option>En curso</option>
            <option>Atendida</option>
          </select>
          <select
            className="input"
            name="campo"
            value={editForm?.campo || ''}
            onChange={handleEditChange}
          >
            <option value="">Campo</option>
            {campos.map((campo) => (
              <option key={campo.id} value={campo.nombre}>
                {campo.nombre}
              </option>
            ))}
          </select>
          <select
            className="input"
            name="lote"
            value={editForm?.lote || ''}
            onChange={handleEditChange}
          >
            <option value="">Lote agricola</option>
            {lotesAgricolas.map((lote) => (
              <option key={lote.id} value={lote.nombre}>
                {lote.nombre}
              </option>
            ))}
          </select>
          <select
            className="input"
            name="campana"
            value={editForm?.campana || ''}
            onChange={handleEditChange}
          >
            <option value="">Campana</option>
            {campanas.map((campana) => (
              <option key={campana.id} value={campana.nombre}>
                {campana.nombre}
              </option>
            ))}
          </select>
          <textarea
            className="textarea"
            name="descripcion"
            placeholder="Descripcion"
            rows={3}
            value={editForm?.descripcion || ''}
            onChange={handleEditChange}
          />
        </form>
      </Modal>
    </div>
  )
}

export default Alertas
