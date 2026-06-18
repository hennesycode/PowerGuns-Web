import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { ServicesSection } from "@/components/home/ServicesSection";
import { PackagesSection } from "@/components/home/PackagesSection";
import { SafetySection } from "@/components/home/SafetySection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { GallerySection } from "@/components/home/GallerySection";
import { CTABand } from "@/components/home/CTABand";
import { BookingPanel } from "@/components/home/BookingPanel";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <ServicesSection />
      <PackagesSection />
      <SafetySection />
      <HowItWorksSection />
      <GallerySection />
      <CTABand />
      <BookingPanel />
      <ContactSection />
    </>
  );
}
