import { cloneElement } from "react";
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
  return (
    <div
      style={{
        height: "min(940px, 84vh)",
        marginTop: "8px",
        minHeight: "520px",
        minWidth: 0,
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
              boxHeight: 104,
              canvasPadding: 12,
              connectorColor: "#53627c",
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
              width: 250,
            },
          } as { style: OptionsType }
        }
        svgWrapper={({ children, bracketHeight, bracketWidth }) => (
          <FittedBracketSvg
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
> & { children: ReactElement<SVGProps<SVGSVGElement>> };

const FittedBracketSvg = ({
  bracketHeight,
  bracketWidth,
  children,
}: FittedBracketSvgProps) => {
  const scale = 0.75;
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
  participant: ParticipantType & { profilePictureUrl?: string | null };
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
      <span style={participantNameStyle}>
        {participant.profilePictureUrl && (
          <img
            alt=""
            height={30}
            src={participant.profilePictureUrl}
            style={avatarStyle}
            width={30}
          />
        )}
        <span style={participantTextStyle}>{participant.name || "TBD"}</span>
      </span>
      {participant.resultText && (
        <span style={scoreStyle}>{participant.resultText}</span>
      )}
    </div>
  );
};

const bracketTheme = createTheme({
  border: { color: "#3a4b6c", highlightedColor: "#9473ed" },
  connectorColor: "#53627c",
  connectorColorHighlight: "#9473ed",
  matchBackground: { lostColor: "#22304e", wonColor: "#294c42" },
  roundHeader: { fontColor: "#ffffff" },
  roundHeaders: { background: "#9473ed" },
  score: {
    background: { lostColor: "#22304e", wonColor: "#294c42" },
    text: { highlightedLostColor: "#ffffff", highlightedWonColor: "#ffffff" },
  },
  svgBackground: "#18233d",
  textColor: { dark: "#b7c6ff", highlighted: "#ffffff", main: "#ffffff" },
});

const sectionStyle = {
  background: "#18233d",
  border: "1px solid #22304e",
  borderRadius: "16px",
  color: "#ffffff",
  minWidth: 0,
  padding: "16px",
};

const eyebrowStyle = {
  color: "#b7c6ff",
  fontSize: "12px",
  fontWeight: 700,
  margin: "0 0 4px",
};

const bracketViewportStyle: CSSProperties = {
  alignItems: "flex-start",
  display: "flex",
  height: "100%",
  justifyContent: "flex-start",
  overflow: "auto",
  width: "100%",
};

const matchCardStyle: CSSProperties = {
  background: "#22304e",
  border: "2px solid #3a4b6c",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  boxSizing: "border-box",
  color: "#ffffff",
  fontFamily: "system-ui, sans-serif",
  height: "100%",
  overflow: "hidden",
  width: "100%",
};

const matchTitleStyle: CSSProperties = {
  background: "#2c3c5d",
  color: "#cbd6ff",
  fontSize: "16px",
  fontWeight: 700,
  height: "26px",
  letterSpacing: "0.02em",
  lineHeight: "26px",
  padding: "0 9px",
};

const matchParticipantStyle: CSSProperties = {
  alignItems: "center",
  background: "#22304e",
  borderTop: "1px solid #3a4b6c",
  boxSizing: "border-box",
  display: "flex",
  fontSize: "18px",
  height: "36px",
  justifyContent: "space-between",
  lineHeight: "1",
  padding: "0 9px",
};

const winningParticipantStyle: CSSProperties = {
  background: "#294c42",
  color: "#ffffff",
  fontWeight: 700,
};

const missingParticipantStyle: CSSProperties = {
  background: "#27334d",
  color: "#b7c6ff",
  fontSize: "16px",
  fontStyle: "italic",
};

const participantNameStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  flex: "1 1 auto",
  gap: "7px",
  minWidth: 0,
};

const participantTextStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const scoreStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  marginLeft: "8px",
};

const avatarStyle: CSSProperties = {
  border: "1px solid #b7c6ff",
  borderRadius: "50%",
  flex: "0 0 auto",
  objectFit: "cover",
};
