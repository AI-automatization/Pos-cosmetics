import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import HowItWorks from '@/components/sections/HowItWorks'
import Features from '@/components/sections/Features'
import Comparison from '@/components/sections/Comparison'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import RegistrationForm from '@/components/sections/RegistrationForm'
import Testimonials from '@/components/sections/Testimonials'
import TrustedBy from '@/components/sections/TrustedBy'
const Calculator = dynamic(() => import('@/components/sections/Calculator'))

export default function LandingPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <TrustedBy />
        <Testimonials />
        <HowItWorks />
        <Features />
        <Comparison />
        <Pricing />
        <Calculator />
        <FAQ />
        <RegistrationForm />
      </main>
      <Footer />
    </>
  )
}
