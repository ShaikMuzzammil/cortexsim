/**
 * network3d.js — GPU-instanced 3D rendering of the neuron population with
 * Three.js. Each neuron is an instance of a sphere; spikes trigger a colour
 * flash that decays over time. Excitatory/inhibitory cells use distinct hues,
 * with colourblind-safe palette options.
 *
 * Three.js is loaded via the page import map (see app.html). This keeps the
 * project build-free and instantly deployable to Vercel as static files.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class Network3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05060f, 0.006);
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
    this.camera.position.set(0, 20, 95);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;

    const amb = new THREE.AmbientLight(0x7080ff, 0.5);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(40, 60, 40);
    this.scene.add(amb, dir);

    this.palette = "default";
    this.activity = null; // Float32 flash intensity per neuron
    this.isExc = null;
    this.N = 0;
    this.mesh = null;
    this._color = new THREE.Color();
    this._m = new THREE.Matrix4();
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  setPalette(name) {
    this.palette = name;
    if (this.N) this._refreshBaseColors();
  }

  baseColor(isExc) {
    // returns [r,g,b] base hue depending on palette + cell type
    switch (this.palette) {
      case "deuteranopia":
        return isExc ? [0.0, 0.45, 0.95] : [0.95, 0.75, 0.0];
      case "protanopia":
        return isExc ? [0.1, 0.55, 0.95] : [0.95, 0.85, 0.2];
      case "tritanopia":
        return isExc ? [0.0, 0.7, 0.7] : [0.9, 0.2, 0.4];
      case "mono":
        return isExc ? [0.55, 0.6, 0.75] : [0.8, 0.82, 0.9];
      default:
        return isExc ? [0.25, 0.55, 1.0] : [1.0, 0.35, 0.5];
    }
  }

  build(N, layout, isExc) {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    this.N = N;
    this.isExc = isExc;
    this.activity = new Float32Array(N);
    this.positions = layout;
    const detail = N > 6000 ? 0 : N > 2000 ? 1 : 2;
    const radius = N > 4000 ? 0.45 : N > 1500 ? 0.6 : 0.9;
    const geo = new THREE.IcosahedronGeometry(radius, detail);
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      emissive: new THREE.Color(0x111133),
      emissiveIntensity: 0.6,
      roughness: 0.4,
      metalness: 0.1,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, N);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
    for (let i = 0; i < N; i++) {
      this._m.makeTranslation(layout[i * 3], layout[i * 3 + 1], layout[i * 3 + 2]);
      this.mesh.setMatrixAt(i, this._m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this._refreshBaseColors();
    this.scene.add(this.mesh);
  }

  updateLayout(layout) {
    if (!this.mesh) return;
    this.positions = layout;
    for (let i = 0; i < this.N; i++) {
      this._m.makeTranslation(layout[i * 3], layout[i * 3 + 1], layout[i * 3 + 2]);
      this.mesh.setMatrixAt(i, this._m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  _refreshBaseColors() {
    const ic = this.mesh.instanceColor;
    for (let i = 0; i < this.N; i++) {
      const base = this.baseColor(this.isExc[i]);
      const a = this.activity[i];
      ic.setXYZ(
        i,
        base[0] * (0.25 + 0.75 * a) + a * 0.6,
        base[1] * (0.25 + 0.75 * a) + a * 0.6,
        base[2] * (0.25 + 0.75 * a) + a * 0.6
      );
    }
    ic.needsUpdate = true;
  }

  /** Flash neurons that spiked this frame. */
  onSpikes(spikeIds) {
    for (let k = 0; k < spikeIds.length; k++) {
      const id = spikeIds[k];
      if (id >= 0 && id < this.N) this.activity[id] = 1.0;
    }
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on;
  }

  _resize() {
    const w = this.canvas.clientWidth || this.canvas.parentElement.clientWidth;
    const h = this.canvas.clientHeight || this.canvas.parentElement.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (!this.mesh) {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      return;
    }
    // Decay activity flashes.
    const ic = this.mesh.instanceColor;
    const act = this.activity;
    for (let i = 0; i < this.N; i++) {
      const a = act[i];
      if (a > 0.001) {
        act[i] = a * 0.86;
        const base = this.baseColor(this.isExc[i]);
        const f = act[i];
        ic.setXYZ(
          i,
          base[0] * (0.25 + 0.4 * f) + f * 0.9,
          base[1] * (0.25 + 0.4 * f) + f * 0.9,
          base[2] * (0.25 + 0.4 * f) + f * 0.9
        );
      } else if (a !== 0) {
        act[i] = 0;
        const base = this.baseColor(this.isExc[i]);
        ic.setXYZ(i, base[0] * 0.25, base[1] * 0.25, base[2] * 0.25);
      }
    }
    ic.needsUpdate = true;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // WebXR / VR entry point (roadmap-ready: enabled if device supports it).
  async enableVR(button) {
    if (!navigator.xr) return false;
    try {
      const supported = await navigator.xr.isSessionSupported("immersive-vr");
      if (!supported) return false;
      this.renderer.xr.enabled = true;
      this.renderer.setAnimationLoop(() => this.render());
      button.addEventListener("click", async () => {
        const session = await navigator.xr.requestSession("immersive-vr");
        this.renderer.xr.setSession(session);
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
