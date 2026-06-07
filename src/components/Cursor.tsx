import { useRef } from "react";
import { useCursor } from "../hooks/useCursor";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useCursor(dotRef, ringRef);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
      />
      <div
        ref={ringRef}
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[100] -ml-[18px] -mt-[18px] h-9 w-9 rounded-full border border-cyan-300/70 transition-[width,height,background-color,border-color] duration-200"
      />
      <style>{`
				.cursor-ring.cursor-hot {
					width: 56px; height: 56px;
					margin-left: -28px; margin-top: -28px;
					background: rgba(168,85,247,0.18);
					border-color: rgba(236,72,153,0.9);
				}
			`}</style>
    </>
  );
}
