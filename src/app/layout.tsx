import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/learn/Toaster";
import StudioCursor from "@/components/studio/StudioCursor";

export const metadata: Metadata = {
  title: "CortexSim Studio - Neural Dynamics Platform",
  description:
    "CortexSim Studio is a full-stack, real-time spiking neural network platform: 3D visualization, live signal analysis, plasticity, parameter sweeps, editable dynamics and an interactive learning curriculum. Built with Next.js, TypeScript, Tailwind, Framer Motion and Three.js.",
  keywords: [
    "spiking neural network",
    "Izhikevich",
    "computational neuroscience",
    "simulation platform",
    "Next.js",
    "WebGL",
  ],
  openGraph: {
    title: "CortexSim Studio - Neural Dynamics Platform",
    description:
      "Real-time brain dynamics and an interactive neuroscience learning platform in your browser.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
        <StudioCursor />
      </body>
    </html>
  );
}
