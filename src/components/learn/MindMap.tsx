"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { activitiesByGroup, STUDIO_STATS } from "@/lib/studio/registry";
import type { Activity } from "@/lib/studio/types";

const GROUP_COLOR: Record<string, string> = {
  Visualization: "#6ea8ff",
  Analysis: "#36d399",
  "Dynamics & Learning": "#c084fc",
  Connectivity: "#5db1ff",
  "Performance & Systems": "#fbbd23",
  "Data & Protocols": "#ff5d73",
};

const WIDTH = 1040;
const CENTER_X = WIDTH / 2;
const ROW_TOP = 150;
const NODE_GAP = 46;
const GROUP_PAD = 70;

interface MapNode {
  slug: string;
  title: string;
  id: number;
  status: Activity["status"];
  group: string;
  x: number;
  y: number;
}

function colorFor(group: string): string {
  return GROUP_COLOR[group] || "#6ea8ff";
}

export default function MindMap() {
  const router = useRouter();

  const { nodes, branches, height } = useMemo(() => {
    const groups = activitiesByGroup();
    const branches: Array<{ group: string; x: number; y: number }> = [];
    const nodes: MapNode[] = [];
    let y = ROW_TOP;

    groups.forEach((g, gi) => {
      const side = gi % 2 === 0 ? -1 : 1;
      const branchX = CENTER_X + side * 130;
      const items = g.items;
      const blockHeight = (items.length - 1) * NODE_GAP;
      const branchY = y + blockHeight / 2;
      branches.push({ group: g.group, x: branchX, y: branchY });

      items.forEach((a, ai) => {
        const nodeX = CENTER_X + side * (300 + (ai % 2) * 60);
        const nodeY = y + ai * NODE_GAP;
        nodes.push({
          slug: a.slug,
          title: a.title,
          id: a.id,
          status: a.status,
          group: g.group,
          x: nodeX,
          y: nodeY,
        });
      });
      y += blockHeight + GROUP_PAD;
    });

    return { nodes, branches, height: y + 40 };
  }, []);

  return (
    <div className="scrollbar-thin overflow-auto rounded-2xl border border-edge bg-ink/60 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3 px-1 text-[11px]">
        {Object.keys(GROUP_COLOR).map((g) => (
          <span key={g} className="inline-flex items-center gap-1.5 text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full" style={dotStyle(colorFor(g))} />
            {g}
          </span>
        ))}
        <span className="ml-auto text-slate-500">{STUDIO_STATS.total} activities \u00b7 click any node to open it</span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="mx-auto block" style={svgStyle(height)}>
        {/* spine */}
        <line x1={CENTER_X} y1={70} x2={CENTER_X} y2={height - 40} stroke="#1d2742" strokeWidth={3} />
        <circle cx={CENTER_X} cy={70} r={40} fill="#10172c" stroke="#6ea8ff" strokeWidth={2} />
        <text x={CENTER_X} y={66} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={800}>
          CortexSim
        </text>
        <text x={CENTER_X} y={82} textAnchor="middle" fill="#6ea8ff" fontSize={10} fontWeight={700}>
          STUDIO
        </text>

        {/* branch connectors + labels */}
        {branches.map((b) => {
          const color = colorFor(b.group);
          const left = b.x < CENTER_X;
          return (
            <g key={b.group}>
              <path
                d={`M ${CENTER_X} ${b.y} C ${(CENTER_X + b.x) / 2} ${b.y}, ${(CENTER_X + b.x) / 2} ${b.y}, ${b.x} ${b.y}`}
                stroke={color}
                strokeWidth={2}
                fill="none"
                opacity={0.6}
              />
              <rect
                x={left ? b.x - 150 : b.x - 10}
                y={b.y - 15}
                width={160}
                height={30}
                rx={8}
                fill="#0b1020"
                stroke={color}
                strokeWidth={1.5}
              />
              <text
                x={left ? b.x - 70 : b.x + 70}
                y={b.y + 4}
                textAnchor="middle"
                fill={color}
                fontSize={11}
                fontWeight={700}
              >
                {b.group}
              </text>
            </g>
          );
        })}

        {/* node links */}
        {nodes.map((n) => {
          const b = branches.find((br) => br.group === n.group)!;
          const color = colorFor(n.group);
          return (
            <path
              key={`l-${n.slug}`}
              d={`M ${b.x} ${b.y} C ${(b.x + n.x) / 2} ${b.y}, ${(b.x + n.x) / 2} ${n.y}, ${n.x} ${n.y}`}
              stroke={color}
              strokeWidth={1.1}
              fill="none"
              opacity={0.3}
            />
          );
        })}

        {/* nodes */}
        {nodes.map((n, i) => {
          const color = colorFor(n.group);
          const left = n.x < CENTER_X;
          const filled = n.status === "live";
          return (
            <motion.g
              key={n.slug}
              initial={nodeInit}
              animate={nodeShow}
              transition={nodeTransition(i)}
              className="cursor-pointer"
              onClick={() => router.push(`/simulator?s=${n.slug}`)}
            >
              <title>{`${n.title} \u2014 open in studio`}</title>
              <circle
                cx={n.x}
                cy={n.y}
                r={8}
                fill={filled ? color : "#0b1020"}
                stroke={color}
                strokeWidth={2}
              />
              <text
                x={left ? n.x - 14 : n.x + 14}
                y={n.y + 4}
                textAnchor={left ? "end" : "start"}
                fill="#cbd5e1"
                fontSize={11.5}
                fontWeight={500}
              >
                {String(n.id).padStart(2, "0")} {n.title}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

const nodeInit = { opacity: 0, scale: 0.6 };
const nodeShow = { opacity: 1, scale: 1 };
function nodeTransition(i: number) {
  return { delay: 0.015 * i, duration: 0.25 };
}
function svgStyle(height: number) {
  return { minWidth: WIDTH, height };
}
function dotStyle(color: string) {
  return { background: color };
}
