import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { BulletScrollDivider } from "@/components/home/BulletScrollDivider";
import { InfoSpotlightSection } from "@/components/home/InfoSpotlightSection";
import { ServicesProfessionalSection } from "@/components/home/ServicesProfessionalSection";
import { AboutSection } from "@/components/home/AboutSection";
import { CTABand } from "@/components/home/CTABand";
import { GallerySection } from "@/components/home/GallerySection";
import { SafetyRulesSection } from "@/components/home/SafetyRulesSection";
import { LocationSection } from "@/components/home/LocationSection";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <BulletScrollDivider />
      <InfoSpotlightSection />
      <ServicesProfessionalSection />
      <AboutSection />
      <CTABand />
      <GallerySection />
      <SafetyRulesSection />
      <LocationSection />
      <HomeFooter />
    </>
  );
}
