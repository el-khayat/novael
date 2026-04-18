import { useState, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Send, Plus, Trash2, Ticket } from 'lucide-react'
import { useAdminSubscribers, useAdminPromos } from '../../hooks/useAdmin'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate, formatDateTime } from '../../lib/utils'
import Input, { Textarea } from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { toast } from '../../components/ui/Toast.jsx'
import Logo from '../../components/common/Logo.jsx'

export default function AdminMarketing() {
  return (
    <div>
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Grow</div>
        <h1 className="font-display text-3xl uppercase tracking-[0.15em]">Marketing</h1>
      </div>

      <Tabs.Root defaultValue="subscribers">
        <Tabs.List className="flex gap-6 border-b border-gold/10 mb-8">
          {[
            { id: 'subscribers', label: 'Subscribers' },
            { id: 'campaign', label: 'Send Campaign' },
            { id: 'logs', label: 'Email Logs' },
            { id: 'promos', label: 'Promo Codes' },
          ].map((t) => (
            <Tabs.Trigger
              key={t.id}
              value={t.id}
              className="pb-4 text-[11px] uppercase tracking-[0.25em] text-ivory/60 hover:text-ivory data-[state=active]:text-gold data-[state=active]:border-b-2 data-[state=active]:border-gold -mb-px transition-colors"
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="subscribers"><Subscribers /></Tabs.Content>
        <Tabs.Content value="campaign"><Campaign /></Tabs.Content>
        <Tabs.Content value="logs"><EmailLogs /></Tabs.Content>
        <Tabs.Content value="promos"><Promos /></Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

function Subscribers() {
  const { subscribers, refresh } = useAdminSubscribers()

  const toggle = async (s) => {
    await supabase.from('subscribers').update({ is_active: !s.is_active }).eq('id', s.id)
    refresh()
  }

  return (
    <div>
      <div className="mb-4 text-xs text-ivory/60 uppercase tracking-[0.2em]">
        Total: <span className="text-gold">{subscribers.length}</span>
      </div>
      <div className="bg-admin-surface border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 bg-black/30">
            <tr>
              <th className="py-4 px-4 text-left">Email</th>
              <th className="py-4 px-4 text-left">Name</th>
              <th className="py-4 px-4 text-left">Source</th>
              <th className="py-4 px-4 text-left">Joined</th>
              <th className="py-4 px-4 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t border-gold/10">
                <td className="py-3 px-4">{s.email}</td>
                <td className="py-3 px-4 text-ivory/60">{s.name || '—'}</td>
                <td className="py-3 px-4 text-ivory/60 text-xs">{s.source}</td>
                <td className="py-3 px-4 text-ivory/60 text-xs">{formatDate(s.created_at)}</td>
                <td className="py-3 px-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={s.is_active} onChange={() => toggle(s)} className="accent-gold" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/60">{s.is_active ? 'Yes' : 'No'}</span>
                  </label>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-ivory/40">No subscribers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Campaign() {
  const { subscribers } = useAdminSubscribers()
  const profile = useAuthStore((s) => s.profile)
  const [audience, setAudience] = useState('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const recipients = subscribers.filter((s) => s.is_active).length

  const send = async () => {
    if (!subject || !message) {
      toast.error('Fill in all fields')
      return
    }
    setSending(true)
    try {
      await supabase.from('email_logs').insert({
        subject,
        recipient_count: recipients,
        sent_by: profile?.id,
      })
      // EMAIL SENDING — Implement via Supabase Edge Function calling Resend API
      toast.success('Campaign queued', `Sent to ${recipients} recipients (pending backend).`)
      setSubject('')
      setMessage('')
    } catch (err) {
      toast.error('Send failed', err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div>
          <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-ivory/70">Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full h-12 bg-transparent border-b border-gold/30 text-ivory focus:border-gold outline-none"
          >
            <option value="all" className="bg-black">All Subscribers ({recipients})</option>
            <option value="customers" className="bg-black">Customers Only</option>
            <option value="segment" className="bg-black">Custom Segment</option>
          </select>
        </div>

        <Input label="Subject" dark value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A quiet luxury update…" />
        <Textarea label="Message" dark rows={10} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message here…" />

        <Button variant="filled" onClick={send} loading={sending} className="w-full">
          <Send className="w-3.5 h-3.5" /> Send To {recipients} Recipients
        </Button>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-3">Preview</div>
        <div className="bg-ivory text-black p-8 shadow-xl">
          <div className="text-center pb-6 border-b border-black/10">
            <Logo size="md" color="black" />
          </div>
          <h2 className="font-display text-2xl uppercase tracking-[0.12em] mt-6 mb-4">
            {subject || 'Your subject line'}
          </h2>
          <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">
            {message || 'Your message body will appear here. Write something beautiful.'}
          </p>
          <div className="mt-10 pt-6 border-t border-black/10 text-[10px] uppercase tracking-[0.25em] text-black/40 text-center">
            © Novaël — <a href="#" className="underline">Unsubscribe</a>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmailLogs() {
  const [logs, setLogs] = useState([])
  useEffect(() => {
    supabase.from('email_logs')
      .select('*, sent_by_profile:profiles!sent_by(full_name, email)')
      .order('sent_at', { ascending: false })
      .then(({ data }) => setLogs(data || []))
  }, [])
  return (
    <div className="bg-admin-surface border border-gold/10 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 bg-black/30">
          <tr>
            <th className="py-4 px-4 text-left">Sent</th>
            <th className="py-4 px-4 text-left">Subject</th>
            <th className="py-4 px-4 text-left">Recipients</th>
            <th className="py-4 px-4 text-left">By</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t border-gold/10">
              <td className="py-3 px-4 text-ivory/60 text-xs">{formatDateTime(l.sent_at)}</td>
              <td className="py-3 px-4">{l.subject}</td>
              <td className="py-3 px-4 text-gold">{l.recipient_count}</td>
              <td className="py-3 px-4 text-ivory/60">{l.sent_by_profile?.full_name || l.sent_by_profile?.email || '—'}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={4} className="py-10 text-center text-ivory/40">No campaigns sent yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Promos() {
  const { promos, savePromo, deletePromo } = useAdminPromos()
  const [editing, setEditing] = useState(null)

  const empty = {
    code: '', discount_type: 'percentage', discount_value: 10,
    min_order: 0, max_uses: null, one_per_user: true, is_active: true, expires_at: null,
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(empty)} className="btn-luxe h-10 text-[10px] bg-gold text-black border-gold">
          <Plus className="w-3.5 h-3.5" /> New Code
        </button>
      </div>

      <div className="bg-admin-surface border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 bg-black/30">
            <tr>
              <th className="py-4 px-4 text-left">Code</th>
              <th className="py-4 px-4 text-left">Type</th>
              <th className="py-4 px-4 text-left">Value</th>
              <th className="py-4 px-4 text-left">Uses</th>
              <th className="py-4 px-4 text-left">Status</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-t border-gold/10">
                <td className="py-3 px-4 font-display uppercase tracking-[0.2em] text-gold">{p.code}</td>
                <td className="py-3 px-4 text-ivory/70 capitalize">{p.discount_type}</td>
                <td className="py-3 px-4">
                  {p.discount_type === 'percentage' ? `${p.discount_value}%` : `$${p.discount_value}`}
                </td>
                <td className="py-3 px-4 text-ivory/70">{p.uses_count} / {p.max_uses || '∞'}</td>
                <td className="py-3 px-4">
                  <Badge variant={p.is_active ? 'outline' : 'muted'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="py-3 px-4 text-right space-x-3">
                  <button onClick={() => setEditing(p)} className="text-ivory/70 hover:text-gold text-[10px] uppercase tracking-[0.2em]">Edit</button>
                  <button onClick={() => deletePromo(p.id)} className="text-ivory/70 hover:text-rose-nude">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-ivory/40">No promo codes yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <PromoModal
        promo={editing}
        onClose={() => setEditing(null)}
        onSave={async (p) => {
          try {
            await savePromo({
              ...p,
              code: String(p.code).toUpperCase().trim(),
              discount_value: Number(p.discount_value),
              min_order: Number(p.min_order) || 0,
              max_uses: p.max_uses ? Number(p.max_uses) : null,
            })
            toast.success('Code saved')
            setEditing(null)
          } catch (err) {
            toast.error('Save failed', err.message)
          }
        }}
      />
    </div>
  )
}

function PromoModal({ promo, onClose, onSave }) {
  const [form, setForm] = useState(promo || {})
  useEffect(() => { setForm(promo || {}) }, [promo])
  if (!promo) return null

  return (
    <Modal open={Boolean(promo)} onOpenChange={(o) => !o && onClose()} title={promo.id ? 'Edit Promo' : 'New Promo'} size="md">
      <div className="space-y-5">
        <Input label="Code" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-black/60">Type</label>
            <select
              value={form.discount_type || 'percentage'}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              className="w-full h-12 border-b border-black/20 bg-transparent focus:border-black outline-none"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <Input label="Value" type="number" value={form.discount_value || 0} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
          <Input label="Min Order" type="number" value={form.min_order || 0} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
          <Input label="Max Uses (optional)" type="number" value={form.max_uses || ''} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <input type="checkbox" checked={form.is_active !== false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-gold" />
            Active
          </label>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <input type="checkbox" checked={form.one_per_user !== false} onChange={(e) => setForm({ ...form, one_per_user: e.target.checked })} className="accent-gold" />
            One per user
          </label>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="dark" className="flex-1" onClick={() => onSave(form)}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}
