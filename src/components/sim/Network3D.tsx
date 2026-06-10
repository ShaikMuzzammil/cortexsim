"use client";

import { useEffect, useRef } from "react";
import type { SNN } from "@/lib/engine/snn";

// 3D neuron cloud via Three.js, with an automatic 2D canvas fallback so the
// view ALWAYS renders even when WebGL is unavailable.
export default function Network3D({
  engineRef,
  mode,
  autoRotate,
  onProbe,
}: {
  engineRef: { current: SNN | null };
  mode: "3d" | "2d";
  autoRotate: boolean;
  onProbe: (index: number) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<any>({ raf: 0, three: null, angle: 0 });

  // 2D fallback renderer
  useEffect(() => {
    if (mode !== "2d") return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let angle = 0;
    const render = () => {
      const eng = engineRef.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#05070e";
      ctx.fillRect(0, 0, w, h);
      if (eng) {
        if (autoRotate) angle += 0.005;
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.4;
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const fired = new Set(eng.firedThisStep);
        const stride = eng.N > 4000 ? 2 : 1;
        for (let i = 0; i < eng.N; i += stride) {
          const x = eng.px[i] * ca - eng.pz[i] * sa;
          const z = eng.px[i] * sa + eng.pz[i] * ca;
          const persp = 1.6 / (1.6 + z);
          const sx = cx + x * scale * persp;
          const sy = cy + eng.py[i] * scale * persp;
          const isFired = fired.has(i);
          if (isFired) ctx.fillStyle = "#ffffff";
          else ctx.fillStyle = eng.isExc[i] ? "rgba(255,93,115,0.7)" : "rgba(93,177,255,0.7)";
          const r = (isFired ? 2.4 : 1.3) * persp;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [mode, autoRotate, engineRef]);

  // 3D Three.js renderer (dynamically imported to avoid SSR issues)
  useEffect(() => {
    if (mode !== "3d") return;
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x05070e);
        const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
        camera.position.set(0, 0, 3.4);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.setSize(w, h);
        mount.innerHTML = "";
        mount.appendChild(renderer.domElement);

        const eng = engineRef.current;
        const N = eng ? eng.N : 1000;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(N * 3);
        const colors = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          positions[i * 3] = eng ? eng.px[i] : 0;
          positions[i * 3 + 1] = eng ? eng.py[i] : 0;
          positions[i * 3 + 2] = eng ? eng.pz[i] : 0;
          const exc = eng ? eng.isExc[i] : 1;
          colors[i * 3] = exc ? 1 : 0.36;
          colors[i * 3 + 1] = exc ? 0.36 : 0.69;
          colors[i * 3 + 2] = exc ? 0.45 : 1;
        }
        geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.PointsMaterial({
          size: 0.035,
          vertexColors: true,
          transparent: true,
          opacity: 0.95,
        });
        const points = new THREE.Points(geom, mat);
        scene.add(points);

        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(1.05, 32, 32),
          new THREE.MeshBasicMaterial({
            color: 0x6ea8ff,
            wireframe: true,
            transparent: true,
            opacity: 0.06,
          }),
        );
        scene.add(shell);

        let dragging = false;
        let px = 0;
        let py = 0;
        let rotX = 0;
        let rotY = 0;
        const dom = renderer.domElement;
        const onDown = (e: MouseEvent) => {
          dragging = true;
          px = e.clientX;
          py = e.clientY;
        };
        const onUp = () => (dragging = false);
        const onMove = (e: MouseEvent) => {
          if (!dragging) return;
          rotY += (e.clientX - px) * 0.01;
          rotX += (e.clientY - py) * 0.01;
          px = e.clientX;
          py = e.clientY;
        };
        const onClick = () => {
          if (eng) onProbe((Math.random() * eng.N) | 0);
        };
        const onWheel = (e: WheelEvent) => {
          camera.position.z = Math.max(1.8, Math.min(7, camera.position.z + e.deltaY * 0.002));
        };
        dom.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);
        window.addEventListener("mousemove", onMove);
        dom.addEventListener("click", onClick);
        dom.addEventListener("wheel", onWheel, { passive: true });

        const colorAttr = geom.getAttribute("color") as any;
        const render = () => {
          if (disposed) return;
          const e2 = engineRef.current;
          if (e2 && e2.N === N) {
            const arr = colorAttr.array as Float32Array;
            // decay flashes
            for (let i = 0; i < N; i++) {
              arr[i * 3] *= 0.86;
              arr[i * 3 + 1] *= 0.86;
              arr[i * 3 + 2] *= 0.86;
              const exc = e2.isExc[i];
              const baseR = exc ? 1 : 0.36;
              const baseG = exc ? 0.36 : 0.69;
              const baseB = exc ? 0.45 : 1;
              if (arr[i * 3] < baseR) arr[i * 3] = baseR;
              if (arr[i * 3 + 1] < baseG) arr[i * 3 + 1] = baseG;
              if (arr[i * 3 + 2] < baseB) arr[i * 3 + 2] = baseB;
            }
            for (const i of e2.firedThisStep) {
              arr[i * 3] = 1;
              arr[i * 3 + 1] = 1;
              arr[i * 3 + 2] = 1;
            }
            colorAttr.needsUpdate = true;
          }
          if (autoRotate) rotY += 0.003;
          points.rotation.x = rotX;
          points.rotation.y = rotY;
          shell.rotation.x = rotX;
          shell.rotation.y = rotY;
          renderer.render(scene, camera);
          stateRef.current.raf = requestAnimationFrame(render);
        };
        render();

        const onResize = () => {
          const nw = mount.clientWidth;
          const nh = mount.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          cancelAnimationFrame(stateRef.current.raf);
          window.removeEventListener("resize", onResize);
          dom.removeEventListener("mousedown", onDown);
          window.removeEventListener("mouseup", onUp);
          window.removeEventListener("mousemove", onMove);
          dom.removeEventListener("click", onClick);
          dom.removeEventListener("wheel", onWheel);
          renderer.dispose();
          geom.dispose();
          mat.dispose();
          if (mount) mount.innerHTML = "";
        };
      } catch (err) {
        // WebGL/three failed: leave the 2D fallback note visible.
        if (mount) {
          mount.innerHTML =
            '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;font-size:13px">3D unavailable - switch to 2D render mode</div>';
        }
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [mode, autoRotate, engineRef, onProbe]);

  if (mode === "2d") {
    return <canvas ref={canvas2dRef} className="h-full w-full" />;
  }
  return <div ref={mountRef} className="h-full w-full" />;
}
