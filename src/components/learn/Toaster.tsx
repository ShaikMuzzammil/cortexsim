"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Trophy, XCircle, X } from "lucide-react";
import { useToast, type Toast } from "@/store/useToast";

const ICON: Record<Toast["kind"], React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-good" />,
  info: <Info size={18} className="text-brand" />,
  reward: <Trophy size={18} className="text-warn" />,
  error: <XCircle size={18} className="text-exc" />,
};

const toastInit = { opacity: 0, y: 14, scale: 0.96 };
const toastShow = { opacity: 1, y: 0, scale: 1 };
const toastExit = { opacity: 0, x: 48, scale: 0.96 };
const toastTrans = { duration: 0.22 };

export default function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[330px] max-w-[90vw] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={toastInit}
            animate={toastShow}
            exit={toastExit}
            transition={toastTrans}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-edge bg-panel/95 p-3.5 shadow-xl backdrop-blur"
          >
            <span className="mt-0.5 shrink-0">{ICON[t.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{t.title}</p>
              {t.body ? (
                <p className="mt-0.5 text-xs leading-5 text-slate-400">{t.body}</p>
              ) : null}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-slate-500 hover:text-white"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
