import type { Guide } from "../types";

export const reproducibleResearch: Guide = {
  slug: "reproducible-research",
  title: "Reproducible experiments in CortexSim",
  category: "Workflow",
  summary:
    "Turn ad-hoc fiddling into rigorous, repeatable science using projects, runs, seeds, exports and the API.",
  readingTimeMin: 6,
  updated: "2026-06-14",
  blocks: [
    {
      type: "p",
      text: "A result you cannot reproduce is a story, not a finding. CortexSim is built so that every interesting moment can be captured, labelled and re-run - by you next week or by a collaborator on another machine.",
    },
    { type: "h", text: "The reproducibility ladder" },
    {
      type: "ol",
      items: [
        "Capture: export State JSON the instant you see something - it pins the full configuration.",
        "Organise: store runs under a named project with notes describing the question.",
        "Compare: use the Compare view to diff two to four runs side by side.",
        "Automate: drive the REST API from a script so a whole sweep is one command.",
        "Share: publish a read-only link or export a report so others can verify.",
      ],
    },
    { type: "h", text: "Seeds and determinism" },
    {
      type: "p",
      text: "Stochastic input and random wiring mean two runs differ unless the seed is fixed. Record the seed alongside the configuration so a run can be reproduced bit-for-bit, and vary only the seed when you want to measure run-to-run variability.",
    },
    {
      type: "tip",
      text: "Treat the State JSON as the unit of truth. If two people load the same JSON and get different numbers, something undocumented changed - hunt it down before trusting the result.",
    },
    { type: "h", text: "Automating with the API" },
    {
      type: "code",
      lang: "bash",
      code: "# Run a sweep from the command line using an API token\nfor drive in 0.2 0.4 0.6 0.8; do\n  curl -s -X POST https://your-deploy/api/projects/$PID/runs \\\n    -H \"Authorization: Bearer $CORTEXSIM_TOKEN\" \\\n    -H 'Content-Type: application/json' \\\n    -d '{\"config\":{\"drive\":'$drive'},\"label\":\"drive-'$drive'\"}'\ndone",
    },
    { type: "h", text: "A reproducibility checklist" },
    {
      type: "list",
      items: [
        "Every figure links to the run that produced it.",
        "Every run records its seed, config and CortexSim version.",
        "Notes state the hypothesis, not just the settings.",
        "Exports are archived next to the manuscript.",
      ],
    },
    {
      type: "warn",
      text: "Browser local storage is convenient but not durable. For real projects, sign in so runs persist server-side, and back up the data store (see DEPLOY.md).",
    },
  ],
};
