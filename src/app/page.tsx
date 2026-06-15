import Navbar from "@/components/landing/Navbar";
import ScrollProgress from "@/components/landing/ScrollProgress";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Importance from "@/components/landing/Importance";
import HowItWorks from "@/components/landing/HowItWorks";
import Metrics from "@/components/landing/Metrics";
import PlatformPreview from "@/components/landing/PlatformPreview";
import UseCases from "@/components/landing/UseCases";
import TechStack from "@/components/landing/TechStack";
import Integrations from "@/components/landing/Integrations";
import Showcase from "@/components/landing/Showcase";
import Comparison from "@/components/landing/Comparison";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Roadmap from "@/components/landing/Roadmap";
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
      <Importance />
      <Metrics />
      <PlatformPreview />
      <UseCases />
      <HowItWorks />
      <TechStack />
      <Integrations />
      <Showcase />
      <Comparison />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Roadmap />
      <LearnCallout />
      <CTA />
      <Footer />
    </main>
  );
}
