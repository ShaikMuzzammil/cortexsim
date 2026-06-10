"use client";

import { useState } from "react";
import type { SNN } from "@/lib/engine/snn";
import { compileFormula } from "@/lib/export/exporters";

// Lets the user override the membrane (dv) and recovery (du) equations live.
export default function EquationEditor({
  engineRef,
}: {
  engineRef: { current: SNN | null };
}) {
  const [dv, setDv] = useState("0.04*v*v + 5*v + 140 - u + I");
  const [du, setDu] = useState("a*(b*v - u)");
  const [status, setStatus] = useState("Using default Izhikevich dynamics");

  const apply = () => {
    const eng = engineRef.current;
    if (!eng) return;
    try {
      const fdv = compileFormula(dv);
      const fdu = compileFormula(du);
      // smoke-test the compiled formulas
      const t1 = fdv({ v: -65, u: -13, I: 5 });
      const t2 = fdu({ v: -65, u: -13, a: 0.02, b: 0.2 });
      if (!isFinite(t1) || !isFinite(t2)) throw new Error("non-finite");
      eng.customDv = (v, u, I) => fdv({ v, u, I });
      eng.customDu = (v, u, a, b) => fdu({ v, u, a, b });
      setStatus("Custom dynamics applied - the network is now using your equations");
    } catch {
      setStatus("Could not parse equations - check your syntax");
    }
  };

  const reset = () => {
    const eng = engineRef.current;
    if (eng) {
      eng.customDv = null;
      eng.customDu = null;
    }
    setDv("0.04*v*v + 5*v + 140 - u + I");
    setDu("a*(b*v - u)");
    setStatus("Restored default Izhikevich dynamics");
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="label">dv/dt =</span>
        <input
          value={dv}
          onChange={(e) => setDv(e.target.value)}
          className="mt-1 w-full rounded-lg border border-edge bg-panel2 px-3 py-2 font-mono text-xs text-white outline-none focus:border-brand"
        />
      </label>
      <label className="block">
        <span className="label">du/dt =</span>
        <input
          value={du}
          onChange={(e) => setDu(e.target.value)}
          className="mt-1 w-full rounded-lg border border-edge bg-panel2 px-3 py-2 font-mono text-xs text-white outline-none focus:border-brand"
        />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={apply} className="btn-primary flex-1">Apply</button>
        <button type="button" onClick={reset} className="btn-ghost flex-1">Reset</button>
      </div>
      <p className="text-xs text-slate-400">{status}</p>
      <p className="text-[11px] text-slate-500">Variables: v, u, I, a, b. Math functions allowed (sin, exp, tanh, ...).</p>
    </div>
  );
}
