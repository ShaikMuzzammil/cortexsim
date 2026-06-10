"use client";

import { cn } from "@/lib/utils";

export default function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-edge px-3 py-2 text-left"
    >
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition",
          checked ? "bg-brand" : "bg-edge",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition",
            checked ? "left-4" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
