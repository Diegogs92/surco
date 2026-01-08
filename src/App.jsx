import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Maquinaria from './pages/Maquinaria.jsx'
import NuevoReporte from './pages/NuevoReporte.jsx'
import Reportes from './pages/Reportes.jsx'
import Usuarios from './pages/Usuarios.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/maquinaria" replace />} />
          <Route path="/maquinaria" element={<Maquinaria />} />
          <Route path="/nuevo-reporte" element={<NuevoReporte />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
