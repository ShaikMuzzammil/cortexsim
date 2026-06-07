import { useEffect, type RefObject } from "react";

export interface View {
  rotX: number;
  rotY: number;
  zoom: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
}

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
  viewRef: RefObject<View>;
}

/** Interactive 3D neuron cloud. Drag to rotate, wheel/pinch to zoom. */
export default function Network3D({ canvasRef, viewRef }: Props) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const view = viewRef.current;
    if (!canvas || !view) return;

    const onDown = (e: PointerEvent) => {
      view.dragging = true;
      view.lastX = e.clientX;
      view.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!view.dragging) return;
      view.rotY += (e.clientX - view.lastX) * 0.008;
      view.rotX += (e.clientY - view.lastY) * 0.008;
      view.lastX = e.clientX;
      view.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      view.dragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      view.zoom = Math.min(3, Math.max(0.4, view.zoom - e.deltaY * 0.0012));
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [canvasRef, viewRef]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-grab touch-none rounded-2xl active:cursor-grabbing"
    />
  );
}
