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

/**
 * Hosts the 3D network canvas and handles drag-to-rotate / wheel-to-zoom.
 * The actual rendering is performed by the Platform render loop, which draws
 * into this canvas using the shared view state.
 */
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
      view.rotY += (e.clientX - view.lastX) * 0.01;
      view.rotX += (e.clientY - view.lastY) * 0.01;
      view.lastX = e.clientX;
      view.lastY = e.clientY;
    };
    const onUp = () => {
      view.dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      view.zoom *= e.deltaY > 0 ? 0.93 : 1.07;
      view.zoom = Math.max(0.4, Math.min(3, view.zoom));
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [canvasRef, viewRef]);

  return (
    <canvas
      ref={canvasRef}
      className="hot h-full w-full touch-none rounded-2xl"
      aria-label="3D neuron network"
    />
  );
}
