"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center space-y-8 px-4"
      >
        <div className="space-y-4">
          <motion.div
            animate={{ 
              textShadow: [
                "0 0 20px rgba(0,240,255,0.5)",
                "0 0 40px rgba(0,240,255,0.8)",
                "0 0 20px rgba(0,240,255,0.5)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1 className="font-orbitron text-8xl md:text-9xl font-black text-neon">
              404
            </h1>
          </motion.div>

          <div className="flex items-center justify-center gap-2 text-amberAP">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-orbitron text-sm uppercase tracking-wider">
              Neural Void Detected
            </span>
          </div>

          <p className="text-lavenderGray text-lg max-w-md mx-auto">
            You've ventured into uncharted neural territory. This page doesn't exist in our network.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            Return to Home
          </Button>
        </Link>

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-neon/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-electric/10 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}