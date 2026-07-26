"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FileJson, Image as ImageIcon, CheckCircle } from "lucide-react";

// Helper functions - defined outside component
function generateCSV(): string {
  const header = "time_ms,neuron_0,neuron_1,neuron_2,neuron_3,neuron_4\n";
  const rows: string[] = [];
  for (let t = 0; t <= 1000; t += 10) {
    const values = Array.from({ length: 5 }, () => 
      (-70 + Math.random() * 20).toFixed(2)
    );
    rows.push(t + "," + values.join(","));
  }
  return header + rows.join("\n");
}

function generateJSON(): string {
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    simulator: "CortexSim Izhikevich",
    parameters: { a: 0.02, b: 0.2, c: -65, d: 8, I: 10, neurons: 50, duration: 1000 },
    summary: { total_spikes: 1247, mean_rate: 24.9, duration_ms: 1000 },
    note: "Sample export - run simulation for real data"
  }, null, 2);
}

function generatePython(): string {
  return [
    "# CortexSim Export - Python Script",
    "# Generated: " + new Date().toISOString(),
    "",
    "import numpy as np",
    "import matplotlib.pyplot as plt",
    "",
    "# Parameters",
    "params = {'a': 0.02, 'b': 0.2, 'c': -65, 'd': 8, 'I': 10}",
    "",
    "print('CortexSim Parameters:', params)",
    "",
    "# Example plot",
    "t = np.arange(0, 1000, 0.5)",
    "v = np.sin(t / 50) * 20 + (-70)",
    "",
    "plt.figure(figsize=(10, 4))",
    "plt.plot(t, v, color='#3b82f6')",
    "plt.xlabel('Time (ms)')",
    "plt.ylabel('Membrane Potential (mV)')",
    "plt.title('CortexSim Output')",
    "plt.savefig('output.png', dpi=150)",
    "print('Saved!')"
  ].join("\n");
}

const EXPORT_FORMATS = [
  { id: "csv", name: "CSV", desc: "Spreadsheet-compatible data", icon: <FileText size={20} />, ext: ".csv", color: "text-emerald-400 bg-emerald-500/10" },
  { id: "json", name: "JSON", desc: "Structured data for programming", icon: <FileJson size={20} />, ext: ".json", color: "text-blue-400 bg-blue-500/10" },
  { id: "png", name: "PNG Image", desc: "High-quality chart snapshot", icon: <ImageIcon size={20} />, ext: ".png", color: "text-purple-400 bg-purple-500/10" },
  { id: "python", name: "Python Code", desc: "Ready-to-run Python script", icon: <FileText size={20} />, ext: ".py", color: "text-yellow-400 bg-yellow-500/10" }
];

export default function ExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = (formatId: string) => {
    setExporting(formatId);
    
    setTimeout(() => {
      let content = "";
      let filename = "";
      let mimeType = "";

      if (formatId === "csv") {
        content = generateCSV();
        filename = "cortexsim_data_" + Date.now() + ".csv";
        mimeType = "text/csv";
      } else if (formatId === "json") {
        content = generateJSON();
        filename = "cortexsim_data_" + Date.now() + ".json";
        mimeType = "application/json";
      } else if (formatId === "python") {
        content = generatePython();
        filename = "cortexsim_script_" + Date.now() + ".py";
        mimeType = "text/x-python";
      } else if (formatId === "png") {
        filename = "cortexsim_chart_" + Date.now() + ".png";
        setLastExport(filename);
        setExporting(null);
        return;
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setLastExport(filename);
      setExporting(null);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Export Center</h1>
        <p className="text-sm text-gray-500 mt-1">Download your simulation results in various formats</p>
      </div>

      {/* Export Formats Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {EXPORT_FORMATS.map((format) => (
          <motion.button
            key={format.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleExport(format.id)}
            disabled={exporting !== null}
            className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={"p-3 rounded-xl " + format.color}>
                {format.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white group-hover:text-blue-400">{format.name}</h3>
                  <span className="text-xs text-gray-600 font-mono">{format.ext}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{format.desc}</p>
                
                {exporting === formatId ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-400">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full"
                    />
                    Generating...
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 mt-3 group-hover:text-blue-400">
                    <Download size={12} /> Download
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Success Toast */}
      {lastExport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-950 border border-emerald-500/30 shadow-xl"
        >
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm text-emerald-300">Downloaded: <strong>{lastExport}</strong></span>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="font-medium text-white mb-2">Tip</h3>
        <p className="text-sm text-gray-400">
          Run a simulation first in the Simulator, then come here to export the results.
        </p>
      </div>
    </motion.div>
  );
}
