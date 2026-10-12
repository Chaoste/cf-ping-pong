import type { ExperienceComponentProps } from "../componentTypes";
import {
  getReadyMatches,
  playerName,
  toTournamentData,
} from "../tournamentStatus";

export const NextMatch = ({ tournament }: ExperienceComponentProps) => {
  const data = toTournamentData(tournament);
  const matches = data ? getReadyMatches(data.matches ?? []) : [];

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  if (matches.length === 0) {
    return (
      <section style={cardStyle}>
        <p style={eyebrowStyle}>READY TO PLAY</p>
        <h2 style={headingStyle}>No matches are ready yet</h2>
        <p style={{ margin: 0 }}>
          Complete an earlier match to advance its players.
        </p>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>READY TO PLAY</p>
      <h2 style={headingStyle}>Matches ready to play</h2>
      <p style={{ color: "#b7c6ff", margin: "0 0 16px" }}>
        Start any pairing whose players are available. Earlier rounds are listed
        first.
      </p>
      <div style={{ display: "grid", gap: "10px" }}>
        {matches.map((match, index) => (
          <article
            key={`${match.matchNumber ?? "match"}-${index}`}
            style={matchStyle}
          >
            <span style={{ color: "#b7c6ff", fontSize: "13px" }}>
              {match.matchNumber ?? "Match"} ·{" "}
              {match.isUpperBracket ? "Upper" : "Lower"} · Round{" "}
              {match.round ?? "—"}
            </span>
            <strong style={{ fontSize: "19px" }}>
              {playerName(match.player1)}{" "}
              <span style={{ color: "#b7c6ff", fontSize: "14px" }}>vs</span>{" "}
              {playerName(match.player2)}
            </strong>
          </article>
        ))}
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

const matchStyle = {
  background: "#22304e",
  borderRadius: "10px",
  display: "grid",
  gap: "4px",
  padding: "12px",
};
