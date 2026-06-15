"use client";

import { useMemo, useState, useEffect } from "react";
import { QUIZ_DOMAINS, quizByDomain, type QuizDomain } from "@/content/quiz";

type Domain = QuizDomain | "All";

export default function QuizRunner() {
  const [domain, setDomain] = useState<Domain>("All");
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState("");

  const questions = useMemo(() => quizByDomain(domain), [domain]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cortexsim:quiz-notes");
      if (saved) setNotes(saved);
    } catch {}
  }, []);

  function choose(qid: string, idx: number) {
    if (submitted) return;
    setPicked((prev) => ({ ...prev, [qid]: idx }));
  }

  function saveNotes(value: string) {
    setNotes(value);
    try {
      window.localStorage.setItem("cortexsim:quiz-notes", value);
    } catch {}
  }

  function reset() {
    setPicked({});
    setSubmitted(false);
  }

  const answered = questions.filter((q) => picked[q.id] !== undefined).length;
  const correct = questions.filter((q) => picked[q.id] === q.answer).length;
  const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {(["All", ...QUIZ_DOMAINS] as Domain[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDomain(d);
              reset();
            }}
            className={
              "rounded-full border px-3.5 py-1.5 text-sm transition " +
              (domain === d
                ? "border-brand bg-brand/15 text-brand"
                : "border-edge text-slate-300 hover:border-brand/50")
            }
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-edge bg-panel/50 px-5 py-4">
        <p className="text-sm text-slate-400">
          Answered <span className="font-bold text-white">{answered}</span> / {questions.length}
        </p>
        {submitted ? (
          <p className="text-sm">
            Score:{" "}
            <span className={pct >= 70 ? "font-bold text-good" : "font-bold text-warn"}>
              {correct} / {questions.length} ({pct}%)
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-500">Pick an answer for each question, then check.</p>
        )}
      </div>

      <ol className="space-y-5">
        {questions.map((q, qi) => (
          <li key={q.id} className="panel panel-pad">
            <div className="mb-3 flex items-start gap-3">
              <span className="mt-0.5 rounded-md bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand">{qi + 1}</span>
              <h3 className="text-base font-semibold text-white">{q.question}</h3>
            </div>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const chosen = picked[q.id] === oi;
                const isCorrect = q.answer === oi;
                let tone = "border-edge text-slate-300 hover:border-brand/50";
                if (submitted) {
                  if (isCorrect) tone = "border-good/60 bg-good/10 text-good";
                  else if (chosen) tone = "border-exc/60 bg-exc/10 text-exc";
                  else tone = "border-edge text-slate-500";
                } else if (chosen) {
                  tone = "border-brand bg-brand/10 text-white";
                }
                return (
                  <button
                    key={oi}
                    onClick={() => choose(q.id, oi)}
                    className={"flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition " + tone}
                  >
                    <span className="font-mono text-xs opacity-70">{String.fromCharCode(65 + oi)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {submitted ? (
              <p className="mt-3 rounded-lg border border-edge bg-ink/50 px-3 py-2 text-xs leading-relaxed text-slate-400">
                {q.explanation}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        {!submitted ? (
          <button onClick={() => setSubmitted(true)} disabled={answered === 0} className="btn-primary disabled:opacity-40">
            Check answers
          </button>
        ) : (
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
        )}
        <button onClick={reset} className="btn-ghost">
          Clear
        </button>
      </div>

      <div className="panel panel-pad">
        <h3 className="mb-2 text-sm font-bold text-white">Your learning notes</h3>
        <p className="mb-3 text-xs text-slate-500">Saved automatically in your browser. Jot down what surprised you.</p>
        <textarea
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
          rows={5}
          placeholder="e.g. I did not expect raising the E/I ratio to cause runaway synchrony..."
          className="w-full resize-y rounded-xl border border-edge bg-ink/60 px-4 py-3 text-sm text-slate-200 outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}
