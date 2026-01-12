import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Campos from './pages/Campos.jsx'
import Cultivos from './pages/Cultivos.jsx'
import Tareas from './pages/Tareas.jsx'
import Maquinaria from './pages/Maquinaria.jsx'
import Reportes from './pages/Reportes.jsx'
import Personal from './pages/Personal.jsx'
import Insumos from './pages/Insumos.jsx'
import Proveedores from './pages/Proveedores.jsx'
import Costos from './pages/Costos.jsx'
import Alertas from './pages/Alertas.jsx'
import Campanas from './pages/Campanas.jsx'
import LotesAgricolas from './pages/LotesAgricolas.jsx'
import RegistrosAgricolas from './pages/RegistrosAgricolas.jsx'
import Ganaderia from './pages/Ganaderia.jsx'
import NotFound from './pages/NotFound.jsx'
import BackgroundVideo from './components/BackgroundVideo.jsx'

function App() {
  return (
    <div className="app-root">
      <BackgroundVideo />
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
    </div>
  )
}

export default App
