"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VoltageTraceProps {
  voltages: number[];
  times: number[];
  selectedNeuron?: number;
}

export default function VoltageTrace({ voltages, times, selectedNeuron = 0 }: VoltageTraceProps) {
  const data = useMemo(() => {
    return times.map((time, i) => ({
      time,
      voltage: voltages[i] || -65,
    }));
  }, [voltages, times]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
          <XAxis
            dataKey="time"
            name="Time"
            unit="ms"
            stroke="#8A8A9A"
            tick={{ fill: "#8A8A9A", fontSize: 10 }}
          />
          <YAxis
            domain={[-80, 40]}
            stroke="#8A8A9A"
            tick={{ fill: "#8A8A9A", fontSize: 10 }}
            label={{ value: "mV", angle: -90, position: "insideLeft", fill: "#8A8A9A", fontSize: 10 }}
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
          <Line
            type="monotone"
            dataKey="voltage"
            stroke="#00F0FF"
            strokeWidth={2}
            dot={false}
            animationDuration={0}
          />
          <Line
            type="monotone"
            dataKey={() => -55}
            stroke="#FF1744"
            strokeDasharray="5 5"
            strokeWidth={1}
            dot={false}
            name="Threshold"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}