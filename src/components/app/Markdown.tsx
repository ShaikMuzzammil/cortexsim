"use client";
// Tiny markdown renderer: headings, bold, italic, inline code, code fences,
// lists, blockquotes, links, hr, paragraphs. Sufficient for notes & comments.
// Escapes HTML first so notes are safe to render.

import { useMemo } from "react";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  let out = escape(s);
  out = out.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#10172c] text-[#cfe1ff] text-[12px]">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="text-[#6ea8ff] underline" href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

function render(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) {
      out.push(`<p class="text-sm text-slate-300 leading-relaxed">${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };
  for (const raw of lines) {
    const line = raw;
    if (inCode) {
      if (line.trim().startsWith("```")) {
        out.push(`<pre class="my-3 p-3 rounded-lg bg-[#0b1020] border border-[#1d2742] text-[12px] text-slate-200 overflow-x-auto"><code data-lang="${escape(codeLang)}">${escape(codeBuf.join("\n"))}</code></pre>`);
        inCode = false;
        codeLang = "";
        codeBuf = [];
      } else {
        codeBuf.push(line);
      }
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushPara();
      closeList();
      inCode = true;
      codeLang = line.trim().slice(3).trim();
      continue;
    }
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      closeList();
      const level = h[1].length;
      const sizes = ["text-2xl", "text-xl", "text-lg", "text-base"];
      out.push(`<h${level} class="${sizes[level - 1]} font-semibold text-white mt-4 mb-1">${inline(h[2])}</h${level}>`);
      continue;
    }
    if (line.trim() === "---") {
      flushPara();
      closeList();
      out.push('<hr class="my-4 border-[#1d2742]"/>');
      continue;
    }
    const bq = /^>\s?(.*)$/.exec(line);
    if (bq) {
      flushPara();
      closeList();
      out.push(`<blockquote class="border-l-2 border-[#6ea8ff] pl-3 my-2 text-slate-300 italic">${inline(bq[1])}</blockquote>`);
      continue;
    }
    const ul = /^[-*]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      if (listType !== "ul") {
        closeList();
        out.push('<ul class="list-disc pl-5 space-y-1 my-2 text-sm text-slate-300">');
        listType = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      if (listType !== "ol") {
        closeList();
        out.push('<ol class="list-decimal pl-5 space-y-1 my-2 text-sm text-slate-300">');
        listType = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }
    para.push(line);
  }
  if (inCode) {
    out.push(`<pre class="my-3 p-3 rounded-lg bg-[#0b1020] border border-[#1d2742] text-[12px] text-slate-200 overflow-x-auto"><code>${escape(codeBuf.join("\n"))}</code></pre>`);
  }
  flushPara();
  closeList();
  return out.join("\n");
}

export default function Markdown({ source }: { source: string }) {
  const html = useMemo(() => render(source || ""), [source]);
  const dh = { __html: html };
  return <div className="cortex-md" dangerouslySetInnerHTML={dh} />;
}
