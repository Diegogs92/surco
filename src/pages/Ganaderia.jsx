import { useEffect, useMemo, useState } from 'react'
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'

const initialGanadoLoteForm = {
  nombre: '',
  categoria: '',
  cantidad: '',
  pesoPromedio: '',
  etapa: '',
  notas: '',
}
const initialGanadoAnimalForm = {
  identificador: '',
  categoria: '',
  sexo: '',
  fechaNacimiento: '',
  peso: '',
  loteId: '',
  origen: '',
  estado: '',
}
const initialGanadoEventoForm = {
  tipo: '',
  fecha: '',
  loteId: '',
  animalId: '',
  descripcion: '',
  kilos: '',
  costo: '',
  ingreso: '',
}
const initialGanadoPlanForm = {
  tipo: '',
  fecha: '',
  loteId: '',
  responsable: '',
  notas: '',
  estado: 'pendiente',
}

const ganadoCategorias = [
  'Terneros',
  'Novillos',
  'Vaquillonas',
  'Vacas',
  'Toros',
  'Reproductores',
  'Otros',
]
const ganadoEtapas = ['Crianza', 'Engorde', 'Faenado', 'Venta', 'Distribucion']
const ganadoEventosTipos = [
  'Nacimiento',
  'Compra',
  'Venta',
  'Movimiento',
  'Pesaje',
  'Tratamiento sanitario',
  'Mortalidad',
]
const ganadoPlanesTipos = ['Vacuna', 'Desparasitacion', 'Control']

function Ganaderia() {
  const [campos, setCampos] = useState([])
  const [campoId, setCampoId] = useState('')
  const [ganadoLoteForm, setGanadoLoteForm] = useState(initialGanadoLoteForm)
  const [ganadoAnimalForm, setGanadoAnimalForm] = useState(initialGanadoAnimalForm)
  const [ganadoEventoForm, setGanadoEventoForm] = useState(initialGanadoEventoForm)
  const [ganadoPlanForm, setGanadoPlanForm] = useState(initialGanadoPlanForm)
  const [ganadoError, setGanadoError] = useState('')
  const [editGanadoLote, setEditGanadoLote] = useState(null)
  const [editGanadoAnimal, setEditGanadoAnimal] = useState(null)
  const [editGanadoEvento, setEditGanadoEvento] = useState(null)
  const [editGanadoPlan, setEditGanadoPlan] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'campos'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCampos(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!campoId && campos.length) {
      setCampoId(campos[0].id)
    }
  }, [campos, campoId])

  const campoSeleccionado = useMemo(
    () => campos.find((campo) => campo.id === campoId),
    [campos, campoId],
  )

  const handleGanadoLoteChange = (event) => {
    const { name, value } = event.target
    setGanadoLoteForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoAnimalChange = (event) => {
    const { name, value } = event.target
    setGanadoAnimalForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoEventoChange = (event) => {
    const { name, value } = event.target
    setGanadoEventoForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoPlanChange = (event) => {
    const { name, value } = event.target
    setGanadoPlanForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoLoteSubmit = async (event) => {
    event.preventDefault()
    if (!campoSeleccionado || !ganadoLoteForm.nombre) return
    setGanadoError('')
    if (editGanadoLote) {
      await handleUpdateGanado('lote')
      return
    }
    const cantidadValue = ganadoLoteForm.cantidad
      ? Number(ganadoLoteForm.cantidad)
      : null
    const pesoValue = ganadoLoteForm.pesoPromedio
      ? Number(ganadoLoteForm.pesoPromedio)
      : null
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      nombre: ganadoLoteForm.nombre,
      categoria: ganadoLoteForm.categoria || '',
      cantidad: Number.isNaN(cantidadValue) ? null : cantidadValue,
      pesoPromedio: Number.isNaN(pesoValue) ? null : pesoValue,
      etapa: ganadoLoteForm.etapa || '',
      notas: ganadoLoteForm.notas || '',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', campoSeleccionado.id), {
        ganadoLotes: arrayUnion(payload),
      })
      setGanadoLoteForm(initialGanadoLoteForm)
    } catch {
      setGanadoError('No se pudo guardar el lote ganadero.')
    }
  }

  const handleGanadoAnimalSubmit = async (event) => {
    event.preventDefault()
    if (!campoSeleccionado || !ganadoAnimalForm.identificador) return
    setGanadoError('')
    if (editGanadoAnimal) {
      await handleUpdateGanado('animal')
      return
    }
    const pesoValue = ganadoAnimalForm.peso
      ? Number(ganadoAnimalForm.peso)
      : null
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      identificador: ganadoAnimalForm.identificador,
      categoria: ganadoAnimalForm.categoria || '',
      sexo: ganadoAnimalForm.sexo || '',
      fechaNacimiento: ganadoAnimalForm.fechaNacimiento || '',
      peso: Number.isNaN(pesoValue) ? null : pesoValue,
      loteId: ganadoAnimalForm.loteId || '',
      origen: ganadoAnimalForm.origen || '',
      estado: ganadoAnimalForm.estado || '',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', campoSeleccionado.id), {
        ganadoAnimales: arrayUnion(payload),
      })
      setGanadoAnimalForm(initialGanadoAnimalForm)
    } catch {
      setGanadoError('No se pudo guardar el animal.')
    }
  }

  const handleGanadoEventoSubmit = async (event) => {
    event.preventDefault()
    if (!campoSeleccionado || !ganadoEventoForm.tipo || !ganadoEventoForm.fecha)
      return
    setGanadoError('')
    if (editGanadoEvento) {
      await handleUpdateGanado('evento')
      return
    }
    const kilosValue = ganadoEventoForm.kilos
      ? Number(ganadoEventoForm.kilos)
      : null
    const costoValue = ganadoEventoForm.costo
      ? Number(ganadoEventoForm.costo)
      : null
    const ingresoValue = ganadoEventoForm.ingreso
      ? Number(ganadoEventoForm.ingreso)
      : null
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      tipo: ganadoEventoForm.tipo,
      fecha: ganadoEventoForm.fecha,
      loteId: ganadoEventoForm.loteId || '',
      animalId: ganadoEventoForm.animalId || '',
      descripcion: ganadoEventoForm.descripcion || '',
      kilos: Number.isNaN(kilosValue) ? null : kilosValue,
      costo: Number.isNaN(costoValue) ? null : costoValue,
      ingreso: Number.isNaN(ingresoValue) ? null : ingresoValue,
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', campoSeleccionado.id), {
        ganadoEventos: arrayUnion(payload),
      })
      setGanadoEventoForm(initialGanadoEventoForm)
    } catch {
      setGanadoError('No se pudo guardar el evento.')
    }
  }

  const handleGanadoPlanSubmit = async (event) => {
    event.preventDefault()
    if (!campoSeleccionado || !ganadoPlanForm.tipo || !ganadoPlanForm.fecha) return
    setGanadoError('')
    if (editGanadoPlan) {
      await handleUpdateGanado('plan')
      return
    }
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      tipo: ganadoPlanForm.tipo,
      fecha: ganadoPlanForm.fecha,
      loteId: ganadoPlanForm.loteId || '',
      responsable: ganadoPlanForm.responsable || '',
      notas: ganadoPlanForm.notas || '',
      estado: ganadoPlanForm.estado || 'pendiente',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', campoSeleccionado.id), {
        ganadoPlanes: arrayUnion(payload),
      })
      setGanadoPlanForm(initialGanadoPlanForm)
    } catch {
      setGanadoError('No se pudo guardar el recordatorio.')
    }
  }

  const handleDeleteGanadoItem = async (key, itemId) => {
    if (!campoSeleccionado) return
    const confirmDelete = window.confirm('Eliminar registro?')
    if (!confirmDelete) return
    const updated = (campoSeleccionado[key] || []).filter((item) => item.id !== itemId)
    await updateDoc(doc(db, 'campos', campoSeleccionado.id), {
      [key]: updated,
    })
  }

  const handleOpenEditGanado = (type, item) => {
    setGanadoError('')
    if (type === 'lote') {
      setEditGanadoLote(item)
      setGanadoLoteForm({
        nombre: item.nombre || '',
        categoria: item.categoria || '',
        cantidad: item.cantidad ?? '',
        pesoPromedio: item.pesoPromedio ?? '',
        etapa: item.etapa || '',
        notas: item.notas || '',
      })
    }
    if (type === 'animal') {
      setEditGanadoAnimal(item)
      setGanadoAnimalForm({
        identificador: item.identificador || '',
        categoria: item.categoria || '',
        sexo: item.sexo || '',
        fechaNacimiento: item.fechaNacimiento || '',
        peso: item.peso ?? '',
        loteId: item.loteId || '',
        origen: item.origen || '',
        estado: item.estado || '',
      })
    }
    if (type === 'evento') {
      setEditGanadoEvento(item)
      setGanadoEventoForm({
        tipo: item.tipo || '',
        fecha: item.fecha || '',
        loteId: item.loteId || '',
        animalId: item.animalId || '',
        descripcion: item.descripcion || '',
        kilos: item.kilos ?? '',
        costo: item.costo ?? '',
        ingreso: item.ingreso ?? '',
      })
    }
    if (type === 'plan') {
      setEditGanadoPlan(item)
      setGanadoPlanForm({
        tipo: item.tipo || '',
        fecha: item.fecha || '',
        loteId: item.loteId || '',
        responsable: item.responsable || '',
        notas: item.notas || '',
        estado: item.estado || 'pendiente',
      })
    }
  }

  const handleUpdateGanado = async (type) => {
    if (!campoSeleccionado) return
    const camposRef = doc(db, 'campos', campoSeleccionado.id)
    try {
      if (type === 'lote' && editGanadoLote) {
        const cantidadValue = ganadoLoteForm.cantidad
          ? Number(ganadoLoteForm.cantidad)
          : null
        const pesoValue = ganadoLoteForm.pesoPromedio
          ? Number(ganadoLoteForm.pesoPromedio)
          : null
        const updated = (campoSeleccionado.ganadoLotes || []).map((item) =>
          item.id === editGanadoLote.id
            ? {
                ...item,
                nombre: ganadoLoteForm.nombre,
                categoria: ganadoLoteForm.categoria || '',
                cantidad: Number.isNaN(cantidadValue) ? null : cantidadValue,
                pesoPromedio: Number.isNaN(pesoValue) ? null : pesoValue,
                etapa: ganadoLoteForm.etapa || '',
                notas: ganadoLoteForm.notas || '',
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoLotes: updated })
        setEditGanadoLote(null)
        setGanadoLoteForm(initialGanadoLoteForm)
      }
      if (type === 'animal' && editGanadoAnimal) {
        const pesoValue = ganadoAnimalForm.peso
          ? Number(ganadoAnimalForm.peso)
          : null
        const updated = (campoSeleccionado.ganadoAnimales || []).map((item) =>
          item.id === editGanadoAnimal.id
            ? {
                ...item,
                identificador: ganadoAnimalForm.identificador,
                categoria: ganadoAnimalForm.categoria || '',
                sexo: ganadoAnimalForm.sexo || '',
                fechaNacimiento: ganadoAnimalForm.fechaNacimiento || '',
                peso: Number.isNaN(pesoValue) ? null : pesoValue,
                loteId: ganadoAnimalForm.loteId || '',
                origen: ganadoAnimalForm.origen || '',
                estado: ganadoAnimalForm.estado || '',
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoAnimales: updated })
        setEditGanadoAnimal(null)
        setGanadoAnimalForm(initialGanadoAnimalForm)
      }
      if (type === 'evento' && editGanadoEvento) {
        const kilosValue = ganadoEventoForm.kilos
          ? Number(ganadoEventoForm.kilos)
          : null
        const costoValue = ganadoEventoForm.costo
          ? Number(ganadoEventoForm.costo)
          : null
        const ingresoValue = ganadoEventoForm.ingreso
          ? Number(ganadoEventoForm.ingreso)
          : null
        const updated = (campoSeleccionado.ganadoEventos || []).map((item) =>
          item.id === editGanadoEvento.id
            ? {
                ...item,
                tipo: ganadoEventoForm.tipo,
                fecha: ganadoEventoForm.fecha,
                loteId: ganadoEventoForm.loteId || '',
                animalId: ganadoEventoForm.animalId || '',
                descripcion: ganadoEventoForm.descripcion || '',
                kilos: Number.isNaN(kilosValue) ? null : kilosValue,
                costo: Number.isNaN(costoValue) ? null : costoValue,
                ingreso: Number.isNaN(ingresoValue) ? null : ingresoValue,
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoEventos: updated })
        setEditGanadoEvento(null)
        setGanadoEventoForm(initialGanadoEventoForm)
      }
      if (type === 'plan' && editGanadoPlan) {
        const updated = (campoSeleccionado.ganadoPlanes || []).map((item) =>
          item.id === editGanadoPlan.id
            ? {
                ...item,
                tipo: ganadoPlanForm.tipo,
                fecha: ganadoPlanForm.fecha,
                loteId: ganadoPlanForm.loteId || '',
                responsable: ganadoPlanForm.responsable || '',
                notas: ganadoPlanForm.notas || '',
                estado: ganadoPlanForm.estado || 'pendiente',
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoPlanes: updated })
        setEditGanadoPlan(null)
        setGanadoPlanForm(initialGanadoPlanForm)
      }
    } catch {
      setGanadoError('No se pudieron guardar los cambios.')
    }
  }

  const stockPorCategoria = () => {
    const animales = campoSeleccionado?.ganadoAnimales || []
    const lotes = campoSeleccionado?.ganadoLotes || []
    const stock = {}
    if (animales.length) {
      animales.forEach((animal) => {
        const key = animal.categoria || 'Sin categoria'
        stock[key] = (stock[key] || 0) + 1
      })
    } else {
      lotes.forEach((lote) => {
        const key = lote.categoria || 'Sin categoria'
        const cantidad = lote.cantidad || 0
        stock[key] = (stock[key] || 0) + cantidad
      })
    }
    return Object.entries(stock)
  }

  const reportesGanado = () => {
    const eventos = campoSeleccionado?.ganadoEventos || []
    const lotes = campoSeleccionado?.ganadoLotes || []
    const map = {}
    eventos.forEach((evento) => {
      const loteId = evento.loteId || 'sin-lote'
      if (!map[loteId]) {
        const lote = lotes.find((item) => item.id === loteId)
        map[loteId] = {
          lote: lote?.nombre || 'Sin lote',
          kilos: 0,
          costos: 0,
          ingresos: 0,
        }
      }
      if (evento.kilos) map[loteId].kilos += evento.kilos
      if (evento.costo) map[loteId].costos += evento.costo
      if (evento.ingreso) map[loteId].ingresos += evento.ingreso
    })
    return Object.values(map)
  }

  const ganadoLotes = campoSeleccionado?.ganadoLotes || []
  const ganadoAnimales = campoSeleccionado?.ganadoAnimales || []
  const ganadoEventos = campoSeleccionado?.ganadoEventos || []
  const ganadoPlanes = campoSeleccionado?.ganadoPlanes || []

  return (
    <div className="page">
      <PageHeader
        title="Gestion ganadera"
        subtitle="Crianza, engorde, faena y trazabilidad."
        actions={
          <select
            className="input"
            value={campoId}
            onChange={(event) => setCampoId(event.target.value)}
          >
            {campos.map((campo) => (
              <option key={campo.id} value={campo.id}>
                {campo.nombre}
              </option>
            ))}
          </select>
        }
      />

      {!campoSeleccionado ? (
        <div className="empty-state">Selecciona un campo para gestionar ganado.</div>
      ) : (
        <div className="section-stack">
          {ganadoError && <p className="form-error">{ganadoError}</p>}

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Lotes ganaderos</h3>
                <span className="section-hint">
                  Crianza, engorde, faenado, venta y distribucion.
                </span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoLoteSubmit}>
              <input
                className="input"
                name="nombre"
                placeholder="Nombre del lote"
                value={ganadoLoteForm.nombre}
                onChange={handleGanadoLoteChange}
                required
              />
              <select
                name="categoria"
                value={ganadoLoteForm.categoria}
                onChange={handleGanadoLoteChange}
              >
                <option value="">Categoria</option>
                {ganadoCategorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                name="cantidad"
                placeholder="Cantidad"
                value={ganadoLoteForm.cantidad}
                onChange={handleGanadoLoteChange}
              />
              <input
                className="input"
                type="number"
                name="pesoPromedio"
                placeholder="Peso promedio (kg)"
                value={ganadoLoteForm.pesoPromedio}
                onChange={handleGanadoLoteChange}
              />
              <select
                name="etapa"
                value={ganadoLoteForm.etapa}
                onChange={handleGanadoLoteChange}
              >
                <option value="">Etapa</option>
                {ganadoEtapas.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </select>
              <textarea
                className="textarea"
                name="notas"
                placeholder="Notas"
                rows={2}
                value={ganadoLoteForm.notas}
                onChange={handleGanadoLoteChange}
              />
              <div className="inline-actions">
                <button className="primary-button small" type="submit">
                  {editGanadoLote ? 'Guardar cambios' : 'Agregar lote'}
                </button>
                {editGanadoLote && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoLote(null)
                      setGanadoLoteForm(initialGanadoLoteForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoLotes.length ? (
                ganadoLotes.map((lote) => (
                  <div className="mini-card" key={lote.id}>
                    <strong>{lote.nombre}</strong>
                    <span>
                      {lote.categoria || 'Sin categoria'} ·{' '}
                      {lote.cantidad ? `${lote.cantidad} animales` : 'Cantidad N/D'}
                    </span>
                    <span>
                      {lote.pesoPromedio
                        ? `${lote.pesoPromedio} kg prom.`
                        : 'Peso N/D'}
                      {lote.etapa ? ` · ${lote.etapa}` : ''}
                    </span>
                    {lote.notas && <span>{lote.notas}</span>}
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado('lote', lote)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => handleDeleteGanadoItem('ganadoLotes', lote.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin lotes ganaderos.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Animales</h3>
                <span className="section-hint">Alta individual y stock por categoria.</span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoAnimalSubmit}>
              <input
                className="input"
                name="identificador"
                placeholder="Identificador / Caravana"
                value={ganadoAnimalForm.identificador}
                onChange={handleGanadoAnimalChange}
                required
              />
              <select
                name="categoria"
                value={ganadoAnimalForm.categoria}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Categoria</option>
                {ganadoCategorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <select
                name="sexo"
                value={ganadoAnimalForm.sexo}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Sexo</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
              <input
                className="input"
                type="date"
                name="fechaNacimiento"
                value={ganadoAnimalForm.fechaNacimiento}
                onChange={handleGanadoAnimalChange}
              />
              <input
                className="input"
                type="number"
                name="peso"
                placeholder="Peso (kg)"
                value={ganadoAnimalForm.peso}
                onChange={handleGanadoAnimalChange}
              />
              <select
                name="loteId"
                value={ganadoAnimalForm.loteId}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Lote ganadero</option>
                {ganadoLotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
              <select
                name="origen"
                value={ganadoAnimalForm.origen}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Origen</option>
                <option value="Nacimiento">Nacimiento</option>
                <option value="Compra">Compra</option>
              </select>
              <select
                name="estado"
                value={ganadoAnimalForm.estado}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Estado</option>
                <option value="Activo">Activo</option>
                <option value="Vendido">Vendido</option>
                <option value="Baja">Baja</option>
              </select>
              <div className="inline-actions">
                <button className="primary-button small" type="submit">
                  {editGanadoAnimal ? 'Guardar cambios' : 'Agregar animal'}
                </button>
                {editGanadoAnimal && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoAnimal(null)
                      setGanadoAnimalForm(initialGanadoAnimalForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoAnimales.length ? (
                ganadoAnimales.map((animal) => (
                  <div className="mini-card" key={animal.id}>
                    <strong>{animal.identificador}</strong>
                    <span>
                      {animal.categoria || 'Sin categoria'} · {animal.sexo || 'Sexo N/D'}
                    </span>
                    <span>
                      {animal.peso ? `${animal.peso} kg` : 'Peso N/D'}
                      {animal.estado ? ` · ${animal.estado}` : ''}
                    </span>
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado('animal', animal)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => handleDeleteGanadoItem('ganadoAnimales', animal.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin animales registrados.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Eventos y trazabilidad</h3>
                <span className="section-hint">
                  Nacimientos, compras, movimientos, pesajes y tratamientos.
                </span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoEventoSubmit}>
              <select
                name="tipo"
                value={ganadoEventoForm.tipo}
                onChange={handleGanadoEventoChange}
                required
              >
                <option value="">Tipo de evento</option>
                {ganadoEventosTipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                name="fecha"
                value={ganadoEventoForm.fecha}
                onChange={handleGanadoEventoChange}
                required
              />
              <select
                name="loteId"
                value={ganadoEventoForm.loteId}
                onChange={handleGanadoEventoChange}
              >
                <option value="">Lote ganadero</option>
                {ganadoLotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
              <select
                name="animalId"
                value={ganadoEventoForm.animalId}
                onChange={handleGanadoEventoChange}
              >
                <option value="">Animal</option>
                {ganadoAnimales.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.identificador}
                  </option>
                ))}
              </select>
              <input
                className="input"
                name="kilos"
                type="number"
                placeholder="Kilos (+/-)"
                value={ganadoEventoForm.kilos}
                onChange={handleGanadoEventoChange}
              />
              <input
                className="input"
                name="costo"
                type="number"
                placeholder="Costo ($)"
                value={ganadoEventoForm.costo}
                onChange={handleGanadoEventoChange}
              />
              <input
                className="input"
                name="ingreso"
                type="number"
                placeholder="Ingreso ($)"
                value={ganadoEventoForm.ingreso}
                onChange={handleGanadoEventoChange}
              />
              <textarea
                className="textarea"
                name="descripcion"
                placeholder="Descripcion"
                rows={2}
                value={ganadoEventoForm.descripcion}
                onChange={handleGanadoEventoChange}
              />
              <div className="inline-actions">
                <button className="primary-button small" type="submit">
                  {editGanadoEvento ? 'Guardar cambios' : 'Agregar evento'}
                </button>
                {editGanadoEvento && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoEvento(null)
                      setGanadoEventoForm(initialGanadoEventoForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoEventos.length ? (
                ganadoEventos.map((evento) => (
                  <div className="mini-card" key={evento.id}>
                    <strong>{evento.tipo}</strong>
                    <span>{evento.fecha}</span>
                    <span>{evento.descripcion || 'Sin descripcion'}</span>
                    <span>
                      {evento.kilos ? `${evento.kilos} kg` : 'Sin kilos'} ·{' '}
                      {evento.costo ? `$ ${evento.costo}` : '$ 0'} ·{' '}
                      {evento.ingreso ? `$ ${evento.ingreso}` : '$ 0'}
                    </span>
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado('evento', evento)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => handleDeleteGanadoItem('ganadoEventos', evento.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin eventos registrados.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Sanidad y recordatorios</h3>
                <span className="section-hint">
                  Vacunas, desparasitacion y controles sanitarios.
                </span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoPlanSubmit}>
              <select
                name="tipo"
                value={ganadoPlanForm.tipo}
                onChange={handleGanadoPlanChange}
                required
              >
                <option value="">Tipo</option>
                {ganadoPlanesTipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                name="fecha"
                value={ganadoPlanForm.fecha}
                onChange={handleGanadoPlanChange}
                required
              />
              <select
                name="loteId"
                value={ganadoPlanForm.loteId}
                onChange={handleGanadoPlanChange}
              >
                <option value="">Lote ganadero</option>
                {ganadoLotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
              <input
                className="input"
                name="responsable"
                placeholder="Responsable"
                value={ganadoPlanForm.responsable}
                onChange={handleGanadoPlanChange}
              />
              <select
                name="estado"
                value={ganadoPlanForm.estado}
                onChange={handleGanadoPlanChange}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en curso">En curso</option>
                <option value="realizada">Realizada</option>
              </select>
              <textarea
                className="textarea"
                name="notas"
                placeholder="Notas"
                rows={2}
                value={ganadoPlanForm.notas}
                onChange={handleGanadoPlanChange}
              />
              <div className="inline-actions">
                <button className="primary-button small" type="submit">
                  {editGanadoPlan ? 'Guardar cambios' : 'Agregar recordatorio'}
                </button>
                {editGanadoPlan && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoPlan(null)
                      setGanadoPlanForm(initialGanadoPlanForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoPlanes.length ? (
                ganadoPlanes.map((plan) => (
                  <div className="mini-card" key={plan.id}>
                    <strong>{plan.tipo}</strong>
                    <span>{plan.fecha}</span>
                    <span>{plan.estado}</span>
                    {plan.notas && <span>{plan.notas}</span>}
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado('plan', plan)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => handleDeleteGanadoItem('ganadoPlanes', plan.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin recordatorios.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Reportes basicos</h3>
                <span className="section-hint">
                  Kilos ganados, costos, ingresos y margen por lote.
                </span>
              </div>
            </div>
            <div className="report-grid">
              <div className="report-card">
                <strong>Stock por categoria</strong>
                <div className="mini-list">
                  {stockPorCategoria().length ? (
                    stockPorCategoria().map(([categoria, total]) => (
                      <span key={categoria}>
                        {categoria}: {total}
                      </span>
                    ))
                  ) : (
                    <span className="detail-muted">Sin datos de stock.</span>
                  )}
                </div>
              </div>
              <div className="report-card">
                <strong>Resumen por lote</strong>
                <div className="mini-list">
                  {reportesGanado().length ? (
                    reportesGanado().map((reporte) => (
                      <span key={reporte.lote}>
                        {reporte.lote}: {reporte.kilos} kg · $ {reporte.ingresos} - $
                        {reporte.costos} = $ {reporte.ingresos - reporte.costos}
                      </span>
                    ))
                  ) : (
                    <span className="detail-muted">Sin reportes disponibles.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ganaderia
