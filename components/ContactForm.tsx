"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, User, MessageSquare, Tag } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-card border-neon/20 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon/10 mb-4">
            <Mail className="w-6 h-6 text-neon" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-gradient">
            Get in Touch
          </h1>
          <p className="text-lavenderGray text-sm">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-synapticGreen/10 border border-synapticGreen/30 text-synapticGreen text-sm"
          >
            Message sent – we'll reply soon.
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-spikeRed/10 border border-spikeRed/30 text-spikeRed text-sm"
          >
            Failed to send message. Please try again.
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-[38px] w-4 h-4 text-lavenderGray" />
            <Input
              type="text"
              label="Name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-[38px] w-4 h-4 text-lavenderGray" />
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-[38px] w-4 h-4 text-lavenderGray" />
            <Input
              type="text"
              label="Subject"
              placeholder="What's this about?"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <MessageSquare className="absolute left-3 top-[38px] w-4 h-4 text-lavenderGray" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-softWhite">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us more..."
                rows={5}
                className="w-full bg-void/50 border border-lavenderGray/30 rounded-lg px-4 py-3 pl-10 text-softWhite placeholder:text-lavenderGray/50 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all duration-300 resize-none"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </form>
      </div>
    </motion.div>
  );
}