import StudioWorkspace from "@/components/studio/StudioWorkspace";

export const metadata = {
  title: "Studio - CortexSim Studio",
  description:
    "The CortexSim Studio workspace: a live spiking-network simulator plus 35 separate interactive activities across visualization, analysis, dynamics, connectivity, performance and data \u2014 each with its own controls, outputs and tips.",
};

export default function SimulatorPage() {
  return <StudioWorkspace />;
}
