import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, MessageCircle, Share2 } from 'lucide-react'
import Input, { Textarea } from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import GoldDivider from '../components/common/GoldDivider.jsx'
import { toast } from '../components/ui/Toast.jsx'
import { brand } from '../config/brand'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      toast.success('Message sent', 'We will be in touch shortly.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Could not send', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Contact — Novaël</title></Helmet>
      <section className="pt-[calc(var(--nav-height)+80px)] pb-24 bg-black text-ivory">
        <div className="container-nvl">
          <div className="text-center mb-16">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Say Hello</div>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-[0.15em]">Contact Us</h1>
            <GoldDivider center className="mt-8" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-[0.12em] mb-6">We Would Love To Hear From You</h2>
              <p className="text-ivory/70 leading-relaxed mb-10">
                Whether you have a question about a product, a suggestion, or simply want to share
                your Novaël story — we read every message. Expect a response within 24 hours.
              </p>

              <div className="space-y-6">
                <ContactInfo icon={Mail} label="Customer Care" value={brand.supportEmail} />
                <ContactInfo icon={MessageCircle} label="Press & Partnerships" value={brand.contactEmail} />
                <ContactInfo icon={Share2} label="Follow Us" value="@novael" href={brand.social.instagram} />
              </div>
            </div>

            <form onSubmit={submit} className="bg-ivory/5 border border-gold/10 p-8 space-y-5">
              <Input label="Name" dark required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Email" dark type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Subject" dark value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <Textarea label="Message" dark rows={6} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <Button type="submit" variant="filled" className="w-full" loading={loading}>Send Message</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

function ContactInfo({ icon: Icon, label, value, href }) {
  const Content = (
    <>
      <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gold" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-ivory/50">{label}</div>
        <div className="font-display text-sm uppercase tracking-[0.15em] mt-1">{value}</div>
      </div>
    </>
  )
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:text-gold transition-colors">
      {Content}
    </a>
  ) : (
    <div className="flex items-center gap-4">{Content}</div>
  )
}
