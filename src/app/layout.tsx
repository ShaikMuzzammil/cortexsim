import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CortexSim GODMODE - Spiking Neural Network Simulator",
  description:
    "A full-stack, real-time spiking neural network simulator with 3D visualization, live analytics, parameter sweeps, and editable dynamics. Built with Next.js, TypeScript, Tailwind, Framer Motion and Three.js.",
  keywords: [
    "spiking neural network",
    "Izhikevich",
    "neuroscience",
    "simulation",
    "Next.js",
    "WebGL",
  ],
  openGraph: {
    title: "CortexSim GODMODE",
    description: "Real-time brain dynamics in your browser.",
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
