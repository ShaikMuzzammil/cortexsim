import type { Activity } from "./types";
import { visualizationActivities } from "./activities/visualization";
import { analysisActivities } from "./activities/analysis";
import { dynamicsActivities } from "./activities/dynamics";
import { connectivityActivities } from "./activities/connectivity";
import { performanceActivities } from "./activities/performance";
import { dataActivities } from "./activities/data";

// The canonical ordering of the six workspace groups shown in the sidebar.
export const STUDIO_GROUPS = [
  "Visualization",
  "Analysis",
  "Dynamics & Learning",
  "Connectivity",
  "Performance & Systems",
  "Data & Protocols",
] as const;

export type StudioGroup = (typeof STUDIO_GROUPS)[number];

// Every interactive section in the in-app studio, flattened into one registry.
export const STUDIO_ACTIVITIES: Activity[] = [
  ...visualizationActivities,
  ...analysisActivities,
  ...dynamicsActivities,
  ...connectivityActivities,
  ...performanceActivities,
  ...dataActivities,
].sort((a, b) => a.id - b.id);

export function activityBySlug(slug: string): Activity | undefined {
  return STUDIO_ACTIVITIES.find((a) => a.slug === slug);
}

export function activitiesByGroup(): { group: StudioGroup; items: Activity[] }[] {
  return STUDIO_GROUPS.map((group) => ({
    group,
    items: STUDIO_ACTIVITIES.filter((a) => a.group === group),
  })).filter((g) => g.items.length > 0);
}

export const STUDIO_STATS = {
  total: STUDIO_ACTIVITIES.length,
  live: STUDIO_ACTIVITIES.filter((a) => a.status === "live").length,
  beta: STUDIO_ACTIVITIES.filter((a) => a.status === "beta").length,
  roadmap: STUDIO_ACTIVITIES.filter((a) => a.status === "roadmap").length,
  animated: STUDIO_ACTIVITIES.filter((a) => a.animated).length,
};
