import type { ReactNode } from "react";

export interface ExperienceComponentProps extends Record<string, unknown> {
  content?: ReactNode;
  matches?: unknown;
  players?: unknown;
  tournamentName?: unknown;
}
