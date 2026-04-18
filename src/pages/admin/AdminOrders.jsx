import { useState, useMemo } from 'react'
import { Download, X } from 'lucide-react'
import { useAdminOrders } from '../../hooks/useAdmin'
import { formatPrice, formatDateTime, formatDate, downloadCSV, cn } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const EDITABLE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrders() {
  const { orders, updateOrder } = useAdminOrders()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [editedStatus, setEditedStatus] = useState('')
  const [editedTracking, setEditedTracking] = useState('')

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  )

  const openOrder = (o) => {
    setSelected(o)
    setEditedStatus(o.status)
    setEditedTracking(o.tracking_number || '')
  }

  const save = async () => {
    await updateOrder(selected.id, { status: editedStatus, tracking_number: editedTracking })
    setSelected(null)
  }

  const exportCSV = () => {
    const rows = filtered.map((o) => ({
      order_number: o.order_number,
      date: formatDate(o.created_at),
      customer: o.profile?.full_name || o.guest_email || '',
      email: o.profile?.email || o.guest_email || '',
      items: (o.items || []).length,
      total: o.total,
      status: o.status,
      payment: o.payment_status,
    }))
    downloadCSV(rows, `orders-${filter}-${Date.now()}.csv`)
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Manage</div>
          <h1 className="font-display text-3xl uppercase tracking-[0.15em]">Orders</h1>
        </div>
        <button onClick={exportCSV} className="btn-luxe h-10 text-[10px] border-gold/40">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-colors',
              filter === s ? 'bg-gold text-black border-gold' : 'border-gold/20 text-ivory/60 hover:border-gold/60',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-admin-surface border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 bg-black/30">
            <tr>
              <th className="py-4 px-4 text-left">Order #</th>
              <th className="py-4 px-4 text-left">Customer</th>
              <th className="py-4 px-4 text-left">Date</th>
              <th className="py-4 px-4 text-left">Items</th>
              <th className="py-4 px-4 text-left">Total</th>
              <th className="py-4 px-4 text-left">Status</th>
              <th className="py-4 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-gold/10 hover:bg-gold/5 cursor-pointer" onClick={() => openOrder(o)}>
                <td className="py-3 px-4 font-display uppercase tracking-[0.15em] text-[12px]">{o.order_number}</td>
                <td className="py-3 px-4 text-ivory/80">{o.profile?.full_name || o.guest_email || '—'}</td>
                <td className="py-3 px-4 text-ivory/60 text-xs">{formatDate(o.created_at)}</td>
                <td className="py-3 px-4 text-ivory/60">{(o.items || []).length}</td>
                <td className="py-3 px-4 text-gold">{formatPrice(o.total)}</td>
                <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                <td className="py-3 px-4 text-right text-[10px] uppercase tracking-[0.2em] text-gold">View</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-ivory/40">No orders match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected ? `Order ${selected.order_number}` : ''}
        size="lg"
      >
        {selected && (
          <div className="space-y-6 text-black">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Customer</div>
                <p>{selected.profile?.full_name || selected.guest_email || '—'}</p>
                <p className="text-black/60 text-sm">{selected.profile?.email || selected.guest_email}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Placed</div>
                <p>{formatDateTime(selected.created_at)}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Ship To</div>
                <p className="text-sm">
                  {selected.shipping_address?.name}<br />
                  {selected.shipping_address?.address1}<br />
                  {selected.shipping_address?.city}, {selected.shipping_address?.zip}<br />
                  {selected.shipping_address?.country}
                </p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Total</div>
                <p className="font-display text-2xl">{formatPrice(selected.total)}</p>
                <p className="text-xs text-black/60 mt-1">
                  Subtotal {formatPrice(selected.subtotal)} · Shipping {formatPrice(selected.shipping_cost)}
                  {selected.discount_amount > 0 && ` · Discount -${formatPrice(selected.discount_amount)}`}
                </p>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Items</div>
              <div className="border border-black/10 divide-y divide-black/10">
                {(selected.items || []).map((it, i) => (
                  <div key={i} className="p-3 flex justify-between text-sm">
                    <span>{it.name}{it.variantName ? ` · ${it.variantName}` : ''} × {it.qty}</span>
                    <span>{formatPrice(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-black/10">
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-black/60 block mb-2">Status</label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="w-full h-11 border border-black/20 bg-transparent px-3 text-sm focus:border-black outline-none"
                >
                  {EDITABLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input
                label="Tracking Number"
                value={editedTracking}
                onChange={(e) => setEditedTracking(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button variant="dark" onClick={save}>Save Changes</Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
