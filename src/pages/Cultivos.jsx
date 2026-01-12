import { useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js'
import { useFormValidation } from '../hooks/useFormValidation.js'
import { SkeletonCard } from '../components/Skeleton.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const initialForm = {
  cultivo: 'Soja',
  campana: '',
  campoId: '',
  loteId: '',
  fechaSiembra: '',
  variedad: '',
  fechaCosecha: '',
  rendimientoEsperado: '',
  rendimientoReal: '',
}

const CULTIVOS_OPCIONES = ['Soja', 'Maiz', 'Trigo', 'Girasol', 'Cebada', 'Sorgo', 'Arroz', 'Otro']

function Cultivos() {
  const toast = useToast()
  const { data: cultivos, loading } = useFirestoreQuery('cultivos', [orderBy('createdAt', 'desc')])
  const { data: campos } = useFirestoreQuery('campos')

  const [editCultivo, setEditCultivo] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [cultivoPersonalizado, setCultivoPersonalizado] = useState('')

  // Validaciones
  const validationRules = {
    campana: {
      required: true,
      requiredMessage: 'La campaña es requerida',
      pattern: /^\d{4}\/\d{2,4}$/,
      patternMessage: 'Formato: 2024/25 o 2024/2025',
    },
    fechaSiembra: {
      required: true,
      requiredMessage: 'La fecha de siembra es requerida',
    },
    fechaCosecha: {
      validate: (value, allValues) => {
        if (!value || !allValues.fechaSiembra) return ''
        const siembra = new Date(allValues.fechaSiembra)
        const cosecha = new Date(value)
        if (cosecha <= siembra) {
          return 'La fecha de cosecha debe ser posterior a la siembra'
        }
        const diffDays = (cosecha - siembra) / (1000 * 60 * 60 * 24)
        if (diffDays < 30) {
          return 'Debe haber al menos 30 días entre siembra y cosecha'
        }
        return ''
      },
    },
    rendimientoEsperado: {
      min: 0,
      minMessage: 'El rendimiento debe ser positivo',
    },
    rendimientoReal: {
      min: 0,
      minMessage: 'El rendimiento debe ser positivo',
    },
  }

  const form = useFormValidation(initialForm, validationRules)
  const editForm = useFormValidation(initialForm, validationRules)

  // Lotes disponibles según campo seleccionado
  const lotesDisponibles = useMemo(() => {
    if (!form.values.campoId) return []
    const campoSeleccionado = campos.find((c) => c.id === form.values.campoId)
    return campoSeleccionado?.lotes || []
  }, [form.values.campoId, campos])

  const lotesDisponiblesEdit = useMemo(() => {
    if (!editForm.values.campoId) return []
    const campoSeleccionado = campos.find((c) => c.id === editForm.values.campoId)
    return campoSeleccionado?.lotes || []
  }, [editForm.values.campoId, campos])

  // Estadísticas
  const stats = useMemo(() => {
    const totalCultivos = cultivos.length
    const conRendimientoReal = cultivos.filter((c) => c.rendimientoReal > 0).length
    const rendimientoPromedio =
      cultivos.reduce((sum, c) => sum + (c.rendimientoReal || 0), 0) / (conRendimientoReal || 1)
    const superaronExpectativa = cultivos.filter(
      (c) => c.rendimientoReal > 0 && c.rendimientoReal >= c.rendimientoEsperado
    ).length

    return {
      total: totalCultivos,
      conRendimiento: conRendimientoReal,
      promedio: rendimientoPromedio.toFixed(2),
      exito: conRendimientoReal > 0 ? ((superaronExpectativa / conRendimientoReal) * 100).toFixed(0) : 0,
    }
  }, [cultivos])

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const cultivoFinal = values.cultivo === 'Otro' ? cultivoPersonalizado : values.cultivo

      await addDoc(collection(db, 'cultivos'), {
        ...values,
        cultivo: cultivoFinal,
        rendimientoEsperado: Number(values.rendimientoEsperado || 0),
        rendimientoReal: Number(values.rendimientoReal || 0),
        createdAt: serverTimestamp(),
      })

      form.reset()
      setCultivoPersonalizado('')
      toast.success('Cultivo guardado correctamente')
    } catch (error) {
      console.error('Error guardando cultivo:', error)
      toast.error('No se pudo guardar el cultivo')
    }
  })

  const openEdit = (cultivo) => {
    setEditCultivo(cultivo)
    editForm.setFieldValue('cultivo', cultivo.cultivo || 'Soja')
    editForm.setFieldValue('campana', cultivo.campana || '')
    editForm.setFieldValue('campoId', cultivo.campoId || '')
    editForm.setFieldValue('loteId', cultivo.loteId || '')
    editForm.setFieldValue('fechaSiembra', cultivo.fechaSiembra || '')
    editForm.setFieldValue('variedad', cultivo.variedad || '')
    editForm.setFieldValue('fechaCosecha', cultivo.fechaCosecha || '')
    editForm.setFieldValue('rendimientoEsperado', cultivo.rendimientoEsperado || '')
    editForm.setFieldValue('rendimientoReal', cultivo.rendimientoReal || '')
  }

  const handleEditSubmit = editForm.handleSubmit(async (values) => {
    if (!editCultivo) return

    try {
      await updateDoc(doc(db, 'cultivos', editCultivo.id), {
        ...values,
        rendimientoEsperado: Number(values.rendimientoEsperado || 0),
        rendimientoReal: Number(values.rendimientoReal || 0),
      })

      setEditCultivo(null)
      editForm.reset()
      toast.success('Cultivo actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando cultivo:', error)
      toast.error('No se pudo actualizar el cultivo')
    }
  })

  const handleDelete = async () => {
    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, 'cultivos', confirmDelete.id))
      setConfirmDelete(null)
      toast.success('Cultivo eliminado correctamente')
    } catch (error) {
      console.error('Error eliminando cultivo:', error)
      toast.error('No se pudo eliminar el cultivo')
    }
  }

  // Indicador de rendimiento
  const getRendimientoIndicator = (cultivo) => {
    if (!cultivo.rendimientoReal || !cultivo.rendimientoEsperado) return null

    const diferencia = cultivo.rendimientoReal - cultivo.rendimientoEsperado
    const porcentaje = ((diferencia / cultivo.rendimientoEsperado) * 100).toFixed(1)

    if (diferencia > 0) {
      return (
        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={16} />
          +{porcentaje}%
        </span>
      )
    } else if (diferencia < 0) {
      return (
        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingDown size={16} />
          {porcentaje}%
        </span>
      )
    } else {
      return (
        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Minus size={16} />
          0%
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Cultivos" subtitle="Gestiona campañas y fechas de siembra/cosecha." />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Cultivos"
        subtitle="Gestiona campañas y fechas de siembra/cosecha."
      />

      {/* Estadísticas */}
      <section className="stats-grid">
        <StatCard label="Total Cultivos" value={stats.total} hint="Campañas registradas" />
        <StatCard label="Con Rendimiento" value={stats.conRendimiento} hint="Cosechados" />
        <StatCard label="Rendimiento Promedio" value={`${stats.promedio} t/ha`} hint="Media general" />
        <StatCard label="Tasa de Éxito" value={`${stats.exito}%`} hint="Superaron expectativa" />
      </section>

      <section className="two-column">
        <div className="card">
          <h2>Nuevo cultivo</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select
              className="input"
              name="cultivo"
              value={form.values.cultivo}
              onChange={form.handleChange}
            >
              {CULTIVOS_OPCIONES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {form.values.cultivo === 'Otro' && (
              <input
                className="input"
                placeholder="Especificar cultivo"
                value={cultivoPersonalizado}
                onChange={(e) => setCultivoPersonalizado(e.target.value)}
                required
              />
            )}

            <input
              className="input"
              name="campana"
              placeholder="Campaña (2024/25)"
              value={form.values.campana}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
            {form.errors.campana && form.touched.campana && (
              <p className="form-error">{form.errors.campana}</p>
            )}

            <select
              className="input"
              name="campoId"
              value={form.values.campoId}
              onChange={form.handleChange}
            >
              <option value="">Campo (opcional)</option>
              {campos.map((campo) => (
                <option key={campo.id} value={campo.id}>
                  {campo.nombre}
                </option>
              ))}
            </select>

            {lotesDisponibles.length > 0 && (
              <select
                className="input"
                name="loteId"
                value={form.values.loteId}
                onChange={form.handleChange}
              >
                <option value="">Lote (opcional)</option>
                {lotesDisponibles.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
            )}

            <input
              className="input"
              type="date"
              name="fechaSiembra"
              value={form.values.fechaSiembra}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
            {form.errors.fechaSiembra && form.touched.fechaSiembra && (
              <p className="form-error">{form.errors.fechaSiembra}</p>
            )}

            <input
              className="input"
              name="variedad"
              placeholder="Variedad"
              value={form.values.variedad}
              onChange={form.handleChange}
            />

            <input
              className="input"
              type="date"
              name="fechaCosecha"
              value={form.values.fechaCosecha}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
            {form.errors.fechaCosecha && form.touched.fechaCosecha && (
              <p className="form-error">{form.errors.fechaCosecha}</p>
            )}

            <input
              className="input"
              type="number"
              step="0.01"
              name="rendimientoEsperado"
              placeholder="Rendimiento esperado (t/ha)"
              value={form.values.rendimientoEsperado}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
            {form.errors.rendimientoEsperado && form.touched.rendimientoEsperado && (
              <p className="form-error">{form.errors.rendimientoEsperado}</p>
            )}

            <input
              className="input"
              type="number"
              step="0.01"
              name="rendimientoReal"
              placeholder="Rendimiento real (t/ha)"
              value={form.values.rendimientoReal}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
            {form.errors.rendimientoReal && form.touched.rendimientoReal && (
              <p className="form-error">{form.errors.rendimientoReal}</p>
            )}

            <button className="primary-button" type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Guardando...' : 'Guardar cultivo'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Campañas</h2>
          {cultivos.length === 0 ? (
            <div className="empty-state">No hay cultivos registrados.</div>
          ) : (
            <div className="table">
              {cultivos.map((cultivo) => {
                const campo = campos.find((c) => c.id === cultivo.campoId)
                const lote = campo?.lotes?.find((l) => l.id === cultivo.loteId)

                return (
                  <div className="table-row" key={cultivo.id}>
                    <div>
                      <strong>{cultivo.cultivo}</strong>
                      <span>{cultivo.campana}</span>
                      {campo && (
                        <span>
                          {campo.nombre}
                          {lote && ` - ${lote.nombre}`}
                        </span>
                      )}
                    </div>
                    <div>
                      <span>Siembra: {cultivo.fechaSiembra || 'Sin fecha'}</span>
                      <span>Cosecha: {cultivo.fechaCosecha || 'Sin fecha'}</span>
                      {cultivo.variedad && <span>Var: {cultivo.variedad}</span>}
                    </div>
                    <div>
                      <span>Esperado: {cultivo.rendimientoEsperado} t/ha</span>
                      <span>Real: {cultivo.rendimientoReal || 0} t/ha</span>
                      {getRendimientoIndicator(cultivo)}
                    </div>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => openEdit(cultivo)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => setConfirmDelete(cultivo)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal de edición */}
      <Modal
        open={Boolean(editCultivo)}
        title="Editar cultivo"
        onClose={() => {
          setEditCultivo(null)
          editForm.reset()
        }}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-cultivo-form"
            disabled={editForm.isSubmitting}
          >
            {editForm.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form className="form-grid" id="edit-cultivo-form" onSubmit={handleEditSubmit}>
          <select
            className="input"
            name="cultivo"
            value={editForm.values.cultivo}
            onChange={editForm.handleChange}
          >
            {CULTIVOS_OPCIONES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            className="input"
            name="campana"
            placeholder="Campaña (2024/25)"
            value={editForm.values.campana}
            onChange={editForm.handleChange}
            onBlur={editForm.handleBlur}
          />
          {editForm.errors.campana && editForm.touched.campana && (
            <p className="form-error">{editForm.errors.campana}</p>
          )}

          <select
            className="input"
            name="campoId"
            value={editForm.values.campoId}
            onChange={editForm.handleChange}
          >
            <option value="">Campo (opcional)</option>
            {campos.map((campo) => (
              <option key={campo.id} value={campo.id}>
                {campo.nombre}
              </option>
            ))}
          </select>

          {lotesDisponiblesEdit.length > 0 && (
            <select
              className="input"
              name="loteId"
              value={editForm.values.loteId}
              onChange={editForm.handleChange}
            >
              <option value="">Lote (opcional)</option>
              {lotesDisponiblesEdit.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.nombre}
                </option>
              ))}
            </select>
          )}

          <input
            className="input"
            type="date"
            name="fechaSiembra"
            value={editForm.values.fechaSiembra}
            onChange={editForm.handleChange}
            onBlur={editForm.handleBlur}
          />
          {editForm.errors.fechaSiembra && editForm.touched.fechaSiembra && (
            <p className="form-error">{editForm.errors.fechaSiembra}</p>
          )}

          <input
            className="input"
            name="variedad"
            placeholder="Variedad"
            value={editForm.values.variedad}
            onChange={editForm.handleChange}
          />

          <input
            className="input"
            type="date"
            name="fechaCosecha"
            value={editForm.values.fechaCosecha}
            onChange={editForm.handleChange}
            onBlur={editForm.handleBlur}
          />
          {editForm.errors.fechaCosecha && editForm.touched.fechaCosecha && (
            <p className="form-error">{editForm.errors.fechaCosecha}</p>
          )}

          <input
            className="input"
            type="number"
            step="0.01"
            name="rendimientoEsperado"
            placeholder="Rendimiento esperado (t/ha)"
            value={editForm.values.rendimientoEsperado}
            onChange={editForm.handleChange}
            onBlur={editForm.handleBlur}
          />

          <input
            className="input"
            type="number"
            step="0.01"
            name="rendimientoReal"
            placeholder="Rendimiento real (t/ha)"
            value={editForm.values.rendimientoReal}
            onChange={editForm.handleChange}
            onBlur={editForm.handleBlur}
          />
        </form>
      </Modal>

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar cultivo"
        message={`¿Estás seguro de eliminar el cultivo ${confirmDelete?.cultivo} de la campaña ${confirmDelete?.campana}?`}
        variant="danger"
      />
    </div>
  )
}

export default Cultivos
