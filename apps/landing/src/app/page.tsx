import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import SegmentCarousel from '@/components/sections/SegmentCarousel'
import HowItWorks from '@/components/sections/HowItWorks'
import Features from '@/components/sections/Features'
import Comparison from '@/components/sections/Comparison'
import Pricing from '@/components/sections/Pricing'
import Testimonials from '@/components/sections/Testimonials'
import FAQ from '@/components/sections/FAQ'
import RegistrationForm from '@/components/sections/RegistrationForm'
import CTASection from '@/components/sections/CTASection'

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <SegmentCarousel />
        <HowItWorks />
        <Features />
        <Comparison />
        <Pricing />
        <Testimonials />
        <FAQ />
        <RegistrationForm />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
