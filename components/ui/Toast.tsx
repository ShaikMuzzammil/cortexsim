"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-synapticGreen" />,
    error: <AlertCircle className="w-5 h-5 text-spikeRed" />,
    info: <Info className="w-5 h-5 text-neon" />,
  };

  const borders = {
    success: "border-synapticGreen/30",
    error: "border-spikeRed/30",
    info: "border-neon/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={`glass-card ${borders[toast.type]} p-4 min-w-[300px] flex items-start gap-3`}
    >
      {icons[toast.type]}
      <p className="text-sm text-softWhite flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-lavenderGray hover:text-softWhite transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}