import Cursor from "./components/Cursor";
import Background from "./components/Background";
import ProgressBar from "./components/ProgressBar";
import Nav from "./components/Nav";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Platform from "./components/platform/Platform";
import Science from "./components/landing/Science";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Cursor />
      <Background />
      <ProgressBar />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Features />
        <Platform />
        <Science />
        <Footer />
      </main>
    </>
  );
}
