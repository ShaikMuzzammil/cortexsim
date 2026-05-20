"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

interface ExpandableCardProps {
  title: string;
  summary: string;
  details: React.ReactNode;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

export default function ExpandableCard({
  title,
  summary,
  details,
  icon,
  isOpen,
  onToggle,
  index,
}: ExpandableCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`glass-card overflow-hidden transition-all duration-300 ${
        isOpen ? "border-neon/50 shadow-neon" : "hover:border-neon/30"
      }`}
    >
      <div
        className="p-6 cursor-pointer"
        onClick={onToggle}
        data-hover="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${isOpen ? "bg-neon/20 text-neon" : "bg-white/5 text-lavenderGray"} transition-colors`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron text-lg font-bold text-softWhite mb-2">
                {title}
              </h3>
              <p className="text-lavenderGray text-sm leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-lavenderGray" />
            </motion.div>
            <AnimatePresence>
              {isOpen && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="p-1 rounded-md hover:bg-spikeRed/20 text-lavenderGray hover:text-spikeRed transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-white/5">
              <div className="text-lavenderGray text-sm leading-relaxed space-y-4">
                {details}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}