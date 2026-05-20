"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RasterPlotProps {
  spikeTimes: number[][];
  timeWindow?: number;
}

export default function RasterPlot({ spikeTimes, timeWindow = 1000 }: RasterPlotProps) {
  const data = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    spikeTimes.forEach((times, neuronIdx) => {
      times.forEach((time) => {
        if (time > spikeTimes[0]?.[spikeTimes[0].length - 1] - timeWindow || timeWindow === 0) {
          points.push({ x: time, y: neuronIdx });
        }
      });
    });
    return points;
  }, [spikeTimes, timeWindow]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
          <XAxis
            type="number"
            dataKey="x"
            name="Time"
            unit="ms"
            stroke="#8A8A9A"
            tick={{ fill: "#8A8A9A", fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Neuron"
            stroke="#8A8A9A"
            tick={{ fill: "#8A8A9A", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: "#1A1A2E",
              border: "1px solid #00F0FF",
              borderRadius: "8px",
              color: "#E0E0E0",
              fontSize: "12px",
            }}
          />
          <Scatter
            data={data}
            fill="#00F0FF"
            fillOpacity={0.8}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}