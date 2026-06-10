"use client";

import { fmt } from "@/lib/utils";

export default function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  digits,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="font-mono text-xs text-brand">
          {fmt(value, digits ?? 2)}
          {unit ? " " + unit : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-edge accent-brand"
      />
    </label>
  );
}
