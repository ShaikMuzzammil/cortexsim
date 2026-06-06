/**
 * copilot.js — Offline natural-language experiment control.
 *
 * A rule/intent based parser maps plain-English commands to concrete parameter
 * changes and actions. It works fully offline (no API keys), and is structured
 * so a hosted LLM endpoint can be dropped in later (see askLLM stub).
 *
 * Examples:
 *   "increase inhibition"            -> raise g
 *   "make it fire faster"            -> raise input rate
 *   "produce 40hz gamma"             -> load gamma preset
 *   "reset" / "pause" / "run"        -> control actions
 *   "show me bursting"               -> load bursting preset
 *   "enable plasticity"              -> stdp on
 */
export function interpret(text) {
  const t = text.toLowerCase().trim();
  const num = (re) => {
    const m = t.match(re);
    return m ? parseFloat(m[1]) : null;
  };

  // Direct control actions
  if (/\b(run|start|play|go)\b/.test(t)) return { action: "start", say: "Running the simulation." };
  if (/\b(pause|stop|halt)\b/.test(t)) return { action: "pause", say: "Paused." };
  if (/\b(reset|restart|clear)\b/.test(t)) return { action: "reset", say: "Reset to initial state." };
  if (/\bstep\b/.test(t)) return { action: "step", say: "Stepped 1 ms." };

  // Presets / regimes
  if (/gamma|40\s*hz|oscillat/.test(t)) return { action: "preset", value: "gamma", say: "Loading a gamma-oscillation network (~40 Hz)." };
  if (/burst/.test(t)) return { action: "preset", value: "single_burst", say: "Loading an intrinsically bursting Izhikevich neuron." };
  if (/async|irregular|balanced|ground state/.test(t)) return { action: "preset", value: "brunel_ai", say: "Loading the balanced asynchronous-irregular regime." };
  if (/sync/.test(t)) return { action: "preset", value: "brunel_si", say: "Loading the synchronous regime." };

  // Plasticity
  if (/(enable|turn on|add).*(plasticity|stdp|learning)/.test(t)) return { action: "param", key: "stdp", value: true, say: "STDP plasticity enabled." };
  if (/(disable|turn off|remove).*(plasticity|stdp|learning)/.test(t)) return { action: "param", key: "stdp", value: false, say: "STDP plasticity disabled." };

  // Inhibition / excitation
  if (/(increase|more|raise|stronger).*inhibit/.test(t)) return { action: "scale", key: "g", factor: 1.3, say: "Increasing inhibitory strength." };
  if (/(decrease|less|lower|weaker).*inhibit/.test(t)) return { action: "scale", key: "g", factor: 0.75, say: "Decreasing inhibitory strength." };
  if (/(increase|more|raise).*(excit|drive|activity|fire faster|firing)/.test(t)) return { action: "scale", key: "inputRate", factor: 1.4, say: "Increasing external drive." };
  if (/(decrease|less|lower|quieter|calmer).*(excit|drive|activity|firing)/.test(t)) return { action: "scale", key: "inputRate", factor: 0.7, say: "Reducing external drive." };

  // Set explicit values
  const rate = num(/(\d+(?:\.\d+)?)\s*hz/);
  if (rate != null && /input|drive|rate/.test(t)) return { action: "param", key: "inputRate", value: rate, say: `Setting input rate to ${rate} Hz.` };
  const nset = num(/(\d+)\s*neuron/);
  if (nset != null) return { action: "param", key: "N", value: nset, say: `Rebuilding with ${nset} neurons.` };
  const conn = num(/connect(?:ion|ivity)?\s*(?:prob(?:ability)?)?\s*(?:of|to)?\s*(\d+(?:\.\d+)?)/);
  if (conn != null) return { action: "param", key: "connectionProb", value: conn > 1 ? conn / 100 : conn, say: `Setting connection probability to ${conn}.` };

  // Visualization
  if (/layer/.test(t)) return { action: "layout", value: "layers", say: "Switching to layered layout." };
  if (/grid/.test(t)) return { action: "layout", value: "grid", say: "Switching to grid layout." };
  if (/sphere|ball/.test(t)) return { action: "layout", value: "sphere", say: "Switching to spherical layout." };

  return {
    action: "none",
    say: "I can adjust inhibition/excitation, load regimes (gamma, bursting, async), toggle plasticity, set neuron count or input rate, and control playback. Try: \"produce 40 Hz gamma\" or \"increase inhibition\".",
  };
}

/** Optional hosted-LLM hook. Reads an endpoint from a global if configured. */
export async function askLLM(text) {
  const endpoint = window.CORTEXSIM_LLM_ENDPOINT;
  if (!endpoint) return interpret(text);
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text }),
    });
    if (!r.ok) return interpret(text);
    return await r.json();
  } catch {
    return interpret(text);
  }
}
