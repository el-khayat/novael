import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import GoldDivider from '../components/common/GoldDivider.jsx'

export default function NotFound() {
  return (
    <>
      <Helmet><title>Not Found — Novaël</title></Helmet>
      <section className="min-h-screen pt-[var(--nav-height)] relative bg-black text-ivory grain-overlay flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.04]">
          <div className="font-display text-[22vw] tracking-[0.1em] uppercase">NOVAËL</div>
        </div>
        <div className="relative container-nvl text-center max-w-2xl">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Lost</div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-[0.15em] leading-tight">
            You've Wandered<br />Somewhere Beautiful<br />But Empty
          </h1>
          <GoldDivider center className="mt-10" />
          <p className="mt-10 text-ivory/60 max-w-md mx-auto">
            The page you were looking for does not exist. Let's get you back to somewhere full of light.
          </p>
          <Link to="/" className="btn-luxe mt-12">Return Home</Link>
        </div>
      </section>
    </>
  )
}
