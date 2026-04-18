import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Archive, Users, Mail, LogOut } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { useAuthStore } from '../../store/authStore'
import { cn, getInitials } from '../../lib/utils'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/stock', label: 'Stock', icon: Archive },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/marketing', label: 'Marketing', icon: Mail },
]

export default function AdminLayout() {
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-admin-bg text-ivory flex">
      <aside className="w-[240px] bg-admin-bg border-r border-gold/10 flex flex-col fixed h-screen">
        <div className="px-7 py-7 border-b border-gold/10">
          <Logo size="md" color="gold" />
          <div className="text-[9px] uppercase tracking-[0.3em] text-ivory/40 mt-2">Atelier</div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {links.map((l) => {
            const Icon = l.icon
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-[0.2em] font-medium transition-all',
                    isActive
                      ? 'bg-gold/10 text-gold border-l-2 border-gold'
                      : 'text-ivory/60 hover:text-ivory hover:bg-admin-surface border-l-2 border-transparent',
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-5 border-t border-gold/10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-ivory/60 hover:text-gold text-[11px] uppercase tracking-[0.25em]">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 pl-[240px]">
        <header className="h-[70px] border-b border-gold/10 bg-admin-bg/80 backdrop-blur flex items-center justify-end px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{profile?.full_name || 'Admin'}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold">{profile?.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center font-display font-semibold text-sm">
              {getInitials(profile?.full_name || profile?.email || 'A')}
            </div>
          </div>
        </header>
        <main className="p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
