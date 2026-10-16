import {
  ClientExperienceRenderer,
  type Config,
  type PortableRenderPlan,
} from "@contentful/experiences-react";
import { CurrentResults } from "./components/CurrentResults";
import { DashboardShell } from "./components/DashboardShell";
import { NextMatch } from "./components/NextMatch";
import { TournamentBracket } from "./components/TournamentBracket";
import { TournamentStatus } from "./components/TournamentStatus";

export const experienceConfig: Config = {
  components: {
    "current-results": CurrentResults,
    "next-match": NextMatch,
    "tournament-bracket": TournamentBracket,
    "tournament-dashboard-shell": DashboardShell,
    "tournament-status": TournamentStatus,
  },
};

export const ExperiencePlanRenderer = ({ plan }: { plan: PortableRenderPlan }) => (
  <ClientExperienceRenderer
    config={experienceConfig}
    debug={false}
    experience={plan}
    renderUnknown={({ componentId }) => (
      <aside style={{ border: "1px solid #d3d9e5", padding: "16px" }}>
        The Experience uses an unregistered XO component: {componentId}
      </aside>
    )}
  />
);
