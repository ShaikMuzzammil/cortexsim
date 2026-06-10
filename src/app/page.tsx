import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import TechStack from "@/components/landing/TechStack";
import Showcase from "@/components/landing/Showcase";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Features />
      <TechStack />
      <Showcase />
      <CTA />
      <Footer />
    </main>
  );
}
