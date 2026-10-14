import type { ExperienceComponentProps } from "../componentTypes";
import {
  getReadyMatches,
  playerName,
  toTournamentData,
} from "../tournamentStatus";

export const NextMatch = (props: ExperienceComponentProps) => {
  const data = toTournamentData(props);
  const matches = data ? getReadyMatches(data.matches ?? []) : [];

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  if (matches.length === 0) {
    return (
      <section style={cardStyle}>
        <p style={eyebrowStyle}>READY TO PLAY</p>
        <h2 style={emptyHeadingStyle}>No matches are ready yet</h2>
        <p style={{ margin: 0 }}>
          Complete an earlier match to advance its players.
        </p>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>READY TO PLAY</p>
      <div
        style={{
          display: "grid",
          gap: "8px",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginTop: "10px",
        }}
      >
        {matches.map((match, index) => (
          <article
            key={`${match.matchNumber ?? "match"}-${index}`}
            style={matchStyle}
          >
            <span style={{ color: "#b7c6ff", fontSize: "12px" }}>
              {match.matchNumber ?? "Match"} ·{" "}
              {match.isUpperBracket ? "Upper" : "Lower"} · Round{" "}
              {match.round ?? "—"}
            </span>
            <strong style={{ fontSize: "17px" }}>
              {playerName(match.player1)}{" "}
              <span style={{ color: "#b7c6ff", fontSize: "12px" }}>vs</span>{" "}
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
  borderRadius: "12px",
  color: "#ffffff",
  padding: "16px",
};

const eyebrowStyle = {
  color: "#b7c6ff",
  fontSize: "12px",
  fontWeight: 700,
  margin: "0 0 4px",
};

const emptyHeadingStyle = {
  fontSize: "24px",
  margin: "0 0 4px",
};

const matchStyle = {
  background: "#22304e",
  borderRadius: "8px",
  display: "grid",
  gap: "2px",
  padding: "10px",
};
