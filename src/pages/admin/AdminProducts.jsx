import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAdminProducts } from '../../hooks/useAdmin'
import { formatPrice, slugify, cn } from '../../lib/utils'
import { CATEGORIES } from '../../config/brand'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Input, { Textarea } from '../../components/ui/Input.jsx'
import { toast } from '../../components/ui/Toast.jsx'

const empty = {
  name: '', slug: '', sku: '', description: '', short_desc: '',
  price: 0, compare_price: null, category: 'lashes',
  tags: [], images: [], stock: 0, is_featured: false, is_active: true,
}

export default function AdminProducts() {
  const { products, saveProduct, deleteProduct, toggleActive } = useAdminProducts()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Inventory</div>
          <h1 className="font-display text-3xl uppercase tracking-[0.15em]">Products</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-luxe h-10 text-[10px] bg-gold text-black border-gold">
          <Plus className="w-3.5 h-3.5" /> New Product
        </button>
      </div>

      <div className="bg-admin-surface border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 bg-black/30">
            <tr>
              <th className="py-4 px-4 text-left">Image</th>
              <th className="py-4 px-4 text-left">Product</th>
              <th className="py-4 px-4 text-left">SKU</th>
              <th className="py-4 px-4 text-left">Price</th>
              <th className="py-4 px-4 text-left">Stock</th>
              <th className="py-4 px-4 text-left">Featured</th>
              <th className="py-4 px-4 text-left">Active</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gold/10 hover:bg-gold/5">
                <td className="py-3 px-4">
                  <div className="w-12 h-12 bg-ivory/10 overflow-hidden">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-display uppercase tracking-[0.15em] text-[12px]">{p.name}</div>
                  <div className="text-[10px] text-ivory/50">{p.category}</div>
                </td>
                <td className="py-3 px-4 text-ivory/60 text-xs">{p.sku || '—'}</td>
                <td className="py-3 px-4 text-gold">{formatPrice(p.price)}</td>
                <td className={cn('py-3 px-4', p.stock < 5 ? 'text-rose-nude' : '')}>{p.stock}</td>
                <td className="py-3 px-4">{p.is_featured ? '✦' : '—'}</td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleActive(p.id, !p.is_active)} className="text-ivory/70 hover:text-gold">
                    {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-40" />}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex gap-3">
                    <button onClick={() => setEditing(p)} className="text-ivory/70 hover:text-gold" aria-label="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleting(p)} className="text-ivory/70 hover:text-rose-nude" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-ivory/40">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductModal
        product={editing}
        onClose={() => setEditing(null)}
        onSave={async (p) => {
          try {
            await saveProduct(p)
            toast.success(p.id ? 'Product updated' : 'Product created')
            setEditing(null)
          } catch (err) {
            toast.error('Save failed', err.message)
          }
        }}
      />

      <Modal
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete Product?"
        size="sm"
      >
        {deleting && (
          <>
            <p className="text-black/70 mb-6">
              Delete <span className="font-semibold">{deleting.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button
                variant="filled"
                className="flex-1"
                onClick={async () => {
                  await deleteProduct(deleting.id)
                  toast.success('Product deleted')
                  setDeleting(null)
                }}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || empty)
  const [tagsInput, setTagsInput] = useState('')
  const [imagesInput, setImagesInput] = useState('')

  useEffect(() => {
    if (product) {
      setForm(product)
      setTagsInput((product.tags || []).join(', '))
      setImagesInput((product.images || []).join('\n'))
    }
  }, [product])

  if (!product) return null

  const save = async () => {
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      images: imagesInput.split('\n').map((s) => s.trim()).filter(Boolean),
      price: Number(form.price) || 0,
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: Number(form.stock) || 0,
    }
    await onSave(payload)
  }

  return (
    <Modal
      open={Boolean(product)}
      onOpenChange={(o) => !o && onClose()}
      title={product.id ? 'Edit Product' : 'New Product'}
      size="xl"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Input label="SKU" value={form.sku || ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        <div>
          <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-black/60">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-12 border-b border-black/20 bg-transparent focus:border-black outline-none"
          >
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <Input label="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Input label="Compare Price (optional)" type="number" step="0.01" value={form.compare_price || ''} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
        <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <Input label="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>

      <div className="mt-5">
        <Input label="Short Description" value={form.short_desc || ''} onChange={(e) => setForm({ ...form, short_desc: e.target.value })} />
      </div>

      <div className="mt-5">
        <Textarea label="Description" rows={5} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="mt-5">
        <Textarea label="Images (one URL per line)" rows={4} value={imagesInput} onChange={(e) => setImagesInput(e.target.value)} />
      </div>

      <div className="flex gap-6 mt-5">
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-gold" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-gold" />
          Active
        </label>
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="dark" className="flex-1" onClick={save}>Save Product</Button>
      </div>
    </Modal>
  )
}
