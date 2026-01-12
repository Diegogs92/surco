import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Topbar from './Topbar.jsx'
import BottomNav from './BottomNav.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import { Breadcrumbs } from './Breadcrumbs.jsx'
import FloatingWeather from './FloatingWeather.jsx'

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
      <FloatingWeather />
    </div>
  )
}

export default AppLayout
