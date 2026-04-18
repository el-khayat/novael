import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import CartDrawer from '../cart/CartDrawer.jsx'

export default function MainLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return (
    <div className="min-h-screen flex flex-col bg-black text-ivory">
      <Navbar transparentOnTop={isHome} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
