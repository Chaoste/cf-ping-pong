import { useRef } from "react";
import {
  createTheme,
  DoubleEliminationBracket,
  Match as MatchComponent,
  SVGViewer,
} from "@g-loot/react-tournament-brackets";
import type { OptionsType } from "@g-loot/react-tournament-brackets";
import useComponentSize from "@rehooks/component-size";
import type { ExperienceComponentProps } from "../componentTypes";
import { toDoubleEliminationMatches } from "../tournamentBracket";
import { toTournamentData } from "../tournamentStatus";

export const TournamentBracket = (props: ExperienceComponentProps) => {
  const data = toTournamentData(props);

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  const matches = data.matches ?? [];

  return (
    <section style={sectionStyle}>
      <p style={eyebrowStyle}>BRACKET</p>
      <h2 style={{ fontSize: "28px", margin: "0 0 20px" }}>Tournament</h2>
      {matches.length > 0 ? (
        <BracketTree matches={toDoubleEliminationMatches(matches)} />
      ) : (
        <p style={{ color: "#53627c", margin: 0 }}>
          No tournament matches are available yet.
        </p>
      )}
    </section>
  );
};

const BracketTree = ({
  matches,
}: ReturnType<typeof toDoubleEliminationMatches>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize = useComponentSize(wrapperRef);

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "min(760px, 75vh)",
        marginTop: "20px",
        minHeight: "480px",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <DoubleEliminationBracket
        matches={matches}
        matchComponent={MatchComponent}
        onMatchClick={() => undefined}
        options={
          {
            style: {
              connectorColor: "#cfe8fb",
              connectorColorHighlight: "#9473ed",
              roundHeader: {
                backgroundColor: "#9473ed",
                fontColor: "#ffffff",
              },
            },
          } as { style: OptionsType }
        }
        svgWrapper={({ children, ...svgProps }) => (
          <SVGViewer
            {...svgProps}
            SVGBackground="#ffffff"
            background="#ffffff"
            height={Math.max(wrapperSize.height, 480)}
            width={Math.max(wrapperSize.width, 320)}
          >
            {children}
          </SVGViewer>
        )}
        theme={bracketTheme}
      />
    </div>
  );
};

const bracketTheme = createTheme({
  border: { color: "#cfe8fb", highlightedColor: "#9473ed" },
  connectorColor: "#cfe8fb",
  connectorColorHighlight: "#9473ed",
  matchBackground: { lostColor: "#cfe8fb", wonColor: "#b6dca7" },
  roundHeader: { fontColor: "#ffffff" },
  roundHeaders: { background: "#9473ed" },
  score: {
    background: { lostColor: "#ffffff", wonColor: "#e7f5e1" },
    text: { highlightedLostColor: "#a32626", highlightedWonColor: "#164c2e" },
  },
  svgBackground: "#ffffff",
  textColor: { dark: "#53627c", highlighted: "#07090d", main: "#1f2a44" },
});

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #d3d9e5",
  borderRadius: "16px",
  color: "#1f2a44",
  padding: "24px",
};

const eyebrowStyle = {
  color: "#53627c",
  fontSize: "14px",
  fontWeight: 700,
  margin: "0 0 4px",
};
