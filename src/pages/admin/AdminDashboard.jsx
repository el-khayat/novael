import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAdminStats, useAdminOrders } from '../../hooks/useAdmin'
import { formatPrice, formatDate, cn } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/Badge.jsx'

const COLORS = ['#C6A97A', '#B79BBF', '#A8A17A', '#E8C6C6', '#2D133A']

export default function AdminDashboard() {
  const stats = useAdminStats()
  const { orders } = useAdminOrders()

  const revenueTrend = buildDailyRevenue(orders)
  const statusData = buildStatusData(orders)
  const topProducts = buildTopProducts(orders)

  const percentChange = stats.ordersLastMonth
    ? ((stats.ordersThisMonth - stats.ordersLastMonth) / stats.ordersLastMonth) * 100
    : 0

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Overview</div>
          <h1 className="font-display text-3xl uppercase tracking-[0.15em]">Dashboard</h1>
        </div>
        <div className="text-xs text-ivory/50">{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <KPICard
          label="Revenue (This Month)"
          value={formatPrice(stats.revenueThisMonth || 0)}
          icon={DollarSign}
          accent
          loading={stats.loading}
        />
        <KPICard
          label="Orders (This Month)"
          value={stats.ordersThisMonth}
          icon={ShoppingCart}
          delta={percentChange}
          loading={stats.loading}
        />
        <KPICard label="Total Products" value={stats.totalProducts} icon={Package} loading={stats.loading} />
        <KPICard label="Total Customers" value={stats.totalCustomers} icon={Users} loading={stats.loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        <Panel title="Revenue — Last 30 Days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueTrend}>
              <CartesianGrid stroke="#C6A97A10" vertical={false} />
              <XAxis dataKey="day" stroke="#F6F3EE60" fontSize={11} />
              <YAxis stroke="#F6F3EE60" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#141414', border: '1px solid #C6A97A40', color: '#F6F3EE' }}
                formatter={(v) => formatPrice(v)}
              />
              <Line type="monotone" dataKey="revenue" stroke="#C6A97A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Orders by Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #C6A97A40', color: '#F6F3EE' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-ivory/70">
                <span className="w-3 h-3" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name} · {s.value}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Top Products — Units Sold">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="#C6A97A10" horizontal={false} />
            <XAxis type="number" stroke="#F6F3EE60" fontSize={11} />
            <YAxis type="category" dataKey="name" stroke="#F6F3EE60" fontSize={11} width={180} />
            <Tooltip contentStyle={{ background: '#141414', border: '1px solid #C6A97A40', color: '#F6F3EE' }} />
            <Bar dataKey="units" fill="#C6A97A" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Recent Orders" className="mt-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50">
              <tr>
                <th className="py-3 px-2">Order</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id} className="border-t border-gold/10">
                  <td className="py-3 px-2 font-display uppercase tracking-[0.15em] text-[12px]">{o.order_number}</td>
                  <td className="py-3 px-2 text-ivory/70">{o.profile?.full_name || o.guest_email || '—'}</td>
                  <td className="py-3 px-2 text-ivory/50 text-xs">{formatDate(o.created_at)}</td>
                  <td className="py-3 px-2 text-gold">{formatPrice(o.total)}</td>
                  <td className="py-3 px-2"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-ivory/40">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function KPICard({ label, value, icon: Icon, delta, accent, loading }) {
  const up = delta > 0
  return (
    <div className={cn('bg-admin-surface border p-6 relative', accent ? 'border-gold/40' : 'border-gold/10')}>
      <div className="flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-[0.25em] text-ivory/50">{label}</div>
        {Icon && <Icon className={cn('w-4 h-4', accent ? 'text-gold' : 'text-ivory/40')} />}
      </div>
      <div className={cn('mt-4 font-display text-3xl', accent ? 'text-gold' : '')}>
        {loading ? <span className="skeleton inline-block w-24 h-6" /> : value}
      </div>
      {delta != null && !loading && (
        <div className={cn('mt-2 text-xs flex items-center gap-1', up ? 'text-gold' : 'text-rose-nude')}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(delta).toFixed(1)}% vs last month
        </div>
      )}
    </div>
  )
}

function Panel({ title, children, className }) {
  return (
    <div className={cn('bg-admin-surface border border-gold/10 p-6', className)}>
      <h3 className="font-display text-[11px] uppercase tracking-[0.25em] text-gold mb-5">{title}</h3>
      {children}
    </div>
  )
}

function buildDailyRevenue(orders) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    days.push({ key, day: label, revenue: 0 })
  }
  orders.forEach((o) => {
    const key = new Date(o.created_at).toISOString().slice(0, 10)
    const match = days.find((d) => d.key === key)
    if (match) match.revenue += Number(o.total || 0)
  })
  return days
}

function buildStatusData(orders) {
  const counts = {}
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function buildTopProducts(orders) {
  const counts = {}
  orders.forEach((o) => {
    ;(o.items || []).forEach((it) => {
      const key = it.name
      counts[key] = (counts[key] || 0) + it.qty
    })
  })
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, units]) => ({ name, units }))
}
