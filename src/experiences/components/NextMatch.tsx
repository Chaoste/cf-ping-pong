import type { ExperienceComponentProps } from "../componentTypes";
import { getNextMatch, playerName, toTournamentData } from "../tournamentStatus";

export const NextMatch = ({ tournament }: ExperienceComponentProps) => {
  const data = toTournamentData(tournament);
  const match = data ? getNextMatch(data.matches ?? []) : undefined;

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  if (!match) {
    return (
      <section style={cardStyle}>
        <p style={eyebrowStyle}>NEXT MATCH</p>
        <h2 style={headingStyle}>No match is ready yet</h2>
        <p style={{ margin: 0 }}>Complete an earlier match to advance its players.</p>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>NEXT MATCH</p>
      <h2 style={headingStyle}>{match.matchNumber ?? "Match"}</h2>
      <p style={{ color: "#b7c6ff", margin: "0 0 16px" }}>
        {match.isUpperBracket ? "Upper" : "Lower"} bracket · Round {match.round ?? "—"}
      </p>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: "22px",
          fontWeight: 700,
          gap: "16px",
        }}
      >
        <span>{playerName(match.player1)}</span>
        <span style={{ color: "#b7c6ff", fontSize: "14px" }}>vs</span>
        <span>{playerName(match.player2)}</span>
      </div>
    </section>
  );
};

const cardStyle = {
  background: "#18233d",
  borderRadius: "16px",
  color: "#ffffff",
  padding: "24px",
};

const eyebrowStyle = {
  color: "#b7c6ff",
  fontSize: "14px",
  fontWeight: 700,
  margin: "0 0 8px",
};

const headingStyle = {
  fontSize: "28px",
  margin: "0 0 4px",
};
