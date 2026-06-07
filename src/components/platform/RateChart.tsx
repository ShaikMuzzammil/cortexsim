import { type RefObject } from "react";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
}

/** Population firing-rate trace. Drawing is driven by the Platform render loop. */
export default function RateChart({ canvasRef }: Props) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-white/70">
          Population rate
        </span>
        <span className="text-[10px] text-white/35">Hz · time →</span>
      </div>
      <canvas ref={canvasRef} className="h-40 w-full rounded-lg" />
    </div>
  );
}
