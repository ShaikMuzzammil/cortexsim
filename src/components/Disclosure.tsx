import { useState, type ReactNode } from "react";

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Accessible, animated expand/collapse panel used for the feature guides. */
export default function Disclosure({
  icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hot flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        {icon ? <span className="text-2xl">{icon}</span> : null}
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{title}</span>
          {subtitle ? (
            <span className="block truncate text-sm text-white/50">
              {subtitle}
            </span>
          ) : null}
        </span>
        <span
          className={`shrink-0 text-white/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
