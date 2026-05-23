export interface Segment {
  icon: string
  title: string
  description: string
}

export interface Feature {
  icon: string
  title: string
  description: string
  badge?: string
}

export interface PricingPlan {
  name: string
  price: number
  yearlyPrice: number
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  badge?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface Testimonial {
  name: string
  business: string
  text: string
  rating: number
}

export interface ComparisonRow {
  feature: string
  raos: string | boolean
  billz: string | boolean
  yespos: string | boolean
}
