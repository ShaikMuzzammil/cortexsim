/**
 * models.js — Point-neuron model definitions for the CortexSim Pro engine.
 *
 * Each model exposes:
 *   - defaults: default parameter set
 *   - init(state, i, p): initialise membrane state for neuron i
 *   - step(state, i, p, I, dt): integrate one timestep; returns true if neuron i spiked
 *
 * State arrays are shared Float32Arrays owned by the NetworkEngine:
 *   state.v  -> membrane potential (mV)
 *   state.u  -> recovery variable (Izhikevich)
 *   state.refractoryUntil -> sim time (ms) until which neuron is clamped
 *
 * All models are deterministic given the same inputs + seeded RNG, which keeps
 * simulations reproducible (a core requirement for scientific use).
 */

export const MODELS = {
  /**
   * Leaky Integrate-and-Fire (current-based).
   * tau_m * dV/dt = -(V - V_rest) + R * I
   */
  lif: {
    label: "Leaky Integrate-and-Fire (LIF)",
    defaults: {
      tau_m: 20.0, // membrane time constant (ms)
      v_rest: -65.0, // resting potential (mV)
      v_reset: -65.0, // reset potential after spike (mV)
      v_th: -50.0, // spike threshold (mV)
      r_m: 80.0, // membrane resistance (MOhm) -> scales input current
      t_refrac: 2.0, // absolute refractory period (ms)
    },
    init(state, i, p) {
      // Start randomly between reset and threshold to avoid artificial sync.
      state.v[i] = p.v_rest + (p.v_th - p.v_rest) * state.rng();
      state.u[i] = 0;
    },
    step(state, i, p, I, dt, now) {
      if (now < state.refractoryUntil[i]) {
        state.v[i] = p.v_reset;
        return false;
      }
      const dv = (-(state.v[i] - p.v_rest) + p.r_m * I) / p.tau_m;
      state.v[i] += dv * dt;
      if (state.v[i] >= p.v_th) {
        state.v[i] = p.v_reset;
        state.refractoryUntil[i] = now + p.t_refrac;
        return true;
      }
      return false;
    },
  },

  /**
   * Izhikevich (2003) — two-variable model that reproduces many firing patterns.
   * v' = 0.04 v^2 + 5 v + 140 - u + I
   * u' = a (b v - u)
   * if v >= 30: v = c, u += d
   */
  izhikevich: {
    label: "Izhikevich",
    defaults: {
      a: 0.02,
      b: 0.2,
      c: -65.0,
      d: 8.0,
      v_peak: 30.0,
      i_scale: 1.0,
    },
    init(state, i, p) {
      state.v[i] = p.c;
      state.u[i] = p.b * p.c;
    },
    step(state, i, p, I, dt, now) {
      // Sub-step the fast voltage dynamics for numerical stability.
      const Iin = I * p.i_scale;
      let v = state.v[i];
      let u = state.u[i];
      const half = dt * 0.5;
      v += half * (0.04 * v * v + 5 * v + 140 - u + Iin);
      v += half * (0.04 * v * v + 5 * v + 140 - u + Iin);
      u += dt * (p.a * (p.b * v - u));
      if (v >= p.v_peak) {
        state.v[i] = p.c;
        state.u[i] = u + p.d;
        return true;
      }
      state.v[i] = v;
      state.u[i] = u;
      return false;
    },
  },

  /**
   * Adaptive Exponential Integrate-and-Fire (AdEx, Brette & Gerstner 2005).
   * C dV/dt = -gL (V - EL) + gL dT exp((V - VT)/dT) - w + I
   * tau_w dw/dt = a (V - EL) - w ; on spike: V->Vr, w += b
   */
  adex: {
    label: "Adaptive Exponential (AdEx)",
    defaults: {
      C: 200.0, // pF
      gL: 10.0, // nS
      EL: -70.0, // mV
      VT: -50.0, // mV
      dT: 2.0, // mV slope factor
      a: 2.0, // nS subthreshold adaptation
      b: 60.0, // pA spike-triggered adaptation
      tau_w: 30.0, // ms
      Vr: -58.0, // mV reset
      v_peak: 0.0, // mV cutoff
      i_scale: 1.0,
    },
    init(state, i, p) {
      state.v[i] = p.EL + (p.VT - p.EL) * 0.5 * state.rng();
      state.u[i] = 0; // adaptation current w
    },
    step(state, i, p, I, dt, now) {
      let v = state.v[i];
      let w = state.u[i];
      const Iin = I * p.i_scale;
      const expArg = Math.min((v - p.VT) / p.dT, 30); // clamp to avoid overflow
      const dv = (-p.gL * (v - p.EL) + p.gL * p.dT * Math.exp(expArg) - w + Iin) / p.C;
      const dw = (p.a * (v - p.EL) - w) / p.tau_w;
      v += dv * dt;
      w += dw * dt;
      if (v >= p.v_peak) {
        state.v[i] = p.Vr;
        state.u[i] = w + p.b;
        return true;
      }
      state.v[i] = v;
      state.u[i] = w;
      return false;
    },
  },
};

export function getModel(name) {
  return MODELS[name] || MODELS.lif;
}

export function modelList() {
  return Object.keys(MODELS).map((k) => ({ id: k, label: MODELS[k].label }));
}
