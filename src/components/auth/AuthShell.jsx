import { Link } from 'react-router-dom'
import Logo from '../common/Logo.jsx'
import GoldDivider from '../common/GoldDivider.jsx'

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1400&q=80'

export default function AuthShell({ title, subtitle, children, footer, image = DEFAULT_IMG }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory">
      <div className="relative bg-black text-ivory lg:min-h-screen grain-overlay overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90" />
        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-16 min-h-[200px] lg:min-h-screen">
          <Link to="/"><Logo size="lg" color="ivory" /></Link>
          <div className="hidden lg:block">
            <GoldDivider />
            <h2 className="font-display text-4xl uppercase tracking-[0.18em] mt-6 leading-tight">
              Luxury<br />Without<br />Compromise
            </h2>
            <p className="text-ivory/60 mt-6 max-w-sm text-sm leading-relaxed">
              Join the Novaël Circle. Access exclusive collections, private events, and your
              personal beauty ritual.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-16 px-6 sm:px-12 bg-ivory text-black">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <Link to="/"><Logo size="md" color="black" /></Link>
          </div>

          <div className="mb-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">{subtitle}</div>
            <h1 className="font-display text-3xl md:text-4xl uppercase tracking-[0.15em]">{title}</h1>
            <GoldDivider className="mt-6" animate={false} />
          </div>

          {children}

          {footer && <div className="mt-10 text-center text-sm text-black/60">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
