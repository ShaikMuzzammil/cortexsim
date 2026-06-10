"use client";

import { useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import {
  exportStateJson,
  exportReport,
  Recorder,
} from "@/lib/export/exporters";
import type { Spike } from "@/types";
import { Download, FileText, Save } from "lucide-react";

export default function ExportPanel({
  getSpikes,
  recorder,
}: {
  getSpikes: () => Spike[];
  recorder: Recorder;
}) {
  const config = useSimStore((s) => s.config);
  const metrics = useSimStore((s) => s.metrics);
  const [notes, setNotes] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [recording, setRecording] = useState(false);

  const exportSpikes = () => {
    const spikes = getSpikes();
    let csv = "step,neuron\n";
    for (const s of spikes) csv += s.t + "," + s.i + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cortexsim-spikes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleRecord = () => {
    if (recording) {
      recorder.stop();
      setRecording(false);
    } else {
      recorder.start();
      setRecording(true);
    }
  };

  const saveExperiment = async () => {
    setSaveMsg("Saving...");
    try {
      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Experiment " + new Date().toLocaleString(),
          config,
          metricsSnapshot: metrics,
          notes,
        }),
      });
      const data = await res.json();
      if (data.persistence === "mongodb") setSaveMsg("Saved to MongoDB");
      else {
        // fallback to localStorage when no DB configured
        const key = "cortexsim:saved";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.unshift(data.saved);
        localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
        setSaveMsg("Saved locally (no database configured)");
      }
    } catch {
      setSaveMsg("Save failed");
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Experiment notes..."
        className="h-16 w-full rounded-lg border border-edge bg-panel2 px-3 py-2 text-xs text-white outline-none focus:border-brand"
      />
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={exportSpikes} className="btn-ghost">
          <Download size={15} /> CSV
        </button>
        <button type="button" onClick={() => exportStateJson(config, metrics)} className="btn-ghost">
          <Download size={15} /> JSON
        </button>
        <button type="button" onClick={() => exportReport(config, metrics, notes)} className="btn-ghost">
          <FileText size={15} /> PDF
        </button>
        <button type="button" onClick={() => recorder.export()} className="btn-ghost">
          <Download size={15} /> .cxs
        </button>
      </div>
      <button type="button" onClick={toggleRecord} className={recording ? "btn-primary w-full" : "btn-ghost w-full"}>
        {recording ? "Stop recording" : "Record activity"}
      </button>
      <button type="button" onClick={saveExperiment} className="btn-primary w-full">
        <Save size={15} /> Save experiment
      </button>
      {saveMsg ? <p className="text-xs text-slate-400">{saveMsg}</p> : null}
    </div>
  );
}
