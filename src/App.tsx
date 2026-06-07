import { useSim } from "./store/useSim";
import Cursor from "./components/Cursor";
import Background from "./components/Background";
import ProgressBar from "./components/ProgressBar";
import Nav from "./components/Nav";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Science from "./components/landing/Science";
import Footer from "./components/Footer";
import PlatformApp from "./components/platform/PlatformApp";

export default function App() {
  const launched = useSim((s) => s.launched);

  if (launched) {
    return (
      <>
        <Cursor />
        <PlatformApp />
      </>
    );
  }

  return (
    <>
      <Cursor />
      <Background />
      <ProgressBar />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Features />
        <Science />
        <Footer />
      </main>
    </>
  );
}
