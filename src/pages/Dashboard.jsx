import { useMemo } from 'react'
import { orderBy, where } from 'firebase/firestore'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js'
import { SkeletonCard } from '../components/Skeleton.jsx'
import { ErrorMessage } from '../components/ErrorMessage.jsx'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

function Dashboard() {
  // Optimizado: queries específicas en vez de 7 listeners completos
  const { data: tareas, loading: loadingTareas } = useFirestoreQuery('tareas', [
    orderBy('createdAt', 'desc'),
  ])
  const { data: maquinaria, loading: loadingMaquinaria } = useFirestoreQuery('maquinaria')
  const { data: insumos, loading: loadingInsumos } = useFirestoreQuery('insumos')
  const { data: alertas } = useFirestoreQuery('alertas', [
    where('leida', '==', false),
    orderBy('createdAt', 'desc'),
  ])

  // Usamos getCountFromServer para colecciones que solo necesitamos contar
  const { data: campos } = useFirestoreQuery('campos')
  const { data: cultivos } = useFirestoreQuery('cultivos')
  const { data: empleados } = useFirestoreQuery('empleados')

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const tareasPendientes = tareas.filter((t) => t.estado === 'Pendiente').length
    const tareasEnCurso = tareas.filter((t) => t.estado === 'En curso').length
    const maquinariaOperativa = maquinaria.filter((m) => m.estado === 'Operativa').length
    const maquinariaFueraServicio = maquinaria.filter(
      (m) => m.estado === 'Fuera de servicio'
    ).length
    const insumosStockBajo = insumos.filter((i) => (i.stock || 0) < (i.stockMinimo || 10)).length

    return {
      campos: campos.length,
      cultivos: cultivos.length,
      tareasPendientes,
      tareasEnCurso,
      tareasTotal: tareas.length,
      maquinaria: maquinaria.length,
      maquinariaOperativa,
      maquinariaFueraServicio,
      personal: empleados.length,
      insumos: insumos.length,
      insumosStockBajo,
      alertasNoLeidas: alertas.length,
    }
  }, [tareas, maquinaria, insumos, campos, cultivos, empleados, alertas])

  // Tareas próximas (próximos 7 días)
  const tareasProximas = useMemo(() => {
    const hoy = new Date()
    const en7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)

    return tareas
      .filter((tarea) => {
        if (!tarea.fecha) return false
        const fechaTarea = new Date(tarea.fecha)
        return fechaTarea >= hoy && fechaTarea <= en7Dias && tarea.estado !== 'Realizada'
      })
      .slice(0, 5)
  }, [tareas])

  // Alertas críticas
  const alertasCriticas = useMemo(() => {
    return alertas.filter((a) => a.prioridad === 'alta').slice(0, 5)
  }, [alertas])

  const loading = loadingTareas || loadingMaquinaria || loadingInsumos

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Dashboard" subtitle="Resumen operativo de campos, cultivos, tareas y costos." />
        <section className="stats-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen operativo de campos, cultivos, tareas y costos."
      />

      <section className="stats-grid">
        <StatCard label="Campos" value={stats.campos} hint="Campos activos" />
        <StatCard label="Cultivos" value={stats.cultivos} hint="Campañas activas" />
        <StatCard
          label="Tareas Pendientes"
          value={stats.tareasPendientes}
          hint={`${stats.tareasEnCurso} en curso`}
        />
        <StatCard
          label="Maquinaria"
          value={stats.maquinariaOperativa}
          hint={`${stats.maquinariaFueraServicio} fuera de servicio`}
        />
        <StatCard label="Personal" value={stats.personal} hint="Empleados activos" />
        <StatCard
          label="Insumos"
          value={stats.insumos}
          hint={stats.insumosStockBajo > 0 ? `${stats.insumosStockBajo} con stock bajo` : 'Stock normal'}
        />
        <StatCard
          label="Alertas"
          value={stats.alertasNoLeidas}
          hint={stats.alertasNoLeidas > 0 ? 'Requieren atención' : 'Sin alertas'}
        />
      </section>

      {/* Sección de Tareas Próximas */}
      {tareasProximas.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Próximas tareas (7 días)</h3>
              <span className="section-hint">Tareas programadas para esta semana</span>
            </div>
          </div>
          <div className="mini-list">
            {tareasProximas.map((tarea) => (
              <div className="mini-card" key={tarea.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {tarea.estado === 'Pendiente' && <Clock size={16} color="#f59e0b" />}
                  {tarea.estado === 'En curso' && <CheckCircle size={16} color="#10b981" />}
                  <strong>{tarea.tipo}</strong>
                </div>
                <span>
                  {tarea.fecha} · {tarea.campo} {tarea.lote && `- ${tarea.lote}`}
                </span>
                <span>{tarea.responsable || 'Sin asignar'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de Alertas Críticas */}
      {alertasCriticas.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Alertas críticas</h3>
              <span className="section-hint">Requieren atención inmediata</span>
            </div>
          </div>
          <div className="mini-list">
            {alertasCriticas.map((alerta) => (
              <div className="mini-card" key={alerta.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#ef4444" />
                  <strong>{alerta.tipo}</strong>
                </div>
                <span>{alerta.mensaje}</span>
                {alerta.fecha && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(alerta.fecha.seconds * 1000).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de Stock Bajo */}
      {stats.insumosStockBajo > 0 && (
        <div className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Insumos con stock bajo</h3>
              <span className="section-hint">{stats.insumosStockBajo} insumos requieren reposición</span>
            </div>
          </div>
          <div className="mini-list">
            {insumos
              .filter((i) => (i.stock || 0) < (i.stockMinimo || 10))
              .slice(0, 5)
              .map((insumo) => (
                <div className="mini-card" key={insumo.id}>
                  <strong>{insumo.nombre}</strong>
                  <span>
                    Stock actual: {insumo.stock || 0} {insumo.unidad || ''} · Mínimo:{' '}
                    {insumo.stockMinimo || 10}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
