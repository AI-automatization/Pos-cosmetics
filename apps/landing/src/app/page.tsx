import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import SegmentCarousel from '@/components/sections/SegmentCarousel'
import HowItWorks from '@/components/sections/HowItWorks'
import Features from '@/components/sections/Features'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import RegistrationForm from '@/components/sections/RegistrationForm'
const Calculator = dynamic(() => import('@/components/sections/Calculator'))
const TutorialsPreview = dynamic(() => import('@/components/sections/TutorialsPreview'))

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <SegmentCarousel />
        <HowItWorks />
        <Features />
        <Pricing />
        <Calculator />
        <TutorialsPreview />
        <FAQ />
        <RegistrationForm />
      </main>
      <Footer />
    </>
  )
}
