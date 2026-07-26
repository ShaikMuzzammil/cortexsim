import Hero from "@/components/landing/Hero";
import Link from "next/link";
import { Brain, Activity, Download, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: <Brain size={24} />,
    title: "Izhikevich Neurons",
    desc: "Simulate spiking neurons with biologically realistic dynamics. Adjust parameters in real-time.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Activity size={24} />,
    title: "Live Visualization",
    desc: "Watch spike trains, voltage traces, and network activity render in real-time charts.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Download size={24} />,
    title: "Export Results",
    desc: "Download your data as CSV, JSON, or PNG. Compatible with Python, MATLAB, Excel.",
    color: "from-emerald-500 to-teal-500",
  },
];

export default function HomePage() {
  return (
    <main className="bg-[#0a0a0f] min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Features Grid - Minimal */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Simulating Now <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-gray-600 mt-4">Free • No account needed • Runs in browser</p>
        </div>
      </section>
    </main>
  );
}
