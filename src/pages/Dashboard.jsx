import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'

function Dashboard() {
  const [stats, setStats] = useState({
    campos: 0,
    cultivos: 0,
    tareas: 0,
    maquinaria: 0,
    personal: 0,
    insumos: 0,
    costos: 0,
  })

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(collection(db, 'campos'), (snap) =>
        setStats((prev) => ({ ...prev, campos: snap.size })),
      ),
      onSnapshot(collection(db, 'cultivos'), (snap) =>
        setStats((prev) => ({ ...prev, cultivos: snap.size })),
      ),
      onSnapshot(collection(db, 'tareas'), (snap) =>
        setStats((prev) => ({ ...prev, tareas: snap.size })),
      ),
      onSnapshot(collection(db, 'maquinaria'), (snap) =>
        setStats((prev) => ({ ...prev, maquinaria: snap.size })),
      ),
      onSnapshot(collection(db, 'empleados'), (snap) =>
        setStats((prev) => ({ ...prev, personal: snap.size })),
      ),
      onSnapshot(collection(db, 'insumos'), (snap) =>
        setStats((prev) => ({ ...prev, insumos: snap.size })),
      ),
      onSnapshot(collection(db, 'costos'), (snap) =>
        setStats((prev) => ({ ...prev, costos: snap.size })),
      ),
    ]
    return () => unsubscribers.forEach((unsub) => unsub())
  }, [])

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen operativo de campos, cultivos, tareas y costos."
      />
      <section className="stats-grid">
        <StatCard label="Campos" value={stats.campos} hint="Superficie activa" />
        <StatCard label="Cultivos" value={stats.cultivos} hint="Campanas" />
        <StatCard label="Tareas" value={stats.tareas} hint="Pendientes y en curso" />
        <StatCard
          label="Maquinaria"
          value={stats.maquinaria}
          hint="Unidades registradas"
        />
        <StatCard label="Personal" value={stats.personal} hint="Empleados" />
        <StatCard label="Insumos" value={stats.insumos} hint="En stock" />
        <StatCard label="Costos" value={stats.costos} hint="Registros" />
      </section>
    </div>
  )
}

export default Dashboard
