import { cloneElement, useRef } from "react";
import {
  createTheme,
  DoubleEliminationBracket,
} from "@g-loot/react-tournament-brackets";
import type {
  MatchComponentProps,
  OptionsType,
  ParticipantType,
  SvgViewerProps,
} from "@g-loot/react-tournament-brackets";
import useComponentSize from "@rehooks/component-size";
import type { CSSProperties, ReactElement, SVGProps } from "react";
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
        height: "min(940px, 84vh)",
        marginTop: "8px",
        minHeight: "520px",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <DoubleEliminationBracket
        matches={matches}
        matchComponent={CompactMatch}
        onMatchClick={() => undefined}
        options={
          {
            style: {
              boxHeight: 90,
              canvasPadding: 12,
              connectorColor: "#cfe8fb",
              connectorColorHighlight: "#9473ed",
              horizontalOffset: 8,
              lineInfo: {
                separation: -8,
              },
              roundHeader: {
                backgroundColor: "#9473ed",
                fontColor: "#ffffff",
                fontSize: 20,
                height: 36,
                marginBottom: 12,
              },
              roundSeparatorWidth: 10,
              spaceBetweenColumns: 14,
              spaceBetweenRows: 14,
              width: 210,
            },
          } as { style: OptionsType }
        }
        svgWrapper={({ children, bracketHeight, bracketWidth }) => (
          <FittedBracketSvg
            availableHeight={Math.max(wrapperSize.height, 480)}
            availableWidth={Math.max(wrapperSize.width, 320)}
            bracketHeight={bracketHeight}
            bracketWidth={bracketWidth}
          >
            {children}
          </FittedBracketSvg>
        )}
        theme={bracketTheme}
      />
    </div>
  );
};

type FittedBracketSvgProps = Pick<
  SvgViewerProps,
  "bracketHeight" | "bracketWidth"
> & {
  availableHeight: number;
  availableWidth: number;
  children: ReactElement<SVGProps<SVGSVGElement>>;
};

const FittedBracketSvg = ({
  availableHeight,
  availableWidth,
  bracketHeight,
  bracketWidth,
  children,
}: FittedBracketSvgProps) => {
  const scale = Math.min(
    availableHeight / bracketHeight,
    availableWidth / bracketWidth,
  );
  const scaledHeight = bracketHeight * scale;
  const scaledWidth = bracketWidth * scale;

  return (
    <div style={bracketViewportStyle}>
      <div
        style={{
          height: `${scaledHeight}px`,
          width: `${scaledWidth}px`,
        }}
      >
        <div
          style={{
            height: `${bracketHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${bracketWidth}px`,
          }}
        >
          {cloneElement(children, { style: { display: "block" } })}
        </div>
      </div>
    </div>
  );
};

const CompactMatch = ({
  bottomParty,
  bottomWon,
  match,
  topParty,
  topWon,
}: MatchComponentProps) => (
  <div style={matchCardStyle}>
    <div style={matchTitleStyle}>{match.name}</div>
    <MatchParticipant participant={topParty} won={topWon} />
    <MatchParticipant participant={bottomParty} won={bottomWon} />
  </div>
);

const MatchParticipant = ({
  participant,
  won,
}: {
  participant: ParticipantType;
  won: boolean;
}) => {
  const isMissingOpponent = participant.name === "No opponent — match skipped";

  return (
    <div
      style={{
        ...matchParticipantStyle,
        ...(isMissingOpponent
          ? missingParticipantStyle
          : won
            ? winningParticipantStyle
            : undefined),
      }}
    >
      <span style={participantNameStyle}>{participant.name || "TBD"}</span>
      {participant.resultText && (
        <span style={scoreStyle}>{participant.resultText}</span>
      )}
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
  padding: "16px",
};

const eyebrowStyle = {
  color: "#53627c",
  fontSize: "12px",
  fontWeight: 700,
  margin: "0 0 4px",
};

const bracketViewportStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  overflow: "hidden",
  width: "100%",
};

const matchCardStyle: CSSProperties = {
  background: "#ffffff",
  border: "2px solid #cfe8fb",
  borderRadius: "6px",
  boxShadow: "0 1px 2px rgba(31, 42, 68, 0.08)",
  boxSizing: "border-box",
  color: "#1f2a44",
  fontFamily: "Arial, Helvetica, sans-serif",
  height: "100%",
  overflow: "hidden",
  width: "100%",
};

const matchTitleStyle: CSSProperties = {
  background: "#f3f6fb",
  color: "#53627c",
  fontSize: "18px",
  fontWeight: 700,
  height: "26px",
  letterSpacing: "0.02em",
  lineHeight: "26px",
  padding: "0 9px",
};

const matchParticipantStyle: CSSProperties = {
  alignItems: "center",
  background: "#dff0ff",
  borderTop: "1px solid #cfe8fb",
  boxSizing: "border-box",
  display: "flex",
  fontSize: "22px",
  height: "30px",
  justifyContent: "space-between",
  lineHeight: "1",
  padding: "0 9px",
};

const winningParticipantStyle: CSSProperties = {
  background: "#dff0d5",
  color: "#164c2e",
  fontWeight: 700,
};

const missingParticipantStyle: CSSProperties = {
  background: "#f0f2f5",
  color: "#697586",
  fontSize: "18px",
  fontStyle: "italic",
};

const participantNameStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const scoreStyle: CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  marginLeft: "8px",
};
