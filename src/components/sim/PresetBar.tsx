"use client";

import { PRESETS } from "@/lib/presets";
import type { SimConfig } from "@/types";

export default function PresetBar({
  onApply,
}: {
  onApply: (patch: Partial<SimConfig>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          title={p.description}
          onClick={() => onApply(p.config)}
          className="chip"
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
