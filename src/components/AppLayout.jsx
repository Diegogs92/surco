import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import BottomNav from './BottomNav.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import FloatingActions from './FloatingActions.jsx'
import MaquinariaModal from './MaquinariaModal.jsx'
import ReporteModal from './ReporteModal.jsx'

function AppLayout() {
  const [openMaquinaria, setOpenMaquinaria] = useState(false)
  const [openReporte, setOpenReporte] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <OfflineBanner />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <FloatingActions
        onNewEquipo={() => setOpenMaquinaria(true)}
        onNewReporte={() => setOpenReporte(true)}
      />
      <MaquinariaModal
        open={openMaquinaria}
        onClose={() => setOpenMaquinaria(false)}
      />
      <ReporteModal open={openReporte} onClose={() => setOpenReporte(false)} />
    </div>
  )
}

export default AppLayout
