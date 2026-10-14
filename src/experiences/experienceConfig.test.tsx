import {
  ClientExperienceRenderer,
  type PortableRenderPlan,
} from "@contentful/experiences-react";
import { render, screen } from "@testing-library/react";
import { experienceConfig } from "./experienceConfig";

jest.mock("@contentful/experiences-runtime", () => ({}));

const plan: PortableRenderPlan = {
  debug: false,
  diagnostics: [],
  metadata: {},
  nodes: [
    {
      nodeId: "dashboard",
      registration: { id: "tournament-dashboard-shell", kind: "component" },
      props: { content: {}, design: {}, designRaw: {} },
      slots: {
        content: [
          {
            nodeId: "status",
            registration: { id: "tournament-status", kind: "component" },
            props: {
              content: { matches: [], tournamentName: "Contentful Pong Cup" },
              design: {},
              designRaw: {},
            },
            slots: {},
          },
        ],
      },
    },
  ],
};

describe("experienceConfig", () => {
  it("renders registered components and their named slots through the React adapter", () => {
    render(
      <ClientExperienceRenderer config={experienceConfig} experience={plan} />,
    );

    expect(
      screen.getByRole("heading", { name: "Contentful Pong Cup" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Played matches")).toBeInTheDocument();
  });
});
