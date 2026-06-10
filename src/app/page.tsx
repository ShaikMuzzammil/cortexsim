import Navbar from "@/components/landing/Navbar";
import ScrollProgress from "@/components/landing/ScrollProgress";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import PlatformPreview from "@/components/landing/PlatformPreview";
import TechStack from "@/components/landing/TechStack";
import Showcase from "@/components/landing/Showcase";
import LearnCallout from "@/components/landing/LearnCallout";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Features />
      <PlatformPreview />
      <TechStack />
      <Showcase />
      <LearnCallout />
      <CTA />
      <Footer />
    </main>
  );
}
