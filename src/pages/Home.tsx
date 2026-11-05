import { Hero } from '../components/home/Hero'
import { ServiceGrid } from '../components/home/ServiceGrid'
import { StatsBand } from '../components/home/StatsBand'
import { MarketSection } from '../components/home/MarketSection'
import { SupplyDemandSection } from '../components/home/SupplyDemandSection'
import { MachineryShowcase } from '../components/home/MachineryShowcase'
import { ProductShowcase } from '../components/home/ProductShowcase'
import { NewsSection } from '../components/home/NewsSection'
import { CtaBand } from '../components/home/CtaBand'

export default function Home() {
  return (
    <>
      <Hero />
      <ServiceGrid />
      <StatsBand />
      <MarketSection />
      <SupplyDemandSection />
      <MachineryShowcase />
      <ProductShowcase />
      <NewsSection />
      <CtaBand />
    </>
  )
}
