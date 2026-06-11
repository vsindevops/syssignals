import { ogCard, OG_SIZE } from '@/lib/og'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Systems & Signals — learn by building real systems'

export default function Image() {
  return ogCard({
    title: 'Learn by building real systems.',
    subtitle: 'DevOps · MLOps · AI',
    footer: 'syssignals.com',
  })
}
