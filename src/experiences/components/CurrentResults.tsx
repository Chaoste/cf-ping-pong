import type { ExperienceComponentProps } from "../componentTypes";
import {
  getCurrentResults,
  isWalkover,
  playerName,
  score,
  toTournamentData,
  winnerName,
} from "../tournamentStatus";

export const CurrentResults = ({ tournament }: ExperienceComponentProps) => {
  const data = toTournamentData(tournament);

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  const results = getCurrentResults(data.matches ?? []);

  return (
    <section style={sectionStyle}>
      <p style={eyebrowStyle}>RESULTS</p>
      <h2 style={{ fontSize: "28px", margin: "0 0 16px" }}>Current results</h2>
      {results.length === 0 ? (
        <p style={{ color: "#53627c", margin: 0 }}>
          No results have been recorded yet.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {results.map((match, index) => {
            const isBye = isWalkover(match);
            const resultScore = score(match);
            return (
              <article
                key={`${match.matchNumber ?? "match"}-${index}`}
                style={{
                  alignItems: "center",
                  borderTop: "1px solid #d3d9e5",
                  display: "grid",
                  gap: "8px",
                  gridTemplateColumns:
                    "minmax(90px, 0.5fr) minmax(180px, 1fr) minmax(140px, 0.7fr)",
                  padding: "12px 0",
                }}
              >
                <strong>{match.matchNumber ?? "Match"}</strong>
                <span>
                  {playerName(match.player1)}{" "}
                  <span style={{ color: "#53627c" }}>vs</span>{" "}
                  {isBye && !match.player2?.name ? (
                    <span style={skippedOpponentStyle}>
                      No opponent — match skipped
                    </span>
                  ) : (
                    playerName(match.player2)
                  )}
                </span>
                <span style={{ fontWeight: 700 }}>
                  {isBye
                    ? `${winnerName(match)} advances — match skipped`
                    : `${winnerName(match)} won${resultScore ? ` · ${resultScore}` : ""}`}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

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

const skippedOpponentStyle = {
  color: "#6d7587",
  fontStyle: "italic",
};
