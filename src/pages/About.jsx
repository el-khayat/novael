import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Sparkles, Leaf, Heart } from 'lucide-react'
import { brand } from '../config/brand'
import GoldDivider from '../components/common/GoldDivider.jsx'

const STORY_IMG = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1400&q=80'
const ATELIER_IMG = 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=1400&q=80'

export default function About() {
  return (
    <>
      <Helmet><title>Our Story — Novaël</title></Helmet>

      <section className="relative pt-[calc(var(--nav-height)+80px)] pb-24 bg-black text-ivory grain-overlay">
        <div className="container-nvl text-center max-w-3xl mx-auto">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">The Atelier</div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-[0.15em] leading-tight">Quiet Luxury.<br />Unapologetic Beauty.</h1>
          <GoldDivider center className="mt-10" />
          <p className="mt-10 text-ivory/70 text-lg leading-relaxed">
            Novaël began with a single refusal: that beauty should feel complicated. We imagined a
            lash that needed no glue, no artistry, no compromise — and we spent two years perfecting it.
          </p>
        </div>
      </section>

      <section className="bg-ivory text-black py-24">
        <div className="container-nvl grid lg:grid-cols-2 gap-16 items-center">
          <motion.img
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            src={STORY_IMG}
            alt=""
            className="w-full aspect-[4/5] object-cover"
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Our Founding</div>
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-[0.12em] leading-tight">Born From A Quiet Rebellion</h2>
            <GoldDivider className="my-6" animate={false} />
            <div className="space-y-6 text-black/70 leading-relaxed">
              <p>
                In a market obsessed with excess, we chose restraint. Every material, every fiber,
                every stitch is selected for how it feels — not how loudly it announces itself.
              </p>
              <p>
                Novaël is for the woman who is already enough. Who wants tools — not disguises.
                Who knows that luxury is not about more; it is about better.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-black text-ivory py-24">
        <div className="container-nvl">
          <div className="text-center mb-16">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">What We Believe</div>
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-[0.15em]">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <Value icon={Leaf} title="Sustainable" body="Reusable lashes. Recyclable packaging. Quality that outlasts trends." />
            <Value icon={Heart} title="Vegan" body="No animal inputs. No animal testing. Ever. A quiet kind of kindness." />
            <Value icon={Sparkles} title="Woman-Founded" body="Designed by women, for women — the way beauty always should have been." />
          </div>
        </div>
      </section>

      <section className="bg-ivory text-black py-24">
        <div className="container-nvl max-w-3xl mx-auto text-center">
          <GoldDivider center />
          <blockquote className="mt-10 font-display text-2xl md:text-3xl uppercase tracking-[0.1em] leading-tight">
            "{brand.founderQuote.text}"
          </blockquote>
          <div className="mt-8 text-[11px] uppercase tracking-[0.3em] text-gold">— {brand.founderQuote.author}</div>
        </div>
      </section>

      <section className="relative h-[60vh] overflow-hidden grain-overlay">
        <img src={ATELIER_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </section>
    </>
  )
}

function Value({ icon: Icon, title, body }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="w-14 h-14 mx-auto rounded-full border border-gold/40 flex items-center justify-center mb-6">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <h3 className="font-display text-lg uppercase tracking-[0.2em] mb-3">{title}</h3>
      <p className="text-sm text-ivory/60 leading-relaxed">{body}</p>
    </motion.div>
  )
}
