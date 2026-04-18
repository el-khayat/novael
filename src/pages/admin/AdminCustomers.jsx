import { useState, useMemo } from 'react'
import { Download, Search } from 'lucide-react'
import { useAdminCustomers } from '../../hooks/useAdmin'
import { formatPrice, formatDate, downloadCSV, getInitials } from '../../lib/utils'

export default function AdminCustomers() {
  const { customers, loading } = useAdminCustomers()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return customers
    return customers.filter(
      (c) => c.email?.toLowerCase().includes(q) || c.full_name?.toLowerCase().includes(q),
    )
  }, [customers, query])

  const exportCSV = () => {
    const rows = filtered.map((c) => ({
      name: c.full_name || '',
      email: c.email,
      phone: c.phone || '',
      joined: formatDate(c.created_at),
      orders: c.ordersCount,
      total_spent: c.totalSpent.toFixed(2),
      last_order: c.lastOrder ? formatDate(c.lastOrder) : '',
    }))
    downloadCSV(rows, `customers-${Date.now()}.csv`)
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Directory</div>
          <h1 className="font-display text-3xl uppercase tracking-[0.15em]">Customers</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3 border border-gold/20 bg-admin-surface">
            <Search className="w-4 h-4 text-ivory/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email…"
              className="bg-transparent outline-none text-sm w-56"
            />
          </div>
          <button onClick={exportCSV} className="btn-luxe h-10 text-[10px] border-gold/40">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-admin-surface border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 bg-black/30">
            <tr>
              <th className="py-4 px-4 text-left">Customer</th>
              <th className="py-4 px-4 text-left">Email</th>
              <th className="py-4 px-4 text-left">Joined</th>
              <th className="py-4 px-4 text-left">Orders</th>
              <th className="py-4 px-4 text-left">Total Spent</th>
              <th className="py-4 px-4 text-left">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-gold/10 hover:bg-gold/5">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center text-[10px] font-semibold">
                      {getInitials(c.full_name || c.email || 'U')}
                    </div>
                    <span className="font-display uppercase tracking-[0.15em] text-[12px]">{c.full_name || '—'}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-ivory/70">{c.email}</td>
                <td className="py-3 px-4 text-ivory/60 text-xs">{formatDate(c.created_at)}</td>
                <td className="py-3 px-4">{c.ordersCount}</td>
                <td className="py-3 px-4 text-gold">{formatPrice(c.totalSpent)}</td>
                <td className="py-3 px-4 text-ivory/60 text-xs">{c.lastOrder ? formatDate(c.lastOrder) : '—'}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-ivory/40">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
