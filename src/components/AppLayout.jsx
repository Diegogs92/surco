import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import BottomNav from './BottomNav.jsx'
import OfflineBanner from './OfflineBanner.jsx'

function AppLayout() {
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
    </div>
  )
}

export default AppLayout
