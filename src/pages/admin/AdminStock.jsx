import { useState } from 'react'
import { useAdminProducts } from '../../hooks/useAdmin'
import { formatDateTime, cn } from '../../lib/utils'
import { toast } from '../../components/ui/Toast.jsx'
import { Check, Pencil } from 'lucide-react'

const REORDER_LEVEL = 5

export default function AdminStock() {
  const { products, updateStock } = useAdminProducts()
  const [editing, setEditing] = useState(null)
  const [value, setValue] = useState(0)

  const save = async (id) => {
    try {
      await updateStock(id, Number(value) || 0)
      toast.success('Stock updated')
      setEditing(null)
    } catch (err) {
      toast.error('Update failed', err.message)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Inventory Health</div>
        <h1 className="font-display text-3xl uppercase tracking-[0.15em]">Stock</h1>
      </div>

      <div className="bg-admin-surface border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 bg-black/30">
            <tr>
              <th className="py-4 px-4 text-left">Product</th>
              <th className="py-4 px-4 text-left">SKU</th>
              <th className="py-4 px-4 text-left">Stock</th>
              <th className="py-4 px-4 text-left">Health</th>
              <th className="py-4 px-4 text-left">Last Updated</th>
              <th className="py-4 px-4 text-right">Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.stock < REORDER_LEVEL
              const health = Math.min(100, (p.stock / 50) * 100)
              return (
                <tr key={p.id} className={cn('border-t border-gold/10', low && 'bg-rose-nude/5')}>
                  <td className="py-3 px-4">
                    <div className="font-display uppercase tracking-[0.15em] text-[12px]">{p.name}</div>
                  </td>
                  <td className="py-3 px-4 text-ivory/60 text-xs">{p.sku || '—'}</td>
                  <td className="py-3 px-4">
                    {editing === p.id ? (
                      <input
                        type="number"
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') save(p.id) }}
                        className="w-24 h-8 bg-transparent border border-gold/40 text-ivory px-2 outline-none focus:border-gold"
                      />
                    ) : (
                      <span className={cn('font-medium', low ? 'text-rose-nude' : 'text-gold')}>{p.stock}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 w-[180px]">
                    <div className="h-1.5 w-full bg-ivory/10 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full', low ? 'bg-rose-nude' : 'bg-gold')}
                        style={{ width: `${Math.max(4, health)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[10px] text-ivory/50">{formatDateTime(p.updated_at)}</td>
                  <td className="py-3 px-4 text-right">
                    {editing === p.id ? (
                      <button onClick={() => save(p.id)} className="text-gold hover:text-ivory">
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => { setEditing(p.id); setValue(p.stock) }} className="text-ivory/60 hover:text-gold">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-ivory/40">No products to manage.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
