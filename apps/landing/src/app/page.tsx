import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import SegmentCarousel from '@/components/sections/SegmentCarousel'
import HowItWorks from '@/components/sections/HowItWorks'
import Features from '@/components/sections/Features'
import Comparison from '@/components/sections/Comparison'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import RegistrationForm from '@/components/sections/RegistrationForm'
import Testimonials from '@/components/sections/Testimonials'
const Calculator = dynamic(() => import('@/components/sections/Calculator'))
const TutorialsPreview = dynamic(() => import('@/components/sections/TutorialsPreview'))

export default function LandingPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <SegmentCarousel />
        <HowItWorks />
        <Features />
        <Comparison />
        <Pricing />
        <Calculator />
        <Testimonials />
        <TutorialsPreview />
        <FAQ />
        <RegistrationForm />
      </main>
      <Footer />
    </>
  )
}
