import type { Metadata } from "next";
import { Inter, Orbitron, Fira_Code } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" });

export const metadata: Metadata = {
  title: "CortexSim - Spiking Neural Network Simulator",
  description: "Build, simulate, and visualize spiking neural networks in your browser. Advanced WebGPU-powered neuroscience simulation platform.",
  keywords: ["neural network", "spiking neural network", "SNN", "simulation", "neuroscience", "WebGPU"],
  authors: [{ name: "CortexSim" }],
  openGraph: {
    title: "CortexSim - Neural Network Simulator",
    description: "Simulate the brain. Visualize intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${firaCode.variable}`}>
      <body className="font-inter bg-void text-softWhite antialiased min-h-screen">
        <Providers>
          <CustomCursor />
          <Navbar />
          <main className="relative">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}