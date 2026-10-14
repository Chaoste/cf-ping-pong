import type { PortableRenderNode, PortableRenderPlan } from "@contentful/experiences-sdk-core";
import type { ComponentType, ReactNode } from "react";
import { CurrentResults } from "./components/CurrentResults";
import { DashboardShell } from "./components/DashboardShell";
import { NextMatch } from "./components/NextMatch";
import { TournamentBracket } from "./components/TournamentBracket";
import { TournamentStatus } from "./components/TournamentStatus";
import type { ExperienceComponentProps } from "./componentTypes";

const componentRegistry: Record<string, ComponentType<ExperienceComponentProps>> = {
  "current-results": CurrentResults,
  "next-match": NextMatch,
  "tournament-bracket": TournamentBracket,
  "tournament-dashboard-shell": DashboardShell,
  "tournament-status": TournamentStatus,
};

export const ExperiencePlanRenderer = ({ plan }: { plan: PortableRenderPlan }) => (
  <>{plan.nodes.map((node, index) => <ExperienceNode key={node.nodeId ?? index} node={node} />)}</>
);

const ExperienceNode = ({ node }: { node: PortableRenderNode }) => {
  const Component = componentRegistry[node.registration.id];

  if (!Component) {
    return (
      <aside style={{ border: "1px solid #d3d9e5", padding: "16px" }}>
        The Experience uses an unregistered XO component: {node.registration.id}
      </aside>
    );
  }

  const slots = Object.fromEntries(
    Object.entries(node.slots).map(([slot, children]) => [
      slot,
      children.map((child, index) => (
        <ExperienceNode key={child.nodeId ?? `${slot}-${index}`} node={child} />
      )),
    ])
  ) as Record<string, ReactNode>;
  const props: ExperienceComponentProps = {
    ...node.props.design,
    ...node.props.content,
    ...node.props.resolved,
    ...slots,
  };

  return <Component {...props} />;
};
