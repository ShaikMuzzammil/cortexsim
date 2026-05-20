"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Chrome, Eye, EyeOff, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card border-neon/20 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon/10 mb-4">
            <Zap className="w-6 h-6 text-neon" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-gradient">
            Welcome Back
          </h1>
          <p className="text-lavenderGray text-sm">
            Sign in to access your experiments
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-spikeRed/10 border border-spikeRed/30 text-spikeRed text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-lavenderGray hover:text-softWhite"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-lavenderGray">
              <input type="checkbox" className="rounded border-lavenderGray/30 bg-void/50 text-neon focus:ring-neon" />
              Remember me
            </label>
            <Link href="#" className="text-neon hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-violetSlate px-2 text-lavenderGray">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm text-softWhite"
          >
            <Chrome className="w-4 h-4" />
            Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm text-softWhite"
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>

        <p className="text-center text-sm text-lavenderGray">
          Don't have an account?{" "}
          <Link href="/signup" className="text-neon hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}