export const SOURCE_COLORS = {
  GTM: { fg: '#4c6ef5', bg: 'rgba(76, 110, 245, 0.1)', border: 'rgba(76, 110, 245, 0.35)' },
  'Server GTM': { fg: '#3653c4', bg: 'rgba(54, 83, 196, 0.1)', border: 'rgba(54, 83, 196, 0.35)' },
  GA4: { fg: '#e8590c', bg: 'rgba(232, 89, 12, 0.1)', border: 'rgba(232, 89, 12, 0.35)' },
  'Meta Pixel': { fg: '#1877f2', bg: 'rgba(24, 119, 242, 0.1)', border: 'rgba(24, 119, 242, 0.35)' },
  'Meta CAPI': { fg: '#0a57c6', bg: 'rgba(10, 87, 198, 0.1)', border: 'rgba(10, 87, 198, 0.35)' },
  Clarity: { fg: '#7048e8', bg: 'rgba(112, 72, 232, 0.1)', border: 'rgba(112, 72, 232, 0.35)' },
}

export const STATUS_META = {
  browsing: { label: 'Browsing', fg: '#2f7bd4', bg: 'rgba(47, 123, 212, 0.1)' },
  checkout: { label: 'In checkout', fg: '#e8590c', bg: 'rgba(232, 89, 12, 0.12)' },
  purchased: { label: 'Purchased', fg: '#1a9e52', bg: 'rgba(37, 211, 102, 0.1)' },
  idle: { label: 'Went idle', fg: '#8a6a1f', bg: 'rgba(138, 106, 31, 0.1)' },
}

export const INITIAL_SESSIONS = [
  {
    id: 's1',
    visitor: 'Visitor 7f2a',
    source: 'Google Ads',
    device: 'iPhone · Safari',
    entryPage: '/packages/kerala-honeymoon',
    status: 'checkout',
    events: [
      { minutesAgo: 22, platform: 'GTM', label: 'Landed on page', page: '/packages/kerala-honeymoon' },
      { minutesAgo: 22, platform: 'GA4', label: 'page_view', page: '/packages/kerala-honeymoon' },
      { minutesAgo: 22, platform: 'Meta Pixel', label: 'ViewContent', page: '/packages/kerala-honeymoon' },
      { minutesAgo: 19, platform: 'Clarity', label: 'Scrolled to pricing table', page: '/packages/kerala-honeymoon' },
      { minutesAgo: 15, platform: 'GTM', label: 'Clicked "Check dates"', page: '/packages/kerala-honeymoon' },
      { minutesAgo: 12, platform: 'GA4', label: 'page_view', page: '/packages/kerala-honeymoon/dates' },
      { minutesAgo: 8, platform: 'GTM', label: 'Clicked "Add to cart"', page: '/packages/kerala-honeymoon/dates' },
      { minutesAgo: 8, platform: 'GA4', label: 'add_to_cart', page: '/packages/kerala-honeymoon/dates' },
      { minutesAgo: 8, platform: 'Meta Pixel', label: 'AddToCart', page: '/packages/kerala-honeymoon/dates' },
      { minutesAgo: 3, platform: 'GTM', label: 'Started checkout', page: '/checkout' },
      { minutesAgo: 3, platform: 'GA4', label: 'begin_checkout', page: '/checkout' },
      { minutesAgo: 3, platform: 'Server GTM', label: 'begin_checkout (server copy)', page: '/checkout' },
      { minutesAgo: 3, platform: 'Meta CAPI', label: 'InitiateCheckout', page: '/checkout' },
    ],
  },
  {
    id: 's2',
    visitor: 'Visitor c114',
    source: 'Organic Search',
    device: 'Windows · Chrome',
    entryPage: '/',
    status: 'purchased',
    events: [
      { minutesAgo: 41, platform: 'GTM', label: 'Landed on page', page: '/' },
      { minutesAgo: 41, platform: 'GA4', label: 'page_view', page: '/' },
      { minutesAgo: 38, platform: 'GTM', label: 'Clicked "Goa Packages"', page: '/' },
      { minutesAgo: 37, platform: 'GA4', label: 'page_view', page: '/packages/goa-beach-escape' },
      { minutesAgo: 30, platform: 'GTM', label: 'Clicked "Add to cart"', page: '/packages/goa-beach-escape' },
      { minutesAgo: 30, platform: 'GA4', label: 'add_to_cart', page: '/packages/goa-beach-escape' },
      { minutesAgo: 30, platform: 'Meta Pixel', label: 'AddToCart', page: '/packages/goa-beach-escape' },
      { minutesAgo: 24, platform: 'GTM', label: 'Started checkout', page: '/checkout' },
      { minutesAgo: 24, platform: 'GA4', label: 'begin_checkout', page: '/checkout' },
      { minutesAgo: 24, platform: 'Server GTM', label: 'begin_checkout (server copy)', page: '/checkout' },
      { minutesAgo: 24, platform: 'Meta CAPI', label: 'InitiateCheckout', page: '/checkout' },
      { minutesAgo: 17, platform: 'GTM', label: 'Completed payment', page: '/checkout/success' },
      { minutesAgo: 17, platform: 'GA4', label: 'purchase — ₹42,000', page: '/checkout/success' },
      { minutesAgo: 17, platform: 'Server GTM', label: 'purchase (server copy, deduped)', page: '/checkout/success' },
      { minutesAgo: 17, platform: 'Meta CAPI', label: 'Purchase — ₹42,000', page: '/checkout/success' },
    ],
  },
  {
    id: 's3',
    visitor: 'Visitor 9d3e',
    source: 'Meta Ads',
    device: 'Android · Chrome',
    entryPage: '/offers/monsoon-sale',
    status: 'idle',
    events: [
      { minutesAgo: 54, platform: 'GTM', label: 'Landed on page', page: '/offers/monsoon-sale' },
      { minutesAgo: 54, platform: 'GA4', label: 'page_view', page: '/offers/monsoon-sale' },
      { minutesAgo: 54, platform: 'Meta Pixel', label: 'ViewContent', page: '/offers/monsoon-sale' },
      { minutesAgo: 53, platform: 'Clarity', label: 'Rage-clicked "Claim offer" (3x)', page: '/offers/monsoon-sale' },
      { minutesAgo: 52, platform: 'GTM', label: 'Exited tab', page: '/offers/monsoon-sale' },
    ],
  },
  {
    id: 's4',
    visitor: 'Visitor 118b',
    source: 'Direct',
    device: 'Mac · Safari',
    entryPage: '/packages',
    status: 'browsing',
    events: [
      { minutesAgo: 9, platform: 'GTM', label: 'Landed on page', page: '/packages' },
      { minutesAgo: 9, platform: 'GA4', label: 'page_view', page: '/packages' },
      { minutesAgo: 7, platform: 'GTM', label: 'Filtered by "Hill stations"', page: '/packages' },
      { minutesAgo: 5, platform: 'GA4', label: 'page_view', page: '/packages/munnar-tea-trails' },
      { minutesAgo: 2, platform: 'Clarity', label: 'Watched itinerary video, 40s', page: '/packages/munnar-tea-trails' },
    ],
  },
  {
    id: 's5',
    visitor: 'Visitor 5aa1',
    source: 'Referral — travelblog.in',
    device: 'iPad · Safari',
    entryPage: '/packages/andaman-island-hop',
    status: 'idle',
    events: [
      { minutesAgo: 70, platform: 'GTM', label: 'Landed on page', page: '/packages/andaman-island-hop' },
      { minutesAgo: 70, platform: 'GA4', label: 'page_view', page: '/packages/andaman-island-hop' },
      { minutesAgo: 63, platform: 'GTM', label: 'Clicked "Add to cart"', page: '/packages/andaman-island-hop' },
      { minutesAgo: 63, platform: 'GA4', label: 'add_to_cart', page: '/packages/andaman-island-hop' },
      { minutesAgo: 63, platform: 'Meta Pixel', label: 'AddToCart', page: '/packages/andaman-island-hop' },
      { minutesAgo: 58, platform: 'GTM', label: 'Started checkout', page: '/checkout' },
      { minutesAgo: 58, platform: 'GA4', label: 'begin_checkout', page: '/checkout' },
      { minutesAgo: 58, platform: 'Server GTM', label: 'begin_checkout (server copy)', page: '/checkout' },
      { minutesAgo: 56, platform: 'Clarity', label: 'Left checkout tab idle', page: '/checkout' },
    ],
  },
]

const NEXT_EVENT_POOL = {
  browsing: [
    { platform: 'GTM', label: 'Clicked a package thumbnail', page: '/packages' },
    { platform: 'GA4', label: 'page_view', page: '/packages/wayanad-wildlife-trail' },
    { platform: 'Clarity', label: 'Scrolled past 75% of page', page: '/packages/wayanad-wildlife-trail' },
  ],
  checkout: [
    { platform: 'Server GTM', label: 'Payment method selected', page: '/checkout' },
    { platform: 'GA4', label: 'add_payment_info', page: '/checkout' },
    { platform: 'Meta CAPI', label: 'AddPaymentInfo', page: '/checkout' },
  ],
}

export function createLiveEvent(sessions) {
  const eligible = sessions.filter((s) => s.status === 'browsing' || s.status === 'checkout')
  if (eligible.length === 0) return null
  const session = eligible[Math.floor(Math.random() * eligible.length)]
  const pool = NEXT_EVENT_POOL[session.status]
  const template = pool[Math.floor(Math.random() * pool.length)]
  return { sessionId: session.id, visitor: session.visitor, minutesAgo: 0, ...template }
}
