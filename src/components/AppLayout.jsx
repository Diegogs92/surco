import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Topbar from './Topbar.jsx'
import BottomNav from './BottomNav.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import { Breadcrumbs } from './Breadcrumbs.jsx'

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-main">
        <Topbar />
        <OfflineBanner />
        <main className="content">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default AppLayout
