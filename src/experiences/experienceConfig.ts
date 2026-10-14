import { defineComponent, type Config } from "@contentful/experiences-react";
import { CurrentResults } from "./components/CurrentResults";
import { DashboardShell } from "./components/DashboardShell";
import { NextMatch } from "./components/NextMatch";
import { TournamentBracket } from "./components/TournamentBracket";
import { TournamentStatus } from "./components/TournamentStatus";
import type { ExperienceComponentProps } from "./componentTypes";

export const experienceConfig: Config = {
  components: {
    "current-results": defineComponent<ExperienceComponentProps>({
      component: CurrentResults,
    }),
    "next-match": defineComponent<ExperienceComponentProps>({
      component: NextMatch,
    }),
    "tournament-bracket": defineComponent<ExperienceComponentProps>({
      component: TournamentBracket,
    }),
    "tournament-dashboard-shell": defineComponent<ExperienceComponentProps>({
      component: DashboardShell,
    }),
    "tournament-status": defineComponent<ExperienceComponentProps>({
      component: TournamentStatus,
    }),
  },
};
