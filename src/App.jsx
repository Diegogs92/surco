import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import BackgroundVideo from './components/BackgroundVideo.jsx'
import { GlobalSearch } from './components/GlobalSearch.jsx'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js'
import { SkeletonCard } from './components/Skeleton.jsx'

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Campos = lazy(() => import('./pages/Campos.jsx'))
const Cultivos = lazy(() => import('./pages/Cultivos.jsx'))
const Tareas = lazy(() => import('./pages/Tareas.jsx'))
const Maquinaria = lazy(() => import('./pages/Maquinaria.jsx'))
const Reportes = lazy(() => import('./pages/Reportes.jsx'))
const Personal = lazy(() => import('./pages/Personal.jsx'))
const Insumos = lazy(() => import('./pages/Insumos.jsx'))
const Proveedores = lazy(() => import('./pages/Proveedores.jsx'))
const Costos = lazy(() => import('./pages/Costos.jsx'))
const Alertas = lazy(() => import('./pages/Alertas.jsx'))
const Campanas = lazy(() => import('./pages/Campanas.jsx'))
const LotesAgricolas = lazy(() => import('./pages/LotesAgricolas.jsx'))
const RegistrosAgricolas = lazy(() => import('./pages/RegistrosAgricolas.jsx'))
const Ganaderia = lazy(() => import('./pages/Ganaderia.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

// Loading fallback component
function PageLoader() {
  return (
    <div style={{ padding: '20px' }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

function App() {
  useKeyboardShortcuts()

  return (
    <div className="app-root">
      <BackgroundVideo />
      <GlobalSearch />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campos" element={<Campos />} />
              <Route path="/cultivos" element={<Cultivos />} />
              <Route path="/tareas" element={<Tareas />} />
              <Route path="/maquinaria" element={<Maquinaria />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/personal" element={<Personal />} />
              <Route path="/insumos" element={<Insumos />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/costos" element={<Costos />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/campanas" element={<Campanas />} />
              <Route path="/lotes-agricolas" element={<LotesAgricolas />} />
              <Route path="/registros-agricolas" element={<RegistrosAgricolas />} />
              <Route path="/ganaderia" element={<Ganaderia />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
