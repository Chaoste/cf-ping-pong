import type { ReactNode } from "react";

export interface ExperienceComponentProps extends Record<string, unknown> {
  content?: ReactNode;
  tournamentName?: unknown;
  matches?: unknown;
}
