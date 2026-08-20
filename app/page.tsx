import FloatingWellnessStrip from "./components/FloatingWellnessStrip";
import GoalsVisionMission from "./components/GoalsVisionMission";
import HeroSection from "./components/HeroSection";
import LuxuryFAQSection from "./components/LuxuryFAQSection";
import LuxuryFooter from "./components/LuxuryFooter";
import LuxuryNavbar from "./components/Navbar";
import ScientificOverviewSection from "./components/Overview";
import ProductFlavorShowcase from "./components/ProductShowcase";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-ivory">
      <LuxuryNavbar/>
      <HeroSection />
      <FloatingWellnessStrip/>
      <ScientificOverviewSection/>
      <GoalsVisionMission/>
      <ProductFlavorShowcase/>
      <LuxuryFAQSection/>
      <LuxuryFooter/>
      {/* Other sections follow here */}
    </main>
  );
}