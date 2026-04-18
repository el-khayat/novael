export const brand = {
  name: 'Novaël',
  wordmark: 'NOVAËL',
  tagline: 'Your Beauty. Your Rules.',
  description:
    'Luxury magnetic lashes crafted for the modern woman. Glue-free, effortless, reusable up to 30 times.',
  contactEmail: 'hello@novael.com',
  supportEmail: 'care@novael.com',

  founderQuote: {
    text: 'Novaël is not a product — it is a ritual. A quiet pause in your day, where beauty is an act of self-respect.',
    author: 'Aïsha Nour, Founder',
  },

  social: {
    instagram: 'https://instagram.com/novael',
    tiktok: 'https://tiktok.com/@novael',
    pinterest: 'https://pinterest.com/novael',
  },

  values: [
    { label: 'Glue-Free Formula', icon: 'sparkles', description: 'No adhesive. No irritation. Effortless every time.' },
    { label: '30× Reusable', icon: 'refresh', description: 'Investment beauty. Crafted to last the season.' },
    { label: 'Vegan & Cruelty-Free', icon: 'leaf', description: 'Never tested on animals. Ever.' },
  ],

  announcement: [
    'FREE SHIPPING OVER $75',
    'MAGNETIC. NO GLUE. NO LIMITS.',
    'REUSABLE UP TO 30 TIMES',
    'NOVAËL BEAUTY',
  ],

  howItWorks: [
    { step: '01', title: 'Apply The Liner', detail: 'Glide the magnetic liner along your lash line like any eyeliner.' },
    { step: '02', title: 'Wait 30 Seconds', detail: 'Let it dry to a soft matte finish. The magic is in the formula.' },
    { step: '03', title: 'Place The Lashes', detail: 'The lashes snap into place — effortless, perfect, every time.' },
    { step: '04', title: 'Done', detail: 'Wear all day, all night. Remove in seconds. Reuse up to 30 times.' },
  ],
}

export const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Shipping', eta: '5–7 business days', priceText: 'Free over $75 · $5.99 under' },
  { id: 'express', label: 'Express Shipping', eta: '2–3 business days', priceText: '$12.99' },
  { id: 'overnight', label: 'Overnight', eta: 'Next business day', priceText: '$24.99' },
]

export const CATEGORIES = [
  { id: 'lashes', label: 'Lashes' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'kits', label: 'Kits' },
]

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
]
