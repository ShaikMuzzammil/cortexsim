import { forwardRef, type ReactNode } from "react";

interface Props {
  title: string;
  hint?: string;
  children?: ReactNode;
}

/** Titled glass container holding a canvas (canvas ref is forwarded). */
const Panel = forwardRef<HTMLCanvasElement, Props>(function Panel(
  { title, hint },
  ref,
) {
  return (
    <div className="glass flex flex-col rounded-2xl p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
          {title}
        </span>
        {hint ? (
          <span className="text-[10px] text-white/35">{hint}</span>
        ) : null}
      </div>
      <canvas ref={ref} className="h-36 w-full rounded-lg" />
    </div>
  );
});

export default Panel;
