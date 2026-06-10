"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GUIDES } from "@/content/guides";
import type { GuideCategory } from "@/content/types";
import { useLearnStore } from "@/store/useLearnStore";

const CATEGORY_ORDER: GuideCategory[] = [
  "Basics",
  "Neuroscience",
  "Networks",
  "Analysis",
  "Workflow",
];

const CAT_COLOR: Record<GuideCategory, string> = {
  Basics: "#6ea8ff",
  Neuroscience: "#ff5d73",
  Networks: "#5db1ff",
  Analysis: "#36d399",
  Workflow: "#fbbd23",
};

const WIDTH = 920;
const CENTER_X = WIDTH / 2;

interface Node {
  slug: string;
  title: string;
  category: GuideCategory;
  x: number;
  y: number;
}

export default function MindMap() {
  const router = useRouter();
  const store = useLearnStore();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const { nodes, branches, height } = useMemo(() => {
    const branches: Array<{ category: GuideCategory; x: number; y: number }> = [];
    const nodes: Node[] = [];
    const cats = CATEGORY_ORDER.filter((c) =>
      GUIDES.some((g) => g.category === c),
    );
    const rowGap = 150;
    let y = 150;
    cats.forEach((category, ci) => {
      const side = ci % 2 === 0 ? -1 : 1;
      const branchX = CENTER_X + side * 150;
      branches.push({ category, x: branchX, y });
      const items = GUIDES.filter((g) => g.category === category);
      items.forEach((g, gi) => {
        const nodeX = CENTER_X + side * (320 + (gi % 2) * 70);
        const nodeY = y + (gi - (items.length - 1) / 2) * 56;
        nodes.push({
          slug: g.slug,
          title: g.title,
          category,
          x: nodeX,
          y: nodeY,
        });
      });
      y += rowGap + Math.max(0, items.length - 2) * 30;
    });
    return { nodes, branches, height: y };
  }, []);

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-edge bg-ink/60 p-4">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="mx-auto block"
        style={svgStyle(height)}
      >
        {/* spine */}
        <line
          x1={CENTER_X}
          y1={60}
          x2={CENTER_X}
          y2={height - 60}
          stroke="#1d2742"
          strokeWidth={3}
        />
        <circle cx={CENTER_X} cy={70} r={34} fill="#10172c" stroke="#6ea8ff" strokeWidth={2} />
        <text x={CENTER_X} y={66} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
          Cortex
        </text>
        <text x={CENTER_X} y={80} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
          Sim
        </text>

        {/* branches */}
        {branches.map((b) => (
          <g key={b.category}>
            <line
              x1={CENTER_X}
              y1={b.y}
              x2={b.x}
              y2={b.y}
              stroke={CAT_COLOR[b.category]}
              strokeWidth={2}
              opacity={0.6}
            />
            <rect
              x={b.x - 60}
              y={b.y - 14}
              width={120}
              height={28}
              rx={8}
              fill="#0b1020"
              stroke={CAT_COLOR[b.category]}
              strokeWidth={1.5}
            />
            <text x={b.x} y={b.y + 4} textAnchor="middle" fill={CAT_COLOR[b.category]} fontSize={11} fontWeight={700}>
              {b.category}
            </text>
          </g>
        ))}

        {/* node links */}
        {nodes.map((n) => {
          const b = branches.find((br) => br.category === n.category)!;
          return (
            <line
              key={`l-${n.slug}`}
              x1={b.x}
              y1={b.y}
              x2={n.x}
              y2={n.y}
              stroke={CAT_COLOR[n.category]}
              strokeWidth={1.2}
              opacity={0.35}
            />
          );
        })}

        {/* nodes */}
        {nodes.map((n, i) => {
          const complete = ready && store.isComplete(n.slug);
          const color = CAT_COLOR[n.category];
          const left = n.x < CENTER_X;
          return (
            <motion.g
              key={n.slug}
              initial={nodeInit}
              animate={nodeShow}
              transition={nodeTransition(i)}
              className="cursor-pointer"
              onClick={() => router.push(`/learn/${n.slug}`)}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={9}
                fill={complete ? color : "#0b1020"}
                stroke={color}
                strokeWidth={2}
              />
              {complete ? (
                <text x={n.x} y={n.y + 3.5} textAnchor="middle" fill="#05070e" fontSize={10} fontWeight={900}>
                  ✓
                </text>
              ) : null}
              <text
                x={left ? n.x - 16 : n.x + 16}
                y={n.y + 4}
                textAnchor={left ? "end" : "start"}
                fill={complete ? "#fff" : "#cbd5e1"}
                fontSize={12}
                fontWeight={complete ? 700 : 500}
              >
                {n.title}
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
  return { delay: 0.04 * i, duration: 0.3 };
}
function svgStyle(height: number) {
  return { minWidth: WIDTH, height };
}
